import os
import uvicorn
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from typing import Optional

from ai_engine import TravelAIEngine

app = FastAPI(title="AI Travel Master - Algorithmic Itinerary System")

# Mount static folder
app.mount("/static", StaticFiles(directory="static"), name="static")

engine = TravelAIEngine()

class TripRequestPayload(BaseModel):
    origin: str
    destination: str
    transport_mode: str
    budget_type: str
    budget_amount: Optional[float] = None
    nights: int
    hotel_min_rating: float
    meal_board: str

@app.get("/")
async def serve_index():
    # Serves the HTML file directly, avoiding the Python 3.14 Jinja caching bug
    return FileResponse(os.path.join("templates", "index.html"))

@app.post("/api/plan-trip")
async def plan_trip_api(payload: TripRequestPayload):
    try:
        plan = engine.generate_plan(payload.model_dump())
        return JSONResponse(content={"success": True, "data": plan.model_dump()})
    except Exception as e:
        return JSONResponse(status_code=500, content={"success": False, "error": str(e)})

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)