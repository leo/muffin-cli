const path = require('path')
const fs = require('fs')

const makeDir = require('mkdirp').sync
const sass = require('node-sass')
const uglify = require('uglify-js')

exports.run = function compile (paths, callback) {
  const ext = path.parse(paths.full).ext.split('.')[1]

  switch (ext) {
    case 'scss':
      exports.sass(paths)
      break
    case 'js':
      exports.js(paths)
      break
    default:
      exports.copy(paths)
  }

  if (typeof callback === 'function') {
    callback()
  }
}

exports.sass = function (paths) {
  const meta = path.parse(paths.full)
  const output = path.normalize(process.cwd() + '/dist/' + paths.relative)

  const result = sass.renderSync({
    file: paths.full,
    outFile: output,
    sourceMap: false,
    outputStyle: 'compressed',
    sourceMapEmbed: false
  })

  try {
    makeDir(path.dirname(output))
    fs.writeFileSync(output, result.css)
  } catch (err) {
    throw err
  }
}

exports.js = function (paths) {
  const result = uglify.minify(paths.full)
  const output = path.normalize(process.cwd() + '/dist/' + paths.relative)

  try {
    makeDir(path.dirname(output))
    fs.writeFileSync(output, result.code)
  } catch (err) {
    throw err
  }
}

exports.copy = function (paths) {
  if (paths.full.includes('node_modules')) {
    return
  }

  const file = fs.createReadStream(paths.full)
  const targetPath = path.normalize(process.cwd() + '/dist/' + paths.relative)

  makeDir(path.dirname(targetPath))
  const target = fs.createWriteStream(targetPath)

  file.pipe(target)

  target.on('error', function (err) {
    console.error(err)
  })
}
