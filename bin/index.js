#!/usr/bin/env node

const app = require('commander')
const dotenv = require('dotenv')
const updateNotifier = require('update-notifier')

const pkg = require(__dirname + '/../package.json')
updateNotifier({ pkg }).notify()

require('dotenv').config({
  path: process.cwd() + '/.env',
  silent: true
})

const configDefaults = {
  port: 2000,
  db: {
    host: 'localhost',
    user: 'admin',
    password: 1234,
    name: 'muffin'
  },
  session_secret: 'random'
}

function setVariable (name, value) {
  name = name.toUpperCase()

  if (!process.env[name]) {
    process.env[name] = value
  }
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
  .version(pkg.version)

app
  .command('build', 'Build your site')
  .command('new [path]', 'Generate the boilerplate for a new site')
  .command('serve', 'Serve your site locally')

app.parse(process.argv)
