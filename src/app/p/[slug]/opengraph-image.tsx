import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand";
import { getPoolView } from "@/lib/pools";

export const alt = "Babywette";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-dynamic";

/** Share preview showing the live odds, so every WhatsApp link teases the bet. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const view = await getPoolView(slug, null);
  const pool = view?.pool;
  const gender = view?.markets.find((m) => m.kind === "gender");
  const girl = gender?.outcomes.find((o) => o.label === "Mädchen")?.price ?? 0.5;
  const names = view?.markets
    .find((m) => m.kind === "name" && m.status !== "resolved")
    ?.outcomes.filter((o) => !o.isCatchAll)
    .sort((a, b) => b.price - a.price)
    .slice(0, 3);
  const genderWinner = gender?.outcomes.find((o) => o.id === gender.resolvedOutcomeId);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "linear-gradient(135deg, #fff3f3 0%, #fffaf5 50%, #f1f7fd 100%)",
          color: "#3b2f2f",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 30, fontWeight: 700, color: "#c9566a" }}>
          {BRAND.name} · Babywette
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {pool?.parentNames && (
            <div style={{ display: "flex", fontSize: 34, color: "#7a6a66" }}>{`${pool.parentNames} bekommen ein Baby!`}</div>
          )}
          <div style={{ display: "flex", fontSize: 84, fontWeight: 800, lineHeight: 1.05 }}>
            {genderWinner
              ? `Es ist ein ${genderWinner.label}!`
              : pool
                ? `Junge oder Mädchen?`
                : "Die Babywette"}
          </div>
          {pool && <div style={{ display: "flex", fontSize: 40, marginTop: 8 }}>{pool.revealedName ?? pool.babyName}</div>}
        </div>
        {gender && !genderWinner ? (
          <div style={{ display: "flex", height: 84, borderRadius: 42, overflow: "hidden", fontSize: 36, fontWeight: 800 }}>
            <div style={{ width: `${girl * 100}%`, background: "#ec8f97", display: "flex", alignItems: "center", justifyContent: "center", minWidth: 220 }}>
              {`Mädchen ${Math.round(girl * 100)} %`}
            </div>
            <div style={{ flex: 1, background: "#79aedf", display: "flex", alignItems: "center", justifyContent: "center", minWidth: 220 }}>
              {`Junge ${Math.round((1 - girl) * 100)} %`}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 16, fontSize: 36, fontWeight: 700 }}>
            {(names ?? []).map((n) => (
              <div key={n.id} style={{ display: "flex", background: "white", borderRadius: 999, padding: "12px 28px" }}>
                {`${n.label} ${Math.round(n.price * 100)} %`}
              </div>
            ))}
          </div>
        )}
      </div>
    ),
    size,
  );
}
