/* eslint-disable @typescript-eslint/no-require-imports */

const { spawn } = require("node:child_process");

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      shell: process.platform === "win32",
      stdio: "inherit",
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} ${args.join(" ")} exited with ${code}`));
      }
    });
  });
}

async function main() {
  await run("node", ["scripts/data/fetch-wfs.js"]);
  await run("node", ["scripts/data/convert-to-geojson.js"]);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
