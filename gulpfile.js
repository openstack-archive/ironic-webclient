(function () {
    'use strict';

    var gulp = require('gulp');
    var bower = require('gulp-bower');
    var mainBowerFiles = require('main-bower-files');
    var filter = require('gulp-filter');
    var webserver = require('gulp-webserver');
    var streamqueue = require('streamqueue');
    var useref = require('gulp-useref');
    var rimraf = require('rimraf');
    var eslint = require('gulp-eslint');
    var ghPages = require('gulp-gh-pages');
    var debug = require('gulp-debug');
    var iconfont = require('gulp-iconfont');
    var consolidate = require('gulp-consolidate');

    var dir = {
        app: './app',
        dist: './dist'
    };

    /**
     * Clean the output directory.
     */
    gulp.task('clean', function (cb) {
        return rimraf(dir.dist, cb);
    });

    /**
     * Resolve all of our runtime libraries from bower.
     */
    gulp.task('bower', function () {
        return bower()
            .pipe(gulp.dest('bower_components/'));
    });

    /**
     * Build our font from the icon svg.
     */
    gulp.task('iconfont', function () {
        gulp.src([ dir.app + '/fonts/ironic/*.svg'])
            .pipe(iconfont({
                fontName: 'ironic',
                appendCodepoints: true
            }))
            .on('codepoints', function (codepoints) {
                var options = {
                    glyphs: codepoints,
                    fontName: 'ironic',
                    fontPath: '../fonts/', // set path to font (from your CSS file if relative)
                    className: 'if' // set class name in your CSS
                };
                gulp.src(dir.app + '/fonts/ironic/ironic-font.css')
                    .pipe(consolidate('lodash', options))
                    .pipe(gulp.dest('./app/css/')); // set path to export your CSS
            })
            .pipe(gulp.dest(dir.app + '/fonts'));
    });

    /**
     * Resolve all bower dependencies and add them to our app directory.
     */
    gulp.task('update_dependencies', ['bower', 'iconfont'], function () {

        var files = mainBowerFiles();

        var resolve_js = gulp.src(files)
            .pipe(filter('*.js'))
            .pipe(gulp.dest(dir.app + '/js/lib'));

        var resolve_css = gulp.src(files)
            .pipe(filter('*.css'))
            .pipe(gulp.dest(dir.app + '/css'));

        var resolve_fonts = gulp.src(files)
            .pipe(filter(['*.eot', '*.svg', '*.ttf', '*.woff', '*.woff2']))
            .pipe(gulp.dest(dir.app + '/fonts'));

        return streamqueue({ objectMode: true },
            resolve_js, resolve_css, resolve_fonts);
    });

    /**
     * Lint the javascript using eslint.
     */
    gulp.task('lint', function () {
        return gulp.src(['gulpfile.js', dir.app + '/js/**/*.js',
                '!' + dir.app + '/js/lib/*.js'])
            .pipe(eslint())
            .pipe(eslint.format())
            .pipe(eslint.failOnError());
    });

    /**
     * Start a local server and serve the raw application code. This is
     * equivalent to opening index.html in a browser.
     */
    gulp.task('serve:raw', function () {
        return gulp.src(dir.app)
            .pipe(webserver({
                livereload: true,
                open: true
            }));
    });

    /**
     * Start a local server and serve the packaged application code.
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
                livereload: true,
                open: true
            }));
    });

    /**
     * Build a concatenated application.
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
     */
    gulp.task('package:static', function () {
        return gulp.src([
                dir.app + '/**/*.+(eot|svg|ttf|woff|woff2|html)',
                '!' + dir.app + '/index.html'
        ]).pipe(gulp.dest(dir.dist));
    });

    /**
     * Package the app
     */
    gulp.task('package', ['package:static', 'package:app']);

    /**
     * Deploy the site to gh-pages.
     */
    gulp.task('deploy', ['package'], function () {
        return gulp.src('./dist/**/*')
            .pipe(ghPages());
    });
})();
