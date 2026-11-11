import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { consola } from 'consola'
import { version } from '../package.json'
import { packages } from '../meta/packages'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
// Validate every archive before publishing any package; a partial build must not release Shared.
function invoke(name: string, action: 'verify' | 'publish') {
  const flags = [action, '--out', path.join(root, '.npm-package', name), '--access=public']
  if (version.includes('beta'))
    flags.push('--tag=beta')
  execFileSync(process.execPath, [path.join(root, 'scripts/npm-package.mjs'), ...flags], {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, NPM_PACKAGE_ROOT: path.join(root, 'packages', name, 'dist') },
  })
}
// The separate local/CI pack step builds before publishing credentials are supplied.
for (const { name } of packages)
  invoke(name, 'verify')
for (const { name } of packages) {
  invoke(name, 'publish')
  consola.success(`Published @datadayrepos/${name}`)
}
