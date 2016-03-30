#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const walk = require('walk')

const compile = require('../lib/compiler').run

const program = require('commander')
const colors = require('colors')
const chokidar = require('chokidar')

program
  .option('-w, --watch', 'Rebuild site if files change')
  .parse(process.argv)

const timerStart = new Date().getTime()

const walker = walk.walk(process.cwd() + '/assets')

walker.on('file', function (root, fileStat, next) {
  const ignored = [
    'package.json',
    'config.json'
  ]

  if (ignored.indexOf(fileStat.name) > -1 || fileStat.name.charAt(0) == '.') {
    return next()
  }

  // You can't reference a object property within itself
  // So it's better to do it like this
  const paths = new function () {
    this.full = path.resolve(root, fileStat.name)
    this.relative = this.full.replace(process.cwd(), '').replace('scss', 'css')
  }

  compile(paths, function () {
    next()
  })
})

walker.on('end', function () {
  const timerEnd = new Date().getTime()
  console.log(`Built the site in ${timerEnd - timerStart}ms.`.green)

  if (program.watch) {
    const watcher = chokidar.watch(process.cwd(), {
      ignored: /dist|.DS_Store|.git/
    })

    console.log('Watching for changes...')

    process.on('SIGINT', () => {
      watcher.close()
      process.exit(0)
    })

    watcher.on('change', (file) => {
      require('../lib/watch')('change', file)
    })
  }
})
