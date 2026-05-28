import rename from 'gulp-rename';
import cleanCss from 'gulp-clean-css';

export const normalize = () => {
  return app.gulp.src(app.path.src.normalize, {sourcemaps: app.isDev})
    .pipe(app.plugins.plumber(
      app.plugins.notify.onError({
        title: "NORMALIZE",
        message: "Error: <%= error.message %>"
      })
    ))
    .pipe(cleanCss())
    .pipe(rename({
      extname: ".min.css"
    }))
    .pipe(app.gulp.dest(app.path.build.normalize))
    .pipe(app.plugins.browsersync.stream())
}