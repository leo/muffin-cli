#!/usr/bin/env node

import broccoli from 'broccoli'
import chalk from 'chalk'
import program from 'commander'
import { log, isSite } from '../lib/utils'
import Builder from '../lib/tasks/build'

program
  .option('-w, --watch', 'Rebuild site if files change')
  .parse(process.argv)

if (!isSite()) {
  log(chalk.red('No site in here!'))
  process.exit(1)
}

const tree = broccoli.loadBrocfile()
new Builder(tree, program.watch)
