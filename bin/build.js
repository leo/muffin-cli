#!/usr/bin/env node

import broccoli from 'broccoli'
import chalk from 'chalk'
import program from 'commander'
import { log, isSite } from '../lib/utils'
import Builder from '../lib/tasks/build'
import config from '../lib/config'

program
  .option('-w, --watch', 'Rebuild site if files change')
  .parse(process.argv)

const tree = broccoli.loadBrocfile()
new Builder(tree, program.watch)
