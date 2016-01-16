const generators = require('yeoman-generator')
const fs = require('fs')

module.exports = generators.Base.extend({
  constructor: function () {
    generators.Base.apply(this, arguments)
    this.sourceRoot(__dirname + '/../kit')
  },
  prompting: function () {

    var done = this.async();

    this.prompt({
      type    : 'input',
      name    : 'name',
      message : 'Project name',
      default : this.appname // Default to current folder name
    }, function (answers) {
      this.log(answers.name);
      done();
    }.bind(this));

  },
  writing: function () {

    const details = {
      name: 'Test',
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
