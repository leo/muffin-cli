const fs = require('fs-extra')
const chalk = require('chalk')

exports.log = (message, err) => {
  // Regular errors
  if (message instanceof Error) {
    console.error(err && err.stack)
    return
  }

  // Ability to add custom message to error
  if (err instanceof Error) {
    console.error(chalk.bold(message), err.stack)
    return
  }

  // The usual loggings
  console.log(message)
}

exports.exists = path => {
  try {
    fs.statSync(path)
    return true
  } catch (err) {
    return false
  }
}

exports.isSite = () => {
  const pkgPath = process.cwd() + '/package.json'

  if (!exports.exists(pkgPath) || !exports.exists(process.cwd() + '/.env')) {
    return false
  }

  const package = require(pkgPath)

  if (!package.scripts) {
    return false
  }

  for (var script in package.scripts) {
    var value = package.scripts[script]

    if (value.includes('muffin')) {
      return true
    }
  }

  return false
}
