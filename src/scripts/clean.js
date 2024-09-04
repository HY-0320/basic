/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */

import { allTargets } from './targets.js'

import path from 'path'
import fs from 'fs-extra'

async function cleanAll(targets) {
  for (const target of targets) {
    const pkgDir = path.resolve(`packages/${target}`)
    // eslint-disable-next-line no-await-in-loop
    await fs.remove(`${pkgDir}/dist`)
  }
}

async function run() {
  try {
    await cleanAll(allTargets)

    const pkgDir = path.resolve(`dist`)
    await fs.remove(pkgDir)
  } catch (error) {
    console.log(error)
  }
}

run()
