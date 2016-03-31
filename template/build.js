const compileSass = require('broccoli-sass')
const mergeTrees = require('broccoli-merge-trees')
const esTranspiler = require('broccoli-babel-transpiler')

const sourceDir = 'assets'

const scripts = esTranspiler(sourceDir, {
  compact: true
})

const styles = compileSass([sourceDir], 'main.scss', 'styles.css', {
  outputStyle: 'compressed'
})

module.exports = mergeTrees([styles, scripts], {
  overwrite: true
})
