const gulp = require('gulp')
const uglify = require('gulp-uglify')
const sass = require('gulp-sass')
const babel = require('gulp-babel')
const nodemon = require('gulp-nodemon')

const browserSync = require('browser-sync').create()

const paths = {
  scss: 'assets/scss/**/*.scss',
  js: 'assets/js/**/*.js',
  public: 'public/**/*',
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
    .pipe(browserSync.stream())
})

gulp.task('scripts', () => {
  return gulp
    .src(paths.js)
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(uglify())
    .pipe(gulp.dest('dist'))
    .pipe(browserSync.stream())
})

gulp.task('serve', () => {
  nodemon({
    script: 'index.js',
    ignore: ['assets/', 'dist/'],
    ext: 'js'
  }).on('restart', () => setTimeout(() => {
    browserSync.reload()
  }, 500))

  browserSync.init({
    proxy: 'localhost:2000',
    open: false,
    logPrefix: 'muffin',
    logFileChanges: false,
    notify: false,
    ui: false
  })
})

gulp.task('watch', ['serve'], () => {
  gulp.watch(paths.scss, ['styles'])
  gulp.watch(paths.js, ['scripts'])

  gulp.watch(paths.templates, browserSync.reload)
  gulp.watch(paths.public, browserSync.reload)
})

gulp.task('default', ['styles', 'scripts'])
