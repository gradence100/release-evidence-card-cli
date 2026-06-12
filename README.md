# Release Evidence Card CLI

> 给你的 npm CLI 拍一张可分享的发布证件照。
> 
> 你不用等新用户踩坑后再来反馈「装不上」。发版前自己先拿一张证。

### 本项目自己的发布证件照
我们每次发版前都会用自己跑出来的结果做验收：
- 👉 [release-evidence.md](./release-evidence.md)
- 👉 [release-evidence.html](./release-evidence.html)

### 一行就能跑
不需要配置文件，不需要账号注册：

```bash
npx release-evidence-card check ./your-cli-project
```

或者用内置示例零门槛 30 秒跑完 demo：

```bash
npx release-evidence-card demo
```

跑一次，5 分钟内全部在本地完成：
- ✅ 真实 `npm pack` 生成 tarball
- ✅ 临时沙箱里全新安装
- ✅ 自动跑你项目里的首条示例命令
- ✅ 输出 `release-evidence.md` + `release-evidence.html`
- ✅ 全程不上传任何东西到第三方服务

> 你是开源 CLI / 工具维护者：你有测试、CI、README，但发版前拿不出一张「打包产物真能装、第一条命令真能跑」的统一证明。这个小工具就只解决这件事。

### Five-minute first value

The intended published path is `npx release-evidence-card demo`. This repository is still a local-only prototype, so the exact first-run commands used to verify it are:

```bash
cd projects/release-evidence-card-cli
node src/index.js demo
node src/index.js check --dir fixtures/passing
node src/index.js check --dir fixtures/failing
```

Expected first screen from `node src/index.js demo`:

```text
# Release Evidence Card CLI - Demo
Fixture: failing
Score: 0/5
Bin entry: MISSING
Governance files: 0/5 present

Fixture: passing
Score: 5/5
Bin entry: YES
Governance files: 5/5 present
```

The pass/fail contrast is the demo: a maintainer sees the publishable fixture and the concrete release gaps in the failing fixture before touching any real project. The proof artifacts produced by the same local entry point are `release-evidence.md`, `release-evidence.html`, and `release-evidence-smoke.md`.

To run the pack/install smoke path against the bundled passing fixture:

```bash
node src/index.js run --entry "node --version" --dir fixtures/passing
```

Expected smoke evidence:

```text
# Release Evidence Smoke Test
## Step 1: npm pack
- Status: PASS
## Step 2: Install in temporary sandbox
- Status: PASS
## Step 3: Entry Smoke Test
- Status: PASS
```

### 和别的工具不一样
- CI 只能在远程机器跑；你在自己本地发版前先验一遍。
- 单元测试断言代码逻辑；这个断言「发布出去的产物开箱就能用」。
- README 是给人读的；生成出来的证据卡是给项目页面做信任背书的。

---

| 现在你常用的东西 | 这里补上的短板 |
|---|---|
| CI 在远程机器跑 | 发版前你在自己本地先跑一遍，看见证据再推送 |
| 单元测试只断言代码逻辑 | 额外断言"打包出来的真实产物在全新环境里开箱可用" |
| README 只写给人看 | 生成的卡片同时给人和社交链接做信任背书 |
| 新用户点进来先克隆试错 | 你直接把证据卡链接贴在 README 顶部，一秒就能看见这次发布不是瞎吹 |

## 目标用户

Open source developer-tool and automation CLI maintainers who have a working repo but need trustworthy release evidence before asking users to install, star, or adopt it.

---

## 安全边界

本工具是本地原型。它不会创建仓库、Issue、PR、Release 或任何 GitHub 写入操作；检查和演示全程没有网络请求，所有操作只在你本地文件系统完成。

## 痛点

Maintainers often have tests, README text, and release automation scattered across separate tools, but they cannot quickly prove that:
- the packaged artifact installs cleanly
- the first command works as documented
- governance files (LICENSE, SECURITY.md, CONTRIBUTING.md) exist
- the release is safe to share

New users then face the same friction identified in the market memory: setup steps, unclear demos, and weak visible outcomes before they ever reach value.

## 两分钟快速体验

两行就能跑通完整 demo：

想看"项目没准备好"的失败场景，直接跑内置坏示例：

```bash
npx release-evidence-card demo --fixture failing
```

示例输出：

```
# Release Evidence Card
**Target directory:** projects/release-evidence-card-cli
**Generated:** 2026-06-11
## Package Info
- Name: release-evidence-card-cli
- Bin entry: YES
- Node engine constraint: YES
## Governance Files
- PASS: LICENSE
- PASS: SECURITY.md
- PASS: CONTRIBUTING.md
- PASS: CHANGELOG.md
## CI
- CI workflow: PASS (found)
## README First-Run Score
- File: README.md
- Score: 5/5
- PASS: target user
- PASS: install command
- PASS: first run command
- PASS: expected output
- PASS: license mention
## Configuration
- ignoreDirs: node_modules, .git, .github
- Custom config: NO (using defaults)
## Verdict: PASS
```

## 它和别的工具差别在哪里

This tool occupies a specific niche that existing tools do not fill:

