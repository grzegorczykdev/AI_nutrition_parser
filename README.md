# 🥗 High-Precision AI Nutritionist

![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react)
![Gemini](https://img.shields.io/badge/Gemini_3.1-8E75B2?style=for-the-badge&logo=google-gemini)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

> **Advanced AI Meal Analysis** — a full-stack reference implementation for multimodal vision analysis, featuring deterministic calorie guardrails and cost-aware autonomous verification.

---

## 👁️ Project Vision

Standard nutrition trackers often suffer from high error margins due to "invisible" data points: cooking oils, alcohol impact, and the significant mass difference between **raw** and **cooked** ingredients. 

This project demonstrates a **Domain-Driven AI approach** to solve these inaccuracies. By combining **expert-level prompt engineering** with **automated validation layers**, the system ensures that vision-based estimates remain mathematically consistent and clinically plausible.

---

## 🛠️ Core Engineering Pillars

### ⚡ Performance & Optimization
* **Edge-Side Compression:** Images are processed via `browser-image-compression` (Web Workers) to < 1MB before upload, drastically reducing TTFT (Time to First Token) on mobile networks.
* **Efficient Transport:** Implements `multipart/form-data` to handle binary transfers directly, avoiding the overhead of Base64 encoding.

### 💰 Cost-Efficiency (Hybrid Validation Model)
To optimize operational costs (OpEx) while maintaining high accuracy, the system uses a tiered execution path:
1.  **Primary Analysis:** `gemini-3.1-flash-lite` generates the initial structured `MealAnalysis`.
2.  **Deterministic Guardrail:** A Python-based validator recomputes the energy balance using a **modified Atwater model**:
    `Total Kcal ≈ (P * 4) + ((C - Fiber) * 4) + (Fiber * 2) + (F * 9) + (Alcohol * 7)`
3.  **Conditional Judge:** The high-reasoning `gemini-3.1-pro` is invoked **only if** the consistency check detects a discrepancy > 10%, performing an autonomous corrective audit.

### ⚖️ Technical Precision
* **Thermal Processing Logic:** AI prompts are engineered to perform internal raw-to-cooked weight conversions (e.g., accounting for moisture loss in proteins).
* **Context-Aware Heuristics:** The system identifies flavor profiles (Sweet vs. Savory) to provide culinarily compatible suggestions for balancing macro-nutrient ratios.
* **Invisible Macro Tracking:** Backend support for Fiber and Alcohol density, ensuring metabolic accuracy even when simplified for the end-user.

---

## 📐 System Architecture

```mermaid
graph TD
    User([User Image + Text]) --> Front[React: Client-Side Compression]
    Front --> API[FastAPI: Logic Orchestrator]
    API --> Flash[Gemini 3.1 Flash: Initial Analysis]
    Flash --> Math{Math Consistency Check?}
    Math -- Within 10% Margin --> Success[Final Verified Result]
    Math -- Discrepancy Found --> Judge[Gemini 3.1 Pro: Corrective Audit]
    Judge --> Success
    Success --> UI[React: Metabolic Snapshot]

    ## 🚀 Key Technical Solutions

### The Hallucination Barrier: Triggered Judge Pattern
LLMs can occasionally produce "hallucinated" JSON that violates basic physics. This project implements a **self-correcting pipeline**: if the deterministic validator flags a mismatch, the flawed draft is sent to a secondary "Judge" model for a corrective pass. This ensures data integrity without the high latency/cost of using heavy models for every request.

### Reliability & Resiliency
Built for production stability using **Exponential Backoff** via `Tenacity`. The system gracefully handles transient API failures (503, 429) across multiple attempts, shielding the user from infrastructure instability.

### Security First
Zero-leaked secrets policy. API keys and deployment configurations are strictly managed via `python-dotenv`. The `.env` file is explicitly gitignored, ensuring that sensitive data never ships with the repository.

## 🧰 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite 8, Tailwind CSS 4, Framer Motion |
| **Backend** | Python 3.12+, FastAPI, Pydantic v2 (Strict Mode), Uvicorn |
| **AI/ML** | Google Gemini 3.1 (Flash & Pro), Structured Schema Generation |
| **Tooling** | `uv` (Package Management), Tenacity (Retries), ESLint |

## 🔮 Roadmap
- [ ] **Long-Term Memory:** Implementation of RAG (Retrieval-Augmented Generation) using `pgvector` for personalized trend analysis.
- [ ] **Voice-to-Meal:** Implementation of hands-free logging via Gemini Audio-to-Text.
- [ ] **API Integration:** Syncing with OpenFoodFacts for verified barcode scanning.

## 🔧 Installation

### Backend
```bash
# Clone the repository
git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
cd your-repo-name

# Setup environment and sync dependencies
uv sync
cp .env.example .env # Add your YOUR_GEMINI_API_KEY
uv run main.py

### Frontend
```bash
cd frontend
npm install
npm run dev

## ⚠️ Disclaimer
*This project is an engineering portfolio piece. AI-generated nutritional estimates are for informational purposes only and do not constitute professional medical advice.*