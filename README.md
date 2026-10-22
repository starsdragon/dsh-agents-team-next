# dsh-agents-team-next

给 DSH 写的插件，主要做三件事：让子代理按任务难度选思考强度、把派发出去的上下文写短一点、在界面上能看到每个子代理实际用了什么档位。

起因是跑 Three.js 这类长任务时的几个问题：子代理一律按最高档思考，简单活也按最贵的算；派任务时整段对话原样转抄，token 涨得很快；界面上又看不到子代理在做什么。后来还碰到一个更麻烦的情况——活已经干完了，任务台账的提醒还在把模型往回拽，让它觉得自己没做完，继续改。所以除了调度，插件里也带了收尾的规则。

## 工作方式

插件只用了 DSH 的公开扩展点，没改任何 Agent preset 的私有配置。

**系统提示**。在提示里加一段 section，放在 10150 的位置。内容分四块：派出规划、完成与收尾纪律、档位选择、任务上下文压缩。放在靠后是有意的：提示缓存按前缀匹配，以后改这段文字只会让提示尾部重新冷启动，不会把整个系统提示的缓存全部作废。

**派发兜底**。在 `tools/execute` 上挂了个 waterfall 监听。只有工具 schema 里声明了 `reasoning_effort`、并且这次调用确实没传，才填入 `defaultEffort`；显式传的值不会被覆盖。`spawn_teammate` 这类没有这个参数的工具不会被动。这段逻辑不写进提示——告诉模型"不传有默认值"，只会让它偷懒不选。

**名册**。输入框下面加了个「子代理」按钮，点开是当前会话的子代理列表，带状态、模型和实际档位。数据同时兼容 Agent Team 的 `agentTeam` projection 和普通 subagent 的 `subagentCatalog`，点条目会打开对应子会话。名册只读，没有改档入口。

**teammate 遮蔽**。teammate 不能派任务，上面那段面向 Lead 的规则在它们的会话里只是噪音，所以插件会给每个 teammate 注册一个同名的空 section，把全局那段遮掉。lead 和其他 agent 不受影响。

## 实测

三个任务上的会话数据。每个任务只跑了一轮，不是严格的 A/B：

| 场景 | 总花费 | 缓存命中 |
|---|---|---|
| 键盘建模（Three.js 交互式键盘产品页） | 8.8M token | 93% |
| 中国古建筑体素建模 | 11.5M token | 93% |
| 余烬谷 | 19.7M token | 98% |

键盘建模那项，和 ZCode 用同一个模型（4.1f）跑同一个任务相比，花了大约一半。跨 harness 的差异不止来自插件，系统提示、工具集、编排方式都不一样，这个数字别当基准看。具体口径和怎么读这些数写在 [docs/BENCHMARK.md](docs/BENCHMARK.md)。

## 安装

插件装在 DSH 的 web profile 里，用 `file:` 依赖。

1. 把仓库放到 DSH 的插件目录，比如 `~/.dsh/plugins-src/dsh-agents-team-next`。
2. 编辑 profile 的 `package.json`：`dependencies` 里加一条 `"dsh-agents-team-next": "file:<插件目录绝对路径>"`，`dsh.profile.bundles` 数组里加上 `"dsh-agents-team-next"`。
3. 在 profile 的 `cordis.patch.yml` 里加配置：

```yaml
- id: agents-team-next
  config:
    defaultEffort: medium
```

4. 安装并检查：

```bash
cd ~/.dsh/profiles/web
pnpm install
dsh --profile web --dump-config > /tmp/dump.yml 2>/tmp/dump.err
```

dump 的退出码应该是 0，stderr 为空，树里能看到 `agents-team-next` 行和 `defaultEffort`。

装完要完全重启 DSH Host，新会话才会用上新的提示。旧会话的前缀已经缓存，不会自动更新。

## 配置

`enabled` 关掉后，提示 section、teammate 遮蔽和派发兜底都会停，不用卸载。

`defaultEffort` 是漏传档位时的兜底。schema 默认是 `low`，但我建议用 `medium`：提示里已经要求每次委派显式选档，真走到兜底说明是漏传，给 `low` 容易把需要完整思考的任务砍短。

## 已知限制

- 提示是纪律，不是强制。模型仍可能判断错难度、漏传档位，或者把任务描述压得过狠。兜底只处理"漏传"这一种情况。
- Agent Team 模式下，`spawn_teammate` 没有 `reasoning_effort` 参数，派发兜底不会动作（schema 守卫拦住了）。这个模式下真正起作用的是提示和名册。
- 名册只列根会话的直接子代理。嵌套子代理进到它自己的会话里，看官方 header 上的名册。
- 每个会话的第一个请求一定是冷的，命中率会随回合数涨。会话中段命中的波动主要来自运行时上下文更新（文件变了会重渲染系统区的快照），不是插件按请求造成的。
- 依赖 DSH 的几个公开接口：`systemPrompt.section`、`tools/execute` waterfall、`composer.dock` slot、session projections。DSH 升级如果改了这些接口，插件要跟着改。

## 测试

```bash
node --check src/index.mjs && node --check src/policy.mjs && node --check src/client.js
node --test test/policy.test.mjs
```

`policy.test.mjs` 不依赖任何东西，在哪都能跑。`index.test.mjs` 需要 `@deepseek-ai/schemastery` 能解析，装进 DSH profile 之后再跑：

```bash
node --test test/policy.test.mjs test/index.test.mjs
```

## 许可

仓库还没放 LICENSE，用之前自己补一份。
