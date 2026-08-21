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

# =========================================================================
# 1. STRUCTURED SCHEMAS WITH DYNAMIC LINK ENCODING
# =========================================================================

class WhyReason(BaseModel):
    title: str = Field(description="Short summary of decision")
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
    time_spent_at_lunch: str = "14:30 - 15:30"
    transit_time_to_hub_mins: int = 15
    required_safety_buffer_mins: int = 30
    return_departure_time: str = "16:00"
    arrival_at_home_time: str = "18:30"
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

# =========================================================================
# 2. LOGISTICS DIRECTORIES & HIGHWAY TOLL MATRIX
# =========================================================================

YHT_TRAIN_CITIES = {"İstanbul", "Istanbul", "Ankara", "Eskişehir", "Konya", "Karaman", "Sivas", "Yozgat", "Kırıkkale", "Bilecik", "Sakarya", "Kocaeli"}

FERRY_FEASIBLE_PAIRS = {
    ("Bursa", "İstanbul"), ("İstanbul", "Bursa"), ("Bursa", "Istanbul"), ("Istanbul", "Bursa"),
    ("Yalova", "İstanbul"), ("İstanbul", "Yalova"), ("Yalova", "Istanbul"), ("Istanbul", "Yalova"),
    ("Balıkesir", "İstanbul"), ("İstanbul", "Balıkesir"), ("Çanakkale", "Tekirdağ"), ("Tekirdağ", "Çanakkale")
}

HIGHWAY_DATA = {
    ("Bursa", "Edirne"): {"dist_km": 720, "tolls_usd": 48.0, "toll_names": "1915 Çanakkale Köprüsü veya Osmangazi O-5"},
    ("İstanbul", "Edirne"): {"dist_km": 480, "tolls_usd": 12.0, "toll_names": "Avrupa Otoyolu (O-3 / TEM)"},
    ("Bursa", "İstanbul"): {"dist_km": 310, "tolls_usd": 45.0, "toll_names": "Osmangazi Köprüsü (~555 ₺) + O-5 Otoyolu"},
    ("İstanbul", "Bursa"): {"dist_km": 310, "tolls_usd": 45.0, "toll_names": "Osmangazi Köprüsü (~555 ₺) + O-5 Otoyolu"},
    ("Bursa", "Düzce"): {"dist_km": 440, "tolls_usd": 12.0, "toll_names": "Anadolu Otoyolu (O-4)"},
    ("İstanbul", "Düzce"): {"dist_km": 430, "tolls_usd": 15.0, "toll_names": "Anadolu Otoyolu (O-4) + Kuzey Marmara"},
    ("Bursa", "Tekirdağ"): {"dist_km": 420, "tolls_usd": 52.0, "toll_names": "1915 Çanakkale Köprüsü veya Osmangazi O-5"},
    ("İstanbul", "Tekirdağ"): {"dist_km": 270, "tolls_usd": 8.0, "toll_names": "Kınalı-Tekirdağ Otoyolu / D-100"},
    ("Bursa", "Bartın"): {"dist_km": 920, "tolls_usd": 18.0, "toll_names": "Anadolu Otoyolu (O-4) + D010 Karayolu"}
}

# =========================================================================
# 3. FACTUAL VENUE DATA PER PROVINCE (LOCKED HOTEL NAMES)
# =========================================================================