- **npm pack / npm publish --dry-run**: Only validates packaging syntax, not release readiness (no governance checks, no README score, no CI detection).
- **renovate / dependabot**: Focus on dependency updates, not pre-release documentation or governance hygiene.
- **husky / lint-staged**: Run pre-commit checks on code quality, not release evidence assembly.
- **semantic-release / standard-version**: Automate version bump and changelog generation, but assume governance files and README are already present.
- **readme-md-generator**: Generates README scaffolding from prompts, but does not evaluate existing README completeness or run pack/install smoke tests.
- **action-tmate**: Debug CI via SSH, unrelated to release readiness.

The core difference: this tool runs local pack/install smoke and governance checks together, produces a single evidence card, and is designed for the five-minute window before asking a user to install or star your project. It does not replace CI, linters, or code quality checks; it fills the gap *between* development and release announcement.

### Competitor, alternative, and differentiation evidence

This section is intentionally concrete so the project is not relying on keyword-only claims.

| Alternative or competitor path | What it proves | What remains unproven before a release | Release Evidence Card difference |
|---|---|---|---|
| `npm pack` / `npm publish --dry-run` | Package metadata and tarball creation | Whether a fresh install can run the documented first command, and whether README/governance evidence is shareable | Runs pack, checks docs/governance, and writes a Markdown/HTML evidence card |
| CI workflow | Checks selected jobs on remote runners | Whether the exact local tarball a maintainer is about to announce has a readable proof card | Produces local artifacts the maintainer can inspect before pushing |
| Unit tests and linters | Code behavior and style | Whether new users see a quickstart, expected output, license, and safety files | Scores README first-run evidence and governance files in the same report |
| Release automation such as semantic-release | Versioning and changelog flow | Whether install smoke, first command, SECURITY.md, and CONTRIBUTING.md are present now | Acts as a release-readiness gate before announcing, not a version bump tool |

Evidence in this repo: `fixtures/passing` returns a PASS-style card with 5/5 README scoring and governance files present; `fixtures/failing` shows the negative sample with missing governance files and a 0/5 README score. That contrast is the product wedge for npm CLI maintainers.

## 配置

Create `.release-evidence-card.json` in the target directory to override default settings:

```json
{
  "ignoreDirs": ["node_modules", ".git", ".github", "dist", "coverage"],
  "governanceFiles": ["LICENSE", "SECURITY.md", "CONTRIBUTING.md", "CHANGELOG.md"],
  "ciPaths": [".github/workflows/ci.yml", ".github/workflows/ci.yaml", ".gitlab-ci.yml"],
  "readmePaths": ["README.md", "README.rst"]
}
```

### 忽略目录行为

By default, the tool skips scanning `node_modules`, `.git`, and `.github` directories to avoid checking external or non-source-controlled files. Add or remove entries in `ignoreDirs` via your config to match your project structure.

Example: If your project has a `build` directory that is not source-controlled, you can add it to ignoreDirs. For full documentation on configuration (including edge cases and test coverage), see [docs/configuration.md](./docs/configuration.md).

```json
{
  "ignoreDirs": ["node_modules", ".git", "build"]
}
```

If no config file is found, the tool uses these sensible defaults.

### Configuration contract proof

The configuration contract is covered by both docs and tests:

- Missing config: if `.release-evidence-card.json` is absent, the report prints `Custom config: NO (using defaults)` and uses the default `ignoreDirs`, `governanceFiles`, `ciPaths`, and `readmePaths`.
- `ignoreDirs` behavior: the default list is `node_modules`, `.git`, `.github`; users can replace it in config when generated folders such as `dist`, `coverage`, or `build` should be ignored.
- Custom config: a partial config is merged with defaults, so a project can override `governanceFiles` without restating `ciPaths` or `readmePaths`.
- Verification: `node --test test/` includes sections named `missing config handling`, `ignoreDirs behavior`, `governance file checks`, and `custom config file`.

## 证据产物说明

The `release-evidence.md` report generated by `check` includes:
- Package info (bin entry, engines, private status)
- Governance file presence (LICENSE, SECURITY.md, etc.)
- CI workflow detection (from .github/workflows/ci.yml)
- README first-run score (target user, install command, etc.)
- Configuration summary
- Final verdict (PASS/PENDING) with items to fix before release

## 失败场景示例

When checking a project with missing governance files and incomplete README:

```
# Release Evidence Card
**Target directory:** /work/hui/civilization3.0/projects/release-evidence-card-cli/fixtures/failing
**Generated:** 2026-06-11

## Configuration
- ignoreDirs: node_modules, .git, .github
- Custom config: NO (using defaults)
## Package Info
- Name: failing-cli
- Bin entry: YES
- Node engine constraint: YES

## Governance Files
- FAIL: LICENSE
- FAIL: SECURITY.md
- FAIL: CONTRIBUTING.md
- FAIL: CHANGELOG.md
## CI
- CI workflow: FAIL (missing)
- CI config: Node.js 18, 20, 22 matrix
## README First-Run Score
- File: fixtures/failing/README.md
- Score: 0/5
- MISSING: target user
- MISSING: install command
- MISSING: first run command
- MISSING: expected output
- MISSING: license mention
## Configuration
- ignoreDirs: node_modules, .git, .github
- Custom config: NO (using defaults)
## Verdict: PENDING

### Items to fix before release:
- Add LICENSE to project root
- Add SECURITY.md to project root
- Add CONTRIBUTING.md to project root
- Add CHANGELOG.md to project root
- Add CI workflow at .github/workflows/ci.yml
- Improve README: add target user, install command, and first-run example
```

## License

MIT
