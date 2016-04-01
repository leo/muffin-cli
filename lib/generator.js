const fs = require('fs-extra')
const path = require('path')
const npm = require('npm')
const ora = require('ora')
const chalk = require('chalk')
const utils = require('./utils')
const Mongonaut = require('mongonaut')
const exec = require('child_process').execSync

class Generator {
  constructor (answers, targetDir) {
    this.blueprints = []

    this.answers = answers
    this.targetDir = targetDir
    this.template = path.normalize(__dirname + '/../template')

    this.insertSampleData()
  }

  setProgressBar (state) {
    try {
      exec('npm set progress=' + state.toString(), {stdio: [0, 1]})
    } catch (err) {
      throw utils.log(err)
    }
  }

  insertSampleData () {
    const mongonaut = new Mongonaut({
      user: this.answers.db_user || '',
      pwd: this.answers.db_password || '',
      db: this.answers.db_name,
      collection: 'pages'
    })

    const dataPath = __dirname + '/../data/'
    const pages = mongonaut.import(dataPath + 'pages.json')

    mongonaut.set('collection', 'users')
    const users = mongonaut.import(dataPath + 'users.json')

    Promise.all([pages, users]).then(function () {
      utils.log(chalk.green('Sucessfully inserted sample data!'))
      this.findBlueprints()
    }.bind(this)).catch(err => {
      utils.log('Not able to insert sample data!', err)
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
        return utils.log(err)
      }

      // If so, copy the blueprints
      try {
        fs.copySync(file, dest)
      } catch (err) {
        return utils.log(err)
      }
    }

    this.spinner = ora(chalk.green('Installing missing packages via npm'))
    this.spinner.color = 'green'
    this.spinner.start()

    process.chdir(this.targetDir)

    npm.load({
      loaded: false,
      loglevel: 'silent'
    }, this.npmLoaded.bind(this))
  }

  npmLoaded (err) {
    if (err) return utils.log(err)

    this.setProgressBar(false)
    npm.commands.install([], this.npmInstall.bind(this))
  }

  npmInstall (err, data) {
    if (err) return utils.log(err)

    if (data) {
      this.spinner.stop()
      utils.log('Generated new site in ' + chalk.gray(this.targetDir))
    } else {
      utils.log(chalk.red('Not able to install dependencies!'))
    }

    this.setProgressBar(true)
  }
}

module.exports = Generator
