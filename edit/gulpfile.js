var gulp = require('gulp'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    streamify = require('gulp-streamify'),
    rename = require('gulp-rename'),
    notify = require('gulp-notify'),
    livereload = require('gulp-livereload'),
    del = require('del'),
    spawn = require('child_process').spawn,
    babelify = require('babelify');

var entryPoint = 'src/index.js',
    outputName = 'main.js';

function bundle_js(bundler) {
  return bundler.bundle()
    .pipe(source(outputName))
    .pipe(buffer())
    .pipe(gulp.dest('dist'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(uglify({
      compress: {
        comparisons: false
      }
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'))
    .pipe(notify({ message: 'Scripts task complete' }));
}

gulp.task('build', function () {
  var bundler = browserify(entryPoint, { debug: true })
  .transform(babelify, {
    presets: ['es2015']
  })

  return bundle_js(bundler)
})

gulp.task('clean', function() {
  return del(['dist']);
});

gulp.task('watch', function() {

  // Watch .js files
  gulp.watch('src/**/*.js', ['build']);
  // Create LiveReload server
  livereload.listen();

  // Watch any files in dist/, reload on change
  gulp.watch(['dist/**']).on('change', livereload.changed);

});

gulp.task('start-server', function (cb) {
  spawn('node', ['server.js'], { stdio: 'inherit' });
})

gulp.task('default', ['clean'], function() {
  gulp.start('build');
});
