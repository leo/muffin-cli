#!/usr/bin/env node

import bin from 'commander'
import { log } from '../lib/utils'
import { execFile } from 'child_process'

bin
  .option('-w, --watch', 'Rebuild site if files change')
  .option('-p, --port <port>', 'The port on which your site will be available', parseInt)
  .parse(process.argv)

execFile('node', ['index.js'], (error, stdout, stderr) => {
  if (error) log(error)
  console.log(stdout)
})
