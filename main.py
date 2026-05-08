from fastapi import FastAPI, HTTPException
from models import MealAnalysis
from ai_service import analyze_meal_with_ai
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="AI Nutrition Parser")


class AnalyzeRequest(BaseModel):
    meal_description: str

# Konfiguracja CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Adres Twojego Reacta
    allow_credentials=True,
    allow_methods=["*"],  # Pozwala na wszystkie metody (GET, POST itd.)
    allow_headers=["*"],  # Pozwala na wszystkie nagłówki
)


@app.post("/analyze", response_model=MealAnalysis)
async def analyze_endpoint(payload: AnalyzeRequest):
    """
    Przyjmuje tekstowy opis posiłku i zwraca ustrukturyzowaną analizę AI.
    """
    try:
        # Wywołanie serwisu AI
        result = await analyze_meal_with_ai(payload.meal_description)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
