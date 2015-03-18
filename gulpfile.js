var gulp = require('gulp');
var bower = require('gulp-bower');
var mainBowerFiles = require('main-bower-files');
var filter = require('gulp-filter');
var git = require('gulp-git');
var debug = require('gulp-debug');
var notify = require('gulp-notify');

var dir = {
    app: ['./app/'],
    dist: './dist'
};

/**
 * Resolve all of our runtime libraries from bower.
 */
gulp.task('bower', function () {
    return bower()
        .pipe(gulp.dest('bower_components/'));
});

/**
 * Resolve all bower javascript dependencies and add them to the /app/lib
 * directory.
 */
gulp.task('update_dependencies',['bower'], function () {
    return gulp.src(mainBowerFiles())
        .pipe(filter('*.js'))
        .pipe(gulp.dest(dir.app + '/lib'))
        .pipe(git.add())
        .pipe(notify('Ironic: Updated dependencies.'));
});
