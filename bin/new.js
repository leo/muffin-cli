#!/usr/bin/env node

const path = require('path')
const fs = require('fs-extra')
const program = require('commander')
const inquirer = require('inquirer')
const gitConfig = require('git-config')
const chalk = require('chalk')
const mkdirp = require('mkdirp')
const npm = require('npm')
const ora = require('ora')

const exec = require('child_process').execSync
const utils = require('../lib/utils')

program
  .option('-f, --force', 'Overwrite the existing site')
  .option('-y, --yes', 'Skip all questions')
  .parse(process.argv)

// Get the directory, if one was defined
const directory = program.args[program.args.length - 1]

// Resolve the path of the directory or use the current working dir
const targetDir = directory ? path.resolve(process.cwd(), directory) : process.cwd()

// Just the normalized path to the place where the blueprints live
const template = path.normalize(__dirname + '/../template')

if (targetDir == template) {
  utils.log('You shouldn\'t run ' + chalk.gray('init') + ' in here.')
  utils.log('Please run it somewhere outside of the project.')

  process.exit(0)
}

if (utils.isSite() && !program.force) {
  utils.log(chalk.red('There\'s already a site in here!'))
  process.exit(1)
}

const prompts = [
  {
    name: 'handle',
    message: 'Project name',
    default: path.basename(targetDir),
    filter (input) {
      return input.replace(' ', '').toLowerCase()
    }
  },
  {
    name: 'author',
    message: 'Author',
    default () {
      var git

      try {
        git = gitConfig.sync()
      } catch (err) {
        git = false
      }

      return git ? git.user.name : null
    }
  },
  {
    name: 'db_host',
    message: 'DB host',
    default: 'localhost'
  },
  {
    name: 'db_name',
    message: 'DB name',
    default: 'muffin'
  },
  {
    name: 'db_user',
    message: 'DB user'
  },
  {
    type: 'password',
    name: 'db_password',
    message: 'DB password'
  }
]

const ignore = [
  'dist',
  'node_modules'
]

function setProgressBar (state) {
  try {
    exec('npm set progress=' + state.toString(), {stdio: [0, 1]})
  } catch (err) {
    throw utils.log(err)
  }
}

const generateSite = answers => {
  const walker = fs.walk(template)
  var files = []

  walker.on('data', item => {
    for (var dir of ignore) {
      if (item.path.indexOf(dir) == -1) {
        continue
      }

      return
    }

    files.push(item.path)
  })

  walker.on('end', () => {
    // Strip away the "/template" folder itself
    // We only need its contents
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
      var dest = path.join(targetDir, path.relative(template, path.format(filePath)))

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

    const spinner = ora(chalk.green('Installing missing dependencies'))
    spinner.color = 'green'
    spinner.start()

    process.chdir(targetDir)

    npm.load({
      loaded: false,
      loglevel: 'silent'
    }, err => {
      if (err) return utils.log(err)

      setProgressBar(false)

      npm.commands.install([], (err, data) => {
        if (err) return utils.log(err)

        if (data) {
          spinner.stop()
          utils.log('Generated new site in ' + chalk.gray(targetDir))
        }

        setProgressBar(true)
      })
    })
  })
}

if (program.yes) {
  generateSite()
} else {
  inquirer.prompt(prompts, generateSite)
}
