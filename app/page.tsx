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
    <main
      style={{
        minHeight: "100vh",
        background: "#0b0b0b",
        color: "#f5f5f5",
        padding: "48px 24px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ maxWidth: 720, width: "100%" }}>
        <h1>AI Beauty Advisor (MVP)</h1>

        {/* Form Card */}
        <div
          style={{
            background: "#111",
            borderRadius: 16,
            padding: 24,
            marginBottom: 32,
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
          }}
        >
          <form onSubmit={handleSubmit}>
            <label style={{ display: "block", marginBottom: 12 }}>
              <span style={{ fontSize: 12, opacity: 0.7 }}>
                Skin Type
              </span>
              <select
                value={form.skinType}
                onChange={(e) =>
                  setForm({ ...form, skinType: e.target.value })
                }
                style={{
                  width: "100%",
                  marginTop: 6,
                  padding: "10px 12px",
                  borderRadius: 8,
                  background: "#1a1a1a",
                  color: "#fff",
                  border: "1px solid #2a2a2a",
                }}
              >
                <option value="dry">Dry</option>
                <option value="oily">Oily</option>
                <option value="combination">Combination</option>
                <option value="sensitive">Sensitive</option>
              </select>
            </label>

            <label style={{ display: "block", marginBottom: 12 }}>
              <span style={{ fontSize: 12, opacity: 0.7 }}>
                Primary Concern
              </span>
              <select
                value={form.concern}
                onChange={(e) =>
                  setForm({ ...form, concern: e.target.value })
                }
                style={{
                  width: "100%",
                  marginTop: 6,
                  padding: "10px 12px",
                  borderRadius: 8,
                  background: "#1a1a1a",
                  color: "#fff",
                  border: "1px solid #2a2a2a",
                }}
              >
                <option value="acne">Acne</option>
                <option value="hyperpigmentation">
                  Hyperpigmentation
                </option>
                <option value="aging">Aging</option>
                <option value="dryness">Dryness</option>
              </select>
            </label>

            <label style={{ display: "block", marginBottom: 12 }}>
              <span style={{ fontSize: 12, opacity: 0.7 }}>
                Ingredient Preference (optional)
              </span>
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
                style={{
                  width: "100%",
                  marginTop: 6,
                  padding: "10px 12px",
                  borderRadius: 8,
                  background: "#1a1a1a",
                  color: "#fff",
                  border: "1px solid #2a2a2a",
                }}
              />
            </label>

            <label style={{ display: "block", marginBottom: 16 }}>
              <span style={{ fontSize: 12, opacity: 0.7 }}>
                Budget
              </span>
              <select
                value={form.budget}
                onChange={(e) =>
                  setForm({ ...form, budget: e.target.value })
                }
                style={{
                  width: "100%",
                  marginTop: 6,
                  padding: "10px 12px",
                  borderRadius: 8,
                  background: "#1a1a1a",
                  color: "#fff",
                  border: "1px solid #2a2a2a",
                }}
              >
                <option value="drugstore">Drugstore</option>
                <option value="mid">Mid</option>
                <option value="luxury">Luxury</option>
              </select>
            </label>

            <button
              type="submit"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 10,
                background:
                  "linear-gradient(135deg, #6ee7b7, #3b82f6)",
                color: "#000",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
              }}
            >
              Get Recommendations
            </button>
          </form>
        </div>

        {/* Results */}
        {result && (
          <div
            style={{
              background: "#111",
              borderRadius: 16,
              padding: 24,
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            }}
          >
            <h2 style={{ marginBottom: 8 }}>
              Top Recommendation
            </h2>

            <p>
              <strong>
                {result.coreRecommendation.brand}
              </strong>{" "}
              — {result.coreRecommendation.name} ($
              {result.coreRecommendation.price})
            </p>

            <p style={{ opacity: 0.7 }}>
              Match confidence:{" "}
              {result.coreRecommendation.confidence}%
            </p>

            <ul>
              {result.coreRecommendation.reasons.map(
                (reason: string, i: number) => (
                  <li key={i}>{reason}</li>
                )
              )}
            </ul>

            <h3 style={{ marginTop: 24 }}>Alternatives</h3>
            <ul>
              {result.alternatives.map((p: any, i: number) => (
                <li key={i}>
                  <strong>{p.brand}</strong> — {p.name}{" "}
                  <span style={{ opacity: 0.7 }}>
                    (${p.price}, {p.confidence}% fit)
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
