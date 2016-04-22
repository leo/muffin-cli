#!/usr/bin/env node

import program from 'commander'
import chalk from 'chalk'
import { log, isSite } from '../lib/utils'
import Insert from '../lib/tasks/insert'
import config from '../lib/config'

program.parse(process.argv)
const args = program.args

if (args.length === 0) {
  log('You need to specify a file or directory: ' + chalk.grey('muffin import file.json'))
  process.exit(1)
}

new Insert(args)
