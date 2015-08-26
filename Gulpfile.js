var gulp    = require('gulp');
var package = require('./package.json');
var rename  = require('gulp-rename');
var uglify  = require('gulp-uglify');
var header  = require('gulp-header');

gulp.task('build', function() {
  return gulp.src('./src/ng-pinch-zoom.js')
    .pipe(header('/*! <%= name %> - v<%= version %> */\n', {
      name: 'angular-pinch-zoom',
      version: package.version
    }))
    .pipe(gulp.dest('./dist/'))
    .pipe(rename('ng-pinch-zoom.min.js'))
    .pipe(uglify({
      preserveComments: 'some'
    }))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('default', ['build']);
