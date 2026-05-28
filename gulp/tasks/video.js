export const video = () => {
  return app.gulp.src('./src/video/**/*.*', { encoding: false })
    .pipe(app.gulp.dest('docs/video'));
}