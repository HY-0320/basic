/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))


const getPkgRoot = (pkg) => path.resolve(__dirname, `../packages/${pkg}`)

function getPackageJson(dir) {
  const packageJsonStr = fs.readFileSync(dir).toString()
  const packageJson = JSON.parse(packageJsonStr)
  return packageJson
}

export const allTargets = fs.readdirSync('packages').filter((f) => {
  const pkgRoot = getPkgRoot(f)
  if (!fs.statSync(pkgRoot).isDirectory()) {
    return false
  }
  const pkg = getPackageJson(path.join(pkgRoot, 'package.json'))
  if (pkg.private) {
    return false
  }
  return true
})
