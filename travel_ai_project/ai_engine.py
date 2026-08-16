import os
import json
import urllib.parse
from typing import List, Optional
from pydantic import BaseModel, Field
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# =========================================================================
# STRICT DATA SCHEMAS FOR STRUCTURED AI OUTPUT
# =========================================================================

class WhyReason(BaseModel):
    title: str = Field(description="Short title explaining the algorithmic decision")
    explanation: str = Field(description="Detailed justification referencing reviews, prices, and rankings")
    score_metrics: List[str] = Field(description="Metrics e.g. ['Aggregated Rating: 9.4/10', 'Price Efficiency: Top 5%']")

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
    booking_links: List[BookingLink]
    ground_transfers: List[GroundTransferOption]
    why: WhyReason

class HotelItem(BaseModel):
    name: str
    stars: int
    aggregated_rating_10: float
    reviews_count: int
    price_per_night_usd: float
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
    image_url: str
    map_url: str
    why: WhyReason

class DayPlan(BaseModel):
    day_number: int
    day_title: str
    breakfast_plan: str
    breakfast_restaurant: Optional[RestaurantItem] = None
    activities: List[ActivityItem]
    restaurants: List[RestaurantItem]

class DepartureDayBuffer(BaseModel):
    departure_mode: str
    flight_or_drive_departure_time: str
    terminal_arrival_or_drive_start: str
    safe_buffer_hours: int = 4
    activities_before_departure: List[ActivityItem]
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
# AI LOGISTICS PROMPT ENGINE
# =========================================================================

class TravelAIEngine:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY", "")
        if not self.api_key or "your_actual" in self.api_key or len(self.api_key) < 15:
            raise ValueError(
                "OPENAI_API_KEY is not set in your .env file! "
                "Please add a valid OpenAI API Key so the AI can dynamically research any city worldwide."
            )
        self.client = OpenAI(api_key=self.api_key)

    def generate_plan(self, data: dict) -> TripPlanResponse:
        lang = data.get("language", "en")
        
        system_prompt = f"""
You are VoyageAI, the world's most intelligent algorithmic travel planner.
You do NOT rely on static templates. You must actively think, reason, and research the exact cities provided by the user.

RULES TO APPLY:

1. GEOGRAPHICAL TRANSIT FEASIBILITY:
   - Check if physical land connections exist between origin and destination.
   - If user selected 'own_car' for a route across open oceans, seas, or closed international borders (e.g. Turkey to Egypt, UK to USA), set is_feasible=False, provide a clear feasibility_warning, and automatically plan the best smart flight route instead.
   - If user selected public transit, evaluate if direct trains exist. If not (e.g. Bursa to Trabzon), do NOT invent fake trains; select the best low-cost airline (e.g. AJet, Pegasus) or express coach.
   - Provide exact flight numbers, departure times (outbound morning, return late night), and airport IATA codes.

2. HOTEL SELECTION & AMENITY MATCHING:
   - Provide a REAL, existing hotel in the destination city that strictly honors ALL requested amenities (e.g., if user checked Private Beach, Aquapark, Pool, or Spa, the chosen hotel MUST genuinely feature those).
   - Calculate aggregated rating out of 10 from Google Maps, TripAdvisor, and Booking.
   - For Turkey destinations: provide search links to Otelz, Google Hotels, and TripAdvisor.
   - For Egypt & Global destinations: provide search links to Booking.com, Google Hotels, and TripAdvisor.

3. ARITHMETIC & PASSENGER TOTALS:
   - Compute exact totals for {data.get('adults_count', 2)} adult(s) and {data.get('children_count', 0)} child(ren) across {data.get('nights', 3)} night(s).
   - Room count: ceil((adults + children) / 2). Total Hotel = nightly_rate * nights * rooms.
   - Transport = (adults * adult_rate) + (children * child_rate).
   - If meal_board == 'no_meals', include a dedicated breakfast cafe at 08:00 AM in the schedule and budget food for 3 daily meals.
   - If meal_board == 'breakfast_only', budget lunch & dinner.
   - If meal_board == 'halfboard', budget lunch only.
   - If meal_board == 'allinclusive' or 'fullboard', food out-of-pocket budget = $0.

4. DAILY ITINERARY & 4-HOUR DEPARTURE BUFFER:
   - Every single day must feature unique, iconic, non-repeating attractions and restaurants.
   - Include authentic photos from Unsplash for each landmark and dining spot.
   - Provide exact distances in km from the hotel, public transport modes (bus/metro/tram), and local transit card money-saving tips.
   - On the final day, create a complete morning/afternoon itinerary and an exact 4-hour departure safety buffer.

5. LANGUAGE & LOCALIZATION:
   - Output the ENTIRE JSON structure (all titles, descriptions, why reasons, food names, tips) in the requested language: '{lang}' (English, Türkçe, or العربية).
"""

        completion = self.client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Research and plan this trip dynamically: {json.dumps(data)}"}
            ],
            response_format=TripPlanResponse,
            temperature=0.2,
        )
        return completion.choices[0].message.parsed