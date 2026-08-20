import os
import json
import re
import urllib.request
import urllib.parse
from pathlib import Path
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(dotenv_path=BASE_DIR / ".env", override=True)
if not os.getenv("GEMINI_API_KEY") and not os.getenv("OPENAI_API_KEY"):
    load_dotenv(dotenv_path=BASE_DIR.parent / ".env", override=True)

# =========================================================================
# SCHEMAS FOR STRUCTURED ITINERARY OUTPUT
# =========================================================================

class WhyReason(BaseModel):
    title: str = Field(description="Short summary of algorithmic ranking decision")
    explanation: str = Field(description="Detailed justification based on real customer review sentiment and live rates")
    score_metrics: List[str] = Field(description="Score factor metrics")

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
    airline: str
    flight_number: str
    departure_time: str
    arrival_time: str
    origin_airport: str
    dest_airport: str
    duration: str

class VehicleCostBreakdown(BaseModel):
    fuel_or_charge_type: str
    roundtrip_distance_km: float
    estimated_fuel_or_ev_cost_usd: float
    hgs_bridge_and_highway_tolls_usd: float
    total_vehicle_expenses_usd: float

class TransportItem(BaseModel):
    mode: str
    is_feasible: bool
    feasibility_warning: Optional[str] = None
    carrier_summary: str
    outbound_leg: Optional[FlightLeg] = None
    return_leg: Optional[FlightLeg] = None
    cost_per_adult_usd: float
    cost_per_child_usd: float
    total_transport_cost_usd: float
    vehicle_breakdown: Optional[VehicleCostBreakdown] = None
    booking_links: List[BookingLink]
    ground_transfers: List[GroundTransferOption]
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
    has_private_beach: bool
    has_aquapark: bool
    has_pool: bool
    has_spa: bool
    image_url: str
    booking_links: List[BookingLink]
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
    image_url: str
    map_url: str
    transit_card_tip: str
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
    activities: List[ActivityItem]
    restaurants: List[RestaurantItem]

class DepartureDayBuffer(BaseModel):
    departure_mode: str
    checkout_time: str = "12:00"
    lunch_spot_near_hub: RestaurantItem
    time_spent_at_lunch: str
    transit_time_to_hub_mins: int
    required_safety_buffer_mins: int
    return_departure_time: str
    arrival_at_home_time: str
    optional_home_arrival_dinner: Optional[RestaurantItem] = None
    activities_before_departure: List[ActivityItem] = []
    recommended_final_meal: RestaurantItem
    distance_from_final_spot_to_terminal_km: float
    transit_time_to_terminal_mins: int
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

# =========================================================================
# TRANSPORT FEASIBILITY DATA
# =========================================================================

ALL_TURKISH_AIRPORTS = {
    "Adana": "ADA", "Adıyaman": "ADF", "Afyonkarahisar": "AFY", "Ağrı": "AJI", "Aksaray": "ASR",
    "Amasya": "MZH", "Ankara": "ESB", "Antalya": "AYT", "Ardahan": "KSY", "Artvin": "RZV",
    "Aydın": "ADB", "Balıkesir": "EDO", "Bartın": "ONQ", "Batman": "BAL", "Bayburt": "RZV",
    "Bilecik": "YEI", "Bingöl": "BGG", "Bitlis": "VAN", "Bolu": "SAW", "Burdur": "ISE",
    "Bursa": "YEI", "Çanakkale": "CKZ", "Çankırı": "ESB", "Çorum": "MZH", "Denizli": "DNZ",
    "Diyarbakır": "DIY", "Düzce": "SAW", "Edirne": "TEQ", "Elazığ": "EZS", "Erzincan": "ERC",
    "Erzurum": "ERZ", "Eskişehir": "AOE", "Gaziantep": "GZT", "Giresun": "OGU", "Gümüşhane": "OGU",
    "Hakkâri": "YKO", "Hatay": "HTY", "Iğdır": "IGD", "Isparta": "ISE", "İstanbul": "IST",
    "Istanbul": "IST", "İzmir": "ADB", "Izmir": "ADB", "Kahramanmaraş": "KCM", "Karabük": "ONQ",
    "Karaman": "KYA", "Kars": "KSY", "Kastamonu": "KFS", "Kayseri": "ASR", "Kırıkkale": "ESB",
    "Kırklareli": "TEQ", "Kırşehir": "NAV", "Kilis": "GZT", "Kocaeli": "KCO", "Konya": "KYA",
    "Kütahya": "KZR", "Malatya": "MLX", "Manisa": "ADB", "Mardin": "MQM", "Mersin": "ADA",
    "Muğla": "BJV", "Muş": "MSR", "Nevşehir": "NAV", "Niğde": "NAV", "Ordu": "OGU",
    "Osmaniye": "ADA", "Rize": "RZV", "Sakarya": "SAW", "Samsun": "SZF", "Siirt": "SXZ",
    "Sinop": "NOP", "Sivas": "VAS", "Şanlıurfa": "GNY", "Şırnak": "NKT", "Tekirdağ": "TEQ",
    "Tokat": "TJK", "Trabzon": "TZX", "Tunceli": "EZS", "Uşak": "USQ", "Van": "VAN",
    "Yalova": "SAW", "Yozgat": "VAS", "Zonguldak": "ONQ"
}

