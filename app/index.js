const generators = require('yeoman-generator')
const fs = require('fs')

module.exports = generators.Base.extend({
  constructor: function () {
    generators.Base.apply(this, arguments)
    this.sourceRoot(__dirname + '/../kit')
  },
  prompting: function () {

    var done = this.async();

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
      }
    ]

    this.prompt(prompts, function (answers) {

      this.fields = {
        year: new Date().getFullYear()
      }

      Object.assign(this.fields, answers);
      done();

    }.bind(this));

  },
  writing: function () {

    const details = this.fields

    fs.readdir(this.templatePath(), function (err, files) {

      if (err) {
        throw err
      }

      for (file of files) {
        var source = this.templatePath(file)
        this.fs.copyTpl(source, this.destinationPath(file), details)
      }

    }.bind(this))

    /*
    this.installDependencies({
      bower: false,
      callback: function () {
        this.npmInstall('muffin')
      }.bind(this)
    })
    */

  }
})
