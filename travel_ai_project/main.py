import os
import uvicorn
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from typing import Optional, List

from ai_engine import TravelAIEngine

app = FastAPI(title="VoyageAI - Live Travel Intelligence Engine")

app.mount("/static", StaticFiles(directory="static"), name="static")

# Initialize engine
try:
    engine = TravelAIEngine()
except Exception as e:
    print(f"Warning: {e}")
    engine = None

class TripRequestPayload(BaseModel):
    origin: str
    destination: str
    adults_count: int
    children_count: int
    nights: int
    transport_mode: str
    budget_type: str
    budget_amount: Optional[float] = None
    hotel_min_rating: float
    hotel_location: str
    amenities: List[str] = []
    has_beach: bool = False
    meal_board: str
    special_notes: Optional[str] = ""
    language: str = "en"

@app.get("/")
async def serve_index():
    return FileResponse(os.path.join("templates", "index.html"))

@app.post("/api/plan-trip")
async def plan_trip_api(payload: TripRequestPayload):
    global engine
    if engine is None:
        try:
            engine = TravelAIEngine()
        except Exception as e:
            return JSONResponse(status_code=500, content={
                "success": False, 
                "error": "OpenAI API Key is missing. Please add your OPENAI_API_KEY inside the .env file so the AI can search and generate live itineraries."
            })
    try:
        plan = engine.generate_plan(payload.model_dump())
        return JSONResponse(content={"success": True, "data": plan.model_dump()})
    except Exception as e:
        return JSONResponse(status_code=500, content={"success": False, "error": str(e)})

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)