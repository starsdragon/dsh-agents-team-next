/**
 * dsh-agents-team-next — pure dispatch & completion policy.
 *
 * No Cordis, no DOM: everything here is directly testable with `node --test`.
 * The Host plugin (src/index.mjs) wires these rules into `systemPrompt` and
 * `tools/execute`; the Web roster (src/client.js) only observes the results.
 */

/** Effort ladder, ordered by reasoning cost. */
export const EFFORT_LEVELS = ['low', 'medium', 'high', 'xhigh', 'max'];

/**
 * Normalize one configured effort level. Unknown or non-string values fall
 * back (with a warning hook) instead of breaking delegation calls.
 */
export function normalizeEffort(value, fallback = 'low', warn) {
  if (typeof value !== 'string') return fallback;
  const level = value.trim().toLowerCase();
  if (EFFORT_LEVELS.includes(level)) return level;
  if (typeof warn === 'function') {
    warn(`agents-team-next: unknown effort "${value}" (known: ${EFFORT_LEVELS.join('/')}), falling back to "${fallback}"`);
  }
  return fallback;
}

/**
 * Whether a tool definition accepts a `reasoning_effort` argument. Two
 * parameter shapes exist in the wild: the flat maps used by
 * `dsh-tool-subagent` / `dsh-experimental-tool-agent-team` (`parameters` keys
 * ARE the argument names) and JSON-Schema-style `parameters.properties`.
 * Both must be handled — checking only one shape silently skips the fill.
 */
export function acceptsEffortParameter(tool) {
  const params = tool?.parameters;
  if (params === null || typeof params !== 'object' || Array.isArray(params)) return false;
  const nested = params.properties;
  if (nested !== null && typeof nested === 'object' && !Array.isArray(nested)
    && Object.hasOwn(nested, 'reasoning_effort')) return true;
  return Object.hasOwn(params, 'reasoning_effort');
}

/**
 * Fill the default effort into one delegation call's arguments.
 * Returns the new arguments object when a fill is warranted, or null when the
 * call must pass through untouched: explicit effort (any defined value,
 * including an intentionally invalid one — let the tool report it), non-object
 * arguments, or an effort-less tool schema.
 */
export function fillEffortDefault(tool, args, fallback) {
  if (!acceptsEffortParameter(tool)) return null;
  if (args === null || typeof args !== 'object' || Array.isArray(args)) return null;
  if (args.reasoning_effort !== undefined) return null;
  return { ...args, reasoning_effort: fallback };
}

/**
 * Build the system-prompt policy section. Static text only, no baked
 * configuration values: telling the model a default effort exists only
 * invites omission, and a stable string keeps the section cache-friendly on
 * every request. The late section order (set by src/index.mjs) keeps future
 * text edits from re-colding the whole system-prompt prefix.
 *
 * v0.3.2 adds the completion discipline discovered from the first real
 * session: the task ledger's turn-stopping gate steers the model back
 * ("Continue the permitted work") whenever tasks are left open, so a product
 * that is already done can be dragged into a modify-again loop. The escape
 * hatches (op:check / op:remove / op:pause_turn) exist in the ledger tool and
 * must be used before a turn ends.
 */
export function buildPolicyText() {
  return `# 子代理调度策略（agents-team-next）

## 派出规划
- 开始前估计要派几个子代理/teammate、各负责什么；工作中按进展增减；只有相互独立、可并行的实质工作才值得派。
- 能复用既有成员（发消息唤醒）就不新派——全新上下文的成员缓存前缀从零开始；Team 中与主会话强相关的成员可用 context: fork 复用已缓存前缀，确需干净上下文才用 fresh。
- 长或易卡的操作（构建、浏览器/视觉验证、慢命令）可整体交给一个子代理/teammate：由它跑、有界重试、取证并回报，主会话继续做别的；不要派"只会等待"的空转代理（只 sleep/盯梢、没有执行与汇报职责）。
- 已派出的子代理必须收集结果或明确中断，不能丢在后台。

## 完成与收尾纪律（防止"做好了还继续改"）
- 任务清单只登记能用现有工具取证的条目，创建时写明验证方式；不创建无法验证的"再优化/视觉打磨"任务。
- 交付前收口：完成的 op:check；做不到或不再需要的 op:remove 并说明原因；因外部阻塞无法继续时用 op:pause_turn 写明原因再结束本回合。不留悬空条目——未收口会触发"继续未完成任务"的提醒，把已完成的活拖回循环。
- 验收标准满足即交付、交付后停止修改：再改已能用的产物必须有可验证的缺陷证据（报错/测试失败/截图问题）；用户说"不需要了/交付"是最高优先级收尾信号，优先于清单提醒。
- 验证命令要有界：先选最小最快的（单条 ≤2 分钟）；更长或易卡（浏览器/交互式）的验证放后台或交给子代理，不让主会话同步卡在等待上；同一手段连续失败 2 次就换路线或在交付中注明未验证项。

## 档位选择（reasoning_effort）
- 每次委派都显式选档，不依赖默认：low=简单、边界清晰、可验证；medium=多文件实现/调试、写测试、按已知规范对齐；high=需求模糊、跨模块设计、难 bug、性能/安全分析；xhigh/max=确有必要的深度推理。工具未声明 reasoning_effort 时不要硬传。

## 任务上下文压缩（仅指派发给子代理的任务文本）
- 派发的任务描述只含：目标、范围、必要约束、验收标准、必要避坑说明；不转抄完整历史或冗长背景。
- 不适用于你自己的推理与结论：思考按需要走完整，关键数据、结论与来源引用不得为省字数删除。
- 要求子代理回传浓缩摘要并附来源引用（文件路径/URL/工具调用）。`;
}
