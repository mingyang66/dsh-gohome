import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(join(root, path), 'utf8');

const pkg = JSON.parse(read('package.json'));

test('manifest is a DSH bundle with a web client half', () => {
  assert.equal(pkg.name, 'dsh-gohome');
  assert.equal(pkg.private, undefined, 'a publishable package must not be private');
  assert.equal(pkg.license, 'MIT');
  assert.equal(pkg.dsh.bundle.patch, './cordis.patch.yml');
  assert.equal(pkg.dsh.client.platform, 'web');
  assert.ok(pkg.dsh.client.inject.includes('@deepseek-ai/dsh-client-ui-conversation'));
  assert.equal(pkg.exports['./client'], './client.js');
  assert.equal(pkg.exports['./icon'], './icon.svg');
});

test('patch inserts the row this package provides', () => {
  const patch = read('cordis.patch.yml');
  assert.match(patch, /id: dsh-gohome/);
  assert.match(patch, /name: 'dsh-gohome'/);
});

test('both halves parse as JavaScript', () => {
  // index.js is ESM, so only its export shape is checked here.
  assert.match(read('index.js'), /export function apply/);
  // client.js is a classic script handed to window.__ModuleLoader__.
  assert.doesNotThrow(() => new Function(read('client.js')));
});

test('display metadata exists in both locales', () => {
  for (const file of ['locale/zh.json', 'locale/en.json']) {
    const dict = JSON.parse(read(file));
    assert.ok(dict.meta.title && dict.meta.title.length > 0, `${file} needs meta.title`);
    assert.ok(dict.meta.description && dict.meta.description.length > 20, `${file} needs a real meta.description`);
  }
});

test('icon ships inside the package and under the size cap', () => {
  const icon = join(root, 'icon.svg');
  assert.ok(existsSync(icon));
  assert.ok(statSync(icon).size <= 256 * 1024);
});

test('runtime files listed in `files` actually exist', () => {
  for (const entry of pkg.files) {
    if (entry.includes('*')) {
      const [dir, pattern] = entry.split('/');
      const suffix = pattern.replace('*', '');
      const names = readdirSync(join(root, dir));
      assert.ok(names.some((name) => name.endsWith(suffix)), `missing ${entry}`);
      continue;
    }
    assert.ok(existsSync(join(root, entry)), `missing ${entry}`);
  }
});

test('storage key matches the documented one', () => {
  assert.match(read('client.js'), /dsh-gohome:work-hours/);
  assert.match(read('README.md'), /dsh-gohome:work-hours/);
});