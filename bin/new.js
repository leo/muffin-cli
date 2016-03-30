#!/usr/bin/env node

const path = require('path')
const fs = require('fs-extra')
const colors = require('colors')
const mkdirp = require('mkdirp')
const program = require('commander')
const inquirer = require('inquirer')

program.parse(process.argv)

const directory = program.args[program.args.length - 1]
const targetDir = directory ? path.resolve(process.cwd(), directory) : process.cwd()
const kit = path.normalize(__dirname + '/../kit')

if (targetDir == kit) {
  console.log('You shouldn\'t run ' + 'init'.gray + ' in here.')
  console.log('Please run it somewhere outside of the project.')

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
    message: 'Author'
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

inquirer.prompt(prompts, answers => {
  const walker = fs.walk(kit)
  var files = []

  walker.on('data', item => {
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

      var dest = path.join(targetDir, path.relative(kit, path.format(filePath)))

      try {
        fs.ensureDirSync(path.dirname(dest))
      } catch (err) {
        return console.error(err)
      }

      try {
        fs.copySync(file, dest)
      } catch (err) {
        return console.error(err)
      }
    }

    console.log('Generated new site in ' + targetDir.gray)
  })
})
