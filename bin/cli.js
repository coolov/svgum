#!/usr/bin/env node
// console.log("");
// const https = require("https");
// const get = https.get;
// https.get = function (url, options, callback) {
//   const urlStr = typeof url === "string" ? url : url.href;
//   log(`⬇ ${urlStr}`);
//   return get(url, options, callback);
// };

const fs = require("fs");
const { program } = require("commander");
const transform = require("../src/transform");

// ansi text formating constants
const ANSI_BOLD = "\x1b[1m";
const ANSI_UNDERLINE = "\x1b[4m";
const ANSI_RESET = "\x1b[0m";

// text formating
const u = (str) => ANSI_UNDERLINE + str + ANSI_RESET;
const b = (str) => ANSI_BOLD + str + ANSI_RESET;

const log = (...strings) => console.log(" " + strings.join(""));

function printStats(stats) {
  const kB = (b) => Math.round(b / 1024).toString(); // byte integer => kB string
  const space = (n) => new Array(n).join(" "); // blank space

  const fonts = stats.fonts.filter((font) => font.embedded);

  {
    // msg
    const msg = !fonts.length
      ? "Emedded no fonts"
      : fonts.length === 1
      ? "Embedded 1 font"
      : `Embedded ${fonts.length} fonts`;

    log();
    log(`${b("Result:")} ${msg} (+${kB(stats.sizeDiff)}kB)`);
    log();
  }

  {
    // font table
    if (fonts.length) {
      log(u("Name"), space(13), u("kB"), space(5), u("chars"));
      for (const { name, size, text } of fonts) {
        log(name.padEnd(16), kB(size).padEnd(6), text);
      }
      log();
    }
  }
}

async function run(source, target, { debug, deoptimize }) {
  try {
    const sourceDoc = fs.readFileSync(source).toString();
    const { svg, stats } = await transform(sourceDoc, { deoptimize });
    printStats(stats);
    fs.writeFileSync(target, svg);
  } catch (err) {
    console.error(`\n ${b("Error")}: ${err.message}\n`);
    if (debug) {
      console.error(` ${err.stack} \n`);
    }
    process.exit(1);
  }
}

program
  .version("0.0.1")
  .arguments("<source> <target>")
  .option("--debug", "include stacktrace in errors")
  .option("--deoptimize", "embed fonts without optimizations")
  .action(run)
  .parse(process.argv);
