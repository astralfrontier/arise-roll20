const { src, dest, series, parallel } = require('gulp')
import * as packageJson from './package.json'
import fs from 'fs-extra'
import path from 'path'
import pug from 'pug'
import sass from 'sass'
import postcss from 'gulp-postcss'
import purgecss from '@fullhuman/postcss-purgecss'
import imageInliner from 'postcss-image-inliner'

type GulpCallback = (err?: any | undefined) => void

const INPUT_DIR = path.join(__dirname, 'src')
const OUTPUT_DIR = path.join(__dirname, 'dist')

// Source files must exist for the pipeline to function

const VARIABLES_JSON = 'variables.json' // Local variables for SASS etc.
const SHEET_MD = 'sheet.md' // Instructions for sheet use
const SHEET_PUG = 'sheet.pug' // The main HTML for the sheet
const SHEET_SASS = 'sheet.sass' // SASS/SCSS for the sheet layout

// Files in the output directory
const SHEET_JSON = 'sheet.json' // Metadata for the sheet, used by Roll20
const SHEET_HTML = `${packageJson.name}.html` // The Sheet HTML
const SHEET_CSS = `${packageJson.name}.css` // The Sheet CSS
const SHEET_PREVIEW = 'preview.png' // A preview image

function ensureOutputDir(cb: GulpCallback) {
  fs.ensureDir(OUTPUT_DIR, cb)
}

function createSheetJson(cb: GulpCallback) {
  const sheetJson = {
    html: SHEET_HTML,
    css: SHEET_CSS,
    authors: packageJson.author,
    roll20userid: packageJson.description,
    preview: SHEET_PREVIEW,
    instructions: fs.readFileSync(path.join(INPUT_DIR, SHEET_MD)).toString(),
    legacy: false,
  }

  fs.writeJSON(path.join(OUTPUT_DIR, SHEET_JSON), sheetJson, cb)
}

function createSheetHtml(cb: GulpCallback) {
  const locals: any = fs.readJSONSync(path.join(INPUT_DIR, VARIABLES_JSON))
  const html = pug.compileFile(path.join(INPUT_DIR, SHEET_PUG), {
    basedir: INPUT_DIR,
  })({ ...locals, package: packageJson })
  fs.writeFile(path.join(OUTPUT_DIR, SHEET_HTML), html, cb)
}

function createSheetCss(cb: GulpCallback) {
  const css = sass.compile(path.join(INPUT_DIR, SHEET_SASS), {
    style: 'compressed',
  }).css
  fs.writeFile(path.join(OUTPUT_DIR, SHEET_CSS), css, cb)
}

function createSheetPreview(cb: GulpCallback) {
  return src(path.join(INPUT_DIR, SHEET_PREVIEW)).pipe(dest(OUTPUT_DIR))
}

function css(cb: GulpCallback) {
  const plugins: any[] = [
    imageInliner({
      assetPaths: ['./assets'],
      maxFileSize: 10240,
    }),
    purgecss({
      content: [path.join(OUTPUT_DIR, SHEET_HTML)],
    }),
  ]
  return src(path.join(OUTPUT_DIR, SHEET_CSS))
    .pipe(postcss(plugins))
    .pipe(dest(OUTPUT_DIR))
}

// TODO postcss https://www.npmjs.com/package/postcss-image-inliner

exports.createSheet = parallel(
  createSheetJson,
  createSheetHtml,
  createSheetCss,
  createSheetPreview
)
exports.default = series(ensureOutputDir, exports.createSheet, css)
