export const vendorCssSwiper =() => {
  const modules = [
    'node_modules/swiper/swiper-bundle.min.css',
  ];

  return app.gulp.src(modules)
    .pipe(app.gulp.dest('docs/css'));
};