import fs from "node:fs/promises";
import { existsSync, readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");

// Load own version from package.json
const ownPkg = JSON.parse(readFileSync(path.join(PROJECT_ROOT, "package.json"), "utf8"));
const OWN_VERSION = ownPkg.version;

/* ─── Config ─────────────────────────────────────────────────── */

const DEFAULT_CONFIG = {
  ignoreDirs: ["node_modules", ".git", ".github"],
  governanceFiles: ["LICENSE", "SECURITY.md", "CONTRIBUTING.md", "CHANGELOG.md"],
  ciPaths: [".github/workflows/ci.yml", ".github/workflows/ci.yaml"],
  readmePaths: ["README.md", "README.rst"],
};

function loadConfig(projectDir) {
  const configPath = path.join(projectDir, ".release-evidence-card.json");
  try {
    const raw = readFileSync(configPath, "utf8");
    const user = JSON.parse(raw);
    return { ...DEFAULT_CONFIG, ...user, custom: true };
  } catch {
    return { ...DEFAULT_CONFIG, custom: false };
  }
}

/* ─── Governance Files ──────────────────────────────────────── */

export async function checkGovernanceFiles(projectDir) {
  const config = loadConfig(projectDir);
  const govFiles = config.governanceFiles;
  const checks = {};
  for (const file of govFiles) {
    const filePath = path.join(projectDir, file);
    try {
      await fs.access(filePath);
      checks[file] = "present";
    } catch {
      checks[file] = "missing";
    }
  }
  const pkgPath = path.join(projectDir, "package.json");
  try {
    const pkg = JSON.parse(await fs.readFile(pkgPath, "utf8"));
    checks.repository = pkg.repository ? "present" : "missing";
  } catch {
    checks.repository = "missing";
  }
  return checks;
}

/* ─── HTML Report ───────────────────────────────────────────── */

export function generateHtmlReport(report) {
  const safe = report.content.replace(/`/g, "").replace(/\n/g, "<br>");
  return `<!DOCTYPE html>
<html>
<head><title>Release Evidence for ${path.basename(report.projectDir)}</title>
<style>body{font-family:system-ui;max-width:800px;margin:2em auto;line-height:1.5}pre{background:#f5f5f5;padding:1em;border-radius:4px}</style>
</head>
<body><h1>Release Evidence</h1><pre>${safe}</pre></body>
</html>`;
}

/* ─── README First-Run Score ────────────────────────────────── */

function scoreReadme(content) {
  const score = {};
  score["target user"] = /target user|audience|for .* who/i.test(content) ? "PASS" : "MISSING";
  score["install command"] = /npm install|npx |cargo install|pip install|go install|brew install/i.test(content) ? "PASS" : "MISSING";
  score["first run command"] = /usage|quickstart|get started|run|example/i.test(content) ? "PASS" : "MISSING";
  score["expected output"] = /output|result|will see|prints|shows/i.test(content) ? "PASS" : "MISSING";
  score["license mention"] = /license|mit|apache|gpl|bsd/i.test(content) ? "PASS" : "MISSING";
  return score;
}

/* ─── Check Command ─────────────────────────────────────────── */

async function cmdCheck(targetDir) {
  const config = loadConfig(targetDir);
  const pkgPath = path.join(targetDir, "package.json");

  // Package info
  let pkg = null;
  try { pkg = JSON.parse(await fs.readFile(pkgPath, "utf8")); } catch {}
  const pkgName = pkg?.name || "(unknown)";
  const hasEngines = pkg?.engines?.node ? "YES" : "MISSING";
  const isPrivate = pkg?.private ? "YES" : "NO";

  // Bin entry validation: check that the referenced file actually exists
  let hasBin = "MISSING";
  if (pkg?.bin) {
    const binPaths = typeof pkg.bin === "string"
      ? [pkg.bin]
      : Object.values(pkg.bin);
    let anyBinFileExists = false;
    let anyBinEntry = false;
    for (const binPath of binPaths) {
      anyBinEntry = true;
      const fullPath = path.resolve(targetDir, binPath);
      if (existsSync(fullPath)) {
        anyBinFileExists = true;
        break;
      }
    }
    if (anyBinEntry && anyBinFileExists) {
      hasBin = "YES";
    } else if (anyBinEntry && !anyBinFileExists) {
      hasBin = "MISSING";
    }
  }

  // Governance files
  const govChecks = await checkGovernanceFiles(targetDir);

  // CI detection
  let ciFound = false;
  for (const ciPath of config.ciPaths) {
    if (existsSync(path.join(targetDir, ciPath))) { ciFound = true; break; }
  }

  // README scoring
  let readmeScore = { "readme": "N/A" };
  let readmeFile = "N/A";
  for (const rp of config.readmePaths) {
    const rpFull = path.join(targetDir, rp);
    if (existsSync(rpFull)) {
      readmeFile = rpFull;
      const content = readFileSync(rpFull, "utf8");
      readmeScore = scoreReadme(content);
      break;
    }
  }

  // Build report
  const lines = [];
  lines.push(`# Release Evidence Card`);
  lines.push(`**Target directory:** ${targetDir}`);
  lines.push(`**Generated:** ${new Date().toISOString().slice(0, 10)}`);
  lines.push(``);
  lines.push(`## Package Info`);
  lines.push(`- Name: ${pkgName}`);
  lines.push(`- Bin entry: ${hasBin}`);
  lines.push(`- Node engine constraint: ${hasEngines}`);
  lines.push(`- Private: ${isPrivate}`);
  lines.push(``);
  lines.push(`## Configuration`);
  lines.push(`- ignoreDirs: ${config.ignoreDirs.join(", ")}`);
  lines.push(`- Custom config: ${config.custom ? "YES" : "NO (using defaults)"}`);
  lines.push(``);

  // Governance section
  lines.push(`## Governance Files`);
  const govItems = config.governanceFiles;
  for (const file of govItems) {
    const status = govChecks[file] === "present" ? "PASS" : "FAIL";
    lines.push(`- ${status}: ${file}`);
  }
  lines.push(`- ${govChecks.repository === "present" ? "PASS" : "FAIL"}: repository field in package.json`);
  lines.push(``);

  // CI
  lines.push(`## CI`);
  lines.push(`- CI workflow: ${ciFound ? "PASS (found)" : "FAIL (missing)"}`);
  lines.push(``);

  // README score
  const scoreValues = Object.values(readmeScore);
  const passCount = scoreValues.filter(v => v === "PASS").length;
  const totalCount = scoreValues.length;
  lines.push(`## README First-Run Score`);
  lines.push(`- File: ${readmeFile}`);
  lines.push(`- Score: ${passCount}/${totalCount}`);
  for (const [criteria, status] of Object.entries(readmeScore)) {
    lines.push(`- ${status}: ${criteria}`);
  }
  lines.push(``);

  // Verdict
  const allPass = Object.values(govChecks).every(v => v === "present") && ciFound && passCount === totalCount && hasBin === "YES";
  lines.push(`## Verdict: ${allPass ? "PASS" : "PENDING"}`);
  if (!allPass) {
    lines.push(``);
    lines.push(`### Items to fix before release:`);
    for (const file of govItems) {
      if (govChecks[file] !== "present") lines.push(`- Add ${file} to project root`);
    }
    if (govChecks.repository !== "present") lines.push(`- Add repository field to package.json`);
    if (!ciFound) lines.push(`- Add CI workflow at .github/workflows/ci.yml`);
    if (hasBin !== "YES") lines.push(`- Add bin entry to package.json`);
    for (const [criteria, status] of Object.entries(readmeScore)) {
      if (status === "MISSING") lines.push(`- Improve README: add ${criteria}`);
    }
  }

  const report = lines.join("\n");
  const reportPath = path.join(process.cwd(), "release-evidence.md");
  writeFileSync(reportPath, report, "utf8");

  // Also write HTML
  const html = generateHtmlReport({ projectDir: targetDir, content: report });
  writeFileSync(path.join(process.cwd(), "release-evidence.html"), html, "utf8");

  console.log(report);
  return report;
}

/* ─── Run Command (pack/install smoke) ──────────────────────── */

async function cmdRun(entryCmd, targetDir) {
  const cwd = targetDir || process.cwd();
  const lines = [];
  lines.push(`# Release Evidence Smoke Test`);
  lines.push(`**Target directory:** ${cwd}`);
  lines.push(`**Entry command:** ${entryCmd}`);
  lines.push(`**Generated:** ${new Date().toISOString().slice(0, 10)}`);
  lines.push(``);

  // Step 1: npm pack
  lines.push(`## Step 1: npm pack`);
  try {
    const packOutput = execSync("npm pack 2>/dev/null", { cwd, encoding: "utf8" }).trim();
    const tgzFile = packOutput.split("\n").pop().trim();
    lines.push(`- Tarball: ${tgzFile}`);
    lines.push(`- Status: PASS`);
    lines.push(``);

    // Step 2: Install in temp sandbox
    const tmpDir = path.join(cwd, `tmp-smoke-${Date.now()}`);
    mkdirSync(tmpDir, { recursive: true });
    try {
      const tgzPath = path.resolve(cwd, tgzFile);
      lines.push(`## Step 2: Install in temporary sandbox`);
      execSync(`npm init -y 2>/dev/null`, { cwd: tmpDir, encoding: "utf8" });
      execSync(`npm install "${tgzPath}" 2>/dev/null`, { cwd: tmpDir, encoding: "utf8" });
      lines.push(`- Sandbox: ${tmpDir}`);
      lines.push(`- Status: PASS`);
      lines.push(``);

      // Step 3: Run entry command
      lines.push(`## Step 3: Entry Smoke Test`);
      lines.push(`- Command: ${entryCmd}`);
      try {
        const entryOutput = execSync(entryCmd, { cwd: tmpDir, encoding: "utf8", timeout: 15000 });
        // Redact paths
        const redacted = entryOutput.replace(tmpDir, "<sandbox>").replace(cwd, "<project>");
        lines.push(`- Status: PASS`);
        lines.push(`- Output:`);
        for (const line of redacted.split("\n").slice(0, 20)) {
          lines.push(`  ${line}`);
        }
      } catch (execErr) {
        lines.push(`- Status: FAIL`);
        lines.push(`- Error: ${execErr.stderr?.slice(0, 200) || execErr.message}`);
      }
    } finally {
      // Cleanup
      try { rmSync(tmpDir, { recursive: true, force: true }); } catch {}
    }
  } catch (packErr) {
    lines.push(`- Status: FAIL`);
    lines.push(`- Error: ${packErr.stderr?.slice(0, 200) || packErr.message}`);
  }

  const report = lines.join("\n");
  const reportPath = path.join(process.cwd(), "release-evidence-smoke.md");
  writeFileSync(reportPath, report, "utf8");
  console.log(report);
  return report;
}

/* ─── Demo Command ──────────────────────────────────────────── */

async function cmdDemo() {
  const fixturesDir = path.join(PROJECT_ROOT, "fixtures");
  const lines = [];
  lines.push(`# Release Evidence Card CLI - Demo`);
  lines.push(`**Generated:** ${new Date().toISOString().slice(0, 10)}`);
  lines.push(``);

  // Check all fixture directories
  const entries = await fs.readdir(fixturesDir, { withFileTypes: true });
  const fixDirs = entries.filter(e => e.isDirectory()).map(e => e.name).sort();

  for (const fixName of fixDirs) {
    const fixPath = path.join(fixturesDir, fixName);
    lines.push(`---`);
    lines.push(`Fixture: ${fixName}`);

    // Check README score
    for (const rp of DEFAULT_CONFIG.readmePaths) {
      const rpFull = path.join(fixPath, rp);
      if (existsSync(rpFull)) {
        const content = readFileSync(rpFull, "utf8");
        const score = scoreReadme(content);
        const passCount = Object.values(score).filter(v => v === "PASS").length;
        const total = Object.keys(score).length;
        lines.push(`Score: ${passCount}/${total}`);
        for (const [criteria, status] of Object.entries(score)) {
          lines.push(`  ${status}: ${criteria}`);
        }
        break;
      }
    }

    // Check package.json
    const pkgPath = path.join(fixPath, "package.json");
    if (existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
        lines.push(`Bin entry: ${pkg.bin ? "YES" : "MISSING"}`);
        lines.push(`Private: ${pkg.private ? "YES" : "NO"}`);
      } catch {}
    }

    // Check governance files
    const gov = await checkGovernanceFiles(fixPath);
    const govPresent = Object.values(gov).filter(v => v === "present").length;
    lines.push(`Governance files: ${govPresent}/${Object.keys(gov).length} present`);
    lines.push(``);
  }

  // Also list project fixtures
  lines.push(`---`);
  for (const fixName of fixDirs) {
    lines.push(`Project fixture: ${fixName}`);
  }

  console.log(lines.join("\n"));
  return lines.join("\n");
}

/* ─── CLI Entry Point ───────────────────────────────────────── */

async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0];

  if (cmd === "--version" || cmd === "-v") {
    console.log(OWN_VERSION);
    return;
  }

  if (!cmd || cmd === "--help" || cmd === "-h") {
    console.log(`Usage:
  release-evidence-card check [--dir <path>]
  release-evidence-card run --entry "<command>" [--dir <path>]
  release-evidence-card demo`);
    return;
  }

  if (cmd === "check") {
    const dirIdx = args.indexOf("--dir");
    const targetDir = dirIdx !== -1 ? path.resolve(args[dirIdx + 1] || ".") : process.cwd();
    await cmdCheck(targetDir);
  } else if (cmd === "run") {
    const entryIdx = args.indexOf("--entry");
    if (entryIdx === -1) {
      console.error("Error: --entry is required for run command");
      process.exit(1);
    }
    const entryCmd = args[entryIdx + 1] || "";
    const dirIdx = args.indexOf("--dir");
    const targetDir = dirIdx !== -1 ? path.resolve(args[dirIdx + 1]) : null;
    await cmdRun(entryCmd, targetDir);
  } else if (cmd === "demo") {
    await cmdDemo();
  } else {
    console.error(`Unknown command: ${cmd}`);
    process.exit(1);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
