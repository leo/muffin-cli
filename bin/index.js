#!/usr/bin/env node

import bin from 'commander'
import updateNotifier from 'update-notifier'
import pkg from '../../package.json'

updateNotifier({ pkg }).notify()

bin.version(pkg.version)

bin
  .command('build', 'Build your site')
  .command('new [path]', 'Generate the boilerplate for a new site')
  .command('serve', 'Serve your site locally')
  .command('import', 'Import data into your site\'s database')

bin.parse(process.argv)
