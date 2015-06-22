(function initializeGulp () {
  'use strict';

  var gulp = require('gulp');
  var bower = require('gulp-bower');
  var mainBowerFiles = require('main-bower-files');
  var filter = require('gulp-filter');
  var webserver = require('gulp-webserver');
  var streamqueue = require('streamqueue');
  var useref = require('gulp-useref');
  var del = require('del');
  var ghPages = require('gulp-gh-pages');
  var iconfont = require('gulp-iconfont');
  var consolidate = require('gulp-consolidate');
  var vinylPaths = require('vinyl-paths');

  var dir = {
    'app': './app',
    'dist': './dist'
  };

  /**
   * Clean the output directory.
   *
   * @param {Function} cb callback.
   * @return {*} A gulp stream that performs this action.
   */
  gulp.task('clean', function (cb) {
    return gulp.src([
      dir.dist,
      'app/css/*.css',
      '!app/css/main.css',
      'app/fonts/*.{eot,svg,ttf,woff,woff2}',
      'app/js/lib/*.js'
    ]).pipe(vinylPaths(del));
  });

  /**
   * Resolve all of our runtime libraries from bower.
   *
   * @return {*} A gulp stream that performs this action.
   */
  gulp.task('bower', function () {
    return bower()
      .pipe(gulp.dest('bower_components/'));
  });

  /**
   * Build our font from the icon svg.
   *
   * @return {*} A gulp stream that performs this action.
   */
  gulp.task('iconfont', function () {
    gulp.src([dir.app + '/fonts/ironic/*.svg'])
      .pipe(iconfont({
        'fontName': 'ironic',
        'appendCodepoints': true
      }))
      .on('codepoints', function (codepoints) {
        var options = {
          'glyphs': codepoints,
          'fontName': 'ironic',
          'fontPath': '../fonts/',
          'className': 'if'
        };
        gulp.src(dir.app + '/fonts/ironic/ironic-font.css')
          .pipe(consolidate('lodash', options))
          .pipe(gulp.dest('./app/css/'));
      })
      .pipe(gulp.dest(dir.app + '/fonts'));
  });

  /**
   * Resolve all bower dependencies and add them to our app directory.
   *
   * @return {*} A gulp stream that performs this action.
   */
  gulp.task('update_dependencies', ['bower', 'iconfont'], function () {

    var files = mainBowerFiles();

    var resolveJs = gulp.src(files)
      .pipe(filter('*.js'))
      .pipe(gulp.dest(dir.app + '/js/lib'));

    var resolveCSS = gulp.src(files)
      .pipe(filter('*.css'))
      .pipe(gulp.dest(dir.app + '/css'));

    var resolveFonts = gulp.src(files)
      .pipe(filter(['*.eot', '*.svg', '*.ttf', '*.woff', '*.woff2']))
      .pipe(gulp.dest(dir.app + '/fonts'));

    return streamqueue({'objectMode': true},
      resolveJs, resolveCSS, resolveFonts);
  });

  /**
   * Start a local server and serve the raw application code. This is
   * equivalent to opening index.html in a browser.
   *
   * @return {*} A gulp stream that performs this action.
   */
  gulp.task('serve:raw', function () {
    return gulp.src(dir.app)
      .pipe(webserver({
        'livereload': true,
        'open': true
      }));
  });

  /**
   * Start a local server and serve the packaged application code.
   *
   * @return {*} A gulp stream that performs this action.
   */
  gulp.task('serve:dist', ['package'], function () {

    gulp.watch(
      [dir.app + '/**/*.+(eot|svg|ttf|woff|woff2|html)'],
      ['package:static']);
    gulp.watch(
      [dir.app + '/**/*.+(js|css)', dir.app + '/index.html'],
      ['package:app']);

    return gulp.src(dir.dist)
      .pipe(webserver({
        'livereload': true,
        'open': true
      }));
  });

  /**
   * Build a concatenated application.
   *
   * @return {*} A gulp stream that performs this action.
   */
  gulp.task('package:app', function () {
    var assets = useref.assets();

    return gulp.src(dir.app + '/index.html')
      .pipe(assets)
      .pipe(assets.restore())
      .pipe(useref())
      .pipe(gulp.dest(dir.dist));
  });

  /**
   * Copy static assets into our package.
   *
   * @return {*} A gulp stream that performs this action.
   */
  gulp.task('package:static', function () {
    return gulp.src([
      dir.app + '/**/*.+(eot|svg|ttf|woff|woff2|html|ico)',
      '!' + dir.app + '/index.html'
    ]).pipe(gulp.dest(dir.dist));
  });

  /**
   * Package the app
   */
  gulp.task('package', ['package:static', 'package:app']);

  /**
   * Deploy the site to gh-pages.
   *
   * @return {*} A gulp stream that performs this action.
   */
  gulp.task('deploy', ['package'], function () {
    return gulp.src('./dist/**/*')
      .pipe(ghPages());
  });
})();
