var gulp = require('gulp');
var babel = require('gulp-babel');
var copy = require('gulp-copy');
var flatten = require('gulp-flatten');

gulp.task('babelify', function () {
	return gulp.src('src/js/*.js')
        .pipe(babel({
			presets: ['es2015', 'react']
        }))
        .pipe(gulp.dest('web/js'));
});

gulp.task('copyjs', function () {
	return gulp.src(['src/js/vendor/*.js'])
        .pipe(flatten())
        .pipe(gulp.dest('web/js/vendor'));
});

gulp.task('copycss', function () {
	return gulp.src(['src/css/*.css'])
        .pipe(gulp.dest('web/css'));
});

gulp.task('copyvendorcss', function () {
	return gulp.src(['src/css/vendor/*.css'])
        .pipe(gulp.dest('web/css/vendor'));
});

gulp.task('watch', function () {
	gulp.watch(['src/js/*.js'], ['babelify']);
	gulp.watch(['src/css/*.css'], ['copycss']);
});

gulp.task('default', ['babelify', 'copyjs', 'copycss', 'copyvendorcss', 'watch']);