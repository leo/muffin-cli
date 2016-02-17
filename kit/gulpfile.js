const gulp = require('gulp')
const uglify = require('gulp-uglify')
const sass = require('gulp-sass')
const babel = require('gulp-babel')
const livereload = require('gulp-refresh')
const nodemon = require('gulp-nodemon')

const paths = {
  scss: 'assets/scss/**/*.scss',
  js: 'assets/js/**/*.js',
  images: 'assets/images/**/*',
  templates: [
    'views/**/*',
    'layouts/**/*'
  ]
}

gulp.task('styles', () => {
  return gulp
    .src(paths.scss)
    .pipe(sass({
      outputStyle: 'compressed',
      includePaths: ['assets/scss']
    }).on('error', sass.logError))
    .pipe(gulp.dest('dist'))
    .pipe(livereload())
})

gulp.task('scripts', () => {
  return gulp
    .src(paths.js)
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(uglify())
    .pipe(gulp.dest('dist'))
    .pipe(livereload())
})

gulp.task('images', () => {
  return gulp
    .src(paths.images)
    .pipe(gulp.dest('dist/images'))
    .pipe(livereload())
})

gulp.task('templates', () => {
  return gulp
    .src(paths.templates)
    .pipe(livereload())
})

gulp.task('watch', ['server'], function () {
  livereload.listen()

  gulp.watch(paths.templates, ['templates'])
  gulp.watch(paths.scss, ['styles'])
  gulp.watch(paths.js, ['scripts'])
  gulp.watch(paths.images, ['images'])
})

gulp.task('server', function () {
  nodemon({
    script: 'index.js',
    ignore: ['assets/', 'dist/'],
    ext: 'js'
  }).on('restart', function () {
    process.env.restarted = true
  })
})

gulp.task('default', ['styles', 'scripts', 'images'])
