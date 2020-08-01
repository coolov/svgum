// Maps font-family definitions to all characters that are using that font
//
// The key is a font name and the value is a string
// of unique alphabetically ordered characters
//
// Example:
// {
//    Roboto: { text: "AbKlz" },
//    "Fira Sans": { text: "EHLO" }
// }
//

function populateFontMap($) {
  const map = {};

  const addToMap = (font, text) => {
    let characters;
    if (!map.hasOwnProperty(font)) {
      characters = new Set();
      map[font] = characters;
    } else {
      characters = map[font];
    }
    for (const char of text.split("")) {
      characters.add(char);
    }
  };

  $("[style]").each((i, elem) => {
    const $elem = $(elem);
    const font = $(elem).css("font-family");
    const text = $elem.text();
    if (font) {
      addToMap(font, text);
    }
  });

  $("[font-family]").each((i, elem) => {
    const $elem = $(elem);
    const text = $(elem).text();
    const font = $elem.attr("font-family");
    if (font) {
      addToMap(font, text);
    }
  });

  for (const k in map) {
    const text = Array.from(map[k]).sort().join("");
    map[k] = { text };
  }

  return map;
}

module.exports = populateFontMap;
