const fs = require("fs");
const path = require("path");

const uiDir = path.resolve(__dirname, "../src/components/ui");
const indexFile = path.join(uiDir, "index.ts");

const files = fs
  .readdirSync(uiDir)
  .filter(
    (file) =>
      file !== "index.ts" &&
      (file.endsWith(".ts") || file.endsWith(".tsx")) &&
      fs.statSync(path.join(uiDir, file)).isFile()
  );

const exportLines = files
  .map((f) => `export * from './${f.replace(/\.tsx?$/, "")}';`)
  .sort();

fs.writeFileSync(indexFile, exportLines.join("\n") + "\n", "utf8");

console.log(`✅ ${indexFile} mis à jour avec ${exportLines.length} exports.`);
