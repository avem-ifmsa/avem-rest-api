import gulp from 'gulp';
import babel from 'gulp-babel';
import sourcemaps from 'gulp-sourcemaps';

gulp.task('build:app', function() {
	gulp.src('src/app/**/*.js')
		.pipe(sourcemaps.init())
		.pipe(babel({ optional: ['runtime'] }))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('dist/app'));
});

gulp.task('build:bin', function() {
	gulp.src('src/bin/**/*.js')
		.pipe(sourcemaps.init())
		.pipe(babel({ optional: ['runtime'] }))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('dist/bin'));
});

gulp.task('build', [
	'build:app', 'build:bin'
]);

gulp.task('watch', function() {
	gulp.watch('src/app', ['build:app']);
	gulp.watch('src/bin', ['build:bin']);
});

gulp.task('default', ['build']);
