#!/usr/bin/env node

import path from 'path'
import fs from 'fs-extra'
import program from 'commander'
import inquirer from 'inquirer'
import gitConfig from 'git-config'
import chalk from 'chalk'
import mkdirp from 'mkdirp'

import { log, isSite } from '../lib/utils'
import Generator from '../lib/tasks/generate'

program
  .option('-y, --yes', 'Skip all questions')
  .option('-f, --force', 'If the current directory contains a site, overwrite it')
  .option('-n, --skip-npm', 'Skip installing dependencies')
  .option('-d, --skip-data', 'Don\'t insert sample data')
  .parse(process.argv)

// Get the directory, if one was defined
const directory = program.args[program.args.length - 1]

// Resolve the path of the directory or use the current working dir
const targetDir = directory ? path.resolve(process.cwd(), directory) : process.cwd()

if (targetDir == path.normalize(__dirname + '/../../template')) {
  log('You shouldn\'t run ' + chalk.gray('init') + ' in here.')
  log('Please run it somewhere outside of the project.')

  process.exit(0)
}

if (isSite() && !program.force) {
  log(chalk.red('There\'s already a site in here!'))
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
      let git

      try {
        // Retrieve author from git config
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

let defaults = {}

for (let prompt of prompts) {
  let value = prompt.default || ''
  defaults[prompt.name] = typeof value === 'function' ? value() : value
}

function startGenerator (fields) {
  const skippers = [
    'Npm',
    'Data'
  ]

  for (let skipper of skippers) {
    let name = 'skip' + skipper
    fields[name] = program[name]
  }

  new Generator(fields, targetDir)
}

if (program.yes) {
  startGenerator(defaults)
} else {
  // Prompt user for details and pass answers to Generator
  inquirer.prompt(prompts, startGenerator)
}
