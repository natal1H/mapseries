import del from "del";
import gulp from "gulp";
import webpack from "webpack";
import webpackStream from "webpack-stream";
import webpackConfig from "./webpack.config.js";
import gulpLoadPlugins from "gulp-load-plugins";
import packageJson from "./package.json";
import runSequence from "run-sequence"

const $ = gulpLoadPlugins({camelize: true});

gulp.task('clean', cb => del(['dist'], {dot: true}, cb));

gulp.task('dist:webpack', cb => {
  webpack(webpackConfig, (err, stats) => {
    if (err) throw new $.util.PluginError('dist', err);

    $.util.log(`[${packageJson.name} dist]`, stats.toString({colors: true}));

    cb();
  });
});

gulp.task('dist:static', cb => {
  gulp.src('./src/index.html').pipe(gulp.dest('./dist'));
  gulp.src('./static/**/*', {base: './static/'}).pipe(gulp.dest('./dist'));
});

gulp.task('default', cb => {
  runSequence('clean', 'dist:webpack', 'dist:static');
});
