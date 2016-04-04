const fs = require('fs-extra')
const path = require('path')
const utils = require('./utils')

require('babel-register')({
  // Pass preset directly. Otherwise Babel would try to get it relative to cwd
  presets: [require('babel-preset-es2015')]
})

const file = path.normalize(process.cwd() + '/index.js')
let controls = false

if (utils.exists(file)) {
  controls = require(file)
}

exports.default = controls
