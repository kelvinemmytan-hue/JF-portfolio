// Runs after "next build" (see package.json).
// For pages under a dynamic route (projects/[slug]) the static export writes the prefetch data as nested
// folders (out/projects/x/__next.projects/$d$slug/__PAGE__.txt), but the browser requests the flat name
// (out/projects/x/__next.projects.$d$slug.__PAGE__.txt). On a plain static host that is a 404 for every
// prefetch. This moves each file to the name that is actually requested.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const out = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "out");
if (!fs.existsSync(out)) {
  console.error("postbuild: out/ not found — run next build first.");
  process.exit(1);
}

let moved = 0;
const filesIn = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? filesIn(path.join(dir, e.name)) : [path.join(dir, e.name)]));

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const full = path.join(dir, entry.name);
    if (entry.name === "_next") continue; // compiled assets, nothing to do
    if (entry.name.startsWith("__next.")) {
      for (const file of filesIn(full)) {
        const flat = `${entry.name}.${path.relative(full, file).split(path.sep).join(".")}`;
        fs.renameSync(file, path.join(dir, flat));
        moved++;
      }
      fs.rmSync(full, { recursive: true, force: true });
    } else {
      walk(full);
    }
  }
}

walk(out);
console.log(`postbuild: ${moved} prefetch file${moved === 1 ? "" : "s"} moved to their requested names.`);
