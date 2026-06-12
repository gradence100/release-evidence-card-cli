import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { execSync } from 'node:child_process';
import { existsSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const CLI = 'node src/index.js';
const FIXTURES = 'fixtures';

describe('Release Evidence Card CLI', () => {

  describe('demo command', () => {
    it('should run demo against bundled fixtures without errors', () => {
      const output = execSync(`${CLI} demo`, { encoding: 'utf8' });
      assert.ok(output.includes('Release Evidence Card CLI - Demo'));
      assert.ok(output.includes('Fixture:'));
      assert.ok(output.includes('Score:'));
    });

    it('should show passing-readme with score 5/5', () => {
      const output = execSync(`${CLI} demo`, { encoding: 'utf8' });
      assert.ok(output.includes('Fixture: passing-readme'));
      assert.ok(output.includes('Score: 5/5'));
    });

    it('should show weak-readme with low score', () => {
      const output = execSync(`${CLI} demo`, { encoding: 'utf8' });
      const weakMatch = output.match(/Fixture: weak-readme[\s\S]*?Score: (\d+\/\d+)/);
      if (weakMatch) {
        const [score, total] = weakMatch[1].split('/').map(Number);
        assert.ok(score < total, 'weak-readme should score less than maximum');
      }
    });

    it('should report project fixtures (passing, failing, missing-bin)', () => {
      const output = execSync(`${CLI} demo`, { encoding: 'utf8' });
      assert.ok(output.includes('Project fixture: passing'));
      assert.ok(output.includes('Project fixture: failing'));
      assert.ok(output.includes('Project fixture: missing-bin'));
    });

    it('should show failing fixture missing bin entry', () => {
      const output = execSync(`${CLI} demo`, { encoding: 'utf8' });
      assert.ok(output.includes('Bin entry: MISSING'));
    });
  });

  describe('check command', () => {
    it('should check project root and find package.json', () => {
      const output = execSync(`${CLI} check`, { encoding: 'utf8' });
      assert.ok(output.includes('Release Evidence Card'));
      assert.ok(output.includes('Name: release-evidence-card-cli'));
      assert.ok(output.includes('Bin entry: YES'));
    });

    it('should write release-evidence.md report', () => {
      assert.ok(existsSync('release-evidence.md'));
      const report = execSync('cat release-evidence.md', { encoding: 'utf8' });
      assert.ok(report.includes('Release Evidence Card'));
    });
  });

  describe('run command', () => {
    it('should error without --entry', () => {
      try {
        execSync(`${CLI} run`, { encoding: 'utf8', stdio: 'pipe' });
        assert.fail('Should have thrown');
      } catch (err) {
        assert.ok(err.stderr.includes('--entry'));
      }
    });

    it('should accept --entry command', () => {
      const output = execSync(`${CLI} run --entry "node --help"`, { encoding: 'utf8' });
      assert.ok(output.includes('Entry Smoke Test'));
      assert.ok(output.includes('node --help'));
      assert.ok(output.includes('Step 1: npm pack'));
    });
  });

  describe('check against failing fixture', () => {
    it('should report MISSING bin entry for failing-cli fixture', () => {
      const output = execSync(`${CLI} check --dir ${FIXTURES}/failing`, { encoding: 'utf8' });
      assert.ok(output.includes('Bin entry: MISSING'));
      assert.ok(output.includes('Verdict: PENDING'));
    });

    it('should report missing governance files for failing-cli fixture', () => {
      const output = execSync(`${CLI} check --dir ${FIXTURES}/failing`, { encoding: 'utf8' });
      assert.ok(output.includes('FAIL: LICENSE'));
      assert.ok(output.includes('FAIL: SECURITY.md'));
    });
  });

  describe('check against missing-bin fixture', () => {
    it('should report MISSING bin entry for missing-bin-cli fixture', () => {
      const output = execSync(`${CLI} check --dir ${FIXTURES}/missing-bin`, { encoding: 'utf8' });
      assert.ok(output.includes('Bin entry: MISSING'));
      assert.ok(output.includes('Verdict: PENDING'));
    });
  });

  describe('check against passing fixture', () => {
    it('should report bin entry present for passing fixture', () => {
      const output = execSync(`${CLI} check --dir ${FIXTURES}/passing`, { encoding: 'utf8' });
      assert.ok(output.includes('Bin entry: YES'));
    });
  });

  describe('missing config handling', () => {
    let tmpDir;

    before(() => {
      tmpDir = join(FIXTURES, 'test-missing-config-' + Date.now());
      mkdirSync(tmpDir, { recursive: true });
      writeFileSync(join(tmpDir, 'package.json'), JSON.stringify({
        name: 'test-pkg',
        bin: { 'test-pkg': './index.js' }
      }));
      writeFileSync(join(tmpDir, 'README.md'), '# Test\n\nnpm install test-pkg\n\nQuickstart: run test-pkg');
    });

    after(() => {
      try { rmSync(tmpDir, { recursive: true, force: true }); } catch {}
    });

    it('should handle missing config by using defaults', () => {
      const output = execSync(`${CLI} check --dir ${tmpDir}`, { encoding: 'utf8' });
      assert.ok(output.includes('ignoreDirs'));
      assert.ok(output.includes('NO (using defaults)'));
      assert.ok(output.includes('LICENSE'));
    });

    it('should accept custom config file', () => {
      const configDir = join(FIXTURES, 'test-custom-config-' + Date.now());
      mkdirSync(configDir, { recursive: true });
      try {
        writeFileSync(join(configDir, 'package.json'), JSON.stringify({
          name: 'config-test',
          bin: { 'config-test': './index.js' }
        }));
        writeFileSync(join(configDir, 'README.md'), '# Config Test\nnpm install\nUsage: run');
        writeFileSync(join(configDir, '.release-evidence-card.json'), JSON.stringify({
          governanceFiles: ['CUSTOM_POLICY.md']
        }));
        writeFileSync(join(configDir, 'CUSTOM_POLICY.md'), '# Custom policy');

        const output = execSync(`${CLI} check --dir ${configDir}`, { encoding: 'utf8' });
        assert.ok(output.includes('YES'));
        assert.ok(output.includes('CUSTOM_POLICY.md'));
      } finally {
        try { rmSync(configDir, { recursive: true, force: true }); } catch {}
      }
    });
  });

  describe('ignoreDirs behavior', () => {
    let tmpDir;

    before(() => {
      tmpDir = join(FIXTURES, 'test-ignoredirs-' + Date.now());
      mkdirSync(tmpDir, { recursive: true });
      writeFileSync(join(tmpDir, 'package.json'), JSON.stringify({
        name: 'ignore-test',
        bin: { 'ignore-test': './index.js' }
      }));
      writeFileSync(join(tmpDir, 'README.md'), '# Ignore Test\nnpm install\nQuickstart\nExpected output\nMIT');

      const nmDir = join(tmpDir, 'node_modules');
      mkdirSync(nmDir, { recursive: true });
      writeFileSync(join(nmDir, 'README.md'), '# Should be ignored');
    });

    after(() => {
      try { rmSync(tmpDir, { recursive: true, force: true }); } catch {}
    });

    it('should not descend into node_modules by default', () => {
      const output = execSync(`${CLI} check --dir ${tmpDir}`, { encoding: 'utf8' });
      assert.ok(output.includes('Score: 4/5'));
      assert.ok(output.includes('MISSING: target user'));
      assert.ok(output.includes('node_modules'));
    });
  });

  describe('governance file checks', () => {
    it('should detect PRESENT governance files in project root', () => {
      const output = execSync(`${CLI} check --dir .`, { encoding: 'utf8' });
      assert.ok(output.includes('PASS: LICENSE'));
      assert.ok(output.includes('PASS: SECURITY.md'));
      assert.ok(output.includes('PASS: CONTRIBUTING.md'));
      assert.ok(output.includes('PASS: CHANGELOG.md'));
    });

    it('should report MISSING governance files for empty directory', () => {
      const emptyDir = join(FIXTURES, 'test-empty-gov-' + Date.now());
      mkdirSync(emptyDir, { recursive: true });
      try {
        const output = execSync(`${CLI} check --dir ${emptyDir}`, { encoding: 'utf8' });
        assert.ok(output.includes('FAIL: LICENSE'));
        assert.ok(output.includes('FAIL: SECURITY.md'));
      } finally {
        try { rmSync(emptyDir, { recursive: true, force: true }); } catch {}
      }
    });
  });

  describe('help output', () => {
    it('should print usage when run without arguments', () => {
      const output = execSync(CLI, { encoding: 'utf8' });
      assert.ok(output.includes('Usage'));
      assert.ok(output.includes('check'));
      assert.ok(output.includes('run'));
      assert.ok(output.includes('demo'));
    });
  });
});
