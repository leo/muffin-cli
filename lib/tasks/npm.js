import npm from 'npm'
import { log } from '../utils'
import { execSync } from 'child_process'

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
      execSync('npm set progress=' + state.toString(), {stdio: [0, 1]})
    } catch (err) {
      log(err)
      process.exit(1)
    }
  }

  loaded (err) {
    if (err) return log(err)
    this.setProgressBar(false)

    npm.commands[this.cmd]([], function (err, data) {
      if (err) return log(err)

      if (data) {
        this.cb(data)
      }

      this.setProgressBar(true)
    }.bind(this))
  }
}

module.exports = NPM
