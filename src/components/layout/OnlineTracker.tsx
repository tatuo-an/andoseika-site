"use client";

import { useEffect } from "react";

function getSessionId(): string {
  const key = "ando_sid";
  let sid = sessionStorage.getItem(key);
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem(key, sid);
  }
  return sid;
}

function sendPing() {
  fetch("/api/online/ping", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId: getSessionId() }),
  }).catch(() => {});
}

function sendRemove() {
  const sid = sessionStorage.getItem("ando_sid");
  if (!sid) return;
  navigator.sendBeacon(
    "/api/online/remove",
    new Blob([JSON.stringify({ sessionId: sid })], { type: "application/json" })
  );
}

export function OnlineTracker() {
  useEffect(() => {
    sendPing();
    const interval = setInterval(sendPing, 30_000);
    window.addEventListener("beforeunload", sendRemove);
    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", sendRemove);
      // アンマウント時はremoveしない（ページ遷移で消えないように）
    };
  }, []);

  return null;
}