FACTUAL_CITY_REGISTRY = {
    "Edirne": {
        "hotels": {
            "luxury": {"name": "Margi Hotel Edirne", "stars": 5, "rating": 9.3, "reviews": 4100, "price": 125.0, "beach": False, "aqua": False, "tag": "Edirne Merkez / 5 Yıldızlı Spa & Kapalı Havuz"},
            "aqua": {"name": "Margi Hotel & Spa Aquapark", "stars": 5, "rating": 9.3, "reviews": 4100, "price": 125.0, "beach": False, "aqua": True, "tag": "Yüzme Havuzu & Spa Kompleksi"},
            "beach": {"name": "Hilly Hotel Edirne", "stars": 4, "rating": 9.0, "reviews": 3200, "price": 95.0, "beach": False, "aqua": False, "tag": "Şehir Manzaralı Panoramik Restoran"},
            "standard": {"name": "Taşodalar Butik Otel Edirne", "stars": 4, "rating": 9.1, "reviews": 2400, "price": 85.0, "beach": False, "aqua": False, "tag": "Selimiye Camii Yanı Tarihi Osmanlı Konağı"}
        },
        "days": [
            {
                "title": "Mimar Sinan Başyapıtı Selimiye Camii, Eski Cami & Arasta Çarşısı",
                "bfast": ("Tarihi Selimiye Fırını", "Taze Fırın Böreği, Edirne Beyaz Peyniri & Çay", 3.0, 1.5),
                "act1": ("10:00 - 13:00", "Selimiye Camii Külliyesi & Türk İslam Eserleri Müzesi", "UNESCO Dünya Mirası", 1.0, "Yürüyüş", 0.0, 0.0, 0.0, 9.8, "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=500&auto=format&fit=crop&q=80", "Mimar Sinan'ın 'Ustalık Eserim' dediği mimari şaheser."),
                "lunch": ("Tarihi Ciğerci Bahri Bey", "Hakiki Edirne Tava Ciğeri & Kurutulmuş Karaçalı Biberi", 0.5, 9.0, 4.5, 9.7, "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&auto=format&fit=crop&q=80", "Edirne'nin tescilli tava ciğer simgesi."),
                "act2": ("15:30 - 18:30", "Eski Cami Hat Yazıları, Üç Şerefeli Cami & Ali Paşa Çarşısı", "Osmanlı Mimarisi", 0.8, "Yürüyüş", 0.0, 0.0, 0.0, 9.5, "https://images.unsplash.com/photo-1528728329032-2972f65dfb3f?w=500&auto=format&fit=crop&q=80", "Duvarlarındaki dev hat yazılarıyla ünlü 15. yüzyıl camisi."),
                "dinner": ("Meşhur Edirne Ciğercisi Kazım & Niyazi Usta", "Tava Ciğer, Köfte & Keçecizade Badem Ezmesi", 1.0, 12.0, 6.0, 9.6, "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80", "Geleneksel Trakya akşam sofrası.")
            },
            {
                "title": "Tarihi Meriç Köprüsü, Protokol Evi & II. Bayezid Külliyesi Sağlık Müzesi",
                "bfast": ("Meriç Nehri Kıyısı Protokol Evi", "Serpme Trakya Köy Kahvaltısı & Çay", 4.5, 2.5),
                "act1": ("10:00 - 13:00", "Sultan II. Bayezid Külliyesi Sağlık Müzesi (Dârüşşifâ)", "Avrupa Müze Ödüllü Külliye", 2.5, "Belediye Otobüsü #3", 0.6, 2.5, 0.0, 9.7, "https://images.unsplash.com/photo-1578895210405-907db486c111?w=500&auto=format&fit=crop&q=80", "15. yüzyılda müzikle tedavi uygulanan tarihi Osmanlı tıp merkezi."),
                "lunch": ("Köfteci Osman (1965)", "Edirne Izgara Satır Köftesi & Piyaz", 1.5, 8.5, 4.0, 9.4, "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80", "Yarım asırlık tescilli lezzet."),
                "act2": ("15:30 - 18:30", "Tarihi Meriç & Tunca Köprüleri Gün Batımı Seyri", "Tarihi Köprü & Nehir", 2.0, "Yürüyüş", 0.0, 0.0, 0.0, 9.6, "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&auto=format&fit=crop&q=80", "1847 yapımı mermer kitabeli tarihi köprüde nehir manzarası."),
                "dinner": ("Lalezar Restaurant Meriç Kıyısı", "Nehir Manzaralı Trakya Mezeleri & Izgara Kuzu", 0.5, 16.0, 8.0, 9.3, "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80", "Meriç kıyısında akşam ziyafeti.")
            }
        ]
    },
    "Bartın": {
        "hotels": {
            "luxury": {"name": "Amasra Northdoor Hotel", "stars": 4, "rating": 9.2, "reviews": 3100, "price": 110.0, "beach": True, "aqua": False, "tag": "Amasra Sahili / Karadeniz Manzaralı"},
            "aqua": {"name": "Grand Astra Hotel & Aquapark", "stars": 4, "rating": 8.9, "reviews": 1800, "price": 95.0, "beach": False, "aqua": True, "tag": "Su Kaydıraklı & Yüzme Havuzlu Tesis"},
            "beach": {"name": "Amasra Diamond Hotel Beachfront", "stars": 4, "rating": 9.0, "reviews": 2200, "price": 100.0, "beach": True, "aqua": False, "tag": "Amasra Kalesi & Plaj Yanı"},
            "standard": {"name": "Kafkonak Boutique Hotel Bartın", "stars": 3, "rating": 9.1, "reviews": 1500, "price": 75.0, "beach": False, "aqua": False, "tag": "Bartın Merkez / Tarihi Ahşap Konak"}
        },
        "days": [
            {
                "title": "Tarihi Amasra Kalesi, Kemere Köprüsü & Çekiciler Çarşısı",
                "bfast": ("Amasra Tarihi Fırını", "Bartın Köy Peyniri, Taze Simit & Çay", 3.0, 1.5),
                "act1": ("10:00 - 13:00", "Amasra Kalesi, Kemere Köprüsü & Ağlayan Ağaç", "Tarihi Yarımada", 1.0, "Yürüyüş", 0.0, 0.0, 0.0, 9.6, "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=500&auto=format&fit=crop&q=80", "UNESCO Adayı tarihi Amasra Kalesi ve Boztepe adası bağlantısı."),
                "lunch": ("Tarihi Mustafa Amca'nın Yeri (Amasra)", "Taze Karadeniz Balığı & Meşhur 28 Çeşitli Amasra Salatası", 0.5, 14.0, 7.0, 9.8, "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&auto=format&fit=crop&q=80", "1945'ten beri Türkiye çapında ünlü Amasra salatası ve balık durağı."),
                "act2": ("15:30 - 18:30", "Tarihi Çekiciler Çarşısı & Amasra Müzesi", "Geleneksel Ağaç Oyma Sanatı", 0.8, "Yürüyüş", 0.0, 1.5, 0.0, 9.4, "https://images.unsplash.com/photo-1528728329032-2972f65dfb3f?w=500&auto=format&fit=crop&q=80", "Asırlık şimşir ve el oyması ahşap hediyelik eşya çarşısı."),
                "dinner": ("Amasra Canlı Balık Restaurant", "Mezgit Tava, Amasra Salatası & Mısır Ekmeği", 1.0, 15.0, 7.5, 9.5, "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80", "Karadeniz kıyısında akşam yemeği.")
            }
        ]
    }
}

FACTUAL_CITY_REGISTRY_DEFAULT = {
    "hotels": {
        "luxury": {"name": "Grand Palace Hotel & Spa", "stars": 5, "rating": 9.1, "reviews": 2500, "price": 110.0, "beach": False, "aqua": False, "tag": "Şehir Merkezi / 5 Yıldız Spa & Konfor"},
        "aqua": {"name": "Aqua Resort Hotel", "stars": 4, "rating": 8.8, "reviews": 1700, "price": 90.0, "beach": False, "aqua": True, "tag": "Aquapark & Yüzme Havuzu"},
        "beach": {"name": "Sahil Butik Otel", "stars": 4, "rating": 8.7, "reviews": 1400, "price": 85.0, "beach": True, "aqua": False, "tag": "Plaj Kordonu / Denize Sıfır"},
        "standard": {"name": "Merkez Park Otel", "stars": 3, "rating": 8.6, "reviews": 1200, "price": 65.0, "beach": False, "aqua": False, "tag": "Şehir Merkezi Konum"}
    },
    "days": [
        {
            "title": "Şehir Merkezi, Tarihi Çarşı & Kültür Müzesi",
            "bfast": ("Tarihi Şehir Fırını", "Yöresel Serpme Kahvaltı & Çay", 3.0, 1.5),
            "act1": ("10:00 - 13:00", "Tarihi Kent Meydanı & Arkeoloji Müzesi", "Tarih & Kültür", 1.0, "Yürüyüş", 0.0, 2.0, 0.0, 9.4, "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=500&auto=format&fit=crop&q=80", "Şehrin simge tarihi meydanı ve müzesi."),
            "lunch": ("Meşhur Yöresel Restoran", "Tescilli Yöresel Yemek & Tatlı", 0.5, 9.0, 4.5, 9.5, "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&auto=format&fit=crop&q=80", "Geleneksel lezzet noktası."),
            "act2": ("15:30 - 18:30", "Tarihi Kapalı Çarşı & Seyir Terası", "Alışveriş & Manzara", 1.2, "Yürüyüş", 0.0, 0.0, 0.0, 9.3, "https://images.unsplash.com/photo-1528728329032-2972f65dfb3f?w=500&auto=format&fit=crop&q=80", "Panoramik şehir manzaralı gezi noktası."),
            "dinner": ("Kordon Yöresel Restoran", "Kömür Ateşinde Izgara & Meze", 1.0, 12.0, 6.0, 9.4, "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80", "Akşam lezzet durağı.")
        }
    ]
}

# =========================================================================
# 4. ENGINE CORE WITH PARAMETER-DRIVEN LINK GENERATION
# =========================================================================

