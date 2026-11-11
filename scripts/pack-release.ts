import { execFileSync } from 'node:child_process'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { packages } from '../meta/packages'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2).filter(value => value !== '--')
if (args.length && (args.length !== 2 || args[0] !== '--out'))
  throw new Error('Usage: pack:release [--out <directory>]')
const out = path.resolve(args[1] || path.join(root, '.npm-package'))
assert(out !== path.parse(out).root && out !== root && !root.startsWith(out + path.sep), 'Output must not be a filesystem root, checkout or its parent.')
if (out.startsWith(root + path.sep))
  assert(out === path.join(root, '.npm-package'), 'In-checkout output is restricted to .npm-package.')
// Invalidate every old receipt before a possibly failing workspace rebuild.
for (const { name } of packages)
  fs.rmSync(path.join(out, name, 'verified.json'), { force: true })
execFileSync('corepack', ['pnpm', 'run', 'build'], { cwd: root, stdio: 'inherit' })
for (const { name } of packages) {
  execFileSync(process.execPath, [path.join(root, 'scripts/npm-package.mjs'), 'pack', '--out', path.join(out, name)], {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, NPM_PACKAGE_ROOT: path.join(root, 'packages', name, 'dist') },
  })
}
