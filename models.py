from pydantic import BaseModel, Field
from typing import List


class Macros(BaseModel):
    protein: float = Field(description="Total protein in grams")
    fat: float = Field(description="Total fat in grams")
    carbs: float = Field(description="Total carbohydrates in grams")


class MealItem(BaseModel):
    name: str
    calories: int
    amount: str


class MealAnalysis(BaseModel):
    items: List[MealItem]
    total_calories: int
    meal_score: int = Field(ge=1, le=10, description="Overall meal quality score from 1 to 10")
    macros: Macros
    glycemic_index: str = Field(description="Rating: Low, Medium, or High")
    is_balanced: bool = Field(description="Whether the meal has a good ratio of P/F/C")
    summary: str
