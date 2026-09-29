import assert from "node:assert/strict";
import test from "node:test";

import {
  lineGroupSettingFromRow,
  normalizeLineGroupAutoReplyState,
  shouldRunLineGroupAutoReply,
  shouldSendAdminPromptImmediately,
  stateFromAdminChoice,
} from "./src/lib/line-group-auto-reply.ts";
import {
  KOUGA_GROUP_ID,
  legacyLineGroupAutoReplyState,
  SHIIRE_GROUP_ID,
} from "./src/lib/line-group-policy.ts";

test("未設定・不明値はpendingでfail-closed", () => {
  assert.equal(normalizeLineGroupAutoReplyState(""), "pending");
  assert.equal(normalizeLineGroupAutoReplyState("unknown"), "pending");
  assert.equal(shouldRunLineGroupAutoReply("pending"), false);
});

test("管理者確認通知は明示設定がない限り保留される", () => {
  assert.equal(shouldSendAdminPromptImmediately(undefined), false);
  assert.equal(shouldSendAdminPromptImmediately("queue"), false);
  assert.equal(shouldSendAdminPromptImmediately("immediate"), true);
});

test("ONだけが自動応答を許可し、OFFは返信しない", () => {
  assert.equal(shouldRunLineGroupAutoReply("enabled"), true);
  assert.equal(shouldRunLineGroupAutoReply("disabled"), false);
});

test("管理画面のON/OFF変更は状態へ正しく変換される", () => {
  assert.equal(stateFromAdminChoice(true), "enabled");
  assert.equal(stateFromAdminChoice(false), "disabled");
});

test("保存行は安定したgroupIdをキーとして読み込む", () => {
  const setting = lineGroupSettingFromRow([
    "C-stable-id",
    "変更後のグループ名",
    "enabled",
    "TRUE",
    "2026-09-29T00:00:00.000Z",
    "2026-09-29T01:00:00.000Z",
    "admin@example.com",
  ]);
  assert.equal(setting?.groupId, "C-stable-id");
  assert.equal(setting?.groupName, "変更後のグループ名");
  assert.equal(setting?.autoReplyEnabled, true);
});

test("既存の明示ルールは移行時に維持する", () => {
  assert.equal(legacyLineGroupAutoReplyState(KOUGA_GROUP_ID), "enabled");
  assert.equal(legacyLineGroupAutoReplyState(SHIIRE_GROUP_ID), "disabled");
  assert.equal(legacyLineGroupAutoReplyState("C-new-group"), null);
});
