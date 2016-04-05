#!/usr/bin/env node --harmony

const path = require('path')
const fs = require('fs-extra')
const program = require('commander')
const inquirer = require('inquirer')
const gitConfig = require('git-config')
const chalk = require('chalk')
const mkdirp = require('mkdirp')

const utils = require('../lib/utils')
const Generator = require('../lib/tasks/generate')

program
  .option('-f, --force', 'Overwrite the existing site')
  .option('-y, --yes', 'Skip all questions')
  .parse(process.argv)

// Get the directory, if one was defined
const directory = program.args[program.args.length - 1]

// Resolve the path of the directory or use the current working dir
const targetDir = directory ? path.resolve(process.cwd(), directory) : process.cwd()

if (targetDir == path.normalize(__dirname + '/../template')) {
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

// Prompt user for details and pass answers to Generator
inquirer.prompt(prompts, answers => new Generator(answers, targetDir))