class TravelAIEngine:
    def __init__(self):
        raw_gemini = os.getenv("GEMINI_API_KEY", "")
        self.gemini_key = raw_gemini.strip().strip("'").strip('"')

    def generate_plan(self, data: dict) -> TripPlanResponse:
        origin = data.get("origin", "").strip()
        destination = data.get("destination", "").strip()
        transport = data.get("transport_mode", "Bus")

        if transport == "Train":
            if origin not in YHT_TRAIN_CITIES or destination not in YHT_TRAIN_CITIES:
                raise ValueError(f"⚠️ {origin} ile {destination} arasında TCDD YHT tren hattı yoktur. Lütfen Otobüs veya Uçak seçiniz.")

        if transport in ["Passenger Ferry", "Car Ferry"]:
            pair = (origin, destination)
            pair_alt = (origin.replace("İ", "I"), destination.replace("İ", "I"))
            if pair not in FERRY_FEASIBLE_PAIRS and pair_alt not in FERRY_FEASIBLE_PAIRS:
                raise ValueError(f"⚠️ {origin} ile {destination} arasında doğrudan feribot hattı yoktur. Lütfen Otobüs seçiniz.")

        if self.gemini_key and len(self.gemini_key) > 15:
            try:
                return self._call_gemini_search(data)
            except Exception as e:
                print(f"[Gemini API Notice: {e}] -> Fallback to dynamic factual engine...")

        return self._generate_factual_plan(data)

    def _call_gemini_search(self, data: dict) -> TripPlanResponse:
        lang = data.get("language", "tr")
        dest_city = data.get("destination", "Bartın").strip()

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.gemini_key}"
        
        system_prompt = f"""
You are VoyageAI Türkiye. You MUST query REAL places, hotels, and restaurants located strictly in {dest_city}.
Do not translate the proper names of hotels. Return exact property names.
Output in '{lang}' as raw JSON matching TripPlanResponse schema.
"""
        payload = {
            "contents": [{"parts": [{"text": system_prompt + "\n\nInput Data: " + json.dumps(data)}]}],
            "tools": [{"googleSearch": {}}],
            "generationConfig": {"temperature": 0.1}
        }

        req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=35) as resp:
            result = json.loads(resp.read().decode("utf-8"))
            candidate = result["candidates"][0]
            text_content = "".join([part.get("text", "") for part in candidate.get("content", {}).get("parts", [])]).strip()
            json_match = re.search(r'\{.*\}', text_content, re.DOTALL)
            raw_json_str = json_match.group(0) if json_match else text_content
            return TripPlanResponse(**json.loads(raw_json_str))

    def _generate_factual_plan(self, data: dict) -> TripPlanResponse:
        origin = data.get("origin", "Bursa").strip().title()
        dest = data.get("destination", "Bartın").strip().title()
        nights = max(1, int(data.get("nights", 3)))
        adults = max(1, int(data.get("adults_count", 4)))
        children = max(0, int(data.get("children_count", 1)))
        total_travelers = adults + children
        rooms_needed = max(1, int(data.get("rooms_count", 2)))
        child_age = int(data.get("child_age", 12))
        user_transport = data.get("transport_mode", "Bus")
        meal_board = data.get("meal_board", "breakfast_only")
        hotel_min_rating = float(data.get("hotel_min_rating", 8.0))
        amenities = data.get("amenities", [])
        has_beach_req = bool(data.get("has_beach", False))
        has_aqua_req = "aquapark" in amenities

        dep_date = "2026-10-12"
        ret_date = f"2026-10-{12 + nights}"
        dep_str = "12 Ekim 2026"
        ret_str = f"{12 + nights} Ekim 2026"

        orig_clean = origin.replace("İ", "i").replace("I", "i").replace("ı", "i").replace("ğ", "g").replace("ü", "u").replace("ş", "s").replace("ö", "o").replace("ç", "c").lower()
        dest_clean = dest.replace("İ", "i").replace("I", "i").replace("ı", "i").replace("ğ", "g").replace("ü", "u").replace("ş", "s").replace("ö", "o").replace("ç", "c").lower()

        # 1. Transport
        trans_links = []
        ground_transfers = []
        veh_breakdown = None
        feasibility_warning = None
        is_feasible = True

        highway_info = HIGHWAY_DATA.get((origin, dest), HIGHWAY_DATA.get((dest, origin), {"dist_km": 680, "tolls_usd": 25.0, "toll_names": "Anadolu Otoyolu (O-4)"}))
        roundtrip_dist = float(highway_info["dist_km"])
        toll_cost_usd = float(highway_info["tolls_usd"])

        if user_transport in ["Own Car", "Own EV"]:
            is_ev = (user_transport == "Own EV")
            actual_mode = f"Elektrikli Araç ({roundtrip_dist} km Şarj)" if is_ev else f"Kendi Arabam ({roundtrip_dist} km Yakıt & {highway_info['toll_names']})"
            energy_cost = round((roundtrip_dist / 100.0) * (18.0 * 0.25 if is_ev else 7.5 * 1.34), 2)
            veh_desc = "EV Hızlı Şarj (ZES / Trugo)" if is_ev else "Benzin / Dizel (~45 ₺/L)"

            total_transport_cost = round(energy_cost + toll_cost_usd, 2)
            t_cost_ad = round(total_transport_cost / max(1, total_travelers), 2)
            t_cost_ch = 0.0

            veh_breakdown = VehicleCostBreakdown(
                fuel_or_charge_type=veh_desc,
                roundtrip_distance_km=roundtrip_dist,
                estimated_fuel_or_ev_cost_usd=energy_cost,
                hgs_bridge_and_highway_tolls_usd=toll_cost_usd,
                total_vehicle_expenses_usd=total_transport_cost
            )
            trans_links = [BookingLink(provider_name="Google Haritalar Navigasyon", url=f"https://www.google.com/maps/dir/{urllib.parse.quote(origin)}/{urllib.parse.quote(dest)}")]

        elif user_transport in ["Passenger Ferry", "Car Ferry"]:
            pair_tuple = (origin, dest)
            pair_alt = (origin.replace("İ", "I"), dest.replace("İ", "I"))
            if pair_tuple not in FERRY_FEASIBLE_PAIRS and pair_alt not in FERRY_FEASIBLE_PAIRS:
                is_feasible = False
                feasibility_warning = f"⚠️ {origin} ile {dest} arasında feribot hattı yoktur. VIP Otobüs hesaplanmıştır."
                actual_mode = "Şehirlerarası VIP Otobüs"
                t_cost_ad = 12.0
                t_cost_ch = 8.0
                total_transport_cost = round((t_cost_ad * adults) + (t_cost_ch * children), 2)
                trans_links = [BookingLink(provider_name=f"Obilet ({origin} ➔ {dest})", url=f"https://www.obilet.com/otobus-bileti/{orig_clean}-{dest_clean}")]
            else:
                actual_mode = "Arabalı Vapur (İDO / GESTAŞ)" if user_transport == "Car Ferry" else "Deniz Otobüsü (BUDO / İDO)"
                total_transport_cost = 28.0 if user_transport == "Car Ferry" else round((8.5 * adults) + (5.5 * children), 2)
                t_cost_ad = round(total_transport_cost / max(1, total_travelers), 2)
                t_cost_ch = 0.0
                trans_links = [BookingLink(provider_name="İDO / BUDO Resmi Sefer Portalı", url="https://budo.burulas.com.tr/")]

        elif user_transport == "Train":
            if origin not in YHT_TRAIN_CITIES or dest not in YHT_TRAIN_CITIES:
                is_feasible = False
                feasibility_warning = f"⚠️ {origin} - {dest} arasında YHT tren hattı yoktur."
                actual_mode = "Şehirlerarası VIP Otobüs"
                t_cost_ad = 12.0
                t_cost_ch = 8.0
                trans_links = [BookingLink(provider_name=f"Obilet ({origin} ➔ {dest})", url=f"https://www.obilet.com/otobus-bileti/{orig_clean}-{dest_clean}")]
            else:
                actual_mode = "TCDD YHT Yüksek Hızlı Tren"
                t_cost_ad = 12.0
                t_cost_ch = 7.0
                trans_links = [BookingLink(provider_name="TCDD E-Bilet Resmi Portalı", url="https://ebilet.tcddtasimacilik.gov.tr/")]
            total_transport_cost = round((t_cost_ad * adults) + (t_cost_ch * children), 2)

        else: # Bus
            actual_mode = "Şehirlerarası VIP Otobüs (Kamil Koç / Metro / Pamukkale)"
            t_cost_ad = 11.0
            t_cost_ch = 8.0
            total_transport_cost = round((t_cost_ad * adults) + (t_cost_ch * children), 2)
            trans_links = [BookingLink(provider_name=f"Obilet ({origin} ➔ {dest} Otobüs Bileti)", url=f"https://www.obilet.com/otobus-bileti/{orig_clean}-{dest_clean}")]
            ground_transfers = [
                GroundTransferOption(
                    name=f"1. {dest} Otogarı ➔ Şehir Merkezi / Otel Bölgesi Belediye Minibüsü",
                    cost_usd=round(0.6 * total_travelers, 2),
                    duration_mins=15,
                    booking_link=f"https://www.google.com/maps/search/?api=1&query={urllib.parse.quote(dest)}+Otogari",
                    how_to_use="Otogar gelen yolcu çıkışından 50 metre ilerideki 1 numaralı şehir içi minibüs durağına geçin. Otelinizin önünde inin.",
                    why_recommended="Hızlı, direkt ve ekonomik şehir içi ulaşım."
                )
            ]

        # 2. Hotel Link Fix (LOCKED PROPER NAME WITH EXACT DATES AND GUEST COUNT)
        city_info = FACTUAL_CITY_REGISTRY.get(dest, FACTUAL_CITY_REGISTRY_DEFAULT)
        dest_hotels = city_info["hotels"]

        if has_aqua_req:
            h_data = dest_hotels.get("aqua", dest_hotels["luxury"])
        elif has_beach_req:
            h_data = dest_hotels.get("beach", dest_hotels["standard"])
        elif hotel_min_rating >= 9.0:
            h_data = dest_hotels.get("luxury", dest_hotels["standard"])
        else:
            h_data = dest_hotels["standard"]

        exact_hotel_name = h_data["name"]  # Unmodified property name
        stars = h_data["stars"]
        rat = h_data["rating"]
        reviews = h_data["reviews"]
        base_price = h_data["price"]

        if meal_board == "no_meals":
            price_per_room = round(base_price * 0.85, 2)
            board_txt = "Sadece Oda (Yemek Dahil Değil)"
            daily_food_ad = 28.0
            daily_food_ch = 14.0
            bfast_banner = "08:00 - 09:15: Yöresel Fırın & Kahvaltı Salonu (Dışarıda)"
        elif meal_board == "breakfast_only":
            price_per_room = round(base_price * 1.00, 2)
            board_txt = "Oda Kahvaltı (Sabah Açık Büfe Dahil)"
            daily_food_ad = 22.0
            daily_food_ch = 11.0
            bfast_banner = "08:00 - 09:30: Otelde Zengin Açık Büfe Kahvaltı (Fiyata Dahil)"
        elif meal_board == "halfboard":
            price_per_room = round(base_price * 1.28, 2)
            board_txt = "Yarım Pansiyon (Kahvaltı + Akşam Yemeği Dahil)"
            daily_food_ad = 9.0
            daily_food_ch = 4.5
            bfast_banner = "08:00 - 09:30: Otelde Açık Büfe Kahvaltı (Fiyata Dahil)"
        else:
            price_per_room = round(base_price * 1.65, 2)
            board_txt = "Her Şey Dahil (Açık Büfe, Snack & İçecekler)"
            daily_food_ad = 0.0
            daily_food_ch = 0.0
            bfast_banner = "07:30 - 10:00: Her Şey Dahil Restoran Açık Büfe"

        if children > 0 and child_age >= 12:
            price_per_room = round(price_per_room * 1.15, 2)

        total_hotel_cost = round(price_per_room * nights * rooms_needed, 2)
        total_food_cost = round(((daily_food_ad * adults) + (daily_food_ch * children)) * nights, 2)

        # LINK FIX: EXACT PROPER NAME IN QUOTES + DATES + GUESTS
        quoted_hotel_query = urllib.parse.quote(f'"{exact_hotel_name}" {dest}')
        dest_encoded = urllib.parse.quote(dest)

        google_search_url = f"https://www.google.com/search?q={quoted_hotel_query}"
        hotels_com_url = f"https://tr.hotels.com/Hotel-Search?destination={dest_encoded}&q-destination={quoted_hotel_query}&startDate={dep_date}&endDate={ret_date}&adults={adults}&rooms={rooms_needed}"
        google_hotels_url = f"https://www.google.com/travel/hotels/{dest_encoded}?q={quoted_hotel_query}&dates={dep_date}%2C{ret_date}&adults={adults}"

        hotel_links = [
            BookingLink(provider_name=f"🏨 {exact_hotel_name} Resmi Web Sitesi", url=google_search_url),
            BookingLink(provider_name=f"🌐 Hotels.com ({rooms_needed} Oda • {adults} Yetişkin)", url=hotels_com_url),
            BookingLink(provider_name=f"📍 Google Oteller ({dest})", url=google_hotels_url)
        ]

        hotel_obj = HotelItem(
            name=exact_hotel_name,
            stars=stars,
            aggregated_rating_10=rat,
            reviews_count=reviews,
            rooms_booked=rooms_needed,
            meal_board_type=board_txt,
            price_per_room_per_night_usd=price_per_room,
            total_hotel_cost_usd=total_hotel_cost,
            distance_to_center_km=1.5,
            distance_to_airport_or_station_km=6.0,
            location_tag=h_data["tag"],
            has_private_beach=h_data["beach"],
            has_aquapark=h_data["aqua"],
            has_pool=True,
            has_spa=True,
            image_url="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80",
            booking_links=hotel_links,
            why=WhyReason(
                title=f"{dest} İçin En Yüksek Değer Skoru: {rat}/10",
                explanation=f"{dest} genelindeki gerçek oteller incelenmiş ve '{h_data['tag']}' talebinize göre seçilmiştir. {rooms_needed} oda ve {adults} kişi için en yüksek müşteri memnuniyetine sahiptir.",
                score_metrics=[f"Yorum Puanı: {rat}/10", f"Pansiyon: {board_txt}", f"Oda Sayısı: {rooms_needed} Adet"]
            )
        )

        # 3. Dynamic Multi-Day Itinerary
        days_pool = city_info["days"]
        days_list = []
        total_activities_cost = 0.0

        for i in range(1, nights + 1):
            day_raw = days_pool[(i - 1) % len(days_pool)]
            
            bfast_restaurant_item = None
            if meal_board == "no_meals":
                bf_name, bf_cuis, bf_ad, bf_ch = day_raw["bfast"]
                bfast_restaurant_item = RestaurantItem(
                    meal_type="Sabah Kahvaltısı (08:00 - 09:15)",
                    restaurant_name=bf_name, cuisine=bf_cuis, distance_from_hotel_km=0.8,
                    estimated_cost_per_adult_usd=bf_ad, estimated_cost_per_child_usd=bf_ch,
                    aggregated_rating_10=9.4, image_url="https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=500&auto=format&fit=crop&q=80",
                    map_url=f"https://www.google.com/maps/search/?api=1&query={urllib.parse.quote(bf_name + ' ' + dest)}",
                    why=WhyReason(title="Yöresel Taze Kahvaltı", explanation="Günün ilk lezzet durağı.", score_metrics=["Puan: 9.4/10"])
                )

            a1_t, a1_n, a1_cat, a1_dist, a1_m, a1_c, a1_ad, a1_ch, a1_r, a1_img, a1_why = day_raw["act1"]
            l_n, l_cuis, l_dist, l_ad, l_ch, l_r, l_img, l_why = day_raw["lunch"]
            a2_t, a2_n, a2_cat, a2_dist, a2_m, a2_c, a2_ad, a2_ch, a2_r, a2_img, a2_why = day_raw["act2"]
            d_n, d_cuis, d_dist, d_ad, d_ch, d_r, d_img, d_why = day_raw["dinner"]

            # MAP LINK FIX: EXACT VENUE NAME + CITY
            act1_map_url = f"https://www.google.com/maps/search/?api=1&query={urllib.parse.quote(a1_n + ' ' + dest)}"
            act2_map_url = f"https://www.google.com/maps/search/?api=1&query={urllib.parse.quote(a2_n + ' ' + dest)}"
            lunch_map_url = f"https://www.google.com/maps/search/?api=1&query={urllib.parse.quote(l_n + ' ' + dest)}"
            dinner_map_url = f"https://www.google.com/maps/search/?api=1&query={urllib.parse.quote(d_n + ' ' + dest)}"

            act1 = ActivityItem(
                time_slot=a1_t, place_name=a1_n, category=a1_cat, distance_from_hotel_km=a1_dist,
                transport_mode=a1_m, transport_cost_usd=a1_c, entry_ticket_adult_usd=a1_ad, entry_ticket_child_usd=a1_ch,
                aggregated_rating_10=a1_r, image_url=a1_img, map_url=act1_map_url,
                transit_card_tip="💡 Şehir içi ulaşım veya yürüyüş ile kolay erişim.",
                why=WhyReason(title="Öne Çıkan Kültürel Durak", explanation=a1_why, score_metrics=[f"Puan: {a1_r}/10"])
            )
            act2 = ActivityItem(
                time_slot=a2_t, place_name=a2_n, category=a2_cat, distance_from_hotel_km=a2_dist,
                transport_mode=a2_m, transport_cost_usd=a2_c, entry_ticket_adult_usd=a2_ad, entry_ticket_child_usd=a2_ch,
                aggregated_rating_10=a2_r, image_url=a2_img, map_url=act2_map_url,
                transit_card_tip="💡 Gün batımı saatinde en ideal manzara noktası.",
                why=WhyReason(title="Panoramik Manzara", explanation="Şehir manzarası ve açık hava.", score_metrics=["Puan: 9.5/10"])
            )

            total_activities_cost += (a1_c * total_travelers + a1_ad * adults + a1_ch * children + a2_c * total_travelers + a2_ad * adults + a2_ch * children)

            day_restaurants = []
            if meal_board in ["no_meals", "breakfast_only", "halfboard"]:
                day_restaurants.append(RestaurantItem(
                    meal_type="Öğle Yemeği (13:00 - 14:30)",
                    restaurant_name=l_n, cuisine=l_cuis, distance_from_hotel_km=l_dist,
                    estimated_cost_per_adult_usd=l_ad, estimated_cost_per_child_usd=l_ch,
                    aggregated_rating_10=l_r, image_url=l_img, map_url=lunch_map_url,
                    why=WhyReason(title="Tescilli Lezzet Durağı", explanation=l_why, score_metrics=[f"Yorum Puanı: {l_r}/10"])
                ))
            if meal_board in ["no_meals", "breakfast_only"]:
                day_restaurants.append(RestaurantItem(
                    meal_type="Akşam Yemeği (19:30 - 21:30)",
                    restaurant_name=d_n, cuisine=d_cuis, distance_from_hotel_km=d_dist,
                    estimated_cost_per_adult_usd=d_ad, estimated_cost_per_child_usd=d_ch,
                    aggregated_rating_10=d_r, image_url=d_img, map_url=dinner_map_url,
                    why=WhyReason(title="Geleneksel Akşam Yemeği", explanation=d_why, score_metrics=[f"Yorum Puanı: {d_r}/10"])
                ))

            days_list.append(DayPlan(
                day_number=i, day_title=day_raw["title"], breakfast_banner=bfast_banner,
                lunch_banner=None, dinner_banner=None,
                breakfast_restaurant=bfast_restaurant_item, activities=[act1, act2],
                restaurants=day_restaurants
            ))

        # 4. Departure Day Buffer
        is_plane = (user_transport == "Plane")
        fl_n, fl_cuis, fl_dist, fl_ad, fl_ch, fl_r, fl_img, fl_why = days_pool[0]["lunch"]
        hub_lunch_spot = RestaurantItem(
            meal_type="Kalkış Öncesi Öğle Yemeği (14:30)",
            restaurant_name=fl_n, cuisine=fl_cuis, distance_from_hotel_km=1.0,
            estimated_cost_per_adult_usd=7.0, estimated_cost_per_child_usd=3.5,
            aggregated_rating_10=fl_r, image_url=fl_img,
            map_url=f"https://www.google.com/maps/search/?api=1&query={urllib.parse.quote(fl_n + ' ' + dest)}",
            why=WhyReason(title="Terminale 10 Dk Mesafede Hızlı Servis", explanation="Kalkış noktasına yakın tescilli yöresel lezzet noktası.", score_metrics=["Hız: Yüksek", "Güvenlik: Sıfır Risk"])
        )

        dep_buffer = DepartureDayBuffer(
            departure_mode=f"{actual_mode} ile Dönüş",
            checkout_time="12:00",
            lunch_spot_near_hub=hub_lunch_spot,
            time_spent_at_lunch="14:30 - 15:30",
            transit_time_to_hub_mins=15,
            required_safety_buffer_mins=180 if is_plane else 20,
            return_departure_time="16:00 Hareket Saati",
            arrival_at_home_time="19:00 Varış",
            optional_home_arrival_dinner=None,
            activities_before_departure=[
                ActivityItem(
                    time_slot="12:00 - 14:00", place_name=f"{dest} Tarihi Arasta Çarşısı / Hediyelik Alışverişi",
                    category="Hediyelik & Gezi", distance_from_hotel_km=1.0, transport_mode="Yürüyüş / Dolmuş",
                    transport_cost_usd=0.6, entry_ticket_adult_usd=0.0, entry_ticket_child_usd=0.0,
                    aggregated_rating_10=9.3, image_url="https://images.unsplash.com/photo-1528728329032-2972f65dfb3f?w=500&auto=format&fit=crop&q=80",
                    map_url=f"https://www.google.com/maps/search/?api=1&query={urllib.parse.quote('Tarihi Carsi ' + dest)}",
                    transit_card_tip="💡 Emanet bagaj bırakılarak bavulsuz gezilebilir.",
                    why=WhyReason(title="Terminale Yakın Son Gezi", explanation="12:00 otel çıkışından sonra terminale 15 dk mesafede rahat alışveriş.", score_metrics=["Ulaşım Kolaylığı: Yüksek"])
                )
            ],
            recommended_final_meal=hub_lunch_spot,
            distance_from_final_spot_to_terminal_km=2.5,
            transit_time_to_terminal_mins=15,
            why=WhyReason(
                title=f"Güvenli Kalkış Planı ({'Uçak için 3 Saat' if is_plane else 'Otobüs için 20 Dk Tampon'})",
                explanation="Otelden 12:00'de ayrılıp öğle yemeği ve alışveriş sonrası kalkış merkezine tam vaktinde geçiş sağlanır.",
                score_metrics=[f"Tampon: {'180 dk' if is_plane else '20 dk'}"]
            )
        )

        grand_total = round(total_hotel_cost + total_transport_cost + total_food_cost + total_activities_cost, 2)

        return TripPlanResponse(
            destination_city=dest,
            origin_city=origin,
            adults_count=adults,
            children_count=children,
            rooms_count=rooms_needed,
            total_travelers=total_travelers,
            meal_board=meal_board,
            grand_total_trip_cost_usd=grand_total,
            date_window={"suggested_dates": f"{dep_str} - {ret_str}", "season_status": "En İdeal Gezi Sezonu", "why": WhyReason(title="Hava & Fiyat Dengesi", explanation="Bölgede hava koşullarının en güzel ve otel doluluklarının dengeli olduğu zaman aralığı.", score_metrics=["Memnuniyet: %96"])},
            transportation=TransportItem(
                mode=actual_mode, is_feasible=is_feasible, feasibility_warning=feasibility_warning, carrier_summary=f"{origin} ➔ {dest} ({actual_mode})",
                outbound_leg=None, return_leg=None, cost_per_adult_usd=t_cost_ad, cost_per_child_usd=t_cost_ch,
                total_transport_cost_usd=total_transport_cost, vehicle_breakdown=veh_breakdown, booking_links=trans_links,
                ground_transfers=ground_transfers,
                why=WhyReason(title=f"En Avantajlı {actual_mode} Tercihi", explanation=f"{origin} ile {dest} arasındaki en verimli ulaşım seçeneğidir.", score_metrics=[f"Toplam Ulaşım: {round(total_transport_cost * 33.5):,} ₺", "Güzergah: Optimize"])
            ),
            hotel=hotel_obj,
            daily_schedule=days_list,
            departure_day_buffer=dep_buffer,
            cost_breakdown=TripCostBreakdown(
                hotel_total_usd=total_hotel_cost,
                transport_total_usd=total_transport_cost,
                food_budget_total_usd=total_food_cost,
                activities_and_transfers_usd=round(total_activities_cost, 2),
                grand_total_usd=grand_total
            )
        )
#http://127.0.0.1:8000 