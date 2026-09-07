import Link from "next/link";
import type { Metadata } from "next";
import { ALL_CASTLES, CATEGORY_LABEL, CATEGORY_ORDER, buildSections, castlesByCategory, pageNumber } from "@/data/castles";

export const metadata: Metadata = {
  title: { absolute: "全国の城 図鑑 ― 現存12天守から模擬天守まで" },
};

export default function CastlesIndexPage() {
  const sections = buildSections();
  const counts = CATEGORY_ORDER.map((c) => ({ c, n: castlesByCategory(c).length }));
  const prefCount = new Set(ALL_CASTLES.map((c) => c.prefCode)).size;

  return (
    <>
      {/* 表紙 */}
      <section className="castles-cover">
        <p className="castles-cover__kicker">JAPANESE CASTLES</p>
        <h1>全国の城 図鑑</h1>
        <p className="castles-cover__sub">現存12天守から、復元・復興・模擬天守まで</p>
        <div className="castles-cover__stats">
          <div>
            <strong>{ALL_CASTLES.length}</strong>
            <span>掲載城数</span>
          </div>
          <div>
            <strong>{prefCount}</strong>
            <span>都道府県</span>
          </div>
          {counts.map(({ c, n }) => (
            <div key={c}>
              <strong>{n}</strong>
              <span>{CATEGORY_LABEL[c].name}</span>
            </div>
          ))}
        </div>
        <div className="castles-cover__actions">
          <Link href="#toc" className="castles-btn castles-btn--fill">
            目次を見る
          </Link>
          <Link href="/castles/book" className="castles-btn">
            最初から通して読む
          </Link>
        </div>
      </section>

      {/* はじめに */}
      <section className="castles-intro">
        <h2>この図鑑について</h2>
        <p>
          全国の城のうち、天守（または天守に代わる櫓）が今も建っている城を集めました。まず「現存12天守」を最初に置き、
          続いて木造復元・外観復元・復興・模擬と、天守の種別ごとに章を分け、章の中は北から南へ都道府県順に並べています。
          石垣や堀だけが残る城跡は、今回は掲載していません。
        </p>
        <p>
          各城のページには、城の外観・石垣・城内の写真、歴代城主の変遷、西暦の年表、そして戦火や地震で失われてから
          復元されるまでの経緯をまとめています。
        </p>

        <h2>天守の種別（凡例）</h2>
        <div className="castles-legend">
          {CATEGORY_ORDER.map((c) => (
            <div key={c}>
              <strong>{CATEGORY_LABEL[c].name}</strong>
              {CATEGORY_LABEL[c].description}
            </div>
          ))}
        </div>
        <p className="castles-note">
          写真は Wikimedia Commons で公開されているライセンス上利用可能な写真を使用し、各写真から出典ページへリンクしています。
          手元で撮影した写真に差し替える場合は、写真を差し替えるだけで本文はそのまま使えます。
        </p>
      </section>

      {/* 目次 */}
      <section className="castles-toc" id="toc">
        <h2>目次</h2>
        {sections.map((sec, i) => (
          <div key={sec.category} className="castles-toc__chapter">
            <div className="castles-toc__chapter-head">
              <span>第{i + 1}章</span>
              <h3>{sec.label.name}</h3>
              <span>{sec.label.sub}</span>
            </div>
            <p className="castles-toc__chapter-desc">{sec.label.description}</p>
            {sec.prefectures.map((pref) => (
              <div key={pref.prefCode} className="castles-toc__pref">
                <p className="castles-toc__pref-name">
                  {pref.prefecture}
                  <small>{pref.region}</small>
                </p>
                <ol>
                  {pref.castles.map((c) => (
                    <li key={c.slug}>
                      <Link href={`/castles/${c.slug}`}>
                        <span className="castles-toc__name">{c.name}</span>
                        <span className="castles-toc__spec">
                          {c.city}／{c.keepSpec}
                        </span>
                        <span className="castles-toc__page">{String(pageNumber(c.slug)).padStart(2, "0")}</span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        ))}
      </section>
    </>
  );
}
