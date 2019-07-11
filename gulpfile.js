const gulp = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const cleanCSS = require('gulp-clean-css');

const vendor = {
	styles: ['node_modules/summernote/dist/summernote-bs4.css'],
	scripts: ['node_modules/summernote/dist/summernote-bs4.min.js'],
	fonts: ['node_modules/summernote/dist/font/*', 'node_modules/summernote/dist/font/**/*'],
	others: ['src/plugins/summernote-image-attributes/summernote-image-attributes.js']
};

gulp.task('vendor:others', () => {
	return gulp.src(vendor.others).pipe(gulp.dest(`dist`));
});

gulp.task('vendor:fonts', () => {
	return gulp.src(vendor.fonts).pipe(gulp.dest(`dist/font`));
});

gulp.task('vendor:images', () => {
	return gulp.src(vendor.images).pipe(gulp.dest(`dist/images`));
});

gulp.task('vendor:js', () => {
	return gulp
		.src(vendor.scripts)
		.pipe(concat('vendors.min.js'))
		.pipe(uglify({ mangle: false }))
		.pipe(gulp.dest(`dist`));
});

gulp.task('vendor:css', () => {
	return gulp
		.src(vendor.styles)
		.pipe(concat('styles.min.css'))
		.pipe(cleanCSS({ specialComments: 0 }))
		.pipe(gulp.dest(`dist`));
});

gulp.task('vendor', gulp.parallel('vendor:others', 'vendor:fonts', 'vendor:images', 'vendor:js', 'vendor:css'));
gulp.task('build', gulp.series('vendor'));
gulp.task('default', gulp.series('vendor'));
