var gulp = require('gulp');
var sass = require('gulp-sass');
var header = require('gulp-header');
var cleanCSS = require('gulp-clean-css');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var autoprefixer = require('gulp-autoprefixer');
var pkg = require('./package.json');
var browserSync = require('browser-sync').create();
var htmlclean = require('gulp-htmlclean');
var realFavicon = require ('gulp-real-favicon');
var fs = require('fs');
// File where the favicon markups are stored
var FAVICON_DATA_FILE = 'faviconData.json';

// Compile SCSS
gulp.task('css:compile', function() {
  return gulp.src('./scss/**/*.scss')
    .pipe(sass.sync({
      outputStyle: 'expanded'
    }).on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(gulp.dest('./css'))
});

// Minify CSS
gulp.task('css:minify', ['css:compile'], function() {
  return gulp.src([
      './css/*.css',
      '!./css/*.min.css'
    ])
    .pipe(cleanCSS())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('./css'))
    .pipe(browserSync.stream());
});

// CSS
gulp.task('css', ['css:compile', 'css:minify']);

// Minify JavaScript
gulp.task('js:minify', function() {
  return gulp.src([
      './js/*.js',
      '!./js/*.min.js'
    ])
    .pipe(uglify())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('./js'))
    .pipe(browserSync.stream());
});

// JS
gulp.task('js', ['js:minify']);

// dist
gulp.task('js:dist', ['js'], function () {
  return gulp.src('./js/*.min.js')
    .pipe(uglify())
    .pipe(gulp.dest('./dist/js/'));
});


gulp.task('css:dist', ['css'], function () {
  return gulp.src('./css/*.min.css')
    .pipe(cleanCSS())
    .pipe(gulp.dest('./dist/css/'));
});

gulp.task('html:dist', function () {
  gulp.src('./index.html')
    .pipe(htmlclean())
    .pipe(gulp.dest('dist/'));
    gulp.src('./img/*')
    .pipe(gulp.dest('dist/img/'));
});

gulp.task('serve:dist', ['js'], function () {
  browserSync.init({
    server: {
      baseDir: "./dist"
    }
  });
});

gulp.task('dist', ['generate-favicon', 'js:dist', 'css:dist', 'html:dist']);

// Default task
gulp.task('default', ['css', 'js']);

// Configure the browserSync task
gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: "./"
    }
  });
});

// Dev task
gulp.task('dev', ['dist'], function() {
  browserSync.init({
    server: {
      baseDir: "./"
    }
  });
  gulp.watch('./scss/*.scss', ['css']);
  gulp.watch('./js/*.js', ['js']);
  gulp.watch('./*.html', browserSync.reload);
});


gulp.task('generate-favicon', function(done) {
	realFavicon.generateFavicon({
		masterPicture: './img/favicon.jpg',
		dest: './dist/',
		iconsPath: '/',
		design: {
			ios: {
				pictureAspect: 'noChange',
				assets: {
					ios6AndPriorIcons: false,
					ios7AndLaterIcons: false,
					precomposedIcons: false,
					declareOnlyDefaultIcon: true
				}
			},
			desktopBrowser: {},
			windows: {
				pictureAspect: 'noChange',
				backgroundColor: '#da532c',
				onConflict: 'override',
				assets: {
					windows80Ie10Tile: false,
					windows10Ie11EdgeTiles: {
						small: false,
						medium: true,
						big: false,
						rectangle: false
					}
				}
			},
			androidChrome: {
				pictureAspect: 'noChange',
				themeColor: '#ffffff',
				manifest: {
					display: 'standalone',
					orientation: 'notSet',
					onConflict: 'override',
					declared: true
				},
				assets: {
					legacyIcon: false,
					lowResolutionIcons: false
				}
			},
			safariPinnedTab: {
				pictureAspect: 'blackAndWhite',
				threshold: 50,
				themeColor: '#5bbad5'
			}
		},
		settings: {
			scalingAlgorithm: 'Mitchell',
			errorOnImageTooSmall: false,
			readmeFile: false,
			htmlCodeFile: false,
			usePathAsIs: false
		},
		markupFile: FAVICON_DATA_FILE
	}, function() {
		done();
  });
});