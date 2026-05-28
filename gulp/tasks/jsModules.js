export const jsModules = () => {
  return app.gulp.src(app.path.src.jsModules)
  .pipe(app.plugins.plumber(
    app.plugins.notify.onError({
      title: "JS",
      message: "Error: <%= error.message %>"
    })
  ))
  .pipe(app.gulp.dest(app.path.build.jsModules))
  .pipe(app.plugins.browsersync.stream())
}