// src/hooks/useCitat.js
import { useCallback, useEffect, useState } from "react";

const DUMMYJSON = "https://dummyjson.com/quotes/random";

async function translateWithMyMemory(text, source = "en", target = "sr") {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
    text
  )}&langpair=${encodeURIComponent(source)}|${encodeURIComponent(target)}`;

  const res = await fetch(url);
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || "MyMemory error");
  }
  const json = await res.json();

  // Prefer the best match if available
  const matches = Array.isArray(json?.matches) ? json.matches : [];
  const best =
    matches
      .slice()
      .sort(
        (a, b) =>
          (Number(b.quality) || 0) - (Number(a.quality) || 0) ||
          (Number(b.match) || 0) - (Number(a.match) || 0)
      )[0] || null;

  return (
    best?.translation ||
    json?.responseData?.translatedText ||
    text // fallback to original EN
  );
}

async function getWorkQuote() {
  // Try a few times to get a "hard work"-ish quote
  for (let i = 0; i < 5; i++) {
    const r = await fetch(DUMMYJSON);
    const j = await r.json();
    const text = j?.quote || j?.text || "";
    const by = j?.author || "Nepoznat autor";

    if (
      /\b(hard|work|effort|discipline|perseverance|persistence|focus|grind)\b/i.test(
        text
      ) ||
      i === 4
    ) {
      return { text, by };
    }
  }
  throw new Error("Nema citata.");
}

export default function useCitat() {
  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchQuote = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { text, by } = await getWorkQuote();
      let sr = text;
      try {
        sr = await translateWithMyMemory(text, "en", "sr");
      } catch {
        // keep English if translation fails
      }
      setQuote(sr);
      setAuthor(by);
    } catch (e) {
      setError("Greška pri preuzimanju citata.");
      setQuote("");
      setAuthor("");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  return { quote, author, loading, error, refresh: fetchQuote };
}
