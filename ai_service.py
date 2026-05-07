import os
import google.generativeai as genai
from models import MealAnalysis

genai.configure(api_key="YOUR_GEMINI_API_KEY")

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