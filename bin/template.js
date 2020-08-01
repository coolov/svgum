// ansi text formating constants
const b = "\x1b[1m"; // bold
const u = "\x1b[4m"; // underline
const _ = "\x1b[0m"; // reset

function findSmallestMargin(txt) {
  const lines = txt.split("\n");
  const margins = [];
  lines.forEach((l) => {
    const m = l.match(/[^\s/]/);
    if (m) {
      return margins.push(m.index);
    }
  });
  return Math.min(...margins);
}

function transform(test) {
  let margin = findSmallestMargin(test);
  console.log(margin);

  // align left
  test = test.replace(/^\s*/gm, " ");

  // format text
  test = test.replace(/\s*_[^_]_/, "X");
}

function blargh() {
  const test = `

    HELLO
    THIS
    IS

        *NEW*
        _BLARGH_
    `;

  console.log(transform(test));
}

blargh();
const arr = str.map((c, i) => {
    console.log(opts.spacing[i]);
    if (opts.spacing) {
      c = c.padEnd(opts.spacing[i], " ");
    }
    return c;
  });
  str = arr.join(" ");
}
console.log(str);
};
