/********* Requirements ***********/

const gulp = require('gulp'),
      sass = require('gulp-sass'),
      cleanCSS = require('gulp-cssnano'),
      useref = require('gulp-useref'),
      uglify = require('gulp-uglify'),
      gulpIf = require('gulp-if'),
      inject = require('gulp-inject-string'), // Injects strings into web files. Used to properly label minified CSS and JS files.
      imagemin = require('gulp-imagemin'),
      cache = require('gulp-cache'),
      spritesmith = require('gulp.spritesmith'), // Only good for jpg and png files
      reaname = require('gulp-rename'),
      svgSprite = require('gulp-svg-sprites'); // Only good for SVG files

/********* Snippets ***********/
const snippets = {
    scriptTag: "<!--============================ Scripts ============================-->\n\t\t",
    cssTag: "<!--============================ CSS ============================-->\n\t\t"
}

/********* Tasks *********/

gulp.task('imagemin', function() {            // Compresses all images. Needs to occur before and after spriting
    return gulp.src('site/images/*.+(png|jpg|jpeg|gif|svg)')
    .pipe(cache(imagemin({
        interlaced: true
    })))
    .pipe(gulp.dest('site/images'));
});

gulp.task('sprite', function() { // Runs both svgSprie and spritesmith
    const spritePng =
        gulp.src('site/images/*.png') // source path of png files
        .pipe(spritesmith({
            imgName: 'spritePng.png',
            cssName: 'spritePng.css'
        }));
    const spriteJpg =
        gulp.src('site/images/*.jpg') // source path of jpg files
        .pipe(spritesmith({
            imgName: 'spriteJpg.jpg',
            cssName: 'spriteJpg.css'
        }));
    spritePng.img.pipe(gulp.dest('site/images/')); // Destination of PNG files for CSS and Sprite
    spritePng.css.pipe(gulp.dest('site/scss'));
    spriteJpg.img.pipe(gulp.dest('site/images'));  // Destination of JPG files for CSS and Sprite
    spriteJpg.css.pipe(gulp.dest('site/scss'));
    gulp.src('site/images/*.svg')
        .pipe(svgSprite({
            cssFile: '../../scss/spriteSvg.scss',
            svg: {
                sprite: 'spriteSvg.svg'
            }
        }))
        .pipe(gulp.dest('site/images')); // Destination of SVG files for CSS and sprite

})

gulp.task('sass', function() {              // Converts all scss files to CSS files. Needs to occur before
    return gulp.src('site/scss/*.+(scss|css)')     // concatination.
    .pipe(sass())
    .pipe(gulp.dest('site/css/'));
});


gulp.task('useref', function() {            // This only concats the JS & CSS stylesheets linked in index.html.
    return gulp.src('site/*.html')          // Concatination occurs below the <!-- end build --> Line.
    .pipe(useref())                         // Useref automatically creates a link to new file in index.html.
    .pipe(inject.before('<script', snippets.scriptTag))
    .pipe(inject.before('<link rel="stylesheet" href="css/styles.min.css">', snippets.cssTag))
    .pipe(gulp.dest('dist'));
})

gulp.task('minify', function() {            // This task minifies both CSS and JS files.
    return gulp.src('site/css/*.css')       // Meant to occur after concatination due to extra addition of CSS sprites.
    .pipe(gulpIf('*.css', cssnano()))
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulp.dest('dist/css'));
});
