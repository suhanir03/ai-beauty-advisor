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
  priceTier: Budget;
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

  if (product.priceTier === survey.budget) score += 2;

  return score;
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
      priceTier: "mid", // hardcoded for MVP
      skinTypes: inferred.skinTypes,
      concerns: inferred.concerns,
      heroIngredients: inferred.heroIngredients,
    };
  });

  const ranked = products
    .map((product) => ({
      product,
      score: scoreProduct(product, survey),
    }))
    .sort((a, b) => b.score - a.score);

  const [core, alt1, alt2] = ranked;

  return Response.json({
    coreRecommendation: core?.product,
    alternatives: [alt1?.product, alt2?.product].filter(Boolean),
  });
}

