import { useState, useEffect } from "react";
import { runPipeline } from "./api";

const AGENTS = [
  { id: "keywords", name: "Keyword Research Agent", icon: "🔍", color: "#6366f1" },
  { id: "meta", name: "Meta Content Agent", icon: "🏷️", color: "#8b5cf6" },
  { id: "description", name: "Product Description Agent", icon: "📝", color: "#a855f7" },
  { id: "schema", name: "Schema Markup Agent", icon: "🧩", color: "#d946ef" },
];

const THEMES = {
  dark: {
    bg: "#0f0f13", card: "#16161e", border: "#1e1e2e",
    input: "#0f0f13", inputBorder: "#2d2d3d", muted: "#2d2d3d",
    text: "#e2e8f0", subtext: "#64748b", dim: "#4a4a5a",
  },
  light: {
    bg: "#f1f5f9", card: "#ffffff", border: "#e2e8f0",
    input: "#f8fafc", inputBorder: "#cbd5e1", muted: "#e2e8f0",
    text: "#0f172a", subtext: "#64748b", dim: "#94a3b8",
  },
};

const toCSV = (product, category, data) => {
  const rows = [["Section", "Key", "Value"]];
  data.keywords.primary.forEach(k => rows.push(["Keywords - Primary", "", k]));
  data.keywords.secondary.forEach(k => rows.push(["Keywords - Secondary", "", k]));
  data.keywords.longTail.forEach(k => rows.push(["Keywords - Long Tail", "", k]));
  data.keywords.voiceSearch.forEach(k => rows.push(["Keywords - Voice Search", "", k]));
  Object.entries(data.keywords.intent).forEach(([intent, kws]) =>
    kws.forEach(k => rows.push([`Intent - ${intent}`, "", k]))
  );
  rows.push(["Meta", "Title", data.meta.metaTitle]);
  rows.push(["Meta", "Description", data.meta.metaDescription]);
  rows.push(["Meta", "Slug", data.meta.slug]);
  rows.push(["Meta", "OG Title", data.meta.ogTitle]);
  rows.push(["Meta", "OG Description", data.meta.ogDescription]);
  rows.push(["Description", "Headline", data.description.headline]);
  rows.push(["Description", "Short", data.description.shortDescription]);
  rows.push(["Description", "Long", data.description.longDescription]);
  data.description.bulletPoints.forEach(b => rows.push(["Description", "Bullet", b]));
  rows.push(["Description", "CTA", data.description.cta]);
  rows.push(["Schema", "JSON-LD", JSON.stringify(data.schema.jsonLd)]);
  rows.push(["Schema", "Breadcrumb", data.schema.breadcrumb.join(" > ")]);
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `seo_${product.replace(/\s+/g, "_")}_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

export default function App() {
  const [product, setProduct] = useState("");
  const [category, setCategory] = useState("");
  const [provider, setProvider] = useState("openai");
  const [loading, setLoading] = useState(false);
  const [activeAgent, setActiveAgent] = useState(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("seo_history") || "[]"); } catch { return []; }
  });
  const [showHistory, setShowHistory] = useState(false);
  const [theme, setTheme] = useState("dark");
  const t = THEMES[theme];

  useEffect(() => {
    localStorage.setItem("seo_history", JSON.stringify(history.slice(0, 20)));
  }, [history]);

  const handleRun = async () => {
    if (!product.trim()) return;
    setLoading(true); setError(null); setData(null); setActiveAgent(null);
    try {
      const res = await runPipeline(product, category, provider);
      setData(res);
      setActiveAgent("keywords");
      const entry = { id: Date.now(), product, category: category || "General", provider, data: res, ts: new Date().toLocaleString() };
      setHistory(prev => [entry, ...prev.slice(0, 19)]);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = (entry) => {
    setProduct(entry.product);
    setCategory(entry.category);
    setProvider(entry.provider);
    setData(entry.data);
    setActiveAgent("keywords");
    setShowHistory(false);
  };

  const deleteHistory = (id, e) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(h => h.id !== id));
  };

  const copy = txt => navigator.clipboard.writeText(typeof txt === "object" ? JSON.stringify(txt, null, 2) : txt);

  return (
    <div style={{ minHeight: "100vh", background: t.bg, color: t.text, fontFamily: "Inter, sans-serif", padding: 24, transition: "all 0.3s" }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 12, letterSpacing: 3, color: "#6366f1", textTransform: "uppercase", marginBottom: 8 }}>Agentic Pipeline</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, background: "linear-gradient(135deg,#6366f1,#d946ef)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          AI SEO Engine
        </h1>
        <p style={{ color: t.subtext, fontSize: 13, marginTop: 6 }}>4 specialized agents · FastAPI backend · React dashboard</p>

        {/* Controls Row */}
        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
          {/* Provider Toggle */}
          <div style={{ display: "inline-flex", background: t.card, border: `1px solid ${t.border}`, borderRadius: 8, overflow: "hidden" }}>
            {["openai", "gemini"].map(p => (
              <button key={p} onClick={() => setProvider(p)}
                style={{ padding: "7px 16px", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: provider === p ? (p === "openai" ? "#10a37f" : "#4285f4") : "transparent", color: provider === p ? "#fff" : t.dim, transition: "all 0.2s" }}>
                {p === "openai" ? "⚡ GPT-4o Mini" : "✦ Gemini 2.5 Flash"}
              </button>
            ))}
          </div>

          {/* Theme Toggle */}
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            style={{ padding: "7px 16px", background: t.card, border: `1px solid ${t.border}`, borderRadius: 8, color: t.text, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>

          {/* History Button */}
          <button onClick={() => setShowHistory(!showHistory)}
            style={{ padding: "7px 16px", background: showHistory ? "#6366f122" : t.card, border: `1px solid ${showHistory ? "#6366f1" : t.border}`, borderRadius: 8, color: showHistory ? "#6366f1" : t.text, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            🕘 History {history.length > 0 && `(${history.length})`}
          </button>
        </div>
      </div>

      {/* History Panel */}
      {showHistory && (
        <div style={{ maxWidth: 860, margin: "0 auto 24px", background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${t.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: "#6366f1" }}>🕘 Search History</span>
            {history.length > 0 && (
              <button onClick={() => setHistory([])} style={{ fontSize: 11, color: "#f87171", background: "transparent", border: "none", cursor: "pointer" }}>Clear All</button>
            )}
          </div>
          {history.length === 0 ? (
            <div style={{ padding: 20, textAlign: "center", color: t.dim, fontSize: 13 }}>No history yet</div>
          ) : (
            <div style={{ maxHeight: 280, overflowY: "auto" }}>
              {history.map(h => (
                <div key={h.id} onClick={() => loadHistory(h)}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 18px", borderBottom: `1px solid ${t.border}`, cursor: "pointer", transition: "background 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.background = t.muted}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{h.product}</div>
                    <div style={{ fontSize: 11, color: t.subtext, marginTop: 2 }}>{h.category} · {h.provider === "openai" ? "GPT-4o Mini" : "Gemini 2.5 Flash"} · {h.ts}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <button onClick={(e) => { e.stopPropagation(); toCSV(h.product, h.category, h.data); }}
                      style={{ padding: "5px 10px", background: "#6366f122", border: "1px solid #6366f144", borderRadius: 6, color: "#6366f1", fontSize: 11, cursor: "pointer" }}>
                      ⬇ CSV
                    </button>
                    <button onClick={(e) => deleteHistory(h.id, e)}
                      style={{ padding: "5px 8px", background: "transparent", border: "none", color: "#f87171", fontSize: 13, cursor: "pointer" }}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Input */}
      <div style={{ maxWidth: 640, margin: "0 auto 32px", background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 20 }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
          <input value={product} onChange={e => setProduct(e.target.value)} onKeyDown={e => e.key === "Enter" && !loading && handleRun()}
            placeholder="Product name (e.g. Wireless Headphones)"
            style={{ flex: 2, background: t.input, border: `1px solid ${t.inputBorder}`, borderRadius: 8, padding: "10px 14px", color: t.text, fontSize: 13, outline: "none" }} />
          <input value={category} onChange={e => setCategory(e.target.value)} placeholder="Category (optional)"
            style={{ flex: 1, background: t.input, border: `1px solid ${t.inputBorder}`, borderRadius: 8, padding: "10px 14px", color: t.text, fontSize: 13, outline: "none" }} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handleRun} disabled={loading || !product.trim()}
            style={{ flex: 1, padding: 11, borderRadius: 8, border: "none", background: loading || !product.trim() ? t.muted : "linear-gradient(135deg,#6366f1,#d946ef)", color: loading || !product.trim() ? t.dim : "#fff", fontWeight: 600, fontSize: 13, cursor: loading || !product.trim() ? "not-allowed" : "pointer" }}>
            {loading ? "⚡ Running Pipeline..." : "🚀 Run Agentic Pipeline"}
          </button>
          <button onClick={() => { setData(null); setActiveAgent(null); setProduct(""); setCategory(""); setError(null); }}
            style={{ padding: "11px 16px", borderRadius: 8, border: `1px solid ${t.inputBorder}`, background: "transparent", color: t.subtext, fontSize: 13, cursor: "pointer" }}>Reset</button>
          {data && (
            <button onClick={() => toCSV(product, category, data)}
              style={{ padding: "11px 16px", borderRadius: 8, border: "1px solid #6366f144", background: "#6366f122", color: "#6366f1", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              ⬇ Export CSV
            </button>
          )}
        </div>
        {error && <div style={{ marginTop: 10, color: "#f87171", fontSize: 12 }}>❌ {error}</div>}
      </div>

      {/* Pipeline Visual */}
      <div style={{ maxWidth: 860, margin: "0 auto 28px", display: "flex", alignItems: "center", justifyContent: "center", gap: 0, flexWrap: "wrap" }}>
        {AGENTS.map((a, i) => {
          const done = !!data;
          const active = activeAgent === a.id;
          return (
            <div key={a.id} style={{ display: "flex", alignItems: "center" }}>
              <div onClick={() => data && setActiveAgent(a.id)}
                style={{ width: 150, padding: "14px 10px", borderRadius: 10, textAlign: "center", border: `2px solid ${active ? a.color : done ? a.color + "66" : t.inputBorder}`, background: active ? a.color + "22" : t.card, cursor: data ? "pointer" : "default", transition: "all 0.3s" }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{a.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: done ? a.color : t.dim, lineHeight: 1.3 }}>{a.name}</div>
                <div style={{ marginTop: 6, fontSize: 10, fontWeight: 600, letterSpacing: 1, color: done ? "#4ade80" : loading ? "#fbbf24" : t.dim }}>
                  {loading ? "● RUNNING" : done ? "✓ DONE" : "○ IDLE"}
                </div>
              </div>
              {i < AGENTS.length - 1 && (
                <div style={{ width: 28, height: 2, background: done ? "#6366f155" : t.muted, position: "relative", flexShrink: 0 }}>
                  <div style={{ position: "absolute", right: -4, top: -4, color: t.dim, fontSize: 10 }}>▶</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Output Tabs */}
      {data && activeAgent && (
        <div style={{ maxWidth: 860, margin: "0 auto", background: t.card, border: `1px solid ${AGENTS.find(a => a.id === activeAgent)?.color}44`, borderRadius: 12, overflow: "hidden" }}>
          <div style={{ display: "flex", borderBottom: `1px solid ${t.border}` }}>
            {AGENTS.map(a => (
              <button key={a.id} onClick={() => setActiveAgent(a.id)}
                style={{ padding: "12px 18px", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", background: activeAgent === a.id ? t.bg : "transparent", color: activeAgent === a.id ? a.color : t.dim, borderBottom: activeAgent === a.id ? `2px solid ${a.color}` : "2px solid transparent", transition: "all 0.2s" }}>
                {a.icon} {a.name.replace(" Agent", "")}
              </button>
            ))}
          </div>
          <div style={{ padding: 20 }}>
            {activeAgent === "keywords" && <KeywordPanel d={data.keywords} copy={copy} t={t} />}
            {activeAgent === "meta" && <MetaPanel d={data.meta} copy={copy} t={t} />}
            {activeAgent === "description" && <DescPanel d={data.description} copy={copy} t={t} />}
            {activeAgent === "schema" && <SchemaPanel d={data.schema} copy={copy} t={t} />}
          </div>
        </div>
      )}

      {!loading && !data && (
        <div style={{ textAlign: "center", color: t.dim, marginTop: 20, fontSize: 13 }}>
          Enter a product and run the pipeline to see agents work in sequence ↑
        </div>
      )}
    </div>
  );
}

const S = ({ title, color = "#6366f1", children }) => (
  <div style={{ marginBottom: 18 }}>
    <div style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>{title}</div>
    {children}
  </div>
);

const Tag = ({ text, bg, tc }) => (
  <span style={{ display: "inline-block", padding: "3px 10px", background: bg, borderRadius: 20, fontSize: 11, color: tc, marginRight: 6, marginBottom: 4 }}>{text}</span>
);

const CopyBtn = ({ onClick }) => (
  <button onClick={onClick} style={{ marginTop: 8, padding: "7px 14px", background: "#2d2d3d", border: "none", borderRadius: 6, color: "#94a3b8", cursor: "pointer", fontSize: 12 }}>📋 Copy All</button>
);

const KeywordPanel = ({ d, copy, t }) => (
  <div>
    {/* Trend Score Badge */}
    {d.trendScore !== undefined && (
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, padding: "10px 14px", background: "#6366f111", border: "1px solid #6366f133", borderRadius: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", textTransform: "uppercase", letterSpacing: 1 }}>📈 Google Trend Score</span>
        <span style={{ fontSize: 22, fontWeight: 800, color: d.trendScore > 60 ? "#4ade80" : d.trendScore > 30 ? "#fbbf24" : "#f87171" }}>{d.trendScore}</span>
        <span style={{ fontSize: 11, color: t.subtext }}>/100</span>
      </div>
    )}
    <S title="Primary Keywords"><div>{d.primary.map((k, i) => <Tag key={i} text={k} bg="#6366f133" tc="#a5b4fc" />)}</div></S>
    <S title="Secondary Keywords"><div>{d.secondary.map((k, i) => <Tag key={i} text={k} bg="#8b5cf633" tc="#c4b5fd" />)}</div></S>
    <S title="Long-Tail Keywords"><div>{d.longTail.map((k, i) => <Tag key={i} text={k} bg="#a855f733" tc="#d8b4fe" />)}</div></S>
    <S title="Search Intent">
      {Object.entries(d.intent).map(([k, v]) => (
        <div key={k} style={{ marginBottom: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#6366f1", letterSpacing: 1, textTransform: "uppercase" }}>{k}: </span>
          {v.map((kw, i) => <Tag key={i} text={kw} bg="#6366f122" tc="#a5b4fc" />)}
        </div>
      ))}
    </S>
    <S title="Voice Search / PAA">
      {(d.paaQuestions?.length ? d.paaQuestions : d.voiceSearch).map((q, i) => (
        <div key={i} style={{ padding: "7px 12px", background: t.input, borderRadius: 6, marginBottom: 6, fontSize: 13, color: "#c4b5fd" }}>🎙️ {q}</div>
      ))}
    </S>
    {d.risingQueries?.length > 0 && (
      <S title="🚀 Rising Queries (Real Google Data)">
        <div>{d.risingQueries.map((k, i) => <Tag key={i} text={k} bg="#4ade8022" tc="#4ade80" />)}</div>
      </S>
    )}
    {d.autoSuggestions?.length > 0 && (
      <S title="💡 Google Autocomplete Suggestions">
        <div>{d.autoSuggestions.map((k, i) => <Tag key={i} text={k} bg="#fbbf2422" tc="#fbbf24" />)}</div>
      </S>
    )}
    {d.serpRelated?.length > 0 && (
      <S title="🔗 SERP Related Searches">
        <div>{d.serpRelated.map((k, i) => <Tag key={i} text={k} bg="#38bdf822" tc="#38bdf8" />)}</div>
      </S>
    )}
    <CopyBtn onClick={() => copy(d)} />
  </div>
);

const MetaPanel = ({ d, copy, t }) => (
  <div>
    {/* Competitor Insights */}
    {d.competitorTitles?.length > 0 && (
      <div style={{ marginBottom: 20, padding: 14, background: "#f87171" + "11", border: "1px solid #f8717133", borderRadius: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#f87171", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>🔍 Competitor Analysis (via ScraperAPI)</div>
        {d.competitorTitles.map((ct, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 10, color: t.subtext, marginBottom: 2 }}>Competitor {i + 1} Title:</div>
            <div style={{ fontSize: 12, color: t.text, padding: "6px 10px", background: t.input, borderRadius: 6 }}>{ct}</div>
            {d.competitorDescriptions[i] && (
              <div style={{ fontSize: 11, color: t.subtext, padding: "4px 10px", fontStyle: "italic" }}>{d.competitorDescriptions[i]}</div>
            )}
          </div>
        ))}
      </div>
    )}
    {[
      { label: "Meta Title", key: "metaTitle", hint: `${d.metaTitle?.length}/60` },
      { label: "Meta Description", key: "metaDescription", hint: `${d.metaDescription?.length}/155` },
      { label: "URL Slug", key: "slug" },
      { label: "OG Title", key: "ogTitle" },
      { label: "OG Description", key: "ogDescription" },
    ].map(f => (
      <div key={f.key} style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#8b5cf6", letterSpacing: 1, textTransform: "uppercase" }}>{f.label}</span>
          {f.hint && <span style={{ fontSize: 10, color: t.subtext }}>{f.hint}</span>}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1, padding: "10px 12px", background: t.input, borderRadius: 6, fontSize: 13, color: t.text, border: `1px solid ${t.inputBorder}` }}>{d[f.key]}</div>
          <button onClick={() => copy(d[f.key])} style={{ padding: "8px 10px", background: t.muted, border: "none", borderRadius: 6, color: "#8b5cf6", cursor: "pointer" }}>📋</button>
        </div>
      </div>
    ))}
  </div>
);

const DescPanel = ({ d, copy, t }) => (
  <div>
    <S title="Headline"><div style={{ fontSize: 18, fontWeight: 700 }}>{d.headline}</div></S>
    <S title="Short Description"><div style={{ fontSize: 13, color: t.subtext, lineHeight: 1.7 }}>{d.shortDescription}</div></S>
    <S title="Long Description"><div style={{ fontSize: 13, color: t.subtext, lineHeight: 1.8 }}>{d.longDescription}</div></S>
    <S title="Bullet Points">{d.bulletPoints.map((p, i) => <div key={i} style={{ padding: "5px 0", fontSize: 13, color: "#c4b5fd" }}>✦ {p}</div>)}</S>
    <S title="CTA"><div style={{ display: "inline-block", padding: "10px 20px", background: "linear-gradient(135deg,#6366f1,#d946ef)", borderRadius: 8, fontWeight: 700, fontSize: 13 }}>{d.cta}</div></S>
    <CopyBtn onClick={() => copy(d)} />
  </div>
);

const SchemaPanel = ({ d, copy, t }) => (
  <div>
    <S title="JSON-LD Schema">
      <div style={{ position: "relative" }}>
        <pre style={{ background: t.input, border: `1px solid ${t.inputBorder}`, borderRadius: 8, padding: 14, fontSize: 11, color: "#a5b4fc", overflow: "auto", margin: 0, lineHeight: 1.6 }}>
          {JSON.stringify(d.jsonLd, null, 2)}
        </pre>
        <button onClick={() => copy(d.jsonLd)} style={{ position: "absolute", top: 8, right: 8, padding: "5px 10px", background: t.muted, border: "none", borderRadius: 6, color: "#d946ef", cursor: "pointer", fontSize: 11 }}>📋 Copy</button>
      </div>
    </S>
    <S title="Breadcrumb">
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {d.breadcrumb.map((b, i) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12, color: "#c4b5fd", padding: "4px 10px", background: t.muted, borderRadius: 4 }}>{b}</span>
            {i < d.breadcrumb.length - 1 && <span style={{ color: t.dim }}>›</span>}
          </span>
        ))}
      </div>
    </S>
  </div>
);