const gulp = require('gulp')
const concat = require('gulp-concat')
const uglify = require('gulp-uglify')
const sass = require('gulp-sass')
const babel = require('gulp-babel')
const livereload = require('gulp-livereload')
const nodemon = require('gulp-nodemon')

const dirs = {
  sass: 'assets/scss/**/*.scss',
  js: 'assets/js/**/*.js',
  images: 'assets/images/**/*'
}

gulp.task('styles', () => {
  return gulp
    .src(dirs.scss)
    .pipe(sass({
      outputStyle: 'compressed',
      includePaths: ['assets/styles']
    }).on('error', sass.logError))
    .pipe(concat('styles.css'))
    .pipe(gulp.dest('dist'))
    .pipe(livereload())
})

gulp.task('scripts', () => {
  return gulp
    .src(dirs.js)
    .pipe(concat('app.js'))
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(uglify())
    .pipe(gulp.dest('dist'))
    .pipe(livereload())
})

gulp.task('images', () => {
  return gulp
    .src(dirs.images)
    .pipe(gulp.dest('dist/images'))
    .pipe(livereload())
})

gulp.task('watch', ['server'], function () {
  livereload.listen()

  gulp.watch(dirs.scss, ['styles'])
  gulp.watch(dirs.js, ['scripts'])
  gulp.watch(dirs.images, ['images'])
})

gulp.task('server', function () {
  nodemon({
    script: 'index.js',
    ignore: ['assets/', 'dist/'],
    ext: 'js hbs'
  }).on('restart', function () {
    process.env.restarted = true
  })
})

gulp.task('default', ['styles', 'scripts', 'images'])
