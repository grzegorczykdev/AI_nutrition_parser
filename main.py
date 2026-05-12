from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from models import MealAnalysis
from ai_service import analyze_meal_with_ai
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="AI Nutrition Parser")

# Konfiguracja CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Adres Twojego Reacta
    allow_credentials=True,
    allow_methods=["*"],  # Pozwala na wszystkie metody (GET, POST itd.)
    allow_headers=["*"],  # Pozwala na wszystkie nagłówki
)


@app.post("/analyze", response_model=MealAnalysis)
async def analyze_endpoint(
    meal_description: str = Form(default=""),
    file: UploadFile | None = File(default=None),
):
    """
    Przyjmuje opis posiłku i opcjonalne zdjęcie, zwraca analizę AI.
    """
    try:
        normalized_description = meal_description.strip()
        image_bytes: bytes | None = None
        image_mime_type: str | None = None

        if file is not None:
            image_bytes = await file.read()
            image_mime_type = file.content_type or "image/jpeg"

        if not normalized_description and not image_bytes:
            raise HTTPException(
                status_code=422,
                detail="Provide at least one input: meal_description or file.",
            )

        result = await analyze_meal_with_ai(
            description=normalized_description,
            image_bytes=image_bytes,
            image_mime_type=image_mime_type,
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
