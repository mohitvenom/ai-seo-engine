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

export const fetchHistory = async (limit = 20) => {
  const res = await fetch(`${BASE}/history?limit=${limit}`);
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.history;
};

export const deleteHistory = async (id) => {
  const res = await fetch(`${BASE}/history/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};