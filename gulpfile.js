const gulp = require('gulp'),
      sass = require('gulp-sass'),
      cleanCSS = require('gulp-clean-css'),
      concatCSS = require('gulp-concat-css');

gulp.task('sass', function() {
    return gulp.src('site/scss/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('site/css/'));
});

gulp.task('cleancss', function() {
    return gulp.src('site/css/*.css')
    .pipe(concatCSS(''))
    .pipe(cleanCSS())
    .pipe(gulp.dest('dist/css'));
});
