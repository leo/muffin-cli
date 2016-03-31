const fs = require('fs-extra')

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
