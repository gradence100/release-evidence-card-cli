# Release Evidence Card CLI - 项目结构图与依赖地图

## 总览

项目根目录: `./projects/release-evidence-card-cli`
版本: 0.2.0
定位: 面向开源 CLI 工具维护者的本地发布证据卡生成器，5 分钟内产出可分享的 `release-evidence.md` + `release-evidence.html`。

---

## 目录结构树

```
release-evidence-card-cli/
├── package.json
├── SPEC.md                    # 产品规格文档
├── README.md                  # 用户说明文档
├── CHANGELOG.md               # 版本历史
├── LICENSE                    # 协议
├── SECURITY.md               # 安全说明
├── CONTRIBUTING.md           # 贡献指南
├── docs/
│   ├── configuration.md       # 配置说明
│   ├── market-patterns.md     # GitHub 市场模式分析
│   ├── origin-story.md        # 产品起源故事
│   ├── release-process.md     # 发布流程指引
│   └── structure-map.md      # 本文件：结构图与依赖地图
├── src/
│   └── index.js               # 唯一核心入口，全部逻辑在这个单文件内完成
├── test/
│   └── index.js               # 全套 Node.js 原生测试套件
├── fixtures/
│   ├── passing/               # 全通过样板项目，含预构建 tgz
│   ├── passing-readme/        # README 5/5 全满分样板
│   ├── weak-readme/           # 弱文档低分成样板
│   ├── missing-bin/           # 缺失 bin 入口样板
│   └── failing/               # 治理文件缺失的失败样板
├── .github/
│   ├── workflows/ci.yml       # GitHub CI 流水线
│   └── ISSUE_TEMPLATE/        # Issue/PR 模板
└── 产物输出：
    ├── release-evidence.md    # Markdown 格式证据卡
    ├── release-evidence.html  # HTML 可直接打开的分享报告
    └── release-evidence-smoke.md  # run 命令生成的完整安装冒烟报告
```

---

## 模块依赖地图

### 第一层: Node.js 内置依赖（零外部 npm 依赖）

| 模块来源 | 用途 |
|---|---|
| `node:fs/promises` | 异步文件读取、检查治理文件 |
| `node:fs` 同步 | 写报告、建临时目录、清临时沙箱 |
| `node:path` | 路径拼接、跨平台兼容 |
| `node:child_process` | 执行 `npm pack`、安装、入口命令冒烟 |
| `node:url` | ESM 下定位 __dirname |
| `node:test` + `node:assert` | 原生单元/集成测试，零测试库依赖 |

本项目没有任何第三方运行时依赖，只要求 Node >= 18，启动成本极低，完全符合「五分钟内跑通」的市场机会约束。

---

### 第二层: 核心逻辑内部流向

```
CLI 入口 src/index.js
├─ 顶层 main()             → CLI 参数解析: 支持 --dir 指定目标目录，--entry 指定冒烟测试命令，--help 打印用法
├─ loadConfig()            → 读取项目根目录下 .release-evidence-card.json，无文件时返回默认配置
├─ checkGovernanceFiles() → 批量检查 LICENSE / SECURITY.md / CONTRIBUTING.md / CHANGELOG / repository 字段
├─ scoreReadme()          → README 首屏打分：5 项硬标准
│  ├─ target user
│  ├─ install command
│  ├─ first run command
│  ├─ expected output
│  └─ license mention
├─ cmdCheck()             → 主检查命令，组装完整证据卡
│  ├─ 读取 package.json
│  ├─ bin 入口真实存在性校验（不是只看字段）
│  ├─ Node engine 字段检查
│  ├─ CI workflow 存在检测
│  └─ 输出 release-evidence.md + release-evidence.html
├─ cmdRun()               → 完整沙箱冒烟四段式：
│  ├─ Step 1: npm pack 在目标目录生成本地 tgz
│  ├─ Step 2: 自动创建带时间戳的临时 sandbox，初始化 npm 后安装刚生成的 tarball
│  ├─ Step 3: 运行用户指定 --entry 命令，捕获输出并脱敏路径
│  └─ Step 4: finally 块自动清理临时沙箱目录，不留残留
│  最终额外输出 release-evidence-smoke.md
├─ generateHtmlReport()   → 把 Markdown 报告转成可直接打开的极简 HTML
└─ cmdDemo()              → 自动遍历 fixtures 下所有目录，批量展示不同样板的 README 得分、bin 状态和治理文件覆盖率
   输出结果直接打印到控制台，给新用户演示不同边界场景的工具表现。
```

三个顶层命令：
1. `release-evidence-card check`   - 快速发布健康检查，生成基础证据卡
2. `release-evidence-card run`    - 完整 tarball 安装冒烟测试，必须传 --entry
3. `release-evidence-card demo`   - 自动遍历全部 fixtures，向新用户演示工具能力

---

### 第三层: Fixtures 与测试资产关系

测试套件直接复用 5 组 fixture，每种覆盖一个边界场景：

- `passing`：治理文件齐全、bin 存在，最终 Verdict PASS
- `passing-readme`：README 命中全部 5 项评分规则，Score 5/5
- `weak-readme`：README 缺项，得分低，暴露首屏引导问题
- `missing-bin`：package.json 有 bin 字段但指向文件不存在 → MISSING
- `failing`：治理文件缺失 → Verdict PENDING

测试套件 test/index.js 直接复用全部 fixtures，用 node:test 原生 API 跑 19 个用例，覆盖配置加载、治理文件检查、README 打分、bin 校验、CI 检测、报告生成全链路。没有额外 mock 库；测试完全靠真实 fixture 目录和真实命令执行，结果可复现。

---

## 关键边界入口

| 入口点 | 作用 |
|---|---|
| `package.json#bin.release-evidence-card` | npm 全局挂载入口 |
| 顶层 main() | CLI 参数解析：支持 `--dir` 指定目标目录，`--entry` 指定冒烟测试命令，`--help` 打印用法 |
| `--dir` 参数 | 支持对任意目标项目目录扫描，不限于当前 cwd |
| `.release-evidence-card.json` | 用户自定义配置：增减治理文件、调整忽略目录 |
| `--entry` 参数 | 用户指定打包后第一条要跑的命令，验证安装后行为正确 |

---

## 为什么这样设计

1. 零第三方运行依赖 → npx 启动不需要等一大堆包下载，五分钟门槛直接降到几十秒。
2. 单文件核心逻辑 → 维护者一眼能看完整个工具，理解成本极低。
3. 证据卡产物是纯静态 Markdown + HTML → 可以直接贴到 PR 描述、Release 说明、README 底部，不需要后端服务。
4. 每个 fixture 都是真实场景样本 → 后续新增检查规则可以很容易加对应 fixture，保证测试覆盖率不下降。

这个结构完全对齐项目的楔点：「开源维护者快速证明 release 安全、用户五分钟内看到真实价值」，没有多余层级和多余依赖。
