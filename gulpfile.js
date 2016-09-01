var
  gulp = require('gulp'),
  $ = require('gulp-load-plugins')()
  ;

var paths = {
  scripts: 'src/',
};

var source = {
  scripts: [
    paths.scripts + 'core.module.js',

    // modules
    paths.scripts + '**/*.module.js',
    paths.scripts + '**/*.js'
  ],
};

var build = {
  scripts: './',
  dist: 'dist.min.js',
};

gulp.task('scripts', function () {
  return gulp
    .src(source.scripts)
    .pipe($.jsvalidate())
    .on('error', handleError)
    .pipe($.concat(build.dist))
    .pipe($.ngAnnotate())
    .on('error', handleError)
    .pipe($.uglify({
      preserveComments: 'some'
    }))
    .on('error', handleError)
    .pipe(gulp.dest(build.scripts))
    ;
});

gulp.task('default', [
  'scripts',
]);

function handleError(err) {
  log(err.toString());
  this.emit('end');
}

// log to console using
function log(msg) {
  $.util.log($.util.colors.blue(msg));
}
