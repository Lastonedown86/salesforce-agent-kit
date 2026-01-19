import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { execSync } from 'child_process';
import { existsSync, rmSync, mkdirSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');
const CLI_PATH = join(PROJECT_ROOT, 'dist', 'index.js');
const TEST_DIR = join(PROJECT_ROOT, 'test-workspace');

// Read package.json for version comparison
const packageJson = JSON.parse(
  readFileSync(join(PROJECT_ROOT, 'package.json'), 'utf-8')
);

describe('CLI Integration Tests', () => {
  
  before(() => {
    // Ensure dist exists
    if (!existsSync(join(PROJECT_ROOT, 'dist', 'index.js'))) {
      console.log('Building project first...');
      execSync('npm run build', { cwd: PROJECT_ROOT, stdio: 'inherit' });
    }
    
    // Create clean test workspace
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
    mkdirSync(TEST_DIR, { recursive: true });
  });

  after(() => {
    // Cleanup test workspace
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  describe('--help', () => {
    it('should display help information', () => {
      const output = execSync(`node "${CLI_PATH}" --help`, { encoding: 'utf-8' });
      assert.match(output, /cloudcrafter-skills/);
      assert.match(output, /init/);
      assert.match(output, /add/);
      assert.match(output, /list/);
      assert.match(output, /update/);
      assert.match(output, /remove/);
    });
  });

  describe('--version', () => {
    it('should display version from package.json', () => {
      const output = execSync(`node "${CLI_PATH}" --version`, { encoding: 'utf-8' });
      assert.strictEqual(output.trim(), packageJson.version);
    });
  });

  describe('list command', () => {
    it('should list available categories', () => {
      const output = execSync(`node "${CLI_PATH}" list`, { encoding: 'utf-8' });
      assert.match(output, /apex/);
      assert.match(output, /triggers/);
      assert.match(output, /lwc/);
      assert.match(output, /soql/);
    });

    it('should show skill counts', () => {
      const output = execSync(`node "${CLI_PATH}" list`, { encoding: 'utf-8' });
      assert.match(output, /\d+ categories/);
      assert.match(output, /\d+ skills/);
    });

    it('should support --verbose flag', () => {
      const output = execSync(`node "${CLI_PATH}" list --verbose`, { encoding: 'utf-8' });
      // Should show individual skills when verbose
      assert.match(output, /batch-apex|handler-framework|component-architecture/);
    });
  });

  describe('init command', () => {
    it('should initialize skills in test workspace', () => {
      const output = execSync(`node "${CLI_PATH}" init`, { 
        encoding: 'utf-8',
        cwd: TEST_DIR 
      });
      assert.match(output, /Installed|Initializing/);
      
      // Verify skills were created
      const skillsPath = join(TEST_DIR, '.agent', 'skills');
      assert.ok(existsSync(skillsPath), '.agent/skills directory should exist');
      assert.ok(existsSync(join(skillsPath, 'apex')), 'apex category should exist');
      assert.ok(existsSync(join(skillsPath, 'triggers')), 'triggers category should exist');
    });

    it('should skip existing skills without --force', () => {
      const output = execSync(`node "${CLI_PATH}" init`, { 
        encoding: 'utf-8',
        cwd: TEST_DIR 
      });
      assert.match(output, /Skipped|already/i);
    });

    it('should overwrite with --force flag', () => {
      const output = execSync(`node "${CLI_PATH}" init --force`, { 
        encoding: 'utf-8',
        cwd: TEST_DIR 
      });
      assert.match(output, /Installed/);
    });
  });

  describe('add command', () => {
    before(() => {
      // Clean up previous test
      const skillsPath = join(TEST_DIR, '.agent', 'skills');
      if (existsSync(skillsPath)) {
        rmSync(skillsPath, { recursive: true, force: true });
      }
    });

    it('should add a specific category', () => {
      const output = execSync(`node "${CLI_PATH}" add apex`, { 
        encoding: 'utf-8',
        cwd: TEST_DIR 
      });
      assert.match(output, /Installed.*apex/);
      
      const apexPath = join(TEST_DIR, '.agent', 'skills', 'apex');
      assert.ok(existsSync(apexPath), 'apex directory should exist');
      assert.ok(existsSync(join(apexPath, 'batch-apex.md')), 'batch-apex.md should exist');
    });

    it('should error on invalid category', () => {
      assert.throws(() => {
        execSync(`node "${CLI_PATH}" add nonexistent`, { 
          encoding: 'utf-8',
          cwd: TEST_DIR,
          stdio: 'pipe'
        });
      });
    });
  });

  describe('remove command', () => {
    it('should remove an installed category', () => {
      // First ensure apex is installed
      execSync(`node "${CLI_PATH}" add apex --force`, { cwd: TEST_DIR, stdio: 'pipe' });
      
      const output = execSync(`node "${CLI_PATH}" remove apex`, { 
        encoding: 'utf-8',
        cwd: TEST_DIR 
      });
      assert.match(output, /Removed.*apex/);
      
      const apexPath = join(TEST_DIR, '.agent', 'skills', 'apex');
      assert.ok(!existsSync(apexPath), 'apex directory should not exist');
    });

    it('should error on non-installed category', () => {
      assert.throws(() => {
        execSync(`node "${CLI_PATH}" remove nonexistent`, { 
          encoding: 'utf-8',
          cwd: TEST_DIR,
          stdio: 'pipe'
        });
      });
    });
  });

  describe('update command', () => {
    it('should update installed skills', () => {
      // First init some skills
      execSync(`node "${CLI_PATH}" init`, { cwd: TEST_DIR, stdio: 'pipe' });
      
      const output = execSync(`node "${CLI_PATH}" update`, { 
        encoding: 'utf-8',
        cwd: TEST_DIR 
      });
      assert.match(output, /Updated|up to date/i);
    });
  });
});
