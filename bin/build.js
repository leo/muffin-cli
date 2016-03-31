#!/usr/bin/env node

const broccoli = require('broccoli')
const findup = require('findup-sync')
const ncp = require('ncp')
const path = require('path')
const colors = require('colors')

// Taken from grunt-broccoli-build
function loadBrocfile () {
  const brocfile = findup('build.js', {
    nocase: true,
    cwd: process.cwd()
  })

  if (!brocfile) {
    throw new Error('build.js not found')
  }

  // cwd into the Brocfile's dir so its deps are loaded correctly.
  process.chdir(path.dirname(brocfile))
  return require(brocfile)
}

const tree = loadBrocfile()
const builder = new broccoli.Builder(tree)

builder.build().then(results => {
  const dir = typeof results === 'string' ? results : results.directory
  const buildTime = results.totalTime

  ncp(dir, process.cwd() + '/dist', {dereference: true}, err => {
    if (err) throw err

    if (buildTime) {
      console.log(`Finished building after ${Math.floor(buildTime / 1e6)}ms.`.green)
    } else {
      console.log('Finished building.'.green)
    }

    builder.cleanup().catch(err => console.error(err))
  })

}).catch(err => {
  throw err
})
