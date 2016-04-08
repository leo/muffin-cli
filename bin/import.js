#!/usr/bin/env node

import program from 'commander'
import chalk from 'chalk'
import { log, isSite } from '../lib/utils'
import Insert from '../lib/tasks/insert'

program.parse(process.argv)
const args = program.args

if (!isSite()) {
  log(chalk.red('No site in here! You need to be within a site\'s directory.'))
  process.exit(1)
}

if (args.length === 0) {
  log('You need to specify a file or directory: ' + chalk.grey('muffin import file.json'))
  process.exit(1)
}

new Insert(args)
