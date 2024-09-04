/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
import { execa } from 'execa'
import { packages, updateVersions, publishPackage, checkPackageExist } from './utils.js'

const targetVersion = process.argv.slice(2)[0]

const run = (_bin, _args, opts = {}) => execa(_bin, _args, { stdio: 'inherit', ...opts })

async function main() {
  for (const pkg of packages) {
    // eslint-disable-next-line no-await-in-loop
    // 发布之前检查，如果开发者打包的流程为【第一次打包】且为【单个模块并打包整体发布】，其他模块下dist文件是空的，需要开发者手动处理这些dist文件
    const isExist = await checkPackageExist(pkg)
    if (!isExist) {
      return
    }
  }

  updateVersions(targetVersion)

  for (const pkg of packages) {
    // eslint-disable-next-line no-await-in-loop
    await publishPackage(pkg, targetVersion, run)
  }

  const syncProms = packages.map((pkgName) => {
    return run('tnpm', ['sync', `@aliyun-sls/lsp-${pkgName}`])
  })

  Promise.all(syncProms)
}

main()

