const browserify = require('browserify');
const buffer = require('vinyl-buffer');
const del = require('del');
const fs = require('fs');
const gulp = require('gulp');
const gulpif = require('gulp-if');
const source = require('vinyl-source-stream');
const stripDebug = require('gulp-strip-debug');
const uglify = require('gulp-uglify');
const vueify = require('vueify');
const envify = require('envify');

process.env.EXT_VER = require('./package.json').version;
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const IS_PROD = process.env.NODE_ENV === 'production';

console.log('process node env', process.env.NODE_ENV);
console.log('IS_PROD', IS_PROD);

gulp.task(
    'cleanup',
    () => del('build/**/*')
);

gulp.task(
    'stripLogs',
    () => gulp.src(['src/**/*.js'])
        .pipe(gulpif(IS_PROD, stripDebug()))
);

gulp.task(
    'prepare',
    ['cleanup', 'stripLogs'],
    () => gulp.src(['src/**/*'])
        .pipe(gulp.dest('build/'))
);

gulp.task(
    'scripts',
    ['prepare'],
    () => browserify('src/index.js')
        .transform('vueify')
        .transform(envify)
        .transform('require-globify')
        .transform('babelify', {presets: ['es2015']})
        .bundle()
        .pipe(source('top_eight.js'))
        .pipe(buffer())
        .pipe(gulp.dest('build'))
);

gulp.task(
    'watch',
    ['default'],
    () => gulp.watch('src/**/*', ['default'])
);

gulp.task(
    'default',
    ['scripts']
);
