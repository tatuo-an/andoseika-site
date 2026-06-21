"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600 transition-colors ${className ?? ""}`}
      title="コピー"
    >
      <span className="truncate">{text}</span>
      {copied
        ? <Check className="w-3 h-3 text-green-500 shrink-0" />
        : <Copy className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100" />
      }
    </button>
  );
}
