#!/usr/bin/env node

const path = require('path')
const fs = require('fs-extra')
const colors = require('colors')
const mkdirp = require('mkdirp')
const program = require('commander')

program.parse(process.argv)

const directory = program.args[program.args.length - 1]
const targetDir = directory ? path.resolve(process.cwd(), directory) : process.cwd()
const kit = path.normalize(__dirname + '/../kit')

if (targetDir == kit) {
  console.log('You shouldn\'t run ' + 'init'.gray + ' in here.')
  console.log('Please run it somewhere outside of the project.')

  process.exit(0)
}

const walker = fs.walk(kit)
var files = []

walker.on('data', item => {
  files.push(item.path)
})

walker.on('end', () => {
  files.shift()

  for (var file of files) {
    var dest = path.join(targetDir, path.relative(kit, file))

    try {
      fs.ensureDirSync(path.dirname(dest))
    } catch (err) {
      return console.error(err)
    }

    try {
      fs.copySync(file, dest)
    } catch (err) {
      return console.error(errr)
    }
  }

  console.log('Generated new site in ' + targetDir.gray)
})
