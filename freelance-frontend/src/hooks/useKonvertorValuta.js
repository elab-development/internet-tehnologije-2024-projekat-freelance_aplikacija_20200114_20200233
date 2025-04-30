import { useState, useEffect } from "react";

export default function useKonvertorValuta() {
  const [kursEurRsd, setKursEurRsd] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExchangeRate = async () => {
      setLoading(true);
      try {
        const url = "https://hexarate.paikama.co/api/rates/latest/EUR?target=RSD";
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Greška pri dohvatu kursa. Kod: ${res.status}`);
        }

        const data = await res.json();
        // data.data.mid je npr. 117.XXX
        if (data.status_code !== 200 || !data.data?.mid) {
          throw new Error("Nevalidan odgovor od hexarate");
        }

        setKursEurRsd(data.data.mid);  // npr. 117.225
      } catch (err) {
        setError(err.message || "Nepoznata greška");
      } finally {
        setLoading(false);
      }
    };

    fetchExchangeRate();
  }, []);

  function convertEurToRsd(eurValue) {
    if (!kursEurRsd) return 0;
    return eurValue * kursEurRsd;
  }

  return { kursEurRsd, loading, error, convertEurToRsd };
}
