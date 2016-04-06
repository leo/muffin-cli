#!/usr/bin/env babel-node

import app from 'commander'
import dotenv from 'dotenv'
import updateNotifier from 'update-notifier'
import pkg from '../package.json'

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

  // This is fine, since it's just the default
  session_secret: 'random'
}

function setVariable (name, value) {
  name = name.toUpperCase()

  if (!process.env[name]) {
    process.env[name] = value
  }
}

for (let property in configDefaults) {
  let whole = configDefaults[property]

  if (typeof whole === 'object') {
    for (let subProp in whole) {
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
  .command('import', 'Import data into your site\'s database')

app.parse(process.argv)
