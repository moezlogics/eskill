// npm run db  -> starts a local MongoDB server with data stored in ./.mongo-data
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readdirSync } from "node:fs";

const base = "C:/Program Files/MongoDB/Server";
let bin = "mongod";
if (existsSync(base)) {
  const versions = readdirSync(base).sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
  for (const v of versions) {
    const p = `${base}/${v}/bin/mongod.exe`;
    if (existsSync(p)) { bin = p; break; }
  }
}

mkdirSync(".mongo-data", { recursive: true });
console.log(`Starting MongoDB: ${bin}`);
const child = spawn(bin, ["--dbpath", ".mongo-data", "--bind_ip", "127.0.0.1", "--port", "27017"], { stdio: "inherit" });
child.on("exit", (code) => process.exit(code ?? 0));
