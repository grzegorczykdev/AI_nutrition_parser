import os
from dotenv import load_dotenv
from google import genai
from google.genai import types
from models import MealAnalysis
from tenacity import retry, stop_after_attempt, wait_exponential


load_dotenv()

api_key = os.getenv("YOUR_GEMINI_API_KEY")

if not api_key:
    raise ValueError("YOUR_GEMINI_API_KEY is not set in the environment!")

client = genai.Client(api_key=api_key)


@retry(
    stop=stop_after_attempt(5),
    wait=wait_exponential(multiplier=1, min=2, max=10),
)
async def analyze_meal_with_ai(
    description: str,
    image_bytes: bytes | None = None,
    image_mime_type: str | None = None,
) -> MealAnalysis:
    prompt = (
        "You are an expert clinical dietitian with 10 years of experience. "
        "Your task is to provide a precise nutritional analysis of a meal based on text, image, or both. "
        "PRECISION & SCALE RULES:"
        "- Visual Scaling: If an image is provided, look for reference objects (cutlery, hands, standard-sized plates) to estimate portion sizes accurately. "
        "- Text Priority: The user's text description is the SUPREME TRUTH. If the user says 'airfried without oil', do NOT assume any hidden fats even if the food looks shiny. If the user specifies weights or quantities, use them exactly."
        "RAW WEIGHT CONVERSION RULES (CRITICAL):"
        "- All weights in the 'items' list must represent the RAW (pre-thermal processing) weight of the ingredient. "
        "- If you see cooked food, perform an internal conversion: "
        "  * For Meat/Fish: Assume ~25% weight loss (shrinkage). If you see 90g of cooked chicken, report it as ~120g RAW. "
        "  * For Grains/Pasta/Rice: Assume weight gain. If you see 200g of cooked rice, report it as ~65-70g RAW. "
        "- Ensure that the calories calculated reflect these RAW weights to maintain clinical accuracy."
        "DIETETIC ASSUMPTIONS (Invisible Ingredients - Only if NOT contradicted by text):"
        "- Hidden Fats: If vegetables or meat appear shiny AND the user did NOT mention a cooking method like 'air-fried' or 'no oil', assume 1 tsp (5g) of cooking oil per serving. "
        "- Salad Dressings: If a salad is present without a mentioned dressing, assume 1 tbsp (15ml) of vinaigrette. "
        "ANALYSIS GOALS:"
        "1. Calculate calories and macros (protein, fat, carbs) based on RAW weights. "
        "2. Provide an overall meal_score on a 1-10 scale. "
        "3. Determine Glycemic Index (Low, Medium, High). "
        "4. Evaluate Balance (20-30% P, 25-35% F, 45-55% C). "
        "5. ACTIONABLE SUMMARY RULES (Strict Formatting):"
        "- INTERNAL LOGIC ONLY: Identify Sweet vs Savory, but do NOT use these words in summary. "
        "- CONDITIONAL SUGGESTIONS: "
        "  * IF meal_score >= 8: No suggestions. Provide positive reinforcement. "
        "  * IF meal_score < 8: Suggest 1-2 culinarily compatible additions (e.g., spinach for savory, walnuts for sweet). "
        "- Be specific and empathetic. Explain WHY an addition helps (only if score < 8)."
    )

    user_context = (
        f"Meal description: {description}"
        if description
        else "No text description provided. Infer meal details from the image."
    )

    contents: list[str | types.Part] = [prompt, user_context]
    if image_bytes:
        contents.append(
            types.Part.from_bytes(
                data=image_bytes,
                mime_type=image_mime_type or "image/jpeg",
            )
        )

    response = client.models.generate_content(
        model="gemini-3.1-flash-lite",
        contents=contents,
        config={
            "response_mime_type": "application/json",
            "response_schema": MealAnalysis,
        },
    )

    return response.parsed
