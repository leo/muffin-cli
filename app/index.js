const generators = require('yeoman-generator')
const Mongonaut = require('mongonaut')
const fsExtra = require('fs-extra')
const updateNotifier = require('update-notifier')
const pkg = require(__dirname + '/../package.json')

const fs = require('fs')
const path = require('path')

updateNotifier({ pkg }).notify()

module.exports = generators.Base.extend({
  constructor: function () {
    generators.Base.apply(this, arguments)
    this.sourceRoot(__dirname + '/../kit')

    const dest = path.resolve(this.destinationRoot())

    this.argument('path', {
      type: String,
      desc: 'The path in which the new site should be generated',
      default: dest
    })

    this.destinationRoot(this.path)
  },
  prompting: function () {
    const done = this.async()
    const dataPath = __dirname + '/../data/'
    const destPath = path.resolve(this.path)

    const prompts = [
      {
        type: 'input',
        name: 'name',
        message: 'Project name',
        default: path.basename(destPath),
        filter: function (input) {
          return input.replace(' ', '').toLowerCase()
        }
      },
      {
        type: 'input',
        name: 'author',
        message: 'Author'
      },
      {
        type: 'input',
        name: 'db_host',
        message: 'DB host',
        default: 'localhost'
      },
      {
        type: 'input',
        name: 'db_name',
        message: 'DB name',
        default: 'muffin'
      },
      {
        type: 'input',
        name: 'db_user',
        message: 'DB user'
      },
      {
        type: 'input',
        name: 'db_password',
        message: 'DB password'
      }
    ]

    this.prompt(prompts, function (answers) {
      this.fields = {
        year: new Date().getFullYear(),
        secret: (Math.random() + 1).toString(36).substring(2)
      }

      Object.assign(this.fields, answers)

      const mongonaut = new Mongonaut({
        user: answers.db_user || '',
        pwd: answers.db_password || '',
        db: answers.db_name,
        collection: 'pages'
      })

      const pages = mongonaut.import(dataPath + 'pages.json')

      mongonaut.set('collection', 'users')
      const users = mongonaut.import(dataPath + 'users.json')

      Promise.all([pages, users]).then(() => done(), err => {
        this.log(err)
        this.env.error('Not able to insert sample data')
      })
    }.bind(this))
  },
  writing: function () {
    const details = this.fields

    const dontCopy = [
      'node_modules',
      '.DS_Store'
    ]

    fs.readdir(this.templatePath(), function (err, files) {
      if (err) {
        throw err
      }

      for (var file of files) {
        if (dontCopy.indexOf(file) > -1) {
          continue
        }

        var output = file.charAt(0) === '_' ? file.replace('_', '.') : file
        var source = this.templatePath(file)

        if (file === 'public') {
          fsExtra.copySync(source, this.destinationPath(output))
        } else {
          this.template(source, this.destinationPath(output), details)
        }
      }

      this.installDependencies({
        bower: false
      })
    }.bind(this))
  }
})
