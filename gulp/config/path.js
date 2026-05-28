import * as nodePath from 'path';
const rootFolder = nodePath.basename(nodePath.resolve());

const buildFolder = `./docs`;
const srcFolder = `./src`;

export const path = {
  build: {
    fonts: `${buildFolder}/fonts/`,
    js: `${buildFolder}/js/`,
    jsModules: `${buildFolder}/js/module/`,
    normalize:`${buildFolder}/css/`,
    css: `${buildFolder}/css/`,
    html: `${buildFolder}/`,
    images: `${buildFolder}/img/`,
  },
  src: {
    fonts: `${srcFolder}/fonts/*.*`,
    js: `${srcFolder}/js/*.js`,
    jsModules: `${srcFolder}/js/module/*.js`,
    images: `${srcFolder}/img/**/*.{jpg,jpeg,png,gif,webp}`,
    svg: `${srcFolder}/img/**/*.svg`,
    normalize: `${srcFolder}/scss/normalize.css`,
    scss: `${srcFolder}/scss/*.scss`,
    html: `${srcFolder}/*.html`,
    svgicons: `${srcFolder}/svgicons/*.svg`
  },
  watch: {
    jsModules: `${srcFolder}/js/module/**/*.js`,
    js: `${srcFolder}/js/**/*.js`,
    scss: `${srcFolder}/scss/**/*.scss`,
    html: `${srcFolder}/**/*.html`,
    images: `${srcFolder}/img/**/*.{jpg,jpeg,png,gif,webp,svg,ico}`,
  },
  clean: buildFolder,
  buildFolder: buildFolder,
  srcFolder: srcFolder,
  rootFolder: rootFolder
}