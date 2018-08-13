'use strict';

var fs = require('fs');
var gulp = require('gulp');
// var Parker = require('parker/lib/Parker');
var prettyJSON = require('prettyjson');
var sass = require('gulp-sass');
const browserSync = require('browser-sync');
// var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
// var sassLint = require('gulp-sass-lint');
var postcss = require('gulp-postcss');
// SCSS
const autoprefixer = require('gulp-autoprefixer');
const cssmin = require('gulp-cssmin');


var CONFIG = require('../config.js');

// Compiles Sass files into CSS
gulp.task('sass', gulp.series('sass:main'));

// Compiles Foundation Sass
gulp.task('sass:main', function () {
  return gulp.src(['src/scss/**/*.scss'])
    .pipe(sourcemaps.init())
    // .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    // .pipe(postcss([autoprefixer()])) // uses ".browserslistrc"
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist/css'))
    .pipe(browserSync.stream())
    // .pipe(browserSync.stream({match: '**/*.css'}))
});

// Audits CSS filesize, selector count, specificity, etc.
// gulp.task('sass:audit', gulp.series('sass:foundation', function(done) {
//   fs.readFile('./_build/assets/css/foundation.css', function(err, data) {
//     var parker = new Parker(require('parker/metrics/All'));
//     var results = parker.run(data.toString());
//     console.log(prettyJSON.render(results));
//     done();
//   });
// }));