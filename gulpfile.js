import gulp from 'gulp';
import {path} from './gulp/config/path.js';
import {plugins} from './gulp/config/plugins.js';

global.app = {
  isBuild: process.argv.includes('--build'),
  isDev: !process.argv.includes('--build'),
  path: path,
  gulp: gulp,
  plugins: plugins
}

import { reset } from './gulp/tasks/reset.js';
import { html } from './gulp/tasks/html.js';
import { server } from './gulp/tasks/server.js';
import { scss } from './gulp/tasks/scss.js';
import { scssEntries } from './gulp/tasks/scssEntries.js';
import {jsModules} from './gulp/tasks/jsModules.js'
import { js } from './gulp/tasks/js.js';
import { images } from './gulp/tasks/images.js';
import { svgSprive } from './gulp/tasks/svgSprive.js';
import { zip } from './gulp/tasks/zip.js';
import { normalize } from './gulp/tasks/normalize.js';
import { fonts } from './gulp/tasks/fonts.js';
import { vendorJsSwiper } from './gulp/tasks/vendorJsSwiper.js';
import { vendorCssSwiper } from './gulp/tasks/vendorCssSwiper.js';
import { fslightbox } from './gulp/tasks/fslightbox.js';
import { video } from './gulp/tasks/video.js';

const styles = gulp.series(scssEntries, scss);

const scssEntriesDirs = [
  `${path.srcFolder}/scss/components/**/*.scss`,
  `${path.srcFolder}/scss/boxs/**/*.scss`,
];

function watcher() {
  gulp.watch(path.watch.html, html)
  gulp.watch(path.watch.scss, scss)
  gulp.watch(scssEntriesDirs, { events: ['add', 'unlink'] }, styles)
  gulp.watch(path.watch.jsModules, jsModules)
  gulp.watch(path.watch.js, js)
  gulp.watch(path.watch.images, images)
}

export { svgSprive }

const mainTasks = gulp.parallel(html, normalize, styles, jsModules, js, images, fonts, vendorJsSwiper, vendorCssSwiper, fslightbox, video)

const dev = gulp.series(reset, mainTasks, gulp.parallel(watcher, server));
const build = gulp.series(reset, mainTasks, gulp.parallel(watcher, server));
const deployZIP = gulp.series(reset, mainTasks, zip);

export { dev }
export { build }
export { deployZIP }

gulp.task('default', dev);