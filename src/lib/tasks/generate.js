import fs from 'fs-extra'
import path from 'path'
import ora from 'ora'
import chalk from 'chalk'
import { log } from '../utils'
import Mongonaut from 'mongonaut'
import NPM from './npm'
import Insert from './insert'

class Generator {
  constructor (answers, targetDir) {
    this.blueprints = []

    this.answers = answers
    this.targetDir = targetDir
    this.template = path.normalize(__dirname + '/../../../template')

    this.insertSampleData()
  }

  insertSampleData () {
    const walker = fs.walk(__dirname + '/../../../data/')
    let files = []

    walker.on('data', item => files.push(item.path))

    walker.on('end', function () {
      files.shift()
      new Insert(files, this.findBlueprints.bind(this))
    }.bind(this))

    walker.on('error', (err, item) => {
      throw err
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
