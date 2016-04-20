import fs from 'fs-extra'
import chalk from 'chalk'

export function log (message, err) {
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

export function exists (path) {
  try {
    fs.statSync(path)
    return true
  } catch (err) {
    return false
  }
}

export function isSite () {
  const pkgPath = process.cwd() + '/package.json'

  const mightExist = {
    pkg: 'package.json',
    dotEnv: '.env',
    underscoreEnv: '_env'
  }

  // If one of the above files exists, return "true"
  for (let file in mightExist) {
    mightExist[file] = process.cwd() + '/' + mightExist[file]

    if (exports.exists(mightExist[file])) {
      return true
    }
  }

  if (!exports.exists(mightExist.pkg)) {
    return false
  }

  // Load the package.json
  const pkg = require(mightExist.pkg)

  // Check if muffin has been added to dependencies
  if (!pkg.dependencies || !pkg.dependencies.muffin) {
    return false
  }

  return true
}
