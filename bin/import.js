#!/usr/bin/env node --use_strict

const Mongonaut = require('mongonaut')
const program = require('commander')
const chalk = require('chalk')
const fs = require('fs-extra')
const path = require('path')
const utils = require('../lib/utils')

program.parse(process.argv)
const args = program.args

if (!utils.isSite()) {
  return utils.log(chalk.red('No site in here! You need to be within a site\'s directory.'))
}

if (args.length === 0) {
  return utils.log('You need to specify a file: ' + chalk.grey('muffin import file.json'))
}

const connection = require('../lib/db').rope

function insertData (files) {
  files = files.map(file => {
    return path.parse(file)
  })

  let mongonaut = new Mongonaut({
    user: process.env.DB_USER || '',
    pwd: process.env.DB_PASSWORD || '',
    db: process.env.DB_NAME || 'muffin'
  })

  let imports = []

  for (let file of files) {
    mongonaut.set('collection', file.name)
    imports.push(mongonaut.import(path.format(file)))
  }

  connection.close()

  Promise.all(imports).then(() => {
    utils.log(chalk.green('Successfully imported data!'))
  }, reason => {
    utils.log('Not able to insert data! Make sure that your DB is running.')
  })
}

connection.on('open', () => {
  // Firstly make sure that all files exist
  connection.db.listCollections().toArray((err, names) => {
    if (err) {
      return utils.log(err)
    }

    const collections = names.map(details => {
      return details.name
    })

    for (let file of args) {
      let details = path.parse(path.resolve(file))

      if (!utils.exists(path.format(details))) {
        utils.log(`The file "${details.base}" doesn\'t exist`)
        connection.close(() => process.exit(1))
      }

      if (collections.indexOf(details.name) === -1) {
        utils.log(`Collection "${details.name}" doesn\'t exist`)
        connection.close(() => process.exit(1))
      }
    }

    insertData(args)
  })
})
