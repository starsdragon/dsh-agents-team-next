# dsh-agents-team-next

给 [DSH（DeepSeek Harness）](https://github.com/deepseek-ai) 用的子代理调度与完成纪律插件：**按任务分配思考强度、压缩派发上下文、只读展示每个子代理的实际档位**，并把"做好了就停"写进系统策略。

> 仓库：<https://github.com/starsdragon/dsh-agents-team-next>

> A DSH plugin for per-task reasoning-effort routing, compressed dispatch prompts, a read-only effort roster, and completion discipline. See [docs/BENCHMARK.md](docs/BENCHMARK.md) for real-task measurements.

## 它解决什么问题

- **思考强度错配**：所有子任务一律满载思考，浅任务付了深推理的钱。
- **派发上下文膨胀**：整段对话历史转抄给每个子代理，成本线性放大。
- **不可观测**：子代理在干什么、用什么模型和档位，界面上看不见。
- **已完成还在改**：任务台账/提醒机制与模型的"再优化冲动"叠加，把已经能用的产物拖回修改循环。

## 机制

### 1. 系统提示 section（order 10150，晚位、静态文本）

- **派出规划**：开始前与工作中估计要派几个子代理、各自负责什么；能复用既有成员就不新派（新成员缓存前缀从零开始；Team 里与主会话强相关的成员用 `context: fork` 复用已缓存前缀）；长或易卡的操作（构建、浏览器/视觉验证、慢命令）可整体交给一个子代理/teammate（跑、有界重试、取证、回报），主会话继续；不派只 sleep/盯梢、没有执行与汇报职责的空转代理。
- **完成与收尾纪律**：任务清单只登记能用现有工具取证的条目；交付前收口（`op:check` / `op:remove` / `op:pause_turn`），不留悬空条目；验收满足即交付、交付后停止修改，再改必须有可验证的缺陷证据；用户说"不需要了/交付"优先于清单提醒；验证命令单条 ≤2 分钟，同一手段连续失败 2 次换路线。
- **档位选择**：`reasoning_effort` 每次委派显式选择（low / medium / high / xhigh / max），不把兜底档位写进提示（避免诱导省略）。
- **任务上下文压缩**：只压缩派发给子代理的任务文本（目标/范围/必要约束/验收标准/必要避坑说明），并明写不适用于模型自己的推理与结论。

section 放在提示晚位（`10150`，介于 `WEB_SURFACE 10100` 与 `DEPLOYMENT_PERSONA_SUFFIX 10200` 之间）是有意为之：提示缓存是前缀匹配的，晚位改动只会让提示尾部小段重新冷启动，不会作废整个系统提示前缀。

### 2. 省略兜底（`tools/execute` waterfall，静默）

仅当工具 schema 声明 `reasoning_effort`（兼容扁平参数表与 `parameters.properties` 两种形状）且调用**省略**该参数时，填入 `defaultEffort`；显式传值永不覆盖；未声明该参数的工具（如 Agent Team 的 `spawn_teammate`）一律不碰。兜底不写进提示文本，只作为漏传时的静默保险。

### 3. 只读名册（Web composer dock）

输入框下方的「子代理」触发器 + 数量角标，浮层列出每个子代理的状态、实际模型与**实际思考档位**；数据同时支持 `agentTeam`（Agent Team 世界）与 `subagentCatalog`（普通 subagent 世界）两种 projection；点击行用完整地址 `{parentSessionId, childSessionId, mode}` 打开子会话。**只读展示，不提供改档控件。**

### 4. teammate 会话遮蔽

对 teammate（非 lead）在其 agent context 上注册同名空文本 section，把这段面向 Lead 的 policy 在 teammate 会话里遮蔽——teammate 不能派任务，这段文本在它们那里只是噪音与泛化风险；lead 与非成员 agent 不受影响。

## 实测（维护者本机，真实任务）

| 场景 | 总花费 | 缓存命中 |
|---|---|---|
| 键盘建模（Three.js 交互式键盘产品页） | 8.8M token | 93% |
| 中国古建筑体素建模 | 11.5M token | 93% |
| 余烬谷 | 19.7M token | 98% |

场景一与 ZCode + 同一模型（4.1f）完成同一任务相比，花费约为后者的一半。口径、混杂因素与复现建议见 [docs/BENCHMARK.md](docs/BENCHMARK.md)。

## 安装（DSH Web profile）

```bash
# 1) 把本仓库放到 DSH 的插件源码目录（路径可自定）
#    e.g. ~/.dsh/plugins-src/dsh-agents-team-next

# 2) 在 profile 的 package.json 里：
#    dependencies  增加  "dsh-agents-team-next": "file:<插件目录绝对路径>"
#    dsh.profile.bundles 数组追加 "dsh-agents-team-next"

# 3) profile 的 cordis.patch.yml 追加配置：
# - id: agents-team-next
#   config:
#     defaultEffort: medium

# 4) 安装并验证
cd ~/.dsh/profiles/web
pnpm install
dsh --profile web --dump-config > /tmp/dump.yml 2>/tmp/dump.err
# 期望：退出码 0、stderr 为空、树中有 agents-team-next 行与 defaultEffort
```

安装后需**完全重启 DSH Host**（新会话生效；旧会话的提示前缀已缓存）。

## 配置

```yaml
- id: agents-team-next
  config:
    enabled: true        # false = 不注册提示 section、teammate 遮蔽与 tools/execute 监听
    defaultEffort: medium # 省略 reasoning_effort 时的静默兜底；schema 默认 low
```

建议 `defaultEffort: medium` 作为兜底地板：提示已要求每次委派显式选档，省略属于漏传，`low` 可能把需要完整思考的任务砍短。

## 验证

```bash
node --check src/index.mjs && node --check src/policy.mjs && node --check src/client.js
node --test test/policy.test.mjs   # 纯策略层，任何目录可跑

# index 测试需要 @deepseek-ai/schemastery 可解析（在 DSH profile 内安装后运行）：
node --test test/policy.test.mjs test/index.test.mjs
```

三层验证边界（诚实声明）：

1. **静态层**：语法、单元测试、`dump-config` 组合验证；
2. **Host 运行时层**：必须完全重启 Host；system prompt section 与 `tools/execute` 兜底只在重启后生效；
3. **浏览器层**：名册 UI 需要重启 Host 并开新会话后在 Web composer dock 出现。

## 已知限制

- **提示是纪律不是强制**：模型仍可能误判任务难度、漏传档位或过度压缩；兜底只覆盖"漏传"这一种情况。
- **Agent Team 世界**：`spawn_teammate` 没有 `reasoning_effort` 参数，`tools/execute` 兜底在此世界天然不动作（schema 守卫）；生效的是提示 section 与名册 UI。
- **名册只列根会话的直接子代理**；嵌套子代理进入其会话后由官方 header 名册展示。
- **缓存**：每个会话的首个请求必然全冷；会话中段的命中波动主要来自运行时上下文更新（文件变化导致系统区快照重渲染），不是本插件造成的逐请求失效。
- **依赖 DSH 公开 seam**：`systemPrompt.section`、`tools/execute` waterfall、`composer.dock` slot、session projections；不修改任何 Agent preset 私有配置。DSH 版本升级若调整这些 seam，需要同步适配。

## 兼容性

- 测试环境：DSH Web profile（2026-10 发行版），Agent Team 启用与关闭两种组合；
- Node ≥ 18（本仓库测试于 Node 24）；
- 运行时依赖只 include 静态模块：`react`、`react/jsx-runtime`、`react-dom`、`@deepseek-ai/dsh-client-ui-primitives`。

## 目录

```
src/policy.mjs   # 纯策略层：档位阶梯、schema 守卫、提示文本（零依赖，可直接测试）
src/index.mjs    # Host：提示 section、teammate 遮蔽、tools/execute 兜底
src/client.js    # Web：composer dock 只读名册
test/            # node:test 单元/集成测试
docs/BENCHMARK.md
```

## 许可

发布前请按需补充 LICENSE（本仓库未附带）。
