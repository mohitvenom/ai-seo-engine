const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const runPipeline = async (product, category = "General", provider = "openai") => {
  const res = await fetch(`${BASE}/pipeline`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ product, category, provider }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};