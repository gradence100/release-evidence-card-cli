# Release Evidence Card CLI：市场模式分析

作者：沈澜
数据来源：外部信号市场记忆 + 项目候选阶段调研

---

## 3 个 Effective Patterns（有效模式）

### Pattern 1：五分钟开箱路径

**表现：** 最受用户认可的 CLI/工具类项目，都有一条从"看到项目"到"看到价值"不超过五分钟的路径。npx one-liner、Docker run、或者下载单文件二进制——用户不需要读超过三行说明就能开始。

**在 Release Evidence Card 中的实现：**
- `npx release-evidence-card check` 直接运行，无需安装、注册、配置
- 内置 passing/failing fixtures，`demo` 命令让用户在 30 秒内看到完整输出
- 总运行耗时 < 1 秒（实测 376ms），远低于五分钟门槛

**为什么有效：** 用户决定是否试用一个新 CLI 的注意力窗口确实在五分钟以内。超过这个阈值，转化率指数级下降。项目以"check"为核心命令，意思就是"你已经在项目目录里了，跑一下就行"。

---

### Pattern 2：证据链可自举（Dogfooding）

**表现：** 高信任度的开发者工具都有一个共同特征——工具自己用自己的产物。用户在试用这个工具时，其实也在验证工具的承诺：如果你说你能生成发布证据，那你自己的发布证据在哪里？

**在 Release Evidence Card 中的实现：**
- 项目已经在自己身上完整跑过自举：pack → 沙箱安装 → 首条命令 → 治理检查 → 三份产物
- 每次发版前，维护者可以在本地跑 `node src/index.js check`，输出的 release-evidence.md 就是自己可信度的活证据
- 谭微的证据链审计确认整个链路没有人工编辑，所有字段都有真实来源

**为什么有效：** 用户对一个宣称"帮你证明发布可信"的工具最合理的怀疑就是"那你为什么不先证明你自己？"。自举把这个怀疑直接打消了。

---

### Pattern 3：先说边界再讲功能

**表现：** 失败的开源项目总是拼命写自己能做什么，成功的项目往往先写自己不能做什么。原因很简单：用户读功能列表时在猜"这东西到底适不适合我"，读边界时在确认"哦，这确实是我需要的"。

**在 Release Evidence Card 中的实现：**
- 明确不替代单元测试和 CI
- 明确不能证明无漏洞
- 明确不上传任何产物到第三方
- 项目 README 顶部的 Safety Boundary 区块是这个模式的直接体现

**为什么有效：** 市场记忆里有一个明确的失败模式叫"vague differentiation"——项目看起来什么都做，但记不住它到底解决什么问题。先画边界，等于帮用户在三秒内决定"我是不是它的目标用户"。

---

## 2 个 Anti-Patterns（应避免的模式）

### Anti-pattern 1：功能膨胀 — 在 MVP 阶段并行支持多语言/多包管理器

**表现：** 项目在初期就试图支持 npm、pip、cargo、go install，结果每个语言的包机制、沙箱隔离、命令检测都不一样，维护者在调试非核心问题上消耗了大部分精力，核心价值反而没打磨好。

**为什么这是反模式：**
- 增加的不只是代码量，而是每个语言的退出码语义、路径脱敏规则、tarball 格式差异
- 目标用户画像被稀释：Python 用户看到 npm 相关字样觉得跟自己无关，Node 用户觉得"做这么泛肯定每个都是半成品"
- 市场记忆显示"First value may drop for non-technical buyers or teams wanting pure SaaS simplicity"——范围越宽，第一批用户的价值感知越浅

**当前项目的规避：** 严格遵守 "v0 只支持 npm CLI 项目"的边界。余青的衔接卡和 SPEC.md 都明确写死了这个范围。

---

### Anti-pattern 2：把证据卡变成另一个 CI 系统

**表现：** 给工具加上远程运行、持续集成、自动 PR 评论、发布闸门——想把"本地证据卡"升级成"发布管理平台"。

**为什么这是反模式：**
- 本地证据卡的核心差异就是"在发版前、在维护者自己的电脑上、用即将发布的真实 tarball 做一次开箱验收"。一旦变成远程服务，就和现有 CI 没有本质区别了。
- 增加了网络依赖、认证系统、权限管理，但核心的"快速开箱验证"价值被稀释
- 市场记忆里的 GitHub Failure Pattern 提到 "setup steps, unclear demos, and weak visible outcomes before they ever reach value"——加远程功能就是增加 setup steps

**当前项目的规避：**
- 现存的三条不做原则直接封死了这个路径
- "它不上传任何产物到第三方，所有证据本地生成"

---

## 1 个 Opportunity（机会点）

### 机会：把证据卡变成 GitHub star 的社会证明锚点

从市场记忆的 GitHub Winning Patterns 来看，star 增长最快的中型项目都有一个共同特征：**它们给访问者一个明确的"信任锚点"，让访问者在三秒内理解"这个项目值得关注"**。

Release Evidence Card CLI 可以自然成为这个锚点：

- 项目维护者把 release-evidence.md 的链接放在 README 顶部，访问者看到的不再是"快速开始"这种营销文本，而是一份不可否认的本地验收记录
- 证据卡里的 tarball sha256、沙箱安装退出码 0、首条命令成功这些字段，本身就是"这个项目是认真维护的"社会证明
- 这和"第一个 star"的心理学机制一致：人们更倾向于关注已经被验证过的项目

**具体动作建议（无需改代码，立刻可用）：**
- 在自己的项目 README 顶部加上：
  ```markdown
  ## 发布证据卡
  [📄 release-evidence.md](./release-evidence.md) | [🌐 release-evidence.html](./release-evidence.html)
  每次发版前本地运行 `npx release-evidence-card check` 生成。
  ```
- 在 GitHub Release 的 release note 里直接嵌入证据卡链接
- 把证据卡作为"请求 star"的替代物：不是"如果觉得有用给个 star"，而是"这是本次发布的本地验收报告，看完再决定"

**为什么这是机会而不是膨胀：**
- 不需要增加一行代码
- 不改变项目边界
- 直接借用"社会证明"的心理学原理放大现有功能的价值感知
- 和项目定位完全不冲突：它仍然是一个本地 CLI，只是在 README 里多放了一个链接

---

*沈澜 · 2026-06-12*
