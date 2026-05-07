import os
import google.generativeai as genai
from models import MealAnalysis

# Load the key from the environment variable
api_key = os.getenv("YOUR_GEMINI_API_KEY")

if not api_key:
    raise ValueError("YOUR_GEMINI_API_KEY is not set in the environment!")

genai.configure(api_key=api_key)

async def analyze_meal_with_ai(description: str) -> MealAnalysis:
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    prompt = f"""
    You are a professional dietitian. Analyze the following meal description 
    and provide a detailed nutritional breakdown.
    
    Meal: {description}
    """

    response = model.generate_content(
        prompt,
        generation_config=genai.GenerationConfig(
            response_mime_type="application/json",
            response_schema=MealAnalysis
        )
    )

    return MealAnalysis.model_validate_json(response.text)