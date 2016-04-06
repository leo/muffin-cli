const gulp = require('gulp')
const babel = require('gulp-babel')
const cache = require('gulp-cached')
const ext = require('gulp-ext')

const paths = {
  bin: 'bin/*'
}

gulp.task('compile-bin', function () {
  return gulp.src(paths.bin)
  .pipe(cache('bin'))
  .pipe(babel({
    presets: ['es2015']
  }))
  .pipe(ext.crop())
  .pipe(gulp.dest('build/bin'))
})

gulp.task('watch', function () {
  gulp.watch(paths.bin, ['compile-bin'])
})

gulp.task('default', ['watch', 'compile-bin'])
