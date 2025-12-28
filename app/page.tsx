"use client";

import { useState } from "react";

export default function Home() {
  const [form, setForm] = useState({
    skinType: "oily",
    concern: "acne",
    ingredientPreference: "",
    budget: "drugstore",
  });

  const [result, setResult] = useState<any>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setResult(data);
  }

  return (
    <main style={{ padding: 32 }}>
      <h1>AI Beauty Advisor (MVP)</h1>

      <form onSubmit={handleSubmit}>
        <label>
          Skin Type:
          <select
            value={form.skinType}
            onChange={(e) =>
              setForm({ ...form, skinType: e.target.value })
            }
          >
            <option value="dry">Dry</option>
            <option value="oily">Oily</option>
            <option value="combination">Combination</option>
            <option value="sensitive">Sensitive</option>
          </select>
        </label>

        <br />

        <label>
          Primary Concern:
          <select
            value={form.concern}
            onChange={(e) =>
              setForm({ ...form, concern: e.target.value })
            }
          >
            <option value="acne">Acne</option>
            <option value="hyperpigmentation">Hyperpigmentation</option>
            <option value="aging">Aging</option>
            <option value="dryness">Dryness</option>
          </select>
        </label>

        <br />

        <label>
          Ingredient Preference (optional):
          <input
            type="text"
            placeholder="e.g. retinol"
            value={form.ingredientPreference}
            onChange={(e) =>
              setForm({
                ...form,
                ingredientPreference: e.target.value,
              })
            }
          />
        </label>

        <br />

        <label>
          Budget:
          <select
            value={form.budget}
            onChange={(e) =>
              setForm({ ...form, budget: e.target.value })
            }
          >
            <option value="drugstore">Drugstore</option>
            <option value="mid">Mid</option>
            <option value="luxury">Luxury</option>
          </select>
        </label>

        <br />
        <br />

        <button type="submit">Get Recommendations</button>
      </form>

      {result && (
        <>
          <h2>Top Recommendation</h2>
          <p>
            <strong>{result.coreRecommendation.brand}</strong> —{" "}
            {result.coreRecommendation.name}
          </p>

          <h3>Alternatives</h3>
          <ul>
            {result.alternatives.map((p: any, i: number) => (
              <li key={i}>
                {p.brand} — {p.name}
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
