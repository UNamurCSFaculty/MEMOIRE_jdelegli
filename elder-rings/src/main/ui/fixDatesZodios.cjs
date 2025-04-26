const fs = require("fs");

let fileContent = fs.readFileSync("./src/openapi/openapizod.ts", "utf-8");

fileContent = fileContent.replace(
  /const OffsetDateTime = z.string\(\)/g,
  "const OffsetDateTime = z.string().datetime({ offset : true})"
);

fileContent = fileContent.replace(
  /\.datetime\(\)/g,
  ".datetime({ offset : true})"
);

fs.writeFileSync("./src/openapi/openapizod.ts", fileContent, "utf-8");