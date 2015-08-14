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
    'dist': './www'
  };

  /**
   * Clean the output directory.
   *
   * @param {Function} cb callback.
   * @return {*} A gulp stream that performs this action.
   */
  gulp.task('clean', function () {
    return gulp.src([
      dir.dist,
      'app/css/*.css',
      '!app/css/main.css',
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
          .pipe(gulp.dest(dir.dist + '/css/'));
      })
      .pipe(gulp.dest(dir.dist + '/fonts'));
  });

  /**
   * Resolve all bower dependencies and add them to our app directory.
   *
   * @return {*} A gulp stream that performs this action.
   */
  gulp.task('update_dependencies', ['bower'], function () {

    var files = mainBowerFiles();

    var resolveJs = gulp.src(files)
      .pipe(filter('*.js'))
      .pipe(gulp.dest(dir.app + '/js/lib'));

    var resolveCSS = gulp.src(files)
      .pipe(filter('*.css'))
      .pipe(gulp.dest(dir.app + '/css'));

    return streamqueue({'objectMode': true},
      resolveJs, resolveCSS);
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

    gulp.watch(
      [dir.app + '/**/*.+(html)'],
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
      dir.app + '/**/*.+(html|ico)',
      '!' + dir.app + '/index.html'
    ]).pipe(gulp.dest(dir.dist));
  });

  /**
   * Package the app
   */
  gulp.task('package', ['package:static', 'package:app', 'package:fonts']);

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
