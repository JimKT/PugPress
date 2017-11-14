"use strict";
// Require the Following to Work
const gulp = require('gulp');
const runSequence = require('run-sequence');
const replace = require('gulp-replace');
const clean = require('gulp-clean');
const rename = require('gulp-rename');
const inlinesource = require('gulp-inline-source');
const inlineCss = require('gulp-inline-css');
const pug = require('gulp-pug');
const imagemin = require('gulp-imagemin');
const gap = require('gulp-append-prepend');
const autoprefixer = require('gulp-autoprefixer');
const ext_replace = require('gulp-ext-replace');
const stylus = require('gulp-stylus');

// Append and Prepend Wordpress Header and Footer
gulp.task('tags', () => 
    gulp.src(['*.php','!functions.php','!header.php','!footer.php'])
    .pipe(gap.prependText('<?php get_header(); ?>'))
    .pipe(gap.appendText('<?php get_footer(); ?>'))
    .pipe(gulp.dest('./'))
);
// Compile Stylus 
gulp.task('stylus', () =>
	gulp.src('./src/css/main.styl')
	.pipe(stylus({
		compress: true
	}))
	.pipe(gulp.dest('assets/css'))
);
// Compile PUG Files
gulp.task('php', () =>
	gulp.src('./src/templates/**/*.pug')
		.pipe(pug({
			pretty: true
		}))
		.pipe(replace('&lt;', '<'))
		.pipe(replace('&gt;', '>'))
		.pipe(replace( /(["'])assets\//g, '$1<?=get_template_directory_uri()?>/assets/' ) )
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
		.pipe(gulp.dest('assets/js'))
);
// Image Minification
gulp.task('images', () =>
	gulp.src('./src/images/**/*')
		.pipe(imagemin({
			optimizationLevel: 10
		}))
		.pipe(gulp.dest('assets/images'))
);
// Run ALL Tasks
gulp.task('build', () =>
	runSequence('images', 'stylus', 'php', 'functions', 'javascript', 'tags')
);
// On stylus Change
gulp.task('watch-stylus', () =>
	runSequence('stylus')
);
// On Javascript Change
gulp.task('watch-javascript', () =>
	runSequence('javascript')
);
// On Image Change
gulp.task('images', () =>
	runSequence('images')
);
// On Template Change
gulp.task('templates', () =>
	runSequence('php', 'functions', 'tags',)
);
// Default ( Runs all Tasks on Watch )
gulp.task('default', function () {
	// On stylus Change
	gulp.watch(['./src/css/**/*'], ['watch-stylus']);
	// On Javascript Change
	gulp.watch(['./src/js/**/*'], ['javascript']);
	// On Image Change
	gulp.watch(['./src/images/**/*'], ['images']);
	// On Template Change
	gulp.watch(['./src/templates/**/*'], ['templates']);
});