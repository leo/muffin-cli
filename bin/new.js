#!/usr/bin/env node

const path = require('path')
const fs = require('fs-extra')
const program = require('commander')
const inquirer = require('inquirer')
const gitConfig = require('git-config')
const chalk = require('chalk')
const mkdirp = require('mkdirp')
const utils = require('../lib/utils')

program.parse(process.argv)

const directory = program.args[program.args.length - 1]
const targetDir = directory ? path.resolve(process.cwd(), directory) : process.cwd()
const template = path.normalize(__dirname + '/../template')

if (targetDir == template) {
  utils.log('You shouldn\'t run ' + chalk.gray('init') + ' in here.')
  utils.log('Please run it somewhere outside of the project.')

  process.exit(0)
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

inquirer.prompt(prompts, answers => {
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
    files.shift()

    const replaceDots = [
      'name',
      'base'
    ]

    for (var file of files) {
      var filePath = path.parse(file)

      for (var property of replaceDots) {
        filePath[property] = filePath[property].replace('_', '.')
      }

      var dest = path.join(targetDir, path.relative(template, path.format(filePath)))

      try {
        fs.ensureDirSync(path.dirname(dest))
      } catch (err) {
        return utils.log(err)
      }

      try {
        fs.copySync(file, dest)
      } catch (err) {
        return utils.log(err)
      }
    }

    utils.log('Generated new site in ' + chalk.gray(targetDir))
  })
})
