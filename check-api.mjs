// seminar-3 шалгах harness: server-ээс ажиллуулж, бүх endpoint-ийн status code шалгана
// ажиллуулах: node check-api.mjs
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(fileURLToPath(import.meta.url));
const PORT = 3000;
const BASE = `http://127.0.0.1:${PORT}`;

const server = spawn(process.execPath, [join(root, "src", "app.js")], {
  stdio: ["ignore", "pipe", "pipe"],
});
const logLines = [];
server.stdout.on("data", (d) => logLines.push(String(d).trimEnd()));
server.stderr.on("data", (d) => logLines.push("ERR " + String(d).trimEnd()));

async function waitReady() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`${BASE}/books`);
      if (r.status) return true;
    } catch {
      await new Promise((r) => setTimeout(r, 200));
    }
  }
  return false;
}

let failed = 0;
async function hit(label, method, url, body, expectStatus, expect) {
  const init = { method, headers: { "Content-Type": "application/json" } };
  if (body !== undefined) init.body = body;
  let status = "ERR";
  let text = "";
  try {
    const res = await fetch(`${BASE}${url}`, init);
    status = res.status;
    text = await res.text();
  } catch (e) {
    text = e.message;
  }
  let ok = status === expectStatus;
  if (ok && expect) {
    if (expect.notIn && text.includes(expect.notIn)) ok = false;
    if (expect.includes && !text.includes(expect.includes)) ok = false;
  }
  if (!ok) failed++;
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${label.padEnd(34)} ${method.padEnd(6)} ${url.padEnd(12)} -> ${status} ${text.slice(0, 120)}`
  );
  return { status, text };
}

if (!(await waitReady())) {
  console.log("SERVER DID NOT START\n" + logLines.join("\n"));
  server.kill();
  process.exit(1);
}

console.log("--- BOOKS (slide 7) ---");
await hit("list", "GET", "/books", undefined, 200, { includes: '"count":3' });
await hit("getOne ok", "GET", "/books/1", undefined, 200, { includes: "Clean Code" });
await hit("getOne 404", "GET", "/books/99", undefined, 404, { includes: "Book not found" });
await hit("create 201", "POST", "/books", '{"title":"Docker","price":1000}', 201, { includes: '"id":4' });
await hit("create 400 (no title)", "POST", "/books", '{"price":100}', 400, { includes: "title is required" });
await hit("update 200", "PATCH", "/books/4", '{"price":99000}', 200, { includes: "99000" });
await hit("delete 204", "DELETE", "/books/4", undefined, 204);
await hit("delete 404 (again)", "DELETE", "/books/4", undefined, 404);

console.log("--- USERS (homework, slide 14) ---");
await hit("list (no password)", "GET", "/users", undefined, 200, { notIn: "password" });
await hit("getOne (no password)", "GET", "/users/1", undefined, 200, { notIn: "password" });
await hit("create 400 (no email)", "POST", "/users", '{"name":"NoMail"}', 400, { includes: "email is required" });
await hit("create 201 (email)", "POST", "/users", '{"name":"Otgon","email":"otgo@example.com","password":"p1"}', 201, { notIn: "password" });
await hit("create 409 (dup email)", "POST", "/users", '{"email":"otgo@example.com"}', 409, { includes: "already exists" });
await hit("create 409 (seed email)", "POST", "/users", '{"email":"bat@example.com"}', 409);
await hit("getOne 404", "GET", "/users/99", undefined, 404, { includes: "User not found" });
await hit("update 200", "PATCH", "/users/1", '{"name":"Batbold"}', 200, { notIn: "password" });
await hit("update 409 (email taken)", "PATCH", "/users/1", '{"email":"sara@example.com"}', 409);
await hit("update 404", "PATCH", "/users/99", '{"name":"X"}', 404);
await hit("delete 204", "DELETE", "/users/3", undefined, 204);
await hit("delete 404 (again)", "DELETE", "/users/3", undefined, 404);

console.log("--- MIDDLEWARES (slides 8, 12, 13) ---");
await hit("notFound", "GET", "/nothing", undefined, 404, { includes: "Route not found" });
await hit("notFound /users/1/extra", "GET", "/users/1/extra", undefined, 404);

server.kill();
await new Promise((r) => setTimeout(r, 300));

const logged = logLines.filter((l) => /^(GET|POST|PATCH|DELETE|ERR)/.test(l));
console.log("--- logger terminal output (slide 8) ---");
console.log(logged.slice(0, 6).join("\n"));
console.log(`logger lines: ${logged.length}`);
console.log(failed === 0 ? "\nALL CHECKS PASSED" : `\n${failed} CHECK(S) FAILED`);
process.exit(failed === 0 ? 0 : 1);
