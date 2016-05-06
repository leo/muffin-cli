#!/usr/bin/env node

import broccoli from 'broccoli'
import chalk from 'chalk'
import args from 'args'
import { log, isSite } from '../lib/utils'
import Builder from '../lib/tasks/build'
import config from '../lib/config'

args
  .option('watch', 'Rebuild site if files change')
  .parse(process.argv)

const tree = broccoli.loadBrocfile()
new Builder(tree, args.watch)
