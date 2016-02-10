const generators = require('yeoman-generator')
const fs = require('fs')

module.exports = generators.Base.extend({
  constructor: function () {
    generators.Base.apply(this, arguments)
    this.sourceRoot(__dirname + '/../kit')
    this.option('install')
  },
  prompting: function () {
    var done = this.async()

    const prompts = [
      {
        type: 'input',
        name: 'name',
        message: 'Project name',
        default: this.appname
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
      done()
    }.bind(this))
  },
  writing: function () {
    const details = this.fields

    fs.readdir(this.templatePath(), function (err, files) {
      if (err) {
        throw err
      }

      for (var file of files) {
        var source = this.templatePath(file)
        this.fs.copyTpl(source, this.destinationPath(file), details)
      }
    }.bind(this))

    if (!this.options.install) {
      return
    }

    this.installDependencies({
      bower: false,
      callback: function () {
        // this.npmInstall('muffin')
      }
    })
  }
})