YHT_TRAIN_CITIES = {"İstanbul", "Istanbul", "Ankara", "Eskişehir", "Konya", "Karaman", "Sivas", "Yozgat", "Kırıkkale", "Bilecik", "Sakarya", "Kocaeli"}

FERRY_FEASIBLE_PAIRS = {
    ("Bursa", "İstanbul"), ("İstanbul", "Bursa"), ("Bursa", "Istanbul"), ("Istanbul", "Bursa"),
    ("Yalova", "İstanbul"), ("İstanbul", "Yalova"), ("Yalova", "Istanbul"), ("Istanbul", "Yalova"),
    ("Balıkesir", "İstanbul"), ("İstanbul", "Balıkesir"), ("Çanakkale", "Tekirdağ"), ("Tekirdağ", "Çanakkale")
}


class TravelAIEngine:
    def __init__(self):
        raw_gemini = os.getenv("GEMINI_API_KEY", "")
        self.gemini_key = raw_gemini.strip().strip("'").strip('"')

        raw_openai = os.getenv("OPENAI_API_KEY", "")
        self.openai_key = raw_openai.strip().strip("'").strip('"')

    def generate_plan(self, data: dict) -> TripPlanResponse:
        # Check transport feasibility first
        origin = data.get("origin", "").strip()
        destination = data.get("destination", "").strip()
        transport = data.get("transport_mode", "Bus")

        if transport == "Train":
            if origin not in YHT_TRAIN_CITIES or destination not in YHT_TRAIN_CITIES:
                raise ValueError(f"No YHT train line between {origin} and {destination}. Please choose Bus or Plane instead.")

        if transport in ["Passenger Ferry", "Car Ferry"]:
            pair = (origin, destination)
            if pair not in FERRY_FEASIBLE_PAIRS:
                raise ValueError(f"No ferry route between {origin} and {destination}. Please choose Bus or Plane instead.")

        # Calculate travel dates
        today = datetime.now()
        dep_date = today + timedelta(days=5)
        nights = max(1, int(data.get("nights", 3)))
        ret_date = dep_date + timedelta(days=nights)
        data["_dep_date"] = dep_date.strftime("%Y-%m-%d")
        data["_ret_date"] = ret_date.strftime("%Y-%m-%d")
        data["_dep_date_display"] = dep_date.strftime("%d %B %Y")
        data["_ret_date_display"] = ret_date.strftime("%d %B %Y")

        # 1. LIVE GEMINI SEARCH GROUNDING CALL
        if self.gemini_key and len(self.gemini_key) > 15:
            try:
                return self._call_gemini_search(data)
            except Exception as e:
                print(f"[Gemini API Error: {e}]")
                raise ValueError(f"AI search failed: {str(e)}. Please check your API key or try again.")

        # 2. LIVE OPENAI CALL
        if self.openai_key and len(self.openai_key) > 15:
            try:
                return self._call_openai_live(data)
            except Exception as e:
                print(f"[OpenAI API Error: {e}]")
                raise ValueError(f"AI search failed: {str(e)}. Please check your API key or try again.")

        raise ValueError("No AI API key configured. Please add GEMINI_API_KEY or OPENAI_API_KEY to the .env file.")

    def _build_search_prompt(self, data: dict) -> str:
        lang = data.get("language", "tr")
        origin = data.get("origin", "Bursa").strip()
        destination = data.get("destination", "Düzce").strip()
        adults = int(data.get("adults_count", 2))
        children = int(data.get("children_count", 0))
        child_age = int(data.get("child_age", 10))
        rooms = int(data.get("rooms_count", 2))
        nights = int(data.get("nights", 3))
        transport_mode = data.get("transport_mode", "Bus")
        meal_board = data.get("meal_board", "breakfast_only")
        hotel_min_rating = float(data.get("hotel_min_rating", 8.0))
        hotel_location = data.get("hotel_location", "city_center")
        amenities = data.get("amenities", [])
        has_beach = data.get("has_beach", False)
        dep_date = data.get("_dep_date", "2026-10-12")
        ret_date = data.get("_ret_date", "2026-10-15")
        total_travelers = adults + children

        lang_instruction = {
            "tr": "Respond entirely in Turkish (Türkçe).",
            "en": "Respond entirely in English.",
            "ar": "Respond entirely in Arabic (العربية)."
        }.get(lang, "Respond entirely in Turkish.")

        transport_instruction = ""
        if transport_mode == "Bus":
            transport_instruction = f"""
TRANSPORT: Intercity Bus (VIP Otobüs)
- Search for the BEST and CHEAPEST bus company operating {origin} to {destination} route.
- Find REAL bus companies (like Kamil Koç, Pamukkale, Metro, Süha, FlixBus Turkey etc.) that actually operate this route.
- Find actual departure times. Choose the best morning departure.
- Generate Obilet link: https://www.obilet.com/otobus-bileti/{{origin_slug}}-{{dest_slug}}/{{date_YYYY-MM-DD}} with real date {dep_date}
- For return: Find the best afternoon/evening departure on {ret_date}. Plan the departure day around this time.
- cost_per_adult_usd and cost_per_child_usd must reflect real current prices.
"""
        elif transport_mode == "Plane":
            orig_air = ALL_TURKISH_AIRPORTS.get(origin, "IST")
            dest_air = ALL_TURKISH_AIRPORTS.get(destination, "IST")
            transport_instruction = f"""
TRANSPORT: Flight ({orig_air} to {dest_air})
- Search for real flights from {origin} ({orig_air}) to {destination} ({dest_air}) on {dep_date}.
- Find the cheapest airline (THY, Pegasus, AJet, SunExpress) operating this route.
- Provide real flight numbers if possible, or realistic ones.
- Generate Google Flights link: https://www.google.com/travel/flights?q=Flights+to+{dest_air}+from+{orig_air}+on+{dep_date}+through+{ret_date}
- For ground transfer from airport to hotel: provide DETAILED step-by-step instructions.
  Example: "Exit the airport arrivals hall. HAVAŞ shuttle bus stop is 50m to your right. Take the HAVAŞ shuttle to {destination} city center (costs ~X TL, takes ~Y minutes). Get off at the last stop. Take a taxi or walk Z meters to the hotel."
  Or if public transport: "Take the airport tram/metro line X to station Y. Transfer to bus number Z. Get off at station W. The hotel is 100m ahead on your left."
  Or if private transfer is best: "Book a private transfer from {destination} airport via BiTaksi or Uber app. Estimated cost: X TL. Journey time: Y minutes. The car will drop you directly at the hotel entrance."
"""
        elif transport_mode == "Train":
            transport_instruction = f"""
TRANSPORT: YHT High-Speed Train (TCDD)
- Search for YHT trains from {origin} to {destination} on {dep_date}.
- Find departure times and prices from ebilet.tcddtasimacilik.gov.tr
- Generate TCDD link: https://ebilet.tcddtasimacilik.gov.tr/
- For ground transfer from train station to hotel: provide DETAILED step-by-step instructions.
  Example: "Exit {destination} Gar (train station). Walk 100m to the bus stop on your right. Take bus number XX going towards [direction]. Get off at stop [name]. Walk 200m - the hotel is on your left."
"""
        elif transport_mode == "Own Car":
            transport_instruction = f"""
TRANSPORT: Own Car (Gasoline/Diesel)
- Calculate the driving route from {origin} to {destination}.
- Find the actual distance in km (one-way and round-trip).
- Calculate HGS toll costs for ALL highways and bridges on the route (Osmangazi Bridge, 1915 Çanakkale Bridge, O-4 Anadolu Otoyolu, etc.)
- Estimate fuel cost: assume 7.5L/100km consumption, current fuel price ~45 TL/L in Turkey.
- Total transport cost = (roundtrip fuel cost + roundtrip toll costs) converted to USD.
- cost_per_adult_usd = total cost (since it's a shared car, don't divide by person)
- cost_per_child_usd = 0
- Provide Google Maps link: https://www.google.com/maps/dir/{origin}/{destination}
- No ground transfer needed (user has their car).
- In vehicle_breakdown: specify fuel_or_charge_type, roundtrip_distance_km, estimated_fuel_or_ev_cost_usd, hgs_bridge_and_highway_tolls_usd, total_vehicle_expenses_usd
"""
        elif transport_mode == "Own EV":
            transport_instruction = f"""
TRANSPORT: Own Electric Vehicle (EV)
- Calculate the driving route from {origin} to {destination}.
- Find the actual distance in km (one-way and round-trip).
- Calculate HGS toll costs for ALL highways and bridges on the route.
- Estimate charging cost: assume 18 kWh/100km consumption, average fast charging price ~10 TL/kWh (ZES, Trugo, Eşarj).
- Total transport cost = (roundtrip charging cost + roundtrip toll costs) converted to USD.
- cost_per_adult_usd = total cost (shared car)
- cost_per_child_usd = 0
- Provide Google Maps link: https://www.google.com/maps/dir/{origin}/{destination}
- No ground transfer needed.
- In vehicle_breakdown: specify all costs.
"""
        elif transport_mode == "Passenger Ferry":
            transport_instruction = f"""
TRANSPORT: Passenger Ferry (İDO / BUDO Sea Bus)
- Search for sea bus schedules from {origin} to {destination}.
- Find real departure times and prices.
- Generate booking link for BUDO or İDO.
- For ground transfer from ferry terminal to hotel: provide DETAILED step-by-step instructions.
"""
        elif transport_mode == "Car Ferry":
            transport_instruction = f"""
TRANSPORT: Car Ferry (İDO / GESTAŞ)
- Search for car ferry schedules from {origin} to {destination}.
- Find real departure times and prices (including car fee).
- Generate booking link for İDO or GESTAŞ.
- No ground transfer needed (user has their car on the ferry).
"""

        hotel_criteria = []
        if "beach" in amenities or has_beach:
            hotel_criteria.append("private beach or beachfront")
        if "aquapark" in amenities:
            hotel_criteria.append("aquapark / water slides")
        if "pool" in amenities:
            hotel_criteria.append("swimming pool")
        if "spa" in amenities:
            hotel_criteria.append("spa / Turkish bath (hamam)")

        location_desc = {
            "city_center": "in the city center, close to historical sites and shopping",
            "near_sea": "beachfront or very close to the sea (within 200m)",
            "nature": "surrounded by nature, mountains, or countryside",
            "quiet": "in a quiet, peaceful area away from noise"
        }.get(hotel_location, "in the city center")

        meal_desc = {
            "no_meals": "Room Only (no meals included) - AI must suggest breakfast, lunch, and dinner restaurants for each day",
            "breakfast_only": "Bed & Breakfast (only breakfast included) - AI must suggest lunch and dinner restaurants for each day",
            "halfboard": "Half Board (breakfast + dinner included) - AI must suggest lunch restaurants for each day",
            "fullboard": "Full Board (breakfast + lunch + dinner included) - No restaurant suggestions needed",
            "allinclusive": "All Inclusive - No restaurant suggestions needed"
        }.get(meal_board, "Bed & Breakfast")

        prompt = f"""
{lang_instruction}

You are VoyageAI, a REAL-TIME travel search engine for Turkey. You MUST use Google Search to find ACTUAL, CURRENTLY EXISTING hotels, restaurants, places, and transportation options.

ABSOLUTE RULES - VIOLATION MEANS FAILURE:
1. NEVER invent or hallucinate names. Every hotel, restaurant, and place MUST be a real, currently operating establishment that you verify exists through search.
2. NEVER use patterns like "Grand [City] Hotel", "[City] Tarihi Meydan", "[City] Ulu Camii" without verifying they actually exist in that specific city.
3. Every link MUST be a working URL with correct parameters (dates, guests, rooms).
4. Each day MUST have COMPLETELY DIFFERENT places and restaurants - NO repetition across days.
5. All prices must be realistic and current (2024-2025 Turkish market prices).

=== TRIP PARAMETERS ===
- Origin: {origin}
- Destination: {destination}
- Check-in: {dep_date}
- Check-out: {ret_date}
- Nights: {nights}
- Adults: {adults}
- Children: {children} (age: {child_age})
- Rooms needed: {rooms}
- Total travelers: {total_travelers}

=== TRANSPORT REQUIREMENTS ===
{transport_instruction}

=== HOTEL REQUIREMENTS ===
Search for a REAL hotel in {destination} with these criteria:
- Location: {location_desc}
- Minimum rating: {hotel_min_rating}/10 on Booking.com or Google
- Required amenities: {', '.join(hotel_criteria) if hotel_criteria else 'standard amenities'}
- Meal plan: {meal_desc}
- Must accommodate {rooms} room(s) for {adults} adults and {children} children

HOTEL BOOKING LINKS (ALL MUST WORK):
1. Booking.com: https://www.booking.com/searchresults.html?ss={{EXACT_HOTEL_NAME}}+{{city}}&checkin={dep_date}&checkout={ret_date}&group_adults={adults}&group_children={children}&no_rooms={rooms}&age={child_age}
2. Google Hotels: https://www.google.com/travel/hotels/{{city}}?q={{EXACT_HOTEL_NAME}}&dates={dep_date}%2C{ret_date}&adults={adults}&children={children}

Use the BEST and CHEAPEST algorithm: Among hotels that meet ALL the criteria above, find the one with the best rating-to-price ratio.

=== DAILY ITINERARY REQUIREMENTS ===
For {nights} days, provide UNIQUE content each day:
- Search for the TOP tourist attractions, historical sites, natural wonders, and activities in {destination}.
- Rank them by: (rating * 0.4) + (uniqueness * 0.3) + (cost_efficiency * 0.3)
- Day 1 gets the #1 and #2 ranked places. Day 2 gets #3 and #4. Day 3 gets #5 and #6. And so on.
- EVERY place must be REAL and VERIFIED to exist in {destination}.
- For restaurants: search for the most famous local foods of {destination} and find the REAL best-rated restaurants that serve them.
- Each day gets DIFFERENT restaurants. Day 1 = best rated. Day 2 = second best. Etc.
- Restaurant map_url MUST be: https://www.google.com/maps/search/?api=1&query={{EXACT_restaurant_name}}+{{city}} (URL-encoded)
- Activity map_url MUST be: https://www.google.com/maps/search/?api=1&query={{EXACT_place_name}}+{{city}} (URL-encoded)

=== GROUND TRANSFER REQUIREMENTS ===
When the traveler arrives at the airport/bus station/train station/ferry terminal:
- Search Google Maps for the EXACT route from the terminal to the hotel.
- Provide STEP-BY-STEP navigation:
  * If public transport: "Exit [terminal name]. Walk [X] meters to [bus stop/metro station name]. Take [bus number/metro line] going towards [direction]. Get off at [stop name] after [Y] stops (~[Z] minutes). Walk [W] meters [direction] - the hotel is [description]."
  * If private taxi/transfer: "Book via [app name like BiTaksi/Uber/airport transfer service]. Cost: [amount] TL. Journey: [minutes]. You will be dropped at the hotel entrance."
  * If shuttle: "Take [HAVAŞ/company name] shuttle from the terminal exit. Cost: [amount] TL per person. Get off at [stop]. Walk [distance] to hotel."
- Include a working booking link if applicable.

=== DEPARTURE DAY REQUIREMENTS ===
Based on the return transport:
- Find the actual departure time for the return journey (bus/train/flight time on {ret_date}).
- Calculate backwards from that time:
  * Subtract safety buffer (3 hours for flights, 30 min for bus/train)
  * Subtract transit time from last location to terminal
  * This gives the latest time traveler must leave the last spot
- Plan: checkout at 12:00 → activity near terminal → lunch near terminal → go to terminal
- Provide step-by-step directions from hotel to terminal (same detail level as arrival).

=== OUTPUT FORMAT ===
Output ONLY valid JSON (no markdown, no code blocks, no explanation) matching this exact schema:
{{
  "destination_city": "{destination}",
  "origin_city": "{origin}",
  "adults_count": {adults},
  "children_count": {children},
  "rooms_count": {rooms},
  "total_travelers": {total_travelers},
  "meal_board": "{meal_board}",
  "grand_total_trip_cost_usd": <number>,
  "date_window": {{
    "suggested_dates": "{dep_date} - {ret_date}",
    "season_status": "<season description>",
    "why": {{"title": "...", "explanation": "...", "score_metrics": ["..."]}}
  }},
  "transportation": {{
    "mode": "<transport mode description>",
    "is_feasible": true,
    "feasibility_warning": null,
    "carrier_summary": "<origin> ➔ <destination> (<mode details>)",
    "outbound_leg": <FlightLeg object or null>,
    "return_leg": <FlightLeg object or null>,
    "cost_per_adult_usd": <number>,
    "cost_per_child_usd": <number>,
    "total_transport_cost_usd": <number>,
    "vehicle_breakdown": <VehicleCostBreakdown or null>,
    "booking_links": [{{"provider_name": "...", "url": "..."}}],
    "ground_transfers": [{{
      "name": "<transfer type>",
      "cost_usd": <number>,
      "duration_mins": <number>,
      "booking_link": "<url or null>",
      "how_to_use": "<DETAILED step-by-step navigation instructions>",
      "why_recommended": "<why this is the best and cheapest option>"
    }}],
    "why": {{"title": "...", "explanation": "...", "score_metrics": ["..."]}}
  }},
  "hotel": {{
    "name": "<REAL hotel name verified via search>",
    "stars": <1-5>,
    "aggregated_rating_10": <rating/10>,
    "reviews_count": <number>,
    "rooms_booked": {rooms},
    "meal_board_type": "<meal plan description>",
    "price_per_room_per_night_usd": <number>,
    "total_hotel_cost_usd": <number>,
    "distance_to_center_km": <number>,
    "distance_to_airport_or_station_km": <number>,
    "location_tag": "<location description>",
    "has_private_beach": <bool>,
    "has_aquapark": <bool>,
    "has_pool": <bool>,
    "has_spa": <bool>,
    "image_url": "<real image URL from the hotel or Unsplash>",
    "booking_links": [{{"provider_name": "Booking.com (...)", "url": "<WORKING parameterized URL>"}}],
    "why": {{"title": "...", "explanation": "...", "score_metrics": ["..."]}}
  }},
  "daily_schedule": [
    {{
      "day_number": 1,
      "day_title": "<unique descriptive title for this day>",
      "breakfast_banner": "<breakfast info>",
      "lunch_banner": null,
      "dinner_banner": null,
      "breakfast_restaurant": <RestaurantItem or null based on meal plan>,
      "activities": [<2 UNIQUE ActivityItem objects - different from all other days>],
      "restaurants": [<RestaurantItem objects for lunch/dinner based on meal plan - different from all other days>]
    }}
  ],
  "departure_day_buffer": {{
    "departure_mode": "<return transport description>",
    "checkout_time": "12:00",
    "lunch_spot_near_hub": <RestaurantItem near the terminal>,
    "time_spent_at_lunch": "<time range>",
    "transit_time_to_hub_mins": <number>,
    "required_safety_buffer_mins": <number>,
    "return_departure_time": "<actual return ticket time>",
    "arrival_at_home_time": "<estimated arrival at origin city>",
    "optional_home_arrival_dinner": null,
    "activities_before_departure": [<ActivityItem near terminal>],
    "recommended_final_meal": <RestaurantItem>,
    "distance_from_final_spot_to_terminal_km": <number>,
    "transit_time_to_terminal_mins": <number>,
    "why": {{"title": "...", "explanation": "...", "score_metrics": ["..."]}}
  }},
  "cost_breakdown": {{
    "hotel_total_usd": <number>,
    "transport_total_usd": <number>,
    "food_budget_total_usd": <number>,
    "activities_and_transfers_usd": <number>,
    "grand_total_usd": <number>
  }}
}}

CRITICAL REMINDERS:
- Every single name (hotel, restaurant, place) MUST be real and verifiable.
- All URLs must be properly encoded and contain correct dates/parameters.
- Each day must have completely different content.
- Ground transfers must have step-by-step navigation detail.
- Departure day must be planned around the actual return ticket time.
- All text content must be in {'Turkish' if lang == 'tr' else 'English' if lang == 'en' else 'Arabic'}.
"""
        return prompt

    def _call_gemini_search(self, data: dict) -> TripPlanResponse:
        prompt = self._build_search_prompt(data)

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={self.gemini_key}"

        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "tools": [{"googleSearch": {}}],
            "generationConfig": {
                "temperature": 0.1,
                "maxOutputTokens": 16000
            }
        }

        req_data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=req_data,
            headers={"Content-Type": "application/json"},
            method="POST"
        )

        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                result = json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            error_body = e.read().decode("utf-8") if e.fp else ""
            raise ValueError(f"Gemini API HTTP {e.code}: {error_body[:300]}")
        except urllib.error.URLError as e:
            raise ValueError(f"Network error connecting to Gemini API: {str(e)}")

        # Extract text from response
        if "candidates" not in result or len(result["candidates"]) == 0:
            raise ValueError(f"Gemini returned no candidates. Response: {json.dumps(result)[:500]}")

        candidate = result["candidates"][0]
        if "content" not in candidate or "parts" not in candidate["content"]:
            # Check for safety block
            finish_reason = candidate.get("finishReason", "UNKNOWN")
            raise ValueError(f"Gemini blocked response. Reason: {finish_reason}")

        text_parts = []
        for part in candidate["content"]["parts"]:
            if "text" in part:
                text_parts.append(part["text"])

        text_content = "".join(text_parts).strip()

        if not text_content:
            raise ValueError("Gemini returned empty text content.")

        # Extract JSON from response (handle markdown code blocks)
        json_str = text_content
        # Remove markdown code blocks if present
        if "```json" in json_str:
            json_str = json_str.split("```json", 1)[1]
            if "```" in json_str:
                json_str = json_str.split("```", 1)[0]
        elif "```" in json_str:
            json_str = json_str.split("```", 1)[1]
            if "```" in json_str:
                json_str = json_str.split("```", 1)[0]

        # Try to find JSON object
        json_str = json_str.strip()
        if not json_str.startswith("{"):
            json_match = re.search(r'\{.*\}', json_str, re.DOTALL)
            if json_match:
                json_str = json_match.group(0)
            else:
                raise ValueError(f"Could not find JSON in Gemini response. First 500 chars: {text_content[:500]}")

        try:
            parsed = json.loads(json_str)
        except json.JSONDecodeError as e:
            # Try to fix common JSON issues
            json_str = re.sub(r',\s*}', '}', json_str)
            json_str = re.sub(r',\s*]', ']', json_str)
            try:
                parsed = json.loads(json_str)
            except json.JSONDecodeError:
                raise ValueError(f"Failed to parse JSON from Gemini. Error: {str(e)}. First 300 chars: {json_str[:300]}")

        # Validate and construct response
        try:
            return TripPlanResponse(**parsed)
        except Exception as e:
            raise ValueError(f"Gemini response doesn't match schema: {str(e)}")

    def _call_openai_live(self, data: dict) -> TripPlanResponse:
        from openai import OpenAI
        client = OpenAI(api_key=self.openai_key)
        prompt = self._build_search_prompt(data)

        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a travel search engine. Output ONLY valid JSON. No markdown, no explanation."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            max_tokens=16000
        )

        text_content = completion.choices[0].message.content.strip()

        # Extract JSON
        if "```json" in text_content:
            text_content = text_content.split("```json", 1)[1].split("```", 1)[0]
        elif "```" in text_content:
            text_content = text_content.split("```", 1)[1].split("```", 1)[0]

        text_content = text_content.strip()
        if not text_content.startswith("{"):
            json_match = re.search(r'\{.*\}', text_content, re.DOTALL)
            if json_match:
                text_content = json_match.group(0)

        parsed = json.loads(text_content)
        return TripPlanResponse(**parsed)
