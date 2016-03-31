const compileSass = require('broccoli-sass')
const mergeTrees = require('broccoli-merge-trees')

const sassDir = 'assets/scss'
const styles = compileSass([sassDir], 'main.scss', 'styles.css')

module.exports = mergeTrees([styles])
