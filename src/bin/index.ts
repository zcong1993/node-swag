#!/usr/bin/env node
import { join } from 'path'
import { existsSync, writeFileSync } from 'fs'
import * as cac from 'cac'
import { sync as mkdirp } from 'mkdirp'
import { stringify } from 'json2yaml'
import { rootConfig } from '../types'
import { gen } from '../'

const normalizePath = (p: string, root: string = process.cwd()): string =>
  join(root, p)

const cli = cac('swag')

cli
  .option('--config <config>', 'Config file', {
    default: './.swag.config.js'
  })
  .option('-r, --dry-run', 'If dry run')
  .option('-f, --force', 'If force write')

cli.version(require('../../package.json')['version'])
cli.help()

const { options } = cli.parse()

const file = normalizePath(options['config'])
if (!existsSync(file)) {
  console.log(`config file ${options['config']} not exists.`)
  process.exit(0)
}
const config: rootConfig = require(file)

const run = async () => {
  const res = await gen(config)
  let data: string
  if (config.outType === 'yaml') {
    data = stringify(res)
  } else {
    data = JSON.stringify(res, null, 2)
  }

  if (options['dryRun']) {
    console.log(data)
    return
  }

  const outDir = normalizePath(config.outDir)
  if (!existsSync(outDir)) {
    mkdirp(outDir)
  }

  const outFile = join(outDir, `swagger.${config.outType}`)

  if (!options['force'] && existsSync(outFile)) {
    console.log(
      `${outFile} already exists, delete it or use -f option to replace it.`
    )
    return
  }

  writeFileSync(outFile, data)

  console.log('Done!')
}

run().catch(err => console.log(err.message))
