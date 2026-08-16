import os
import uvicorn
from pathlib import Path
from typing import Optional, List, Any, Union
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel

from ai_engine import TravelAIEngine

BASE_DIR = Path(__file__).resolve().parent

app = FastAPI(title="VoyageAI - Live Travel Intelligence Engine")

# Mount static files
app.mount("/static", StaticFiles(directory=str(BASE_DIR / "static")), name="static")

# Catch validation errors and return clear error messages
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=400,
        content={"success": False, "error": f"Invalid form input: {str(exc.errors()[0]['msg'])}"}
    )

# Flexible Payload Schema (Accepts both numbers and strings safely)
class TripRequestPayload(BaseModel):
    origin: str
    destination: str
    adults_count: int = 2
    children_count: int = 0
    rooms_count: Optional[Union[str, int]] = "2"
    child_age: Optional[Union[str, int]] = 10
    nights: int = 3
    transport_mode: str = "public_smart"
    budget_type: str = "cheapest_best"
    budget_amount: Optional[float] = None
    hotel_min_rating: float = 8.5
    hotel_location: str = "near_sea"
    amenities: List[str] = []
    has_beach: bool = False
    meal_board: str = "allinclusive"
    special_notes: Optional[str] = ""
    language: str = "en"

@app.get("/")
async def serve_index():
    index_file = BASE_DIR / "templates" / "index.html"
    return FileResponse(index_file)

@app.post("/api/plan-trip")
async def plan_trip_api(payload: TripRequestPayload):
    try:
        engine = TravelAIEngine()
        plan = engine.generate_plan(payload.model_dump())
        return JSONResponse(content={"success": True, "data": plan.model_dump()})
    except Exception as e:
        return JSONResponse(status_code=500, content={"success": False, "error": str(e)})

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)