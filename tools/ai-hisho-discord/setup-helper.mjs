// AI秘書Discord常駐キット: 設置作業を自動化する補助スクリプト。
//
// SETUP_FOR_AI.md の各手順は、このファイルの各コマンドを1つ呼ぶだけで、
// 「フォルダ作成」「ファイルへの書き込み」「権限の設定（chmod）」
// 「自動起動の登録（launchctl/タスクスケジューラ）」を安全にまとめて行えるようにしてある。
// 手作業でテンプレートの {{...}} を書き換えたり、コマンドを1つずつ組み立てたりする必要はない。
//
// このスクリプトは対話をしない（確認や質問はしない）。持ち主への確認は、
// SETUP_FOR_AI.md の指示どおり、このスクリプトを呼ぶ前にAI（このファイルを読んでいるあなた）が行うこと。
//
// 重要: トークンなどの秘密情報は、このスクリプト自身のログにも一切出力しない
// （保存できたかどうかと、文字数だけを報告する）。
//
// 依存パッケージ（discord.js等）を一切使わないため、`npm install` の前でも動く。

import { existsSync, mkdirSync, writeFileSync, readFileSync, chmodSync } from "node:fs";
import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_DIR = path.join(os.homedir(), ".config", "ai-hisho");
const TOKEN_PATH = path.join(CONFIG_DIR, "bot-token");
const CONFIG_PATH = path.join(CONFIG_DIR, "config.json");
const LAUNCHD_LABEL = "com.ai-hisho.bridge";
const TASK_NAME = "AI秘書常駐";

function ensureConfigDir() {
  mkdirSync(CONFIG_DIR, { recursive: true });
}

function chmodIfPossible(filePath, mode) {
  if (process.platform === "win32") return; // Windowsは既定のユーザー権限のままで概ね問題ない
  try {
    chmodSync(filePath, mode);
  } catch (err) {
    console.error(`[warn] 権限の設定に失敗しました（${filePath}）: ${err.message}`);
  }
}

