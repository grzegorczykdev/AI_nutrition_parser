import os
from dotenv import load_dotenv
from google import genai
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
async def analyze_meal_with_ai(description: str) -> MealAnalysis:
    response = client.models.generate_content(
        model="gemini-3.1-flash-lite",
        contents=[
            "You are an expert clinical dietitian with 10 years of experience. Analyze the meal description provided. "
            "1. Calculate calories and macronutrients (protein, fat, carbs) for each item. "
            "2. Determine the overall Glycemic Index (Low, Medium, or High). "
            "3. Evaluate if the meal is balanced (ideal ratio: 20-30% protein, 25-35% fat, 45-55% carbs). "
            "4. Provide a summary with tips to improve the meal's nutritional profile.",
            f"Meal description: {description}",
        ],
        config={
            "response_mime_type": "application/json",
            "response_schema": MealAnalysis,
        },
    )

    return response.parsed
