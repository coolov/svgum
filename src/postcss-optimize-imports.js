// postcss plugin: adds the text parameter to google font imports
// https://fonts.googleblog.com/2011/04/streamline-your-web-font-requests.html

const postcss = require("postcss");
const { URL } = require("url");

function parseUrlFunction(urlFn) {
  const urlValue = Array.from(urlFn.match(/url\(([^)]+)\)/))[1] || "";
  const urlObj = new URL(urlValue);
  return urlObj;
}

module.exports = ({ fontMap, disable = false }) =>
  postcss.plugin("optimize-imports", () => (root, response) => {
    response.fonts = fontMap;
    if (disable) {
      return;
    }
    root.walkAtRules("import", (rule) => {
      const urlObj = parseUrlFunction(rule.params);
      if (urlObj.hostname === "fonts.googleapis.com") {
        const fontFamily = urlObj.searchParams.get("family");
        const chars = fontMap[fontFamily];

        if (chars) {
          urlObj.searchParams.set("text", chars.text);
          rule.params = `url(${urlObj.href})`;
        } else {
          console.log("yo");
          // Font is not in map. Delete it?
        }
      }
    });
  });
