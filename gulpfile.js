(function initializeGulp () {
  'use strict';

  var gulp = require('gulp');
  var sass = require('gulp-sass');
  var concat = require('gulp-concat');
  var mainBowerFiles = require('main-bower-files');
  var filter = require('gulp-filter');
  var webserver = require('gulp-webserver');
  var del = require('del');
  var fs = require('fs');
  var path = require('path');
  var iconfont = require('gulp-iconfont');
  var consolidate = require('gulp-consolidate');
  var vinylPaths = require('vinyl-paths');
  var merge = require('merge-stream');

  var dir = {
    'app': './app',
    'dist': './www',
    'cover': './cover',
    'bower': './bower_components',
    'npm': './node_modules'
  };

  /**
   * Cleans all imported, and generated, files from the project.
   *
   * @param {Function} cb callback.
   * @return {*} A gulp stream that performs this action.
   */
  gulp.task('clean', function () {
    return gulp.src([
      dir.npm,
      dir.bower,
      dir.dist,
      dir.cover
    ]).pipe(vinylPaths(del));
  });

  /**
   * Build our font from the icon svg.
   *
   * @return {*} A gulp stream that performs this action.
   */
  gulp.task('iconfont', function() {
    gulp.src([dir.app + '/fonts/openstack/*.svg'])
      .pipe(iconfont({
        'fontName': 'openstack',
        'appendCodepoints': true,
        'appendUnicode': true,
        'formats': ['ttf', 'eot', 'woff', 'woff2', 'svg']
      }))
      .on('glyphs', function(glyphs) {
        var options = {
          'glyphs': glyphs,
          'fontName': 'openstack',
          'fontPath': '../fonts/',
          'className': 'of'
        };
        return gulp.src(dir.app + '/fonts/openstack/openstack-font.css')
          .pipe(consolidate('lodash', options))
          .pipe(gulp.dest(dir.dist + '/css'));
      })
      .pipe(gulp.dest(dir.dist + '/fonts'));
  });

  /**
   * Start a local server and serve the packaged application code.
   * This also watches the source tree and will update the application
   * whenever changes are detected.
   *
   * @return {*} A gulp stream that performs this action.
   */
  gulp.task('serve', ['package'], function () {

    // Watch changes to the fonts directory.
    gulp.watch([dir.app + '/fonts/**/*.*'], ['iconfont']);

    // Watch changes to the css directory.
    gulp.watch([dir.app + '/css/*.scss'], ['package:styles']);

    // Watch changes to the bower.json file.
    gulp.watch(['./bower.json'], ['package:libs']);

    gulp.watch(
      [dir.app + '/**/*.+(html)'],
      ['package:static']);
    gulp.watch(
      [dir.app + '/**/*.+(js)'],
      ['package:app']);

    return gulp.src(dir.dist)
      .pipe(webserver({
        'livereload': true,
        'open': true
      }));
  });

  /**
   * Copy all the fonts into the dist directory, and generate any custom
   * fonts necessary for the application.
   *
   * @return {*} A gulp stream that performs this action.
   */
  gulp.task('package:fonts', ['iconfont'], function () {
    var files = mainBowerFiles();
    return gulp.src(files)
      .pipe(filter(['*.eot', '*.svg', '*.ttf', '*.woff', '*.woff2']))
      .pipe(gulp.dest(dir.dist + '/fonts'));
  });

  /**
   * Compile all styling files for the project. We're using SCSS includes here,
   * to explicitly choose which bits we need included.
   *
   * @return {*} A gulp stream that performs this action.
   */
  gulp.task('package:styles', function () {
    return gulp.src([dir.app + '/css/*.scss'])
      .pipe(sass())
      .pipe(gulp.dest(dir.dist + '/css'));
  });

  /**
   * Copy all external javascript files, as independent documents (since
   * they may carry their own license) into the output directory.
   *
   * @return {*} A gulp stream that performs this action.
   */
  gulp.task('package:libs', function () {
    // NOTE: This is the extension point for package maintainers. If, rather
    // than using bower, you would like to link in dependencies from a different
    // source (ex. debian package), this is the method that would need to be
    // extended to look for those.
    var files = mainBowerFiles();
    return gulp.src(files)
      .pipe(filter('*.js'))
      .pipe(gulp.dest(dir.dist + '/js/lib'));
  });

  /**
   * Iterate through the modules directory and build a concatenated js file for each directory.
   *
   * @return {*} A gulp stream that performs this action.
   */
  gulp.task('package:app', function () {
    var streams = [];
    var modulePath = path.join(dir.app, 'js', 'modules');

    /*eslint-disable no-sync */
    fs.readdirSync(modulePath)
      .filter(function(file) {
        // Only pull directories
        return fs.statSync(path.join(modulePath, file)).isDirectory();
      }).forEach(function(libName) {
        // Build a file glob pattern.
        var libPath = path.join(modulePath, libName);
        var files = [
          path.join(libPath, 'module.js'),
          path.join(libPath, '**/*.js')
        ];

        // Create a concat stream for this library.
        var stream = gulp.src(files)
          .pipe(concat(libName + '.js'))
          .pipe(gulp.dest(path.join(dir.dist, 'js')));
        streams.push(stream);
      });
    /*eslint-enable no-sync */

    // Merge all the streams and return.
    return merge.apply(merge, streams);
  });

  /**
   * Copy static assets into our package.
   *
   * @return {*} A gulp stream that performs this action.
   */
  gulp.task('package:static', function () {
    return gulp.src([
      dir.app + '/**/*.+(html|ico)'
    ]).pipe(gulp.dest(dir.dist));
  });

  /**
   * Package the app
   */
  gulp.task('package', ['package:static', 'package:app', 'package:fonts',
    'package:styles', 'package:libs']);
})();
