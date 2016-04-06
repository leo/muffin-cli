import fs from 'fs-extra'
import path from 'path'
import ora from 'ora'
import chalk from 'chalk'
import { log } from '../utils'
import Mongonaut from 'mongonaut'
import NPM from './npm'

class Generator {
  constructor (answers, targetDir) {
    this.blueprints = []

    this.answers = answers
    this.targetDir = targetDir
    this.template = path.normalize(__dirname + '/../../../template')

    this.insertSampleData()
  }

  insertSampleData () {
    const mongonaut = new Mongonaut({
      user: this.answers.db_user || '',
      pwd: this.answers.db_password || '',
      db: this.answers.db_name,
      collection: 'pages'
    })

    const dataPath = __dirname + '/../../../data/'
    const pages = mongonaut.import(dataPath + 'pages.json')

    mongonaut.set('collection', 'users')
    const users = mongonaut.import(dataPath + 'users.json')

    Promise.all([pages, users]).then(function () {
      log(chalk.green('Sucessfully inserted sample data!'))
      this.findBlueprints()
    }.bind(this)).catch(err => {
      log('Not able to insert data! Make sure that your DB is running.')
    })
  }

  findBlueprints () {
    const walker = fs.walk(this.template)

    walker.on('data', this.foundFile.bind(this))
    walker.on('end', this.insertBlueprints.bind(this))
  }

  foundFile (file) {
    const ignore = [
      'dist',
      'node_modules'
    ]

    for (var dir of ignore) {
      if (file.path.indexOf(dir) == -1) {
        continue
      }

      return
    }

    this.blueprints.push(file.path)
  }

  insertBlueprints () {
    // Strip away the "/template" folder itself
    // We only need its contents
    var files = this.blueprints
    files.shift()

    // The properties of a parsed file path whose first
    // letter shall be replaced with a dot
    const replaceDots = [
      'name',
      'base'
    ]

    for (var file of files) {
      var filePath = path.parse(file)

      // Take care of the dotfiles
      for (var property of replaceDots) {
        filePath[property] = filePath[property].replace('_', '.')
      }

      // Generate the destination path
      var dest = path.join(this.targetDir, path.relative(this.template, path.format(filePath)))

      // Make sure the destination exists
      try {
        fs.ensureDirSync(path.dirname(dest))
      } catch (err) {
        return log(err)
      }

      // If so, copy the blueprints
      try {
        fs.copySync(file, dest)
      } catch (err) {
        return log(err)
      }
    }

    this.spinner = ora(chalk.green('Installing missing packages via npm'))
    this.spinner.color = 'green'
    this.spinner.start()

    process.chdir(this.targetDir)

    new NPM('install', function (data) {
      if (data) {
        this.spinner.stop()
        log('Generated new site in ' + chalk.gray(this.targetDir))
      } else {
        log(chalk.red('Not able to install dependencies!'))
      }
    }.bind(this))
  }
}

module.exports = Generator
