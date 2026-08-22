import os
import json
import re
import urllib.request
import urllib.error
import urllib.parse
from datetime import datetime, timedelta
from typing import List, Optional
from pydantic import BaseModel, Field

# ############################################################################
# ############################################################################
# >>> READ THIS: PUT YOUR REAL API KEY BELOW. DELETE THE WORDS "PUT_REAL_API_ONLY" AND PASTE YOUR KEY <<<
GEMINI_API_KEY = "AQ.Ab8RN6I3go9Ihx3vezqcomLv4HQczbZDbbiZS9E4A0Bapc-_aw"
# ############################################################################
# ############################################################################


class WhyReason(BaseModel):
    title: str = ""
    explanation: str = ""
    score_metrics: List[str] = []

class BookingLink(BaseModel):
    provider_name: str
    url: str

class GroundTransferOption(BaseModel):
    name: str
    cost_usd: float
    duration_mins: int
    booking_link: Optional[str] = None
    how_to_use: str
    why_recommended: str

class FlightLeg(BaseModel):
    airline: str = ""
    flight_number: str = ""
    departure_time: str = ""
    arrival_time: str = ""
    origin_airport: str = ""
    dest_airport: str = ""
    duration: str = ""

class VehicleCostBreakdown(BaseModel):
    fuel_or_charge_type: str = ""
    roundtrip_distance_km: float = 0.0
    estimated_fuel_or_ev_cost_usd: float = 0.0
    hgs_bridge_and_highway_tolls_usd: float = 0.0
    total_vehicle_expenses_usd: float = 0.0

class TransportItem(BaseModel):
    mode: str
    is_feasible: bool = True
    feasibility_warning: Optional[str] = None
    carrier_summary: str
    outbound_leg: Optional[FlightLeg] = None
    return_leg: Optional[FlightLeg] = None
    cost_per_adult_usd: float
    cost_per_child_usd: float
    total_transport_cost_usd: float
    vehicle_breakdown: Optional[VehicleCostBreakdown] = None
    booking_links: List[BookingLink] = []
    ground_transfers: List[GroundTransferOption] = []
    why: WhyReason

class HotelItem(BaseModel):
    name: str
    stars: int
    aggregated_rating_10: float
    reviews_count: int
    rooms_booked: int
    meal_board_type: str
    price_per_room_per_night_usd: float
    total_hotel_cost_usd: float
    distance_to_center_km: float
    distance_to_airport_or_station_km: float
    location_tag: str
    has_private_beach: bool = False
    has_aquapark: bool = False
    has_pool: bool = False
    has_spa: bool = False
    image_url: str = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80"
    booking_links: List[BookingLink] = []
    why: WhyReason

class ActivityItem(BaseModel):
    time_slot: str
    place_name: str
    category: str
    distance_from_hotel_km: float
    transport_mode: str
    transport_cost_usd: float
    entry_ticket_adult_usd: float
    entry_ticket_child_usd: float
    aggregated_rating_10: float
    image_url: str = "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=500&auto=format&fit=crop&q=80"
    map_url: str
    transit_card_tip: str = ""
    why: WhyReason

class RestaurantItem(BaseModel):
    meal_type: str
    restaurant_name: str
    cuisine: str
    distance_from_hotel_km: float
    estimated_cost_per_adult_usd: float
    estimated_cost_per_child_usd: float
    aggregated_rating_10: float
    image_url: str = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80"
    map_url: str
    why: WhyReason

class DayPlan(BaseModel):
    day_number: int
    day_title: str
    breakfast_banner: str
    lunch_banner: Optional[str] = None
    dinner_banner: Optional[str] = None
    breakfast_restaurant: Optional[RestaurantItem] = None
    activities: List[ActivityItem] = []
    restaurants: List[RestaurantItem] = []

class DepartureDayBuffer(BaseModel):
    departure_mode: str
    checkout_time: str = "12:00"
    lunch_spot_near_hub: Optional[RestaurantItem] = None
    time_spent_at_lunch: str = ""
    transit_time_to_hub_mins: int = 15
    required_safety_buffer_mins: int = 30
    return_departure_time: str = ""
    arrival_at_home_time: str = ""
    optional_home_arrival_dinner: Optional[RestaurantItem] = None
    activities_before_departure: List[ActivityItem] = []
    recommended_final_meal: Optional[RestaurantItem] = None
    distance_from_final_spot_to_terminal_km: float = 3.0
    transit_time_to_terminal_mins: int = 15
    why: WhyReason

