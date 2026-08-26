// AI秘書Discord常駐キット: DiscordとClaude Codeをつなぐブリッジ本体
//
// 持ち主がDiscordの決められたチャンネルへメッセージを送ると、
// このプログラムがそれを受け取り、claude CLIへ渡し、返事をDiscordへ返す。
//
// 重要: トークン（Botの合鍵）は絶対にログへ出さない。設定はconfig.jsonから、
// トークンはbot-tokenファイルから別々に読む。どちらも ~/.config/ai-hisho/ に置く。
//
// このファイルは自分の手で書き換えなくても動くように作ってある。
// 設定はすべて ~/.config/ai-hisho/config.json（人が読み書きする場所）に置く。

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { spawn } from "node:child_process";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import {
  Client,
  GatewayIntentBits,
  Partials,
} from "discord.js";

const CONFIG_DIR = path.join(os.homedir(), ".config", "ai-hisho");
const TOKEN_PATH = path.join(CONFIG_DIR, "bot-token");
const CONFIG_PATH = path.join(CONFIG_DIR, "config.json");
const CLAUDE_PROJECTS_DIR = path.join(os.homedir(), ".claude", "projects");

// 安全設計の本文。ここは工事のたびに変えない（AIが自分で暴走しないための土台）。
function buildPrefixText(secretaryName) {
  return `【Discord経由の依頼です】
あなたの名前は「${secretaryName}」です。持ち主の秘書として、${secretaryName}として返事をしてください。
これはスマホから届いた依頼です。持ち主はいまPCの前にいません。次を守ってください。
1. 破壊的な操作（ファイルやデータの削除・上書き、SNSへの投稿や公開、外部への送信、デプロイ、支払い）は実行しないこと。必要な場合は実行せず「PCの前で承認をください」と返すこと。
2. 返事はスマホで読める長さにすること。結論から書き、1800文字以内に収めること。
3. 調べ物・下書き作成・状況確認・集計は自由にやってよい。
以下が持ち主からの依頼です。
---
`;
}

function log(...args) {
  const ts = new Date().toISOString();
  console.log(`[${ts}]`, ...args);
}

function logError(...args) {
  const ts = new Date().toISOString();
  console.error(`[${ts}]`, ...args);
}

function loadToken(tokenFile) {
  // configの tokenFile でファイル名を上書きできる（CONFIG_DIR配下のみ・複数botを1台で動かす場合用）。
  // 未指定なら bot-token を読む。
  const tokenPath = tokenFile
    ? path.join(CONFIG_DIR, path.basename(tokenFile))
    : TOKEN_PATH;
  let raw;
  try {
    raw = readFileSync(tokenPath, "utf8");
  } catch (err) {
    console.error(
      `Botトークンが見つかりません。${tokenPath} を確認してください。（${err.code || err.message}）`
    );
    process.exit(1);
  }
  const token = raw.trim();
  if (!token) {
    console.error(`Botトークンが空です。${tokenPath} を確認してください。`);
    process.exit(1);
  }
  return token;
}

function loadConfig() {
  let raw;
  try {
    raw = readFileSync(CONFIG_PATH, "utf8");
  } catch (err) {
    console.error(
      `設定ファイルが見つかりません。${CONFIG_PATH} を確認してください。（${err.code || err.message}）`
    );
    process.exit(1);
  }
  let config;
  try {
    config = JSON.parse(raw);
  } catch (err) {
    console.error(`設定ファイルの中身がJSONとして読めません。${CONFIG_PATH} を確認してください。（${err.message}）`);
    process.exit(1);
  }

  // 必須項目（すべて config.json に必要）
  const requiredKeys = ["guildId", "channelIds", "allowedUsers", "workdir", "timeoutMs", "sessionId", "secretaryName"];
  for (const key of requiredKeys) {
    if (config[key] === undefined || config[key] === null) {
      console.error(`設定ファイルに ${key} がありません。${CONFIG_PATH} を確認してください。`);
      process.exit(1);
    }
  }
  if (!Array.isArray(config.channelIds) || config.channelIds.length === 0) {
    console.error(`設定ファイルの channelIds は1件以上の配列にしてください。${CONFIG_PATH} を確認してください。`);
    process.exit(1);
  }
  if (!Array.isArray(config.allowedUsers) || config.allowedUsers.length === 0) {
    console.error(`設定ファイルの allowedUsers は1件以上の配列にしてください。${CONFIG_PATH} を確認してください。`);
    process.exit(1);
  }

  return config;
}

// ---------------------------------------------------------------------------
// ここから下は純粋関数（config・トークンのファイル読み込みや副作用を持たない）。
// ---------------------------------------------------------------------------

// 許可ユーザーの一覧を {id, name} の配列に正規化する。
export function normalizeAllowedUsers(config) {
  return (config.allowedUsers || []).map((u) => {
    if (typeof u === "string") {
      return { id: u, name: null };
    }
    return { id: String(u.id), name: u.name || null };
  });
}

// 反応してよいチャンネルIDの一覧に正規化する。
export function normalizeChannelIds(config) {
  return (config.channelIds || []).map(String);
}

// userIdに一致する許可ユーザー情報（{id,name}）を返す。見つからなければundefined。
export function findAllowedUser(config, userId) {
  return normalizeAllowedUsers(config).find((u) => u.id === String(userId));
}

// userIdが許可ユーザーかどうか
export function isAllowedUser(config, userId) {
  return findAllowedUser(config, userId) !== undefined;
}

// Claudeへ渡すときの「発言者」表示名を決める。
// configに登録された名前があればそれを使い、無ければDiscordの表示名、それも無ければ「利用者」。
export function resolveSpeakerName(config, userId, discordDisplayName) {
  const user = findAllowedUser(config, userId);
  if (user && user.name) return user.name;
  if (discordDisplayName) return discordDisplayName;
  return "利用者";
}

// メッセージ本文からBotへの@メンション表記（<@id> / <@!id>）だけを取り除く。
// 改行や本文中の他の空白はそのまま保つ（前後の空白だけtrimする）。
export function stripBotMention(content, botUserId) {
  if (!botUserId) return content;
  const pattern = new RegExp(`<@!?${botUserId}>`, "g");
  return content.replace(pattern, "").trim();
}

// このメッセージに反応してよいかどうかを判定する（フィルタの本体）。
// 条件: 同じguildであること・許可ユーザーであること、かつ
//       (a) 指定チャンネルのどれかである、または (b) Botへの@メンションを含む。
export function shouldRespond({ config, guildId, channelId, authorId, mentionsBot }) {
  if (guildId !== config.guildId) return false;
  if (!isAllowedUser(config, authorId)) return false;
  const channels = normalizeChannelIds(config);
  if (channels.includes(String(channelId))) return true;
  if (mentionsBot) return true;
  return false;
}

// 文字列を1900文字ごとに分割する（Discordの1メッセージ上限2000字に対する余裕）。
// 可能なら改行位置で切る。
export function splitMessage(text, maxLen = 1900) {
  if (text.length <= maxLen) {
    return [text];
  }
  const chunks = [];
  let remaining = text;
  while (remaining.length > maxLen) {
    let cutAt = remaining.lastIndexOf("\n", maxLen);
    if (cutAt < maxLen * 0.5) {
      // 改行が見つからない・見つかっても短すぎる場合はそのまま切る
      cutAt = maxLen;
    }
    chunks.push(remaining.slice(0, cutAt));
    remaining = remaining.slice(cutAt).replace(/^\n+/, "");
  }
  if (remaining.length > 0) {
    chunks.push(remaining);
  }
  return chunks;
}

// workdirのパスをセッション保存ディレクトリ名にエンコードする（パス区切りを "-" に置換）
export function encodeWorkdirToProjectDir(workdir) {
  return workdir.split(path.sep).join("-");
}

// 指定したsessionIdのセッションファイル（.jsonl）が実在するかどうかを調べる。
// claude CLIは、存在しないセッションIDを--resumeに渡すとエラー終了せずハングするため、
// 実行前に必ずこれで判定してから--resume/--session-idを選ぶ。
export function sessionFileExists(workdir, sessionId) {
  const projectDirName = encodeWorkdirToProjectDir(workdir);
  const sessionPath = path.join(CLAUDE_PROJECTS_DIR, projectDirName, `${sessionId}.jsonl`);
  return existsSync(sessionPath);
}

// ---------------------------------------------------------------------------
// ここから下は実行時の副作用を持つ本体処理。main()の中でだけ実行する。
// このファイルをimportして関数だけ使うとき（テスト等）は main() を呼ばないので、
// トークン読み込み・Discordログインなどは一切走らない。
// ---------------------------------------------------------------------------

function main() {
  const config = loadConfig();
  const token = loadToken(config.tokenFile);

  // busyフラグ: 同時実行を防ぐ（1件ずつ処理する）
  let busy = false;

  // claude CLIとして呼ぶコマンド名。
  // 通常は "claude"（PATHから見つける）。PATHが通っていない特殊な環境だけ、
  // config.json に "claudeBin": "/絶対パス/claude" を追記して上書きできる。
  function resolveClaudeCommand() {
    return config.claudeBin || "claude";
  }

  // claude CLIを実行するときの環境変数（PATH）。
  // Mac/Linuxでは ~/.local/bin（公式インストーラの既定の置き場所）と
  // 主要なパッケージマネージャの場所を、念のためPATHへ足しておく
  // （常駐（launchd/タスクスケジューラ）から起動するとPATHが最小限しか
  // 渡ってこないことがあるため）。
  function buildClaudeEnv() {
    const env = { ...process.env };
    if (process.platform !== "win32") {
      const extraDirs = [
        path.join(os.homedir(), ".local", "bin"),
        "/opt/homebrew/bin",
        "/usr/local/bin",
      ];
      const currentPath = env.PATH || "";
      const parts = currentPath.split(path.delimiter);
      for (const dir of extraDirs) {
        if (!parts.includes(dir)) {
          parts.unshift(dir);
        }
      }
      env.PATH = parts.join(path.delimiter);
    }
    // claudeBinを絶対パスで指定している場合は、そのフォルダもPATHへ足す
    if (config.claudeBin && path.isAbsolute(config.claudeBin)) {
      const dir = path.dirname(config.claudeBin);
      const parts = (env.PATH || "").split(path.delimiter);
      if (!parts.includes(dir)) {
        env.PATH = [dir, ...parts].join(path.delimiter);
      }
    }
    return env;
  }

  // 設定ファイルへ新しいsessionIdを書き込む（パーミッション600を維持）
  function saveSessionId(newSessionId) {
    config.sessionId = newSessionId;
    writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + "\n", {
      mode: 0o600,
    });
  }

  // Discord専用の会話をリセットする。新しいUUIDを発行してconfig.jsonへ保存する。
  // どの許可ユーザーから送っても有効。
  function resetSession() {
    const newSessionId = crypto.randomUUID();
    saveSessionId(newSessionId);
    log(`会話をリセットしました。新しいsessionId=${newSessionId}`);
    return newSessionId;
  }

  // claude CLIを1回だけ起動して結果を返す（Promiseでラップ）
  // mode: "resume"（固定セッションIDを--resumeで継続） / "new"（同じIDで--session-id新規作成）
  function runClaudeOnce({ prompt, sessionId, mode, timeoutMs }) {
    return new Promise((resolve) => {
      const args = ["-p", prompt, "--permission-mode", "acceptEdits"];
      if (mode === "resume") {
        args.push("--resume", sessionId);
      } else if (mode === "new") {
        args.push("--session-id", sessionId);
      }

      // Windowsではnpmグローバルインストールのコマンドが .cmd シム（バッチファイル）で、
      // shell:true にしないとNodeから直接起動できない。Mac/Linuxではshell:false のままでよいが、
      // 同じコードで両対応させるため、Windowsのときだけshellを経由させる。
      const child = spawn(resolveClaudeCommand(), args, {
        cwd: config.workdir,
        env: buildClaudeEnv(),
        stdio: ["ignore", "pipe", "pipe"],
        shell: process.platform === "win32",
      });

      let stdout = "";
      let stderr = "";
      let timedOut = false;
      let settled = false;

      // close イベントが来ない場合の保険。killしてから3秒待ってもcloseが来なければ
      // Promiseをここで確定させる（プロセスがハングしたままPromiseが永久に残るのを防ぐ）。
      let forceResolveTimer = null;

      function settle(payload) {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        if (forceResolveTimer) clearTimeout(forceResolveTimer);
        resolve(payload);
      }

      const timer = setTimeout(() => {
        timedOut = true;
        child.kill("SIGKILL");
        forceResolveTimer = setTimeout(() => {
          logError("[claude] kill後もcloseイベントが来ないため強制的に打ち切りました。");
          settle({ code: -1, stdout, stderr, timedOut: true });
        }, 3000);
      }, timeoutMs);

      child.stdout.on("data", (chunk) => {
        stdout += chunk.toString("utf8");
      });
      child.stderr.on("data", (chunk) => {
        stderr += chunk.toString("utf8");
      });

      child.on("error", (err) => {
        settle({ code: -1, stdout, stderr: stderr + `\n[spawn error] ${err.message}`, timedOut: false });
      });

      child.on("close", (code) => {
        settle({ code, stdout, stderr, timedOut });
      });
    });
  }

  // claude CLIを実行する。
  // Discord専用の固定セッションID（config.sessionId）を使う。PCで作業中のセッションとは完全に分離する。
  //
  // speakerName: 発言者の呼び名。プロンプト冒頭（安全指示の直後・本文の前）に
  // 「（発言者: 〇〇さん）」として付け、Claudeが誰からの依頼かわかるようにする。
  //
  // 重要: claude CLIは、存在しないセッションIDを--resumeに渡すとエラー終了せずハングする
  // （プロセスが生き続け、stdoutに何も出ない）ため、実行前に必ずセッションファイル（.jsonl）の
  // 有無を調べてから --resume / --session-id のどちらを使うか決める（実行してから失敗を見て
  // フォールバックする、では手遅れ）。
  //
  // 保険: --session-id での新規作成が「IDが既に使われている」等の理由で失敗した場合に限り、
  // 1回だけ --resume で再試行する。
  async function runClaude(userPrompt, timeoutMs, speakerName) {
    const fullPrompt = buildPrefixText(config.secretaryName) + `（発言者: ${speakerName}）\n` + userPrompt;
    const sessionId = config.sessionId;

    const hasExistingSession = sessionFileExists(config.workdir, sessionId);
    const primaryMode = hasExistingSession ? "resume" : "new";

    if (hasExistingSession) {
      log("[claude] 既存セッションを継続します。");
    } else {
      log("[claude] 新しいセッションを作ります。");
    }

    let result = await runClaudeOnce({
      prompt: fullPrompt,
      sessionId,
      mode: primaryMode,
      timeoutMs,
    });

    if (result.timedOut) {
      return { ...result, fellBack: false };
    }

    // new（新規作成）が失敗した場合のみ、保険として1回だけresumeを試す
    // （例: IDが既に使われている等）
    const newFailed = primaryMode === "new" && result.code !== 0 && !result.stdout.trim();
    if (newFailed) {
      log("[claude] 新規作成に失敗しました。--resumeで再試行します（保険）。");
      result = await runClaudeOnce({
        prompt: fullPrompt,
        sessionId,
        mode: "resume",
        timeoutMs,
      });
      if (!result.timedOut && result.code === 0) {
        log("[claude] resumeへのフォールバックで実行しました。");
      }
      return { ...result, fellBack: true };
    }

    if (result.code === 0) {
      log(`[claude] ${primaryMode === "resume" ? "resume" : "新規作成"}で実行しました。`);
    }
    return { ...result, fellBack: false };
  }

  async function sendChunked(channel, text) {
    const chunks = splitMessage(text, 1900);
    for (const chunk of chunks) {
      await channel.send(chunk);
    }
  }

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Channel, Partials.Message],
  });

  client.once("clientReady", async () => {
    log(`起動しました。ログイン中: ${client.user.tag}`);
    try {
      const channels = normalizeChannelIds(config);
      const firstChannelId = channels[0];
      if (!firstChannelId) {
        logError("有効なチャンネルIDが設定にありません。");
        return;
      }
      const channel = await client.channels.fetch(firstChannelId);
      await channel.send(`🍯 ${config.secretaryName}、起きました。ご用があればどうぞ`);
      log("起動メッセージをDiscordへ投稿しました。");
    } catch (err) {
      logError("起動メッセージの投稿に失敗しました。", err.message);
    }
  });

  client.on("messageCreate", async (message) => {
    try {
      // フィルタ: これを全部満たさないメッセージは完全に無視する
      if (message.author.bot) return;

      const botUserId = client.user ? client.user.id : null;
      const mentionsBot = botUserId ? message.mentions.users.has(botUserId) : false;

      const allowed = shouldRespond({
        config,
        guildId: message.guildId,
        channelId: message.channelId,
        authorId: message.author.id,
        mentionsBot,
      });
      if (!allowed) return;

      const discordDisplayName =
        (message.member && message.member.displayName) || message.author.username || null;
      const speakerName = resolveSpeakerName(config, message.author.id, discordDisplayName);

      // @メンションで呼ばれた場合は、メンション表記だけを本文から取り除いてClaudeへ渡す。
      // メンションが無い通常メッセージは、従来どおりmessage.contentをそのまま使う。
      const userPrompt =
        mentionsBot && botUserId ? stripBotMention(message.content, botUserId) : message.content;

      // 添付ファイル（画像等）はDiscord CDNのURLとして本文の末尾に添える。
      // 画像つきの質問（スクショ等）に、Claude側がURLを読み込んで答えられるようにするため。
      // ※リセット判定・ログはuserPrompt（文字部分）基準のまま変えない。
      let promptForClaude = userPrompt;
      if (message.attachments && message.attachments.size > 0) {
        const urls = [...message.attachments.values()].map((a) => a.url).slice(0, 5);
        promptForClaude +=
          `\n\n（添付ファイル${urls.length}件。内容が必要なら次のURLをダウンロードして確認してください:\n` +
          urls.join("\n") +
          "）";
      }

      // 「リセット」「/リセット」だけを送ってきたら、claudeを呼ばずに会話をリセットする
      const trimmedContent = userPrompt.trim();
      if (trimmedContent === "リセット" || trimmedContent === "/リセット") {
        log(`受信: userId=${message.author.id}(${speakerName}) リセット要求`);
        resetSession();
        await message.channel.send("会話をリセットしました。ここから新しい話として始めます");
        return;
      }

      if (busy) {
        log(`受信（処理中のため無視）: userId=${message.author.id}(${speakerName}) length=${message.content.length}`);
        await message.channel.send("いま前の仕事をやっています。終わったら取りかかります");
        return;
      }

      log(`受信: userId=${message.author.id}(${speakerName}) length=${message.content.length}`);
      busy = true;

      // 👀 リアクションを付ける
      try {
        await message.react("👀");
      } catch (err) {
        logError("リアクション付与に失敗しました。", err.message);
      }

      // 8秒ごとにタイピング表示を送り続ける
      await message.channel.sendTyping().catch(() => {});
      const typingInterval = setInterval(() => {
        message.channel.sendTyping().catch(() => {});
      }, 8000);

      try {
        const result = await runClaude(promptForClaude, config.timeoutMs, speakerName);

        if (result.timedOut) {
          logError("claude CLIがタイムアウトしました。");
          await message.channel.send(
            "時間がかかりすぎたので中断しました。PCの前で続きをやりましょう"
          );
        } else if (result.code !== 0) {
          const tail = result.stderr.slice(-500);
          logError(`claude CLIがエラー終了しました。code=${result.code}`);
          await message.channel.send(`エラーが出ました\n${tail}`);
        } else {
          const output = result.stdout.trim();
          if (!output) {
            await message.channel.send("（返事が空でした。もう一度お願いします）");
          } else {
            await sendChunked(message.channel, output);
          }
          log(`完了: userId=${message.author.id}(${speakerName}) fellBack=${result.fellBack}`);
        }
      } catch (err) {
        logError("claude CLI実行中に想定外のエラーが発生しました。", err.message);
        await message.channel.send(`エラーが出ました\n${String(err.message || err).slice(-500)}`);
      } finally {
        clearInterval(typingInterval);
        busy = false;
      }
    } catch (outerErr) {
      logError("messageCreateハンドラで想定外のエラーが発生しました。", outerErr.message);
      busy = false;
    }
  });

  client.on("error", (err) => {
    logError("Discordクライアントでエラーが発生しました。", err.message);
  });

  client.login(token).catch((err) => {
    console.error("Discordへのログインに失敗しました。トークンを確認してください。", err.message);
    process.exit(1);
  });
}

// このファイルが `node bridge.mjs` として直接実行されたときだけmain()を走らせる。
// importして関数だけ使うとき（テスト等）は、トークン読み込み・Discordログインなどの
// 副作用は一切発生しない。
const isMainModule = (() => {
  try {
    return import.meta.url === `file://${process.argv[1]}`;
  } catch {
    return false;
  }
})();

if (isMainModule) {
  main();
}
