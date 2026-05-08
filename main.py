from fastapi import FastAPI, HTTPException
from models import MealAnalysis
from ai_service import analyze_meal_with_ai

app = FastAPI(title="AI Nutrition Parser")

@app.post("/analyze", response_model=MealAnalysis)
async def analyze_endpoint(meal_description: str):
    """
    Przyjmuje tekstowy opis posiłku i zwraca ustrukturyzowaną analizę AI.
    """
    try:
        # Wywołanie serwisu AI
        result = await analyze_meal_with_ai(meal_description)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)