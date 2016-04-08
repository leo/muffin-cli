const gulp = require('gulp')
const babel = require('gulp-babel')
const cache = require('gulp-cached')
const ext = require('gulp-ext')
const check = require('gulp-if')
const path = require('path')

const srcPath = 'src/**/*'
const condition = file => file.path.indexOf('/bin') > -1

gulp.task('transpile', function () {
  return gulp.src(srcPath)
  .pipe(cache('muffin'))
  .pipe(babel({
    presets: ['es2015'],
    plugins: [
      'transform-async-to-generator',
      'transform-runtime',
      'syntax-async-functions'
    ]
  }))
  .pipe(check(condition, ext.crop()))
  .pipe(gulp.dest('dist'))
})

gulp.task('watch', function () {
  gulp.watch(srcPath, ['transpile'])
})

gulp.task('default', ['watch', 'transpile'])
