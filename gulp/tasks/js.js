import minify from "gulp-minify";
import rename from 'gulp-rename';

export const js = () => {
  return app.gulp.src(app.path.src.js, { sourcemaps: app.isDev })
  .pipe(app.plugins.plumber(
    app.plugins.notify.onError({
      title: "JS",
      message: "Error: <%= error.message %>"
    })
  ))
  .pipe(minify())
  .pipe(rename({
    extname: ".js"
}))
  .pipe(app.gulp.dest(app.path.build.js))
  .pipe(app.plugins.browsersync.stream())
}