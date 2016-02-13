const generators = require('yeoman-generator')
const fs = require('fs')
const path = require('path')

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
        if (file === 'node_modules') {
          continue
        }

        var output = file.charAt(0) === '_' ? file.replace('_', '.') : file
        var source = this.templatePath(file)

        this.template(source, this.destinationPath(output), details)
      }
    }.bind(this))

    this.installDependencies({
      bower: false
    })
  }
})
