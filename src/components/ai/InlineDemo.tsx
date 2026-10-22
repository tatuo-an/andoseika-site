"use client";

import { Component, lazy, Suspense, useState, type ReactNode } from "react";
import type { DemoKind } from "./demo-types";

const demos = {
  booking: lazy(() => import("./showcase-demos").then(module => ({ default: module.BookingDemo }))),
  sns: lazy(() => import("./showcase-demos").then(module => ({ default: module.SnsDemo }))),
  car: lazy(() => import("./showcase-demos").then(module => ({ default: module.CarDemo }))),
  timecard: lazy(() => import("./showcase-demos").then(module => ({ default: module.TimecardDemo }))),
  shop: lazy(() => import("./showcase-demos").then(module => ({ default: module.ShopDemo }))),
  sales: lazy(() => import("../../app/ai/demo/tool-demos").then(module => ({ default: () => <module.SalesDemo embedded /> }))),
  payroll: lazy(() => import("../../app/ai/demo/tool-demos").then(module => ({ default: () => <module.PayrollDemo embedded /> }))),
  delivery: lazy(() => import("./business-demos").then(module => ({ default: module.DeliveryDemo }))),
  online: lazy(() => import("./business-demos").then(module => ({ default: module.OnlineDemo }))),
  market: lazy(() => import("./business-demos").then(module => ({ default: module.MarketDemo }))),
  castle: lazy(() => import("./castle-demo")),
};

class DemoBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <p role="alert">デモを読み込めませんでした。ページを再読み込みして、もう一度お試しください。</p> : this.props.children; }
}

export function InlineDemo({ kind, label }: { kind: DemoKind; label: string }) {
  const [open, setOpen] = useState(false);
  const Demo = demos[kind];
  return <details className="inline-demo" id={`demo-${kind}`} onToggle={event => setOpen(event.currentTarget.open)}>
    <summary><span>{label}を、この場で試す</span><span className="inline-demo-indicator" aria-hidden="true" /></summary>
    {open && <div className="andu-demo inline-demo-body">
      <p className="inline-demo-notice">操作体験用のサンプルです。実際の情報は入力しないでください。入力は保存・送信されず、閉じると元に戻ります。</p>
      <DemoBoundary><Suspense fallback={<p role="status">デモを読み込んでいます…</p>}><Demo /></Suspense></DemoBoundary>
    </div>}
  </details>;
}
