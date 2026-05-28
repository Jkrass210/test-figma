export const vendorJsSwiper = () => {
  const modules = [
    'node_modules/swiper/swiper-bundle.min.js',
    'node_modules/swiper/swiper-bundle.min.js.map',
  ];

  return app.gulp.src(modules)
    .pipe(app.gulp.dest('docs/js/'));
}