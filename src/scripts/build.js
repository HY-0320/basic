/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */

import { Command } from 'commander'
import path from 'path'
import fs from 'fs-extra'
import { execa } from 'execa'
import chalk from 'chalk'
import { allTargets } from './targets.js'

const program = new Command()

program
  .version('0.0.0')
  .option('-t, --target [value]', 'example: api or components or api,components, default undefined')
  .option('-s, --skip', 'skip clean packages')
  .option('-d, --skipDts', 'skip clean dts')
  .option('--dry', 'skip clean dts')
  .parse(process.argv)

const { skip, skipDts, dry } = program

async function build(target) {
  const pkgDir = path.resolve(`packages/${target}`)

  await fs.remove(`${pkgDir}/dist`)

  const env = 'production'
  await execa(
    'rollup',
    [
      '-c',
      '--environment',
      [`NODE_ENV:${env}`, `TARGET:${target}`].filter(Boolean).join(','),
      '--bundleConfigAsCjs',
    ],
    { stdio: 'inherit' }
  )

  await fs.remove(`${pkgDir}/dist/apps`)
  await fs.remove(`${pkgDir}/dist/packages`)
  await fs.remove(`${pkgDir}/dist/src`)
  await fs.remove(`${pkgDir}/dist/site`)
  await rmSourceMap(pkgDir)
}

function rmSourceMap(pkgDir) {
  fs.readdir(`${pkgDir}/dist`, (err, files) => {
    if (err) {
      console.log(err)
      return
    }
    files
      .filter((filename) => filename.includes('.map'))
      .forEach((filename) => {
        fs.remove(`${pkgDir}/dist/${filename}`)
      })
  })
}

async function buildAll(targets) {
  // await runParallel(require('os').cpus().length, targets, build)
  await runParallel(1, targets, build)
}

async function runParallel(maxConcurrency, source, iteratorFn) {
  const ret = []
  const executing = []
  for (const item of source) {
    const p = Promise.resolve().then(() => iteratorFn(item, source))
    ret.push(p)

    if (maxConcurrency <= source.length) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1))
      executing.push(e)
      if (executing.length >= maxConcurrency) {
        // eslint-disable-next-line no-await-in-loop
        await Promise.race(executing)
      }
    }
  }
  return Promise.all(ret)
}

async function buildDts() {
  try {
    console.log('start build dts')
    if (!dry) {
      await execa('npm', ['run', 'build-dts'], {
        cwd: process.cwd(),
        stdio: 'pipe',
      })
    }
    console.log('finished build dts')
  } catch (error) {
    console.log(chalk.red(`Build-dts error: ${error.message}`))
  }
}

async function cleanAll() {
  try {
    console.log('start clean')
    if (!dry) {
      await execa('npm', ['run', 'clean'], {
        cwd: process.cwd(),
        stdio: 'pipe',
      })
    }
    console.log('finished clean')
  } catch (error) {
    console.log(chalk.red(`clean error: ${error.message}`))
  }
}

async function run() {
  try {
    console.log(skip, skipDts, dry)
    if (!skip) {
      await cleanAll()
    }

    if (!skipDts) {
      console.log('clean cache dts')
      if (!dry) {
        await fs.remove(`dist/packages`)
      }
      await buildDts()
    }

    const { target } = program
    console.log('start build target', target ?? 'all')

    if (!dry) {
      if (target) {
        const argTarget = target.split(',').map((t) => t.trim())
        for (const item of argTarget) {
          if (allTargets.includes(item)) {
            console.log(`build target: ${item}`)
            // eslint-disable-next-line no-await-in-loop
            await build(item)
          } else {
            process.exitCode = 1
            console.log(chalk.red(`Unexpected target: ${item}.`))
          }
        }
      } else {
        // https://stackoverflow.com/questions/42983977/check-if-there-are-changes-under-path-since-commit-ish
        // to do: 只对有commit变更的package进行打包
        await buildAll(allTargets)
      }
    }
  } catch (error) {
    console.log(error)
  }
}

run()
