import Mongonaut from 'mongonaut'
import path from 'path'
import fs from 'fs-extra'
import chalk from 'chalk'
import { log, exists } from '../utils'

class Inserter {
  constructor (files, callback) {
    this.files = files
    this.rope = require('../db').rope
    this.cb = callback

    this.rope.on('open', function () {
      this.rope.db.listCollections().toArray(this.checkInput.bind(this))
    }.bind(this))
  }

  checkInput (err, names) {
    if (err) {
      return log(err)
    }

    let files = [],
        walkers = []

    this.collections = names.map(details => {
      return details.name
    })

    for (let thing of this.files) {
      let fullPath = path.resolve(thing),
          details = path.parse(fullPath)

      if (!exists(path.format(details))) {
        log(`The file or directory "${details.base}" doesn\'t exist`)
        this.rope.close(() => process.exit(1))
      }

      if (details.ext) {
        files.push(fullPath)
        continue
      }

      let prom = new Promise((resolve, reject) => {
        let walker = fs.walk(fullPath),
            subFiles = []

        walker.on('data', item => {
          let info = path.parse(item.path)

          if (info.ext) {
            subFiles.push(item.path)
          }
        })

        walker.on('end', () => resolve(subFiles))
        walker.on('error', reject)
      })

      walkers.push(prom)
    }

    this.rope.close()

    if (walkers.length === 0) {
      return this.tryImport(files)
    }

    Promise.all(walkers).then(function (items) {
      files = files.concat(items[0])
      this.tryImport(files)
    }.bind(this)).catch((err, item) => {
      throw err
    })
  }

  tryImport (files) {
    let imports = []

    for (let file of files) {
      let info = path.parse(file)

      if (this.collections.indexOf(info.name) === -1) {
        log(`Collection "${info.name}" doesn\'t exist`)
        this.rope.close(() => process.exit(1))
      }

      imports.push(this.importFile(info))
    }

    Promise.all(imports).then(function (data) {
      log(chalk.green('Successfully imported data!'))
      this.cb(data)
    }.bind(this), reason => {
      log('Not able to insert data! Make sure that your DB is running.')
    })
  }

  importFile (file) {
    let mongonaut = new Mongonaut({
      user: process.env.DB_USER || '',
      pwd: process.env.DB_PASSWORD || '',
      db: process.env.DB_NAME || 'muffin'
    })

    mongonaut.set('collection', file.name)
    return mongonaut.import(path.format(file))
  }
}

export default Inserter
