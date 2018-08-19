var path = require('path');
const gulp = require('gulp');
const compileHandlebars = require('gulp-compile-handlebars');
const rename = require('gulp-rename');
const handlebars = require('gulp-handlebars');
const wrap = require('gulp-wrap');
const concat = require('gulp-concat');
const declare = require('gulp-declare');
var merge = require('merge-stream');

const CONFIG = require('../config.js');

gulp.task('handlebars', gulp.series('handlebars:precompile', 'handlebars:main'))

gulp.task('handlebars:precompile', () => {
  return gulp.src(CONFIG.SRC + 'pages/*.hbs')
    .pipe(compileHandlebars({}, {
      ignorePartials: true,
      batch: [CONFIG.SRC + '/partials']
    }))
    .pipe(rename({
      extname: '.html'
    }))
    .pipe(gulp.dest(CONFIG.SHIP));
});

gulp.task('handlebars:main', function () {
  // Assume all partials start with an underscore
  // You could also put them in a folder such as source/templates/partials/*.hbs
  return gulp.src(CONFIG.SRC + 'partials/*.hbs')
    .pipe(handlebars())
    .pipe(wrap('Handlebars.template(<%= contents %>)'))
    .pipe(declare({
      namespace: 'Hbs.templates',
      noRedeclare: true // Avoid duplicate declarations
    }))

    // Output both the partials and the templates as build/js/templates.js
    .pipe(concat('templates.js'))
    .pipe(gulp.dest(CONFIG.SHIP + 'js/'));
});