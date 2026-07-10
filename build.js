/**
 * HBW static site builder — zero external dependencies (Node stdlib only).
 * Reads partials + page content fragments, assembles full HTML pages into /dist.
 */
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const DIST = path.join(ROOT, "dist");

function read(p) {
  return fs.readFileSync(path.join(ROOT, p), "utf8");
}

function rimrafSafe(dir) {
  // Recreate dist contents without requiring delete permissions on pre-existing files:
  // we just overwrite files in place; directories are created if missing.
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copyDir(src, dest) {
  rimrafSafe(dest);
  for (const entry of fs.readdirSync(path.join(ROOT, src), { withFileTypes: true })) {
    const s = path.join(ROOT, src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(path.join(src, entry.name), d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

const layout = read("partials/layout.html");
const header = read("partials/header.html");
const footerTpl = read("partials/footer.html");

// pages.config.js exports an array of { slug, title, description, navKey, contentFile }
const pages = require("./pages.config.js");

rimrafSafe(DIST);

for (const page of pages) {
  let content = read(path.join("pages", page.contentFile));

  // mark active nav link
  let headerHtml = header.replace(
    new RegExp(`data-nav="${page.navKey}"`),
    `data-nav="${page.navKey}" aria-current="page"`
  );

  let html = layout
    .replace("{{TITLE}}", page.title)
    .replace("{{DESCRIPTION}}", page.description || "")
    .replace("{{HEADER}}", headerHtml)
    .replace("{{CONTENT}}", content)
    .replace("{{FOOTER}}", footerTpl);

  const outPath = path.join(DIST, page.slug === "index" ? "index.html" : `${page.slug}.html`);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html, "utf8");
  console.log("built:", outPath.replace(ROOT + "/", ""));
}

// copy static assets
copyDir("styles", path.join(DIST, "styles"));
copyDir("assets", path.join(DIST, "assets"));

console.log(`\n${pages.length} pages built into /dist`);
