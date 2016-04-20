#!/usr/bin/env node

import bin from 'commander'

bin
  .option('-w, --watch', 'Rebuild site if files change')
  .option('-p, --port <port>', 'The port on which your site will be available', parseInt)
  .parse(process.argv)

console.log('test')
