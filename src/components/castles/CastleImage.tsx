"use client";

import { useState } from "react";
import type { CastleImage as CastleImageType } from "@/data/castles/types";
import { commonsPageUrl, imageSrc } from "@/data/castles/images";

type Props = {
  image: CastleImageType;
  className?: string;
  /** 配信幅（Commons のサムネイル幅） */
  width?: number;
  /** キャプション・出典を表示するか */
  showCaption?: boolean;
  priority?: boolean;
};

/**
 * 城の写真1枚。Wikimedia Commons から直接配信するため <img> を使う。
 * 読み込みに失敗した場合は写真枠だけを残し「写真を準備中」の表示に切り替える。
 */
export function CastleImage({ image, className = "", width = 1280, showCaption = true, priority = false }: Props) {
  const [failed, setFailed] = useState(false);
  const src = imageSrc(image, width);

  return (
    <figure className={`castle-figure ${className}`}>
      <div className="castle-figure__frame">
        {src && !failed ? (
          // eslint-disable-next-line @next/next/no-img-element -- 外部（Wikimedia Commons）の写真を直接表示するため
          <img
            src={src}
            alt={image.caption}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="castle-figure__placeholder">
            <span>写真を準備中</span>
            <small>{image.caption}</small>
          </div>
        )}
      </div>
      {showCaption && (
        <figcaption>
          <span>{image.caption}</span>
          {image.commons && !failed ? (
            <a href={commonsPageUrl(image.commons)} target="_blank" rel="noopener noreferrer" title="出典・ライセンスを確認">
              出典: Wikimedia Commons
            </a>
          ) : image.credit ? (
            <span>{image.credit}</span>
          ) : null}
        </figcaption>
      )}
    </figure>
  );
}
