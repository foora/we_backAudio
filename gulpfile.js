const gulp = require('gulp');
const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json');
const rollup = require('rollup');
const del = require('del');

gulp.task('compile', () => {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest("compile"));
});

gulp.task('bundle', async () => {
    const bundle = await rollup.rollup({
        input: './compile/index.js'
    });
    await bundle.write({
        file: './dist/audio.js',
        format: 'cjs'
    })
})

gulp.task('clean', () => del(['compile']))

exports.default = gulp.series('compile', 'bundle', 'clean')