#!/usr/bin/env node

const app = require('commander')
const updateNotifier = require('update-notifier')
const pkg = require(__dirname + '/package.json')

updateNotifier({ pkg }).notify()

app
  .version(require(__dirname + '/package.json').version)

app
  .command('new', 'Generate the boilerplate for a new site')

app.parse(process.argv)
