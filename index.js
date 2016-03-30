#!/usr/bin/env node

const app = require('commander')
const dotenv = require('dotenv')
const updateNotifier = require('update-notifier')

const pkg = require(__dirname + '/package.json')
updateNotifier({ pkg }).notify()

require('dotenv').config({
  path: process.cwd() + '/.env',
  silent: true
})

const configDefaults = {
  db: {
    host: 'localhost',
    user: 'admin',
    password: 1234,
    name: 'muffin'
  },
  session_secret: 'random'
}

function setVariable (name, value) {
  process.env[name.toUpperCase()] = value
}

for (var property in configDefaults) {
  var whole = configDefaults[property]

  if (typeof whole == 'object') {
    for (var subProp in whole) {
      setVariable(property + '_' + subProp, whole[subProp])
    }
  } else {
    setVariable(property, whole)
  }
}

app
  .version(require(__dirname + '/package.json').version)

app
  .command('new', 'Generate the boilerplate for a new site')
  .command('serve', 'Serve your site locally')

app.parse(process.argv)
