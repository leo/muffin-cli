const gulp = require('gulp')
const concat = require('gulp-concat')
const uglify = require('gulp-uglify')
const sass = require('gulp-sass')
const babel = require('gulp-babel')

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
})

gulp.task('scripts', () => {
  return gulp.src(dirs.js)
    .pipe(concat('app.js'))
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(uglify())
    .pipe(gulp.dest('dist'))
})

gulp.task('vectors', () => {
  gulp.src(dirs.vectors)
    .pipe(gulp.dest('dist/vectors'))
})

gulp.task('watch', () => {
  gulp.watch(dirs.sass, ['styles'])
  gulp.watch(dirs.js, ['scripts'])
  gulp.watch(dirs.vectors, ['vectors'])
})

gulp.task('default', ['styles', 'scripts', 'vectors'])
