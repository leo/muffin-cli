import fs from 'fs-extra'
import path from 'path'
import escape from 'escape-string-regexp'
import babel from 'babel-register'
import es2015 from 'babel-preset-es2015'
import { exists } from './utils'

const escapedPath = escape(process.cwd())
const file = path.normalize(process.cwd() + '/index.js')

babel({
  // Pass preset directly. Otherwise Babel would try to get it relative to cwd
  presets: [es2015],
  only: new RegExp(escapedPath),
  ignore: false,
  filename: path.basename(file),
  sourceRoot: process.cwd()
})

let controls = false

if (exists(file)) {
  controls = require(file)
}

export default controls.default
