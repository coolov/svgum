// postcss plugin: replaces all font urls with the data uri version of the font

const postcss = require("postcss");
const https = require("https");

function requestFont(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      if (res.statusCode !== 200) {
        throw new Error(
          `Failed requesting ${url} with status code ${res.statusCode}`
        );
      }
      const data = [];
      res.on("data", (chunk) => data.push(chunk));
      res.on("end", () => {
        const contents = Buffer.concat(data);
        const base64 = contents.toString("base64");
        const contentType = res.headers["content-type"];
        const dataURI = `data:${contentType};base64,${base64}`;
        resolve({ dataURI, size: Buffer.byteLength(contents) });
      });
    });
    req.on("error", reject);
  });
}

module.exports = () =>
  postcss.plugin("inline-fonts", () => async (root, response) => {
    const urls = [];
    const declarations = [];

    response.fonts = response.fonts || {};

    root.walkAtRules("font-face", (rule) => {
      rule.walkDecls("src", (decl) => {
        // we are only looking for http urls here. no need to fetch a data-uri
        const match = decl.value.match(/url\((https?:[^)]+)\)/);
        if (match) {
          const url = match[1];
          urls.push(url);
          declarations.push(decl);
        }
      });
    });

    const dataURIs = await Promise.all(urls.map(requestFont));

    // update each declaration with the new dataURI
    declarations.forEach((decl, i) => {
      const { dataURI, size } = dataURIs[i];
      decl.value = decl.value.replace(urls[i], dataURI);

      // add size info to the response object
      decl.parent.walkDecls("font-family", (decl) => {
        const fontName = decl.value.replace(/\'/g, "");
        response.fonts[fontName] = response.fonts[fontName] || {};
        response.fonts[fontName].embedded = true;
        response.fonts[fontName].size = size;
      });
    });
  });