class TripCostBreakdown(BaseModel):
    hotel_total_usd: float
    transport_total_usd: float
    food_budget_total_usd: float
    activities_and_transfers_usd: float
    grand_total_usd: float

class TripPlanResponse(BaseModel):
    destination_city: str
    origin_city: str
    adults_count: int
    children_count: int
    rooms_count: int
    total_travelers: int
    meal_board: str
    grand_total_trip_cost_usd: float
    date_window: dict
    transportation: TransportItem
    hotel: HotelItem
    daily_schedule: List[DayPlan]
    departure_day_buffer: DepartureDayBuffer
    cost_breakdown: TripCostBreakdown


class TravelAIEngine:
    def __init__(self):
        self.gemini_key = GEMINI_API_KEY

    def generate_plan(self, data: dict) -> TripPlanResponse:
        if "PUT_REAL_API_ONLY" in self.gemini_key or len(self.gemini_key) < 20:
            raise ValueError("STOP: You forgot to put your real API key on line 10 of ai_engine.py!")
        
        nights = int(data.get("nights", 3))
        start_date = datetime.now() + timedelta(days=7)
        end_date = start_date + timedelta(days=nights)
        data["dep_date"] = start_date.strftime("%Y-%m-%d")
        data["ret_date"] = end_date.strftime("%Y-%m-%d")
        
        return self._call_gemini_search(data)

    def _call_gemini_search(self, data: dict) -> TripPlanResponse:
        lang = data.get("language", "tr")
        lang_instruction = "Turkish" if lang == "tr" else "Arabic" if lang == "ar" else "English"
        dest = data.get("destination", "Edirne")
        orig = data.get("origin", "Bursa")
        dep_date = data.get("dep_date", "2026-10-12")
        ret_date = data.get("ret_date", "2026-10-15")
        adults = data.get("adults_count", 2)
        children = data.get("children_count", 0)
        
        system_prompt = f"""You are VoyageAI, a travel agent for Turkey. Output ALL text in {lang_instruction}.
RULES:
1. NO HALLUCINATIONS: Use ONLY real places that actually exist in {dest}.
2. NO REPETITION: Day 1, Day 2, Day 3 MUST have completely different restaurants and activities.
3. TRANSPORT LINKS: For buses use https://www.obilet.com/otobus-bileti/{orig.lower()}-{dest.lower()}?date={dep_date}
4. HOTEL LINKS: For hotels use https://www.hotels.com/search.do?destination={dest}&f-lid={dep_date},{ret_date}&adults={adults}&children={children}
5. MAP LINKS: Use https://www.google.com/maps/search/?api=1&query=PLACE+{dest} (replace PLACE with the venue name)
6. TRANSFERS: Give exact micro-directions (e.g. "Walk 100m to X Station, take bus 44 to Y Station").
USER DATA: {json.dumps(data)}

CRITICAL: Return ONLY raw JSON. Do NOT use markdown codeblocks like ```json. Start with '{' and end with '}'."""
        
        payload = {"contents": [{"parts": [{"text": system_prompt}]}], "generationConfig": {"temperature": 0.2}}
        
        # Tries all possible model combinations to guarantee connection
        urls_to_try = [
            f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.gemini_key}",
            f"https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key={self.gemini_key}",
            f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={self.gemini_key}",
            f"https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key={self.gemini_key}"
        ]

        for url in urls_to_try:
            model_name = url.split("/models/")[1].split(":")[0]
            try:
                print(f"[System] Trying {model_name}...")
                req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers={"Content-Type": "application/json"})
                
                with urllib.request.urlopen(req, timeout=90) as resp:
                    result = json.loads(resp.read().decode("utf-8"))
                    text_content = "".join([part.get("text", "") for part in result["candidates"][0].get("content", {}).get("parts", [])]).strip()
                    
                    if "```json" in text_content:
                        text_content = text_content.split("```json")[1].split("```")[0].strip()
                    elif "```" in text_content:
                        text_content = text_content.split("```")[1].split("```")[0].strip()
                    
                    json_match = re.search(r'\{.*\}', text_content, re.DOTALL)
                    if not json_match:
                        raise ValueError("AI did not return valid JSON.")
                    
                    print(f"[System] SUCCESS! Connected via {model_name}.")
                    return TripPlanResponse(**json.loads(json_match.group(0)))
                    
            except urllib.error.HTTPError as e:
                print(f"[Failed] {model_name} -> Error {e.code}")
                continue 
            except Exception as e:
                print(f"[Failed] {model_name} -> Parsing error")
                continue
        
        raise ValueError("All models failed. Your API key is restricted or broken.")
    
#http://127.0.0.1:8000 