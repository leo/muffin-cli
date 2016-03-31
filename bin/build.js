#!/usr/bin/env node

const broccoli = require('broccoli')
const findup = require('findup-sync')
const ncp = require('ncp')
const path = require('path')
const chalk = require('chalk')
const program = require('commander')

const utils = require('../lib/utils')

program
  .option('-w, --watch', 'Rebuild site if files change')
  .parse(process.argv)

if (!utils.isSite()) {
  utils.log(chalk.red('No site in here!'))
  process.exit(1)
}

const tree = broccoli.loadBrocfile()
const builder = new broccoli.Builder(tree)

function startWatching () {
  const Watcher = require('broccoli-sane-watcher')
  const watch = new Watcher(builder)

  process.on('SIGINT', () => {
    watch.close()
    process.exit(0)
  })

  watch.on('change', results => {
    if (!results.filePath) return
    console.log(results)
  })

  watch.on('error', err => utils.log(err))
}

builder.build().then(results => {
  const dir = typeof results === 'string' ? results : results.directory
  const buildTime = results.totalTime

  // Copy files from tmp folder to the destination directory
  // And make sure to follow symlinks while doing so
  ncp(dir, process.cwd() + '/dist', {dereference: true}, err => {
    if (err) throw err

    if (buildTime) {
      // The original built time is in nanoseconds, so we need to convert it to milliseconds
      utils.log(chalk.green(`Finished building after ${Math.floor(buildTime / 1e6)}ms.`))
    } else {
      utils.log(chalk.green('Finished building.'))
    }

    if (program.watch) {
      return startWatching()
    }

    builder.cleanup().catch(err => utils.log(err))
  })

}).catch(err => {
  throw err
})
