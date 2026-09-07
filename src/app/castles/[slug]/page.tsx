import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ALL_CASTLES, getCastle, neighbors, CATEGORY_LABEL } from "@/data/castles";
import { CastlePage } from "@/components/castles/CastlePage";

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return ALL_CASTLES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const castle = getCastle(slug);
  if (!castle) return {};
  return {
    title: `${castle.name}（${castle.prefecture}）― ${CATEGORY_LABEL[castle.category].name}`,
    description: castle.summary,
  };
}

export default async function CastleDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const castle = getCastle(slug);
  if (!castle) notFound();
  const { prev, next } = neighbors(slug);

  return (
    <>
      <CastlePage castle={castle} />
      <nav className="castle-pager" aria-label="前後の城">
        {prev && (
          <Link href={`/castles/${prev.slug}`} className="prev">
            <small>← 前の城</small>
            {prev.name}
          </Link>
        )}
        {next && (
          <Link href={`/castles/${next.slug}`} className="next">
            <small>次の城 →</small>
            {next.name}
          </Link>
        )}
      </nav>
    </>
  );
}
