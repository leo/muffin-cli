#!/usr/bin/env node

import args from 'args'
import chalk from 'chalk'
import { log, isSite } from '../lib/utils'
import Insert from '../lib/tasks/insert'
import config from '../lib/config'

args.parse(process.argv)
let which = program.args._

which.shift()
which.shift()

console.log(which)

if (which.length === 0) {
  log('You need to specify a file or directory: ' + chalk.grey('muffin import file.json'))
  process.exit(1)
}

new Insert(which)
