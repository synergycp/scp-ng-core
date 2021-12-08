var
  gulp = require('gulp'),
  $ = require('gulp-load-plugins')()
  ;

var isProduction = true;

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
  dir: './build',
  src: {
    js: 'src.min.js',
  },
  vendor: {
    js: 'vendor.min.js',
    css: 'vendor.min.css',
  },
  dist: {
    js: 'dist.min.js',
  }
};

var vendor = {
  source: require('./vendor.json'),
};

var cssnanoOpts = {};
var pugOptions = {
  basedir: './',
};
var tplCacheOptions = {
  root: 'scp/core',
  module: 'scp.core',
};

gulp.task('scripts', function () {
  return gulp
    .src(source.scripts)
    .pipe($.jsvalidate())
    .pipe($.sourcemaps.init({loadMaps: true}))
    .on('error', handleError)
    .pipe($.concat(build.src.js))
    .pipe($.ngAnnotate())
    .on('error', handleError)
    .pipe($.uglify({
      preserveComments: 'some'
    }))
    .on('error', handleError)
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest(build.dir))
    ;
});

// Build the base script to start the application from vendor assets
gulp.task('vendor', function () {
  log('Copying base vendor assets..');

  var jsFilter = $.filter('**/*.js', {
    restore: true
  });
  var cssFilter = $.filter('**/*.css', {
    restore: true
  });

  return gulp
    .src(vendor.source)
    .pipe($.expectFile(vendor.source))
    .pipe(jsFilter)
    .pipe($.sourcemaps.init({loadMaps: true}))
    .pipe($.concat(build.vendor.js))
    .pipe(gulp.dest(build.dir))
    .pipe(jsFilter.restore())
    .pipe(cssFilter)
    .pipe($.concat(build.vendor.css))
    .pipe($.cssnano(cssnanoOpts))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest(build.dir))
    .pipe(cssFilter.restore())
    ;
});

gulp.task('merge', function () {
  return gulp
    .src([
      build.dir +'/'+build.vendor.js,
      build.dir +'/'+build.src.js,
    ])
    .pipe($.sourcemaps.init({loadMaps: true}))
    .pipe($.concat(build.dist.js))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest('./'))
    ;
});

gulp.task('default', gulp.series([
  'scripts',
  'vendor',
  'merge',
]));

function handleError(err) {
  log(err.toString());
  this.emit('end');
}

// log to console using
function log(msg) {
  $.util.log($.util.colors.blue(msg));
}
