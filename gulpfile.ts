const { src, dest, series, parallel } = require('gulp')
import * as packageJson from './package.json'
import fs from 'fs-extra'
import path from 'path'
import pug from 'pug'
import sass from 'sass'
import postcss from 'gulp-postcss'
import purgecss from '@fullhuman/postcss-purgecss'

type GulpCallback = (err?: any | undefined) => void

const INPUT_DIR = path.join(__dirname, 'src')
const OUTPUT_DIR = path.join(__dirname, 'dist')
const SHEET_HTML = `${packageJson.name}.html`
const SHEET_CSS = `${packageJson.name}.css`
const SHEET_PREVIEW = 'preview.png'

function defaultTask(cb: GulpCallback) {
  // place code for your default task here
  cb()
}

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
    instructions: fs.readFileSync(path.join(INPUT_DIR, 'sheet.md')).toString(),
    legacy: false,
  }

  fs.writeJSON(path.join(OUTPUT_DIR, 'sheet.json'), sheetJson, cb)
}

function createSheetHtml(cb: GulpCallback) {
  const locals: any = fs.readJSONSync(path.join(INPUT_DIR, 'variables.json'))
  const html = pug.compileFile(path.join(INPUT_DIR, 'sheet.pug'), {
    basedir: INPUT_DIR,
  })({ ...locals, package: packageJson })
  fs.writeFile(path.join(OUTPUT_DIR, SHEET_HTML), html, cb)
}

function createSheetCss(cb: GulpCallback) {
  const css = sass.compile(path.join(INPUT_DIR, 'sheet.sass'), {
    style: 'compressed',
  }).css
  fs.writeFile(path.join(OUTPUT_DIR, SHEET_CSS), css, cb)
}

function createSheetPreview(cb: GulpCallback) {
  return src(path.join(INPUT_DIR, SHEET_PREVIEW)).pipe(dest(OUTPUT_DIR))
}

function css(cb: GulpCallback) {
  const plugins: any[] = [
    purgecss({
      content: [path.join(OUTPUT_DIR, SHEET_HTML)],
    }),
  ]
  return src(path.join(OUTPUT_DIR, SHEET_CSS))
    .pipe(postcss(plugins))
    .pipe(dest(OUTPUT_DIR))
}

// TODO postcss

exports.createSheet = parallel(
  createSheetJson,
  createSheetHtml,
  createSheetCss,
  createSheetPreview
)
exports.default = series(ensureOutputDir, exports.createSheet, css)
