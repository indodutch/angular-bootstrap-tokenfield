//two main tasks are 'gulp watch' and 'gulp build'

//dependencies:
var gulp = require('gulp');
    //to use in conjunction with chrome plugin:
var livereload = require('gulp-livereload');
    //for css:
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var minifycss = require('gulp-minify-css');
var rename = require('gulp-rename');
    //for javascript:
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
    //for cleaning out dist/ directory before build:
var del = require('del');
    //angular-specific:
var ngAnnotate = require('gulp-ng-annotate');
var htmlify = require('gulp-angular-htmlify');
    //for bundling up js bower dependencies into one vendor file on build:
var mainBowerFiles = require('main-bower-files');
var gulpFilter = require('gulp-filter');
var useref = require('gulp-useref');
    //for automatically adding bower dependencies to index.html
var wiredep = require('gulp-wiredep');

//paths object to save file paths for ease as gulpfile gets larger
var paths = {
  dev: {
    css: 'src/css',
    html: 'src/**/*.html',
    sass: 'src/scss/*.scss',
    js: 'src/**/*.js',
    bower: 'bower_components/**'
  },
  build: {
    main: 'dist/',
    css: 'dist/css',
    js: 'dist/js'
  }
};

//for now, only used in bower-files task
var jsFilter = gulpFilter('**/*.js');

gulp.task('default', ['build'])

//watch for changes and compile css and run jshint on those changes
//also use livereload to automatically reload page
gulp.task('watch', function() {
  livereload.listen();
  gulp.watch(paths.dev.html).on('change', livereload.changed);
  gulp.watch(paths.dev.sass, ['styles']).on('change', livereload.changed);
  gulp.watch(paths.dev.js, ['lint']).on('change', livereload.changed);
});

//watch scss for changes and render into minified css with nice auto-prefixing
gulp.task('styles', function() {
  return gulp.src(paths.dev.sass)
    .pipe(sass({ style: 'expanded', errLogToConsole: true }))
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1'))
    .pipe(concat('main.css'))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss())
    .pipe(gulp.dest('app/public/css'));
});

//stylish output for errors
gulp.task('lint', function() {
  return gulp.src(paths.dev.js)
  .pipe(jshint()).on('error', errorHandler)
  .pipe(jshint.reporter('jshint-stylish'))
  .pipe(jshint.reporter('fail'));
});

//build task, with other tasks as dependencies and then javascript handling in anonymous function
gulp.task('build', ['bower-files', 'bower', 'copy-css', 'copy-server', 'copy-html-files'], function() {
    return gulp.src(paths.dev.js)
    .pipe(ngAnnotate())
    .pipe(uglify())
    .pipe(concat('ng-tokenfield.min.js'))
    .pipe(gulp.dest(paths.build.js))
});

//task to clear out dist/ folder befor building out deployment version of app - runs before every other task in 'gulp build'
gulp.task('empty-dist', function() {
  return del([paths.build.main+'/**/*']);
});

//copy minified CSS over to /dist
gulp.task('copy-css', ['empty-dist'], function () {
  return gulp.src(paths.dev.css)
    .pipe(gulp.dest(paths.build.css));
});

//copy html files into build directory, apply html5 data prefix to angular
gulp.task('copy-html-files', ['empty-dist'], function () {

  return gulp.src(paths.dev.html)
    .pipe(htmlify())
    .pipe(useref())
    .pipe(gulp.dest(paths.build.main));
});

//copy over express server into dist/ folder
gulp.task('copy-server', ['empty-dist'], function () {
  return gulp.src('./app/server.js')
  .pipe(gulp.dest('dist/'));
})

//deal with getting bower dependencies into dist/index.html bower and minify and concat bower js into vendor.min.js
gulp.task("bower-files", ['empty-dist'], function(){
  return gulp.src(mainBowerFiles(), { base: './bower_components' })
    .pipe(jsFilter)
    .pipe(uglify())
    .pipe(concat('vendor.min.js'))
    .pipe(gulp.dest("dist/js"));
});

gulp.task('bower', function () {
  gulp.src('./index.html')
    .pipe(wiredep())
    .pipe(gulp.dest('.'));
});

//error handler helper for jshint
function errorHandler (error) {
  this.emit('end');
}