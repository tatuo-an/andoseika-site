import type { Metadata } from "next";
import { buildSections, ALL_CASTLES } from "@/data/castles";
import { CastlePage } from "@/components/castles/CastlePage";

export const metadata: Metadata = {
  title: "通読（本）",
  description: "全国の城 図鑑を最初から最後まで1ページで。印刷するとA4の本として出力できます。",
};

/** 全城を章立てで連続表示。ブラウザの印刷で本（A4）として出力できる */
export default function CastlesBookPage() {
  const sections = buildSections();
  return (
    <>
      <section className="castles-cover">
        <p className="castles-cover__kicker">JAPANESE CASTLES</p>
        <h1>全国の城 図鑑</h1>
        <p className="castles-cover__sub">現存12天守から、復元・復興・模擬天守まで ― 全{ALL_CASTLES.length}城</p>
        <p className="castles-note castles-print-hide" style={{ marginTop: "2rem", textAlign: "left" }}>
          このページはブラウザの「印刷」から PDF に保存すると、1城1ページの本として出力できます（A4・章扉つき）。
        </p>
      </section>

      {sections.map((sec, i) => (
        <section key={sec.category}>
          <div className="castles-chapter" id={`chapter-${sec.category}`}>
            <small>第{i + 1}章 ／ {sec.label.sub}</small>
            <h2>{sec.label.name}</h2>
            <p>{sec.label.description}</p>
          </div>
          {sec.prefectures.map((pref) => (
            <div key={pref.prefCode}>
              <p className="castles-pref-head">
                {pref.prefecture}（{pref.region}）
              </p>
              {pref.castles.map((c) => (
                <CastlePage key={c.slug} castle={c} book />
              ))}
            </div>
          ))}
        </section>
      ))}
    </>
  );
}
