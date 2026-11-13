import fg from 'fast-glob'
import fs from 'fs-extra'

export async function fixTypes() {
  const files = await fg([
    'types/**/*.d.ts',
    'types/**/*.d.cts',
    'types/**/*.d.mts',
    'packages/*/dist/*.d.ts',
    'packages/*/dist/*.d.cts',
    'packages/*/dist/*.d.mts',
  ], {
    onlyFiles: true,
  })

  for (const f of files) {
    const raw = await fs.readFile(f, 'utf-8')
    // This fork is Vue-3-only; declarations must use its declared runtime dependency.
    const changed = raw.replace(/(['"])(?:@vue\/composition-api|vue-demi)\1/g, '$1vue$1')
    await fs.writeFile(f, changed, 'utf-8')
  }
}

fixTypes()
