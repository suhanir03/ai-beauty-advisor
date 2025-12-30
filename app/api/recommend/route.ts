import fs from "fs";
import path from "path";
import Papa from "papaparse";

/* ---------------- TYPES ---------------- */

type SkinType = "dry" | "oily" | "combination" | "sensitive";
type Concern = "acne" | "hyperpigmentation" | "aging" | "dryness";
type Budget = "drugstore" | "mid" | "luxury";

type SurveyResponse = {
  skinType: SkinType;
  concern: Concern;
  ingredientPreference?: string;
  budget: Budget;
};

type Product = {
  brand: string;
  name: string;
  price: number;
  skinTypes: SkinType[];
  concerns: Concern[];
  heroIngredients: string[];
};

/* ---------------- RULE-BASED MAPPINGS ---------------- */

const INGREDIENT_TO_CONCERN: Record<string, Concern[]> = {
  retinol: ["aging", "hyperpigmentation"],
  niacinamide: ["acne", "hyperpigmentation"],
  salicylic: ["acne"],
  benzoyl: ["acne"],
  hyaluronic: ["dryness"],
};

const INGREDIENT_TO_SKIN: Record<string, SkinType[]> = {
  retinol: ["dry", "combination"],
  salicylic: ["oily"],
  benzoyl: ["oily"],
  niacinamide: ["oily", "combination", "sensitive"],
  hyaluronic: ["dry", "sensitive"],
};
  const BUDGET_RANGES: Record<Budget, [number, number]> = {
  drugstore: [0, 15],
  mid: [15, 30],
  luxury: [30, Infinity],
    };

/* ---------------- HELPERS ---------------- */

function inferTagsFromIngredients(ingredientsRaw: string) {
  const lower = ingredientsRaw.toLowerCase();

  const concerns = new Set<Concern>();
  const skinTypes = new Set<SkinType>();
  const heroIngredients: string[] = [];

  for (const ingredient in INGREDIENT_TO_CONCERN) {
    if (lower.includes(ingredient)) {
      INGREDIENT_TO_CONCERN[ingredient].forEach((c) =>
        concerns.add(c)
      );
      heroIngredients.push(ingredient);
    }
  }

  for (const ingredient in INGREDIENT_TO_SKIN) {
    if (lower.includes(ingredient)) {
      INGREDIENT_TO_SKIN[ingredient].forEach((s) =>
        skinTypes.add(s)
      );
    }
  }

  return {
    concerns: Array.from(concerns),
    skinTypes: Array.from(skinTypes),
    heroIngredients,
  };
}

function scoreProduct(product: Product, survey: SurveyResponse) {
  let score = 0;

  if (product.skinTypes.includes(survey.skinType)) score += 3;
  if (product.concerns.includes(survey.concern)) score += 5;

  if (
    survey.ingredientPreference &&
    product.heroIngredients.includes(survey.ingredientPreference)
  ) {
    score += 2;
  }

  const [min, max] = BUDGET_RANGES[survey.budget];
  if (product.price >= min && product.price <= max) {
    score += 3;
  } else if (
    product.price >= min - 5 &&
    product.price <= max + 5
  ) {
    score +=1;
  } else {
    score -=2;
  }
  
  return score;
}

function generateReasons(product: Product, survey: SurveyResponse) {
  const reasons: string[] = [];

  if (product.concerns.includes(survey.concern)) {
    reasons.push(`Targets ${survey.concern}`);
  }

  if (product.skinTypes.includes(survey.skinType)) {
    reasons.push(`Suitable for ${survey.skinType} skin`);
  }

  if (
    survey.ingredientPreference &&
    product.heroIngredients.includes(
      survey.ingredientPreference.toLowerCase()
    )
  ) {
    reasons.push(`Contains ${survey.ingredientPreference}`);
  }


  if (reasons.length === 0) {
    reasons.push("Balanced formulation with broad compatibility");
  }

  return reasons;
}

function normalizeConfidence(score: number) {
  const MAX_SCORE = 12;
  const normalized = Math.round((score/MAX_SCORE) * 100);
  return Math.min(100, Math.max(0, normalized));
}

/* ---------------- API ROUTE ---------------- */

export async function POST(req: Request) {
  const survey: SurveyResponse = await req.json();

  const filePath = path.join(
    process.cwd(),
    "data",
    "synthetic_products.csv"
  );

  const csv = fs.readFileSync(filePath, "utf8");

  const parsed = Papa.parse(csv, {
    header: true,
    skipEmptyLines: true,
  });

  const products: Product[] = parsed.data.map((row: any) => {
    const inferred = inferTagsFromIngredients(
      row.ingredients_raw || ""
    );

    return {
      brand: row.brand,
      name: row.name,
      price: Number(row.price), // hardcoded for MVP
      skinTypes: inferred.skinTypes,
      concerns: inferred.concerns,
      heroIngredients: inferred.heroIngredients,
    };
  });

  const ranked = products
    .map((product) => {
      const score = scoreProduct(product, survey);

      return {
        product,
        score,
        confidence: normalizeConfidence(score),
        reasons: generateReasons(product, survey),
      };
    })
    .sort((a, b) => b.score - a.score);


  const [core, alt1, alt2] = ranked;

  return Response.json({
    coreRecommendation: {
      ...core?.product,
      confidence: core?.confidence,
      reasons:core?.reasons,
    },
    alternatives: [alt1, alt2]
      .filter(Boolean)
      .map((r) => ({
        ...r.product,
        confidence: r.confidence,
        reasons: r.reasons,
      })),
  });
}

