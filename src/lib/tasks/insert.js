import Mongonaut from 'mongonaut'
import path from 'path'
import fs from 'fs-extra'
import chalk from 'chalk'
import { rope } from '../db'
import { log, exists } from '../utils'

class Insert {
  constructor (files) {
    this.files = files

    rope.on('open', function () {
      rope.db.listCollections().toArray(this.checkInput.bind(this))
    }.bind(this))
  }

  checkInput (err, names) {
    if (err) {
      return log(err)
    }

    let files = [],
        walkers = []

    const collections = names.map(details => {
      return details.name
    })

    for (let thing of this.files) {
      let fullPath = path.resolve(thing),
          details = path.parse(fullPath)

      if (!exists(path.format(details))) {
        log(`The file or directory "${details.base}" doesn\'t exist`)
        rope.close(() => process.exit(1))
      }

      if (details.ext) {
        files.push(fullPath)
        continue
      }

      let prom = new Promise((resolve, reject) => {
        let walker = fs.walk(fullPath)
        let subFiles = []

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

    rope.close()

    Promise.all(walkers).then(function (items) {
      files = files.concat(items[0])
      let imports = []

      for (let file of files) {
        let info = path.parse(file)

        if (collections.indexOf(info.name) === -1) {
          log(`Collection "${info.name}" doesn\'t exist`)
          rope.close(() => process.exit(1))
        }

        imports.push(this.importFile(info))
      }

      Promise.all(imports).then(() => {
        log(chalk.green('Successfully imported data!'))
      }, reason => {
        log('Not able to insert data! Make sure that your DB is running.')
      })
    }.bind(this)).catch((err, item) => {
      throw err
    })

    rope.close()
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

export default Insert
