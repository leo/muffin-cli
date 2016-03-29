#!/usr/bin/env node

const path = require('path')
const fs = require('fs-extra')
const walk = require('walk')
const colors = require('colors')
const mkdirp = require('mkdirp')
const program = require('commander')

program.parse(process.argv)

const directory = program.args[program.args.length - 1]
const targetDir = directory ? path.resolve(process.cwd(), directory) : process.cwd()
const kit = __dirname + '/../kit'

if (path.basename(targetDir) == 'kit') {
  console.log('You shouldn\'t run ' + 'init'.gray + ' in here.')
  console.log('Please run it somewhere outside of the project.')

  process.exit(0)
}

const walker = walk.walk(kit)

walker.on('file', function (root, fileStats, next) {
  const way = root + '/' + fileStats.name
  const subPath = root.replace(kit, '')
  const folder = targetDir + subPath

  fs.ensureDirSync(folder)

  fs.copy(way, folder + '/' + fileStats.name, err => {
    if (err) return console.error(err)
    next()
  })
})

walker.on('end', function() {
  console.log('Generated new site in ' + targetDir.gray)
})
