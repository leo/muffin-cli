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
      }
    ]

    this.prompt(prompts, function (answers) {
      Object.assign(this, answers);
      done();
    }.bind(this));

  },
  writing: function () {

    const details = {
      name: this.name.toLowerCase(),
      author: 'Leo',
      year: new Date().getFullYear()
    }

    fs.readdir(this.templatePath(), function (err, files) {

      if (err) {
        throw err
      }

      for (file of files) {
        var source = this.templatePath(file)
        this.fs.copyTpl(source, this.destinationPath(file), details)
      }

    }.bind(this))

  }
})
