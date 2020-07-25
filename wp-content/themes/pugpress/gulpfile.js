"use strict";
// Require the Following to Work
const gulp = require('gulp');
const replace = require('gulp-replace');
const pug = require('gulp-pug');
const imagemin = require('gulp-imagemin');
const gap = require('gulp-append-prepend');
const autoprefixer = require('gulp-autoprefixer');
const ext_replace = require('gulp-ext-replace');
const cleancss = require('gulp-clean-css');
const sass = require('gulp-sass');
const include = require('gulp-include');

// Append and Prepend Wordpress Header and Footer
gulp.task('tags', () => 
    gulp.src(['*.php','!functions.php','!header.php','!footer.php'])
    .pipe(gap.prependText('<?php get_header(); ?>'))
    .pipe(gap.appendText('<?php get_footer(); ?>'))
    .pipe(gulp.dest('./'))
);
// Compile sass 
gulp.task('sass', () =>
	gulp.src('./src/sass/main.scss')
	.pipe(sass({
		compress: true
	}))
	.pipe(sass().on('error', sass.logError))
	.pipe(autoprefixer({
		cascade: false
	}))
    .pipe(cleancss({compatibility: 'ie8'}))
	.pipe(gulp.dest('dist/css'))
);
// Compile PUG Files
gulp.task('php', () =>
	gulp.src('./src/templates/**/*.pug')
		.pipe(pug({
			pretty: true
		}))
		.pipe(replace('&lt;', '<'))
		.pipe(replace('&gt;', '>'))
		.pipe(replace( /(["'])assets\//g, '$1<?=get_template_directory_uri()?>/dist/' ) )
		.pipe(ext_replace('.php'))
		.pipe(gulp.dest('./'))
);
// Move functions.php to Root
gulp.task('functions', () =>
	gulp.src('./src/templates/functions.php')
		.pipe(gulp.dest('./'))
);
// Move Javascript to Assets
gulp.task('javascript', () =>
	gulp.src('./src/js/main.js')
		.pipe(include())
			.on('error', console.log)
		.pipe(gulp.dest('dist/js'))
);
// Image Minification
gulp.task('images', () =>
	gulp.src('./src/images/**/*')
	.pipe(imagemin([
		imagemin.gifsicle({interlaced: true}),
		imagemin.mozjpeg({quality: 75, progressive: true}),
		imagemin.optipng({optimizationLevel: 5}),
		imagemin.svgo({
			plugins: [
				{removeViewBox: true},
				{cleanupIDs: false}
			]
		})
	]))
	.pipe(gulp.dest('dist/images'))
);
// Run ALL Tasks
gulp.task('build', gulp.series('images', 'sass', 'php', 'functions', 'javascript', 'tags'));
// On sass Change
gulp.task('watch-sass', gulp.series('sass'));
// On Javascript Change
gulp.task('watch-javascript', gulp.series('javascript'));
// On Image Change
gulp.task('images', gulp.series('images'));
// On Template Change
gulp.task('templates', gulp.series('php', 'functions', 'tags'));
// Default ( Runs all Tasks on Watch )
gulp.task('default', function () {
	// On sass Change
	gulp.watch(['./src/sass/**/*'], gulp.series('watch-sass'));
	// On Javascript Change
	gulp.watch(['./src/js/**/*'], gulp.series('javascript'));
	// On Image Change
	gulp.watch(['./src/images/**/*'], gulp.series('images'));
	// On Template Change
	gulp.watch(['./src/templates/**/*'], gulp.series('templates'));
});