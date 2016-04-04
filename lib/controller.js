const fs = require('fs-extra')
const path = require('path')
const escape = require('escape-string-regexp')
const utils = require('./utils')

const escapedPath = escape(process.cwd())

require('babel-register')({
  // Pass preset directly. Otherwise Babel would try to get it relative to cwd
  presets: [require('babel-preset-es2015')],
  only: new RegExp(escapedPath)
})

const file = path.normalize(process.cwd() + '/index.js')
let controls = false

if (utils.exists(file)) {
  controls = require(file)
}

module.exports = controls
