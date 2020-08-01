const cheerio = require("cheerio");
const postcss = require("postcss");
const importUrl = require("postcss-import-url");
const optimizeImports = require("./postcss-optimize-imports");
const inlineFonts = require("./postcss-inline-fonts");
const populateFontMap = require("./populate-font-map");

const objToArray = (obj) =>
  Object.keys(obj).map((name) => ({ name, ...obj[name] }));

module.exports = async function transform(svg, options = {}) {
  const $ = cheerio.load(svg, {
    normalizeWhitespace: true,
    xmlMode: true,
  });

  // very rudimentary validation
  // todo: improve this
  if (!$("svg").length) {
    throw new Error("The provided file is not a valid SVG");
  }

  // collect a map of fonts and which
  // letters each font is used for
  const fontMap = populateFontMap($);

  // configure the css processor:
  // 1. rewrite urls to google fonts to include a character list
  //    https://fonts.googleblog.com/2011/04/streamline-your-web-font-requests.html
  // 2. inline css imports
  // 3. inline webfonts as data uris
  const cssProcessor = postcss([
    optimizeImports({ fontMap, disable: options.deoptimize }),
    importUrl({ modernBrowser: true }),
    inlineFonts(),
  ]);

  // meta data about the processed fonts
  const fonts = {};

  // process the CSS for each style tag
  for (const elem of $("style").toArray()) {
    const $elem = $(elem);
    const css = $(elem).html();
    const result = await cssProcessor.process(css, { from: undefined });
    $elem.html(result.css);
    Object.assign(fonts, result.fonts);
  }

  const result = $.xml();
  const stats = {
    fonts: objToArray(fonts),
    sizeDiff:
      Buffer.byteLength(result, "utf-8") - Buffer.byteLength(svg, "utf-8"),
  };

  return { svg: result, stats };
};
