/********* Requirements ***********/

const gulp = require('gulp'),
      sass = require('gulp-sass'),
      cssnano = require('gulp-cssnano'),
      useref = require('gulp-useref'),
      uglify = require('gulp-uglify'),
      gulpIf = require('gulp-if'),
      inject = require('gulp-inject-string'), // Injects strings into web files. Used to properly label minified CSS and JS files.
      imagemin = require('gulp-imagemin'),
      cache = require('gulp-cache'),
      reaname = require('gulp-rename'),
      svgSprite = require('gulp-svg-sprites'), // Only good for SVG files
      runSequence = require('run-sequence'),
      sprity = require('sprity'),
      del = require('del'),
      browserSync = require('browser-sync').create();

/********* Snippets ***********/
const snippets = {
    scriptTag: "<!--============================ Scripts ============================-->\n\t\t",
    cssTag: "<!--============================ CSS ============================-->\n\t\t"
}

/********* Tasks *********/
gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: 'site'
    },
  });
});

gulp.task('imagemin', function() {            // Compresses all images.
    return gulp.src('site/images/**/*.+(png|jpg|jpeg|gif|svg)')
    .pipe(cache(imagemin({
        interlaced: true
    })))
    .pipe(gulp.dest('site/images'));
});

gulp.task('sprite', function() { // Runs both svgSprite and Sprity
    sprity.src({
        src: 'site/images/**/*.{png,jpg}',
        style:'site/sprite.scss',
        processor:'sass',
    })
    .pipe(gulpIf('*.png', gulp.dest('site/images/sprite'), gulp.dest('site/scss'))) //Need to create separate sprite
                                                                                           //Folder for when moving to dist
    gulp.src('site/images/**/*.svg')
        .pipe(svgSprite({
            cssFile: '../../scss/spriteSvg.scss',
            svg: {
                sprite: 'spriteSvg.svg',
            }
        }))
        .pipe(gulp.dest("site/images/sprite")); // Destination of SVG files for CSS and sprite
    gulp.src('site/images/**/*.+(png|jpg|jpeg|gif|svg)') // Image compression again of newly created sprite file
    .pipe(cache(imagemin({
        interlaced: true
    })))
    .pipe(gulp.dest('site/images'))
    return gulp.src('site/images/sprite/**/*.+(png|jpg|jpeg|gif|svg])') // Only places sprite images in distribution folder
    .pipe(gulp.dest('dist/images'));
});

gulp.task('sass', function() {              // Converts all scss files to CSS files. Needs to occur before
    return gulp.src('site/scss/**/*.+(scss|css)')     // concatination.
    .pipe(sass())
    .pipe(gulp.dest('site/css/'))
    .pipe(browserSync.reload({
        stream:true
    }));
});

gulp.task('useref', function() {   // Concats and then minifies CSS and JS for distribution.
    gulp.src('site/*.html')
    .pipe(useref())
    .pipe(gulpIf('*.css', cssnano()))
    .pipe(gulpIf('*.js', uglify()))
    .pipe(inject.before('<script', snippets.scriptTag))                                        // inject label for js
    .pipe(inject.before('<link rel="stylesheet" href="css/styles.min.css">', snippets.cssTag)) // inject label for css
    .pipe(gulp.dest('dist'));
});

gulp.task('fonts', function() {
    return gulp.src('site/fonts/**/*')
    .pipe(gulp.dest('dist/fonts'));
})

gulp.task('clean:dist', function() { // Deletes dist directory
    return del.sync('dist');
})
gulp.task('cache:clear', function(callback) { // Clears cache of project
    return cache.clearAll(callback)
})

gulp.task('watch', ['browserSync', 'sass'], function() {
    gulp.watch('site/scss/**/*.+(scss|css)', ['sass']);
    gulp.watch('site/*.html', browserSync.reload);
    gulp.watch('site/js/**/*.js', browserSync.reload);
    gulp.watch('site/js/**/*.+(scss|css)', browserSync.reload);
    gulp.watch('site/images/**/*', ['imagemin']);
    gulp.watch('site/images/**/*', ['sprite']);
})

gulp.task('build', function() {
    runSequence('clean:dist', 'imagemin', 'sprite', 'sass', ['useref', 'fonts']);
})

gulp.task('default', function() {
    runSequence('clean:dist', 'imagemin', 'sprite', 'sass', ['browserSync', 'sprite', 'watch']);
})
