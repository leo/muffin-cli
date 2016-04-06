#!/usr/bin/env babel-node

import Mongonaut from 'mongonaut'
import program from 'commander'
import chalk from 'chalk'
import fs from 'fs-extra'
import path from 'path'
import { log, isSite, exists } from '../lib/utils'

program.parse(process.argv)
const args = program.args

if (!isSite()) {
  log(chalk.red('No site in here! You need to be within a site\'s directory.'))
  process.exit(1)
}

if (args.length === 0) {
  log('You need to specify a file: ' + chalk.grey('muffin import file.json'))
  process.exit(1)
}

import { rope as connection } from '../lib/db'

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
    log(chalk.green('Successfully imported data!'))
  }, reason => {
    log('Not able to insert data! Make sure that your DB is running.')
  })
}

connection.on('open', () => {
  // Firstly make sure that all files exist
  connection.db.listCollections().toArray((err, names) => {
    if (err) {
      return log(err)
    }

    const collections = names.map(details => {
      return details.name
    })

    for (let file of args) {
      let details = path.parse(path.resolve(file))

      if (!exists(path.format(details))) {
        log(`The file "${details.base}" doesn\'t exist`)
        connection.close(() => process.exit(1))
      }

      if (collections.indexOf(details.name) === -1) {
        log(`Collection "${details.name}" doesn\'t exist`)
        connection.close(() => process.exit(1))
      }
    }

    insertData(args)
  })
})
