var gulp = require('gulp');
var babel = require('gulp-babel');
// var copy = require('gulp-copy');
var flatten = require('gulp-flatten');
var browserify = require('browserify');
var transform = require('vinyl-transform');

gulp.task('babelify', () => {
	return gulp.src('src/js/app.js')
        .pipe(babel({ presets: ['es2015', 'react'] }))
        .pipe(gulp.dest('web/js'));
});

var browserified = transform((filename) => {
	return browserify(filename)
		.transform(babel)
		.bundle();
});

gulp.task('browserify-ish', () => {
	return browserify('./src/js/app.js')
		.transform('babelify', { presets: ['es2015', 'react'] })
		.bundle() //().transform(babel({ presets: ['es2015', 'react'] })))
		.pipe(gulp.dest('web/js/app.js'));
});

gulp.task('browserify', () => {
	return gulp.src('src/js/vendor/events.js')
		.pipe(browserified)
		.pipe(gulp.dest('web/js/vendor'));
});

gulp.task('copyjs', () => {
	return gulp.src(['src/js/vendor/*.js'])
        .pipe(flatten())
        .pipe(gulp.dest('web/js/vendor'));
});

gulp.task('copycss', () => {
	return gulp.src(['src/css/*.css'])
        .pipe(gulp.dest('web/css'));
});

gulp.task('copyvendorcss', () => {
	return gulp.src(['src/css/vendor/*.css'])
        .pipe(gulp.dest('web/css/vendor'));
});

gulp.task('watch', () => {
	gulp.watch(['src/js/*.js'], ['babelify']);
	gulp.watch(['src/css/*.css'], ['copycss']);
});

gulp.task('default', ['babelify', 'browserify-ish', 'copyjs', 'copycss', 'copyvendorcss', 'watch']);
