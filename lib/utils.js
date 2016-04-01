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
    console.error(chalk.bold(message) + "\n", err.stack)
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

  // Load the package.json
  const package = require(pkgPath)

  // Check if muffin has been added to dependencies
  if (!package.dependencies || !package.dependencies.muffin) {
    return false
  }

  return true
}