function readStdinSync() {
  try {
    return readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function fillTemplate(templateText, vars) {
  let out = templateText;
  for (const [key, value] of Object.entries(vars)) {
    out = out.split(`{{${key}}}`).join(value);
  }
  return out;
}

// -------------------- check --------------------
function cmdCheck() {
  console.log(`OS: ${process.platform}`);
  const claude = spawnSync(process.platform === "win32" ? "where" : "which", ["claude"], {
    encoding: "utf8",
  });
  console.log(
    `claude CLIの場所: ${
      claude.status === 0 ? claude.stdout.trim() : "見つかりません（PATHが通っていない可能性があります）"
    }`
  );
  const kitOk = existsSync(path.join(__dirname, "bridge.mjs"));
  console.log(`キットのフォルダ内でbridge.mjsを検出: ${kitOk ? "OK" : "見つかりません"}`);
  const configExists = existsSync(CONFIG_PATH);
  const tokenExists = existsSync(TOKEN_PATH);
  console.log(`設定ファイル(${CONFIG_PATH}): ${configExists ? "あり" : "まだ無い"}`);
  console.log(`トークンファイル(${TOKEN_PATH}): ${tokenExists ? "あり" : "まだ無い"}`);
}

// -------------------- install --------------------
function cmdInstall() {
  console.log("npm install を実行します…");
  const result = spawnSync("npm", ["install"], {
    cwd: __dirname,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  process.exit(result.status ?? 1);
}

// -------------------- write-token --------------------
function readClipboard() {
  if (process.platform === "darwin") {
    const r = spawnSync("pbpaste", [], { encoding: "utf8" });
    return r.status === 0 ? r.stdout : null;
  }
  if (process.platform === "win32") {
    const r = spawnSync("powershell", ["-NoProfile", "-Command", "Get-Clipboard"], {
      encoding: "utf8",
    });
    return r.status === 0 ? r.stdout : null;
  }
  return null;
}

function cmdWriteToken(args) {
  let raw;
  if (args[0] === "--from-clipboard") {
    raw = readClipboard();
    if (raw === null) {
      console.error("クリップボードの読み取りに失敗しました。--from-clipboard を使わず、一時ファイル経由で保存してください。");
      process.exit(1);
    }
  } else if (args[0]) {
    // 一時ファイル経由（Method B: チャットに貼ってもらった値を、AIが一時ファイルへ書いてから渡す）
    try {
      raw = readFileSync(args[0], "utf8");
    } catch (err) {
      console.error(`指定ファイルを読めませんでした: ${err.message}`);
      process.exit(1);
    }
  } else {
    raw = readStdinSync();
  }

  const token = (raw || "").trim();
  if (!token) {
    console.error("トークンの値が空でした。コピーできているか確認してください。");
    process.exit(1);
  }
  ensureConfigDir();
  writeFileSync(TOKEN_PATH, token, { mode: 0o600 });
  chmodIfPossible(TOKEN_PATH, 0o600);
  // 値そのものは絶対に出力しない。長さと保存先だけ報告する。
  console.log(`トークンを保存しました: ${TOKEN_PATH}（${token.length}文字）`);
}

// -------------------- write-config --------------------
function cmdWriteConfig(args) {
  const filePath = args[0];
  if (!filePath) {
    console.error("使い方: node setup-helper.mjs write-config <ドラフトJSONファイルのパス>");
    process.exit(1);
  }
  let draft;
  try {
    draft = JSON.parse(readFileSync(filePath, "utf8"));
  } catch (err) {
    console.error(`指定ファイルをJSONとして読めませんでした: ${err.message}`);
    process.exit(1);
  }

  const config = {
    guildId: draft.guildId,
    channelIds: draft.channelIds,
    allowedUsers: draft.allowedUsers,
    secretaryName: draft.secretaryName,
    workdir: draft.workdir,
    timeoutMs: draft.timeoutMs || 300000,
    sessionId: draft.sessionId || crypto.randomUUID(),
  };
  if (draft.claudeBin) config.claudeBin = draft.claudeBin;
  if (draft.tokenFile) config.tokenFile = draft.tokenFile;

  const requiredKeys = ["guildId", "channelIds", "allowedUsers", "secretaryName", "workdir"];
  const missing = requiredKeys.filter((k) => !config[k]);
  if (missing.length > 0) {
    console.error(`設定に不足があります: ${missing.join(", ")}`);
    process.exit(1);
  }
  if (!Array.isArray(config.channelIds) || config.channelIds.length === 0) {
    console.error("channelIds は1件以上の配列にしてください。");
    process.exit(1);
  }
  if (!Array.isArray(config.allowedUsers) || config.allowedUsers.length === 0) {
    console.error("allowedUsers は1件以上の配列にしてください。");
    process.exit(1);
  }

  ensureConfigDir();
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + "\n", { mode: 0o600 });
  chmodIfPossible(CONFIG_PATH, 0o600);
  console.log(`設定ファイルを保存しました: ${CONFIG_PATH}`);
  console.log(
    `secretaryName: ${config.secretaryName} / workdir: ${config.workdir} / sessionId: ${config.sessionId}`
  );
}

// -------------------- autostart / stop (mac) --------------------
function macPlistPath() {
  return path.join(os.homedir(), "Library", "LaunchAgents", `${LAUNCHD_LABEL}.plist`);
}

function cmdAutostartMac() {
  const templatePath = path.join(__dirname, "templates", "ai-hisho-launchd.plist.template");
  const template = readFileSync(templatePath, "utf8");
  const filled = fillTemplate(template, {
    NODE_PATH: process.execPath,
    BRIDGE_PATH: path.join(__dirname, "bridge.mjs"),
    BRIDGE_DIR: __dirname,
    HOME: os.homedir(),
  });
  const plistPath = macPlistPath();
  mkdirSync(path.dirname(plistPath), { recursive: true });
  writeFileSync(plistPath, filled);
  console.log(`launchd設定を書き出しました: ${plistPath}`);

  // 既に読み込まれていれば一度外してから読み込み直す（再実行しても安全なように）
  spawnSync("launchctl", ["unload", plistPath], { stdio: "ignore" });
  const load = spawnSync("launchctl", ["load", plistPath], { encoding: "utf8" });
  if (load.status !== 0) {
    console.error(`launchctl load に失敗しました: ${load.stderr || load.stdout}`);
    process.exit(1);
  }
  const list = spawnSync("launchctl", ["list"], { encoding: "utf8" });
  const registered = (list.stdout || "").includes("ai-hisho");
  console.log(
    `自動起動の登録: ${registered ? "確認できました" : "確認できませんでした（launchctl list | grep ai-hisho で再確認してください）"}`
  );
}

function cmdStopMac() {
  const plistPath = macPlistPath();
  const result = spawnSync("launchctl", ["unload", plistPath], { encoding: "utf8" });
  console.log(
    result.status === 0
      ? "自動起動を止めました。"
      : `launchctl unload の結果: ${result.stderr || result.stdout || "(登録されていなかった可能性があります)"}`
  );
}

// -------------------- autostart / stop (windows) --------------------
function cmdAutostartWin() {
  const templatePath = path.join(__dirname, "templates", "run-hidden.vbs.template");
  const template = readFileSync(templatePath, "utf8");
  const filled = fillTemplate(template, { BRIDGE_DIR: __dirname });
  const vbsPath = path.join(__dirname, "run-hidden.vbs");
  writeFileSync(vbsPath, filled);
  console.log(`起動補助ファイルを書き出しました: ${vbsPath}`);

  const result = spawnSync(
    "schtasks",
    [
      "/create",
      "/tn",
      TASK_NAME,
      "/tr",
      `wscript.exe "${vbsPath}"`,
      "/sc",
      "onlogon",
      "/rl",
      "highest",
      "/f",
    ],
    { encoding: "utf8" }
  );
  if (result.status !== 0) {
    console.error(
      `schtasksでの自動登録に失敗しました（管理者権限が必要な場合があります）: ${result.stderr || result.stdout}`
    );
    console.error("その場合はSETUP_FOR_AI.md 手順6.6のWindows・GUI手順で登録してください。");
    process.exit(1);
  }
  console.log(`タスクスケジューラへの登録が完了しました（${TASK_NAME}）。`);
}

function cmdStopWin() {
  const result = spawnSync("schtasks", ["/delete", "/tn", TASK_NAME, "/f"], { encoding: "utf8" });
  console.log(
    result.status === 0
      ? "自動起動を止めました。"
      : `schtasks /delete の結果: ${result.stderr || result.stdout || "(登録されていなかった可能性があります)"}`
  );
}

// -------------------- main --------------------
function main() {
  const [, , command, ...args] = process.argv;
  switch (command) {
    case "check":
      return cmdCheck();
    case "install":
      return cmdInstall();
    case "write-token":
      return cmdWriteToken(args);
    case "write-config":
      return cmdWriteConfig(args);
    case "autostart": {
      const target = args[0];
      if (target === "mac") return cmdAutostartMac();
      if (target === "win") return cmdAutostartWin();
      console.error("使い方: node setup-helper.mjs autostart mac|win");
      process.exit(1);
      return;
    }
    case "stop": {
      const target = args[0];
      if (target === "mac") return cmdStopMac();
      if (target === "win") return cmdStopWin();
      console.error("使い方: node setup-helper.mjs stop mac|win");
      process.exit(1);
      return;
    }
    default:
      console.error(
        "使い方: node setup-helper.mjs <check|install|write-token|write-config|autostart|stop>\n" +
          "詳しくは SETUP_FOR_AI.md を参照してください。"
      );
      process.exit(1);
  }
}

main();
