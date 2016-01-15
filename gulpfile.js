const gulp = require('gulp')
const concat = require('gulp-concat')
const uglify = require('gulp-uglify')
const sass = require('gulp-sass')
const babel = require('gulp-babel')
const livereload = require('gulp-livereload')
const nodemon = require('gulp-nodemon')

const dirs = {
  sass: 'assets/styles/**/*.scss',
  js: 'assets/scripts/**/*.js',
  vectors: 'assets/vectors/**/*.svg'
}

gulp.task('styles', () => {
  gulp.src(dirs.sass)
    .pipe(sass({
      outputStyle: 'compressed',
      includePaths: ['assets/styles']
    }).on('error', sass.logError))
    .pipe(concat('styles.css'))
    .pipe(gulp.dest('dist'))
    .pipe(livereload())
})

gulp.task('scripts', () => {
  return gulp.src(dirs.js)
    .pipe(concat('app.js'))
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(uglify())
    .pipe(gulp.dest('dist'))
    .pipe(livereload())
})

gulp.task('vectors', () => {
  gulp.src(dirs.vectors)
    .pipe(gulp.dest('dist/vectors'))
    .pipe(livereload())
})

gulp.task('watch', ['server'], function () {
  livereload.listen()

  gulp.watch(dirs.sass, ['styles'])
  gulp.watch(dirs.js, ['scripts'])
  gulp.watch(dirs.vectors, ['vectors'])
})

gulp.task('server', function () {
  nodemon({
    script: 'index.js',
    ignore: ['assets/', 'dist/'],
    ext: 'js hbs'
  })
})

gulp.task('default', ['styles', 'scripts', 'vectors'])
