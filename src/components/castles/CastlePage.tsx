import Link from "next/link";
import type { Castle } from "@/data/castles/types";
import { CATEGORY_LABEL } from "@/data/castles/types";
import { pageNumber } from "@/data/castles";
import { CastleImage } from "./CastleImage";

type Props = {
  castle: Castle;
  /** 本（連続表示）モードでは各城のリンク・目次戻りを省く */
  book?: boolean;
};

/** 1城 = 1ページ。詳細ページと本（連続表示）で共用 */
export function CastlePage({ castle, book = false }: Props) {
  const cat = CATEGORY_LABEL[castle.category];
  const [hero, ...rest] = castle.images;
  const no = pageNumber(castle.slug);

  return (
    <article className="castle-page" id={castle.slug}>
      {/* 柱（ページ上部の章・所在地） */}
      <header className="castle-page__running">
        <span className="castle-page__chapter">{cat.name}</span>
        <span className="castle-page__place">
          {castle.prefecture} {castle.city}
        </span>
        <span className="castle-page__no">{String(no).padStart(2, "0")}</span>
      </header>

      <div className="castle-page__title">
        <p className="castle-page__reading">{castle.reading}</p>
        <h1>{castle.name}</h1>
        {castle.aliases && castle.aliases.length > 0 && (
          <p className="castle-page__aliases">別名: {castle.aliases.join("・")}</p>
        )}
      </div>

      {hero && <CastleImage image={hero} className="castle-figure--hero" priority={!book} />}

      <p className="castle-page__summary">{castle.summary}</p>

      {/* 天守データ */}
      <dl className="castle-spec">
        <div>
          <dt>天守</dt>
          <dd>{castle.keepSpec}</dd>
        </div>
        <div>
          <dt>現在の天守の建造年</dt>
          <dd>{castle.keepBuiltYear}年</dd>
        </div>
        {castle.designation && (
          <div>
            <dt>指定</dt>
            <dd>{castle.designation}</dd>
          </div>
        )}
        <div>
          <dt>現在の用途</dt>
          <dd>{castle.currentUse}</dd>
        </div>
      </dl>

      {rest.length > 0 && (
        <div className="castle-gallery">
          {rest.map((img, i) => (
            <CastleImage key={`${castle.slug}-${i}`} image={img} />
          ))}
        </div>
      )}

      <section className="castle-section">
        <h2>歴代城主の変遷</h2>
        <table className="castle-table">
          <thead>
            <tr>
              <th>期間</th>
              <th>城主</th>
              <th>備考</th>
            </tr>
          </thead>
          <tbody>
            {castle.lords.map((l, i) => (
              <tr key={i}>
                <td className="nowrap">{l.period}</td>
                <td>{l.lord}</td>
                <td>{l.note ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="castle-section">
        <h2>年表</h2>
        <ol className="castle-timeline">
          {castle.timeline.map((t, i) => (
            <li key={i}>
              <span className="castle-timeline__year">
                {t.year}年{t.era ? <small>（{t.era}）</small> : null}
              </span>
              <span className="castle-timeline__event">{t.event}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="castle-section">
        <h2>歴史と経緯</h2>
        {castle.history.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </section>

      {castle.references && castle.references.length > 0 && (
        <section className="castle-section castle-refs">
          <h2>参考</h2>
          <ul>
            {castle.references.map((r) => (
              <li key={r.url}>
                <a href={r.url} target="_blank" rel="noopener noreferrer">
                  {r.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!book && (
        <p className="castle-page__back">
          <Link href="/castles#toc">← 目次へ戻る</Link>
        </p>
      )}
    </article>
  );
}
