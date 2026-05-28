export const fslightbox = () => {
  return app.gulp.src('./src/js/fslightbox.js')
    .pipe(app.gulp.dest('docs/js'));
}