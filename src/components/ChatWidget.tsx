"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Loader2 } from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function ChatWidget() {
  const { status } = useSession();
  const isLoggedIn = status === "authenticated";
  const [open, setOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ログイン済みなら履歴を読み込む
  useEffect(() => {
    if (!isLoggedIn || historyLoaded) return;
    fetch("/api/chat/history")
      .then((r) => r.json())
      .then((d) => {
        if (d.messages?.length > 0) setMessages(d.messages);
      })
      .finally(() => setHistoryLoaded(true));
  }, [isLoggedIn, historyLoaded]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) {
      setShowBanner(false);
      inputRef.current?.focus();
    }
  }, [open]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || streaming) return;

    const nextMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setStreaming(true);
    setMessages([...nextMessages, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages([...nextMessages, { role: "assistant", content: accumulated }]);
      }

      // ログイン済みなら履歴を保存
      if (isLoggedIn && accumulated) {
        await fetch("/api/chat/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: "user", content: text }),
        });
        await fetch("/api/chat/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: "assistant", content: accumulated }),
        });
      }
    } catch {
      setMessages([
        ...nextMessages,
        { role: "assistant", content: "申し訳ありません。エラーが発生しました。しばらく経ってから再度お試しください。" },
      ]);
    } finally {
      setStreaming(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      {/* 吹き出しバナー */}
      {!open && showBanner && (
        <div className="fixed bottom-28 right-5 z-50 animate-bounce-slow">
          <div className="relative bg-white text-stone-800 text-sm font-bold px-4 py-2 rounded-2xl shadow-lg border border-stone-100 whitespace-nowrap">
            なんでも聞いてね！
            <button
              onClick={() => setShowBanner(false)}
              className="ml-2 text-stone-300 hover:text-stone-500 text-xs"
            >✕</button>
            {/* 吹き出しの三角 */}
            <span className="absolute -bottom-2 right-6 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white" />
          </div>
        </div>
      )}

      {/* 浮かぶボタン */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-white border-2 border-primary rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all pr-4 pl-1 py-1"
        aria-label="チャットを開く"
      >
        {open ? (
          <>
            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
              <Image src="/images/ando-ai.png" alt="安藤AI" width={40} height={40} className="object-cover" />
            </div>
            <X className="w-5 h-5 text-primary" />
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
              <Image src="/images/ando-ai.png" alt="安藤AI" width={40} height={40} className="object-cover" />
            </div>
            <span className="text-sm font-bold text-primary">安藤AIに聞く</span>
          </>
        )}
      </button>

      {/* チャットパネル */}
      {open && (
        <div
          className="fixed bottom-24 right-5 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-stone-100"
          style={{ height: "480px" }}
        >
          {/* ヘッダー */}
          <div className="bg-primary px-4 py-3 flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/50 shrink-0">
              <Image src="/images/ando-ai.png" alt="安藤AI" width={40} height={40} className="object-cover" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">安藤AIに聞く</p>
              <p className="text-white/70 text-xs">商品・サポーター・体験など気軽にどうぞ</p>
            </div>
          </div>

          {/* メッセージ */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.length === 0 && (
              <div className="flex flex-col items-center text-center text-stone-500 text-sm mt-6 gap-3">
                <Image src="/images/ando-ai.png" alt="安藤AI" width={72} height={72} className="rounded-full border-2 border-stone-100" />
                <p className="font-bold text-stone-700">こんにちは！安藤AIです🌿</p>
                <p className="text-stone-400">商品・サポーター会員・体験予約など、なんでも気軽に聞いてください！</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex items-end gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full overflow-hidden shrink-0">
                    <Image src="/images/ando-ai.png" alt="安藤AI" width={28} height={28} className="object-cover" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-primary text-white rounded-br-sm"
                      : "bg-stone-100 text-stone-800 rounded-bl-sm"
                  }`}
                >
                  {msg.content}
                  {msg.role === "assistant" && streaming && i === messages.length - 1 && (
                    <span className="inline-block w-1 h-4 bg-stone-400 ml-0.5 animate-pulse align-middle" />
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* 入力欄 */}
          <div className="border-t border-stone-100 px-3 py-2 flex items-end gap-2 shrink-0">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="メッセージを入力…"
              rows={1}
              className="flex-1 resize-none rounded-xl border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 max-h-24 overflow-y-auto"
              style={{ lineHeight: "1.5" }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || streaming}
              className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary/90 disabled:opacity-40 transition-colors shrink-0"
            >
              {streaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
