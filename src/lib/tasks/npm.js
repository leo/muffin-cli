const npm = require('npm')
const utils = require('../utils')
const exec = require('child_process').execSync

class NPM {
  constructor (command, callback) {
    this.cmd = command
    this.cb = callback

    npm.load({
      loaded: false,
      loglevel: 'silent'
    }, this.loaded.bind(this))
  }

  setProgressBar (state) {
    try {
      exec('npm set progress=' + state.toString(), {stdio: [0, 1]})
    } catch (err) {
      throw utils.log(err)
    }
  }

  loaded (err) {
    if (err) return utils.log(err)
    this.setProgressBar(false)

    npm.commands[this.cmd]([], function (err, data) {
      if (err) return utils.log(err)

      if (data) {
        this.cb(data)
      }

      this.setProgressBar(true)
    }.bind(this))
  }
}

module.exports = NPM
