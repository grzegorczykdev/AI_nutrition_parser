from pydantic import BaseModel, Field
from typing import List

class Ingredient(BaseModel):
    name: str = Field(description="Nazwa produktu, np. 'Jabłko'")
    amount: float = Field(description="Ilość (liczba)")
    unit: str = Field(description="Jednostka, np. 'g', 'ml', 'sztuka'")
    calories: int = Field(description="Przybliżona liczba kalorii")

class MealAnalysis(BaseModel):
    items: List[Ingredient]
    total_calories: int
    health_score: int = Field(ge=1, le=10, description="Ocena zdrowotna posiłku od 1 do 10")
    summary: str = Field(description="Krótki komentarz dietetyczny")