import broccoli from 'broccoli'
import ncp from 'ncp'
import chalk from 'chalk'
import Watcher from 'broccoli-sane-watcher'
import { log } from '../utils'

class Builder {
  constructor (tree, watch) {
    this.shouldWatch = watch
    this.tree = tree

    this.createBuilder()
  }

  createBuilder () {
    this.builder = new broccoli.Builder(this.tree)
    this.builder.build().then(this.doneBuilding.bind(this)).catch(err => utils.log(err))
  }

  doneBuilding (results) {
    const dir = typeof results === 'string' ? results : results.directory
    const buildTime = results.totalTime

    // Copy files from tmp folder to the destination directory
    // And make sure to follow symlinks while doing so
    ncp(dir, process.cwd() + '/dist', {dereference: true}, function (err) {
      if (err) throw err

      if (buildTime) {
        // The original built time is in nanoseconds, so we need to convert it to milliseconds
        log(chalk.green(`Finished building after ${Math.floor(buildTime / 1e6)}ms.`))
      } else {
        log(chalk.green('Finished building.'))
      }

      if (this.shouldWatch && !this.watching) {
        return this.startWatching.bind(this)()
      }

      if (!this.watching) {
        this.builder.cleanup().catch(err => log(err))
      }
    }.bind(this))
  }

  startWatching () {
    const watch = new Watcher(this.builder)
    this.watching = true

    process.on('SIGINT', () => {
      watch.close()
      process.exit(0)
    })

    watch.on('change', function (results) {
      if (!results.filePath) return
      this.createBuilder()
    }.bind(this))

    watch.on('error', err => log(err))
  }
}

export default Builder
