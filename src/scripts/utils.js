import path from 'path'
import fs from 'fs-extra'
import { execa } from 'execa'
import chalk from 'chalk'

import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const getPkgRoot = (pkg) => path.resolve(__dirname, `../packages/${pkg}`)
const step = (msg) => console.log(chalk.cyan(msg))

export const packages = fs
  // 过滤非packages文件
  .readdirSync(path.resolve(__dirname, '../packages'))
  .filter((p) => !p.startsWith('.'))
  .filter((p) => p !== 'sls-entry-loader')
  .filter((p) => {
    if (!fs.statSync(path.resolve(__dirname, '../packages', p)).isDirectory()) {
      return false
    }
    return true
  })

const updatePackage = function (pkgRoot, version, isRoot = false) {
  const pkgPath = path.resolve(pkgRoot, 'package.json')
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
  if (isRoot) {
    pkg.packageVersion = version
  } else {
    pkg.version = version
  }
  updateDeps(pkg, 'dependencies', version)
  updateDeps(pkg, 'peerDependencies', version)
  fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`)
}

const updateDeps = function (pkg, depType, version) {
  const deps = pkg[depType]
  if (!deps) return
  Object.keys(deps).forEach((dep) => {
    if (dep.startsWith('@aliyun-sls') && dep === '@aliyun-sls/lsp-core') {
      console.log(chalk.yellow(`${pkg.name} -> ${depType} -> ${dep}@${version}`))
      deps[dep] = version
    }
  })
}

export const updateVersions = function (version) {
  // 1. update root package.json
  updatePackage(path.resolve(__dirname, '..'), version, true)
  // 2. update all packages
  packages.forEach((p) => updatePackage(getPkgRoot(p), version))
}

export const publishPackage = async function (pkgName, version, _runIfNotDry) {
  const pkgRoot = getPkgRoot(pkgName)
  const pkgPath = path.resolve(pkgRoot, 'package.json')
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))

  if (pkg.private) {
    return
  }

  step(`Publishing ${pkgName}...`)

  try {
    await _runIfNotDry(
      'npm',
      ['publish', '--access', 'public', '--registry=https://registry.npmjs.org/'],
      {
        cwd: pkgRoot,
        stdio: 'pipe',
      }
    )

    // await _runIfNotDry(
    //   'tnpm',
    //   ['sync', `@aliyun-sls/${pkgName}`]
    // )
    console.log(chalk.green(`Successfully published ${pkg.name}@${version}`))
  } catch (e) {
    if (e.stderr && e.stderr.match(/previously published/)) {
      console.log(chalk.red(`Skipping already published: ${pkg.name}`))
    } else {
      throw e
    }
  }
}

function getPackageJson(dir) {
  const packageJsonStr = fs.readFileSync(dir).toString()
  const packageJson = JSON.parse(packageJsonStr)
  return packageJson
}

export const checkPackageExist = async function (pkg) {
  const packageJson = getPackageJson(path.resolve(__dirname, `../packages/${pkg}/package.json`))
  if (packageJson.private) {
    return true
  }
  try {
    fs.statSync(path.resolve(__dirname, '../packages', `${pkg}/dist`))
    return true
  } catch (err) {
    console.log(chalk.red(`package: ${pkg}模块打包异常，为空包，请检查！`))
    return false
  }
}


