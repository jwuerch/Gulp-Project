const gulp = require('gulp'),
      sass = require('gulp-sass'),
      cleanCSS = require('gulp-cssnano'),
      useref = require('gulp-useref'),
      uglify = require('gulp-uglify'),
      gulpIf = require('gulp-if');

gulp.task('sass', function() {
    return gulp.src('site/scss/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('site/css/'));
});

gulp.task('minify', function() {
    return gulp.src('site/css/*.css')
    .pipe(gulpIf('*.css', cssnano()))
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulp.dest('dist/css'));
});

gulp.task('useref', function() {
    return gulp.src('site/*.html')
    .pipe(useref())
    .pipe(gulp.dest('dist'));
})
