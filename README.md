# AI Beauty Advisor (MVP)

🔗 **Live Demo:** ai-beauty-advisor-one.vercel.app 
🎥 **Demo Video:** https://youtu.be/m2S1FONPZ5A

---

## Problem
Choosing skincare products is overwhelming due to ingredient complexity, unclear pricing tiers, and a lack of transparent personalization. Most existing recommendation tools act as black boxes, offering little insight into *why* a product was suggested.

---

## Solution
I built an AI-powered beauty advisor that generates **explainable, confidence-scored product recommendations** based on a user’s skin type, primary concern, ingredient preferences, and budget.

The system prioritizes transparency by:
- Explicitly scoring product fit
- Surfacing reasoning behind each recommendation
- Providing comparable alternatives within similar price ranges

Users can interact with the live prototype here:  
👉 ai-beauty-advisor-one.vercel.app 

---

## Data Source
The product dataset used in this MVP is synthetic data generated using AI to simulate realistic skincare products, ingredients, and pricing tiers.

This approach enabled rapid prototyping and validation of recommendation logic while keeping the system data-agnostic and ready for real product integrations.

---

## Tech Stack
- **Frontend:** Next.js (App Router), React, TypeScript
- **Backend:** Next.js API Routes
- **Recommendation Logic:** Rule-based scoring with ingredient inference
- **Data:** AI-generated synthetic CSV dataset
- **Deployment:** Vercel

---

## Impact
- Built an explainable recommendation engine with confidence scoring
- Demonstrated how rule-based systems can outperform black-box recommendations for early-stage personalization
- Delivered a production-ready MVP that can easily scale to real datasets with minimal refactoring

