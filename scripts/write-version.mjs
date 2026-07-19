// postbuild：把当前构建的 git 短 sha 写进 out/version.json。
// 前端轮询这个文件，与内联的 NEXT_PUBLIC_BUILD_VERSION 比对，不同即提示刷新。
// 与 next.config.mjs 用同一条 git 命令 → 同一次部署里两者取值一致。
import { execSync } from "node:child_process";
import { writeFileSync, existsSync } from "node:fs";

let v = "";
try {
  v = execSync("git rev-parse --short HEAD").toString().trim();
} catch {
  v = "";
}

if (!existsSync("out")) {
  console.warn("[postbuild] out/ 不存在，跳过 version.json（静态导出未产出？）");
  process.exit(0);
}

writeFileSync("out/version.json", JSON.stringify({ v }));
console.log("[postbuild] out/version.json v =", v || "(empty)");
