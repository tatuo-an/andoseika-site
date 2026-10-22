import type { ReactNode } from "react";

export function DemoFrame({ title, children, reset, note }: { title: string; children: ReactNode; reset: () => void; note: string }) {
  return <div className="inline-workspace"><div className="inline-toolbar"><h4>{title}</h4><button type="button" className="demo-secondary" onClick={reset}>サンプルに戻す</button></div>{children}<p className="inline-footnote">{note}</p></div>;
}
export function Feedback({ children }: { children: ReactNode }) { return <p className="demo-feedback" role="status">{children}</p>; }
export function DemoError({ children }: { children: ReactNode }) { return <p className="demo-error" role="alert">{children}</p>; }
