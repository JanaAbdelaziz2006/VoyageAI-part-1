document.addEventListener("DOMContentLoaded", () => {
    const turkishProvinces = [
        "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya", "Ankara", "Antalya",
        "Ardahan", "Artvin", "Aydın", "Balıkesir", "Bartın", "Batman", "Bayburt", "Bilecik",
        "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum",
        "Denizli", "Diyarbakır", "Düzce", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir",
        "Gaziantep", "Giresun", "Gümüşhane", "Hakkâri", "Hatay", "Iğdır", "Isparta", "İstanbul",
        "İzmir", "Kahramanmaraş", "Karabük", "Karaman", "Kars", "Kastamonu", "Kayseri", "Kırıkkale",
        "Kırklareli", "Kırşehir", "Kilis", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa",
        "Mardin", "Mersin", "Muğla", "Muş", "Nevşehir", "Niğde", "Ordu", "Osmaniye",
        "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Şanlıurfa", "Şırnak",
        "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Uşak", "Van", "Yalova", "Yozgat", "Zonguldak"
    ];

    const originSelect = document.getElementById("origin");
    const destSelect = document.getElementById("destination");

    if (originSelect && destSelect) {
        originSelect.innerHTML = "";
        destSelect.innerHTML = "";
        turkishProvinces.forEach(city => {
            const opt1 = document.createElement("option");
            opt1.value = city;
            opt1.innerText = city;
            if (city === "Bursa") opt1.selected = true;
            originSelect.appendChild(opt1);

            const opt2 = document.createElement("option");
            opt2.value = city;
            opt2.innerText = city;
            if (city === "Bartın") opt2.selected = true;
            destSelect.appendChild(opt2);
        });
    }

    // TRANSLATIONS SYSTEM
    const translations = {
        tr: {
            tagline: "81 İl Gerçek Zamanlı Rota, Otel ve Yorum Optimizasyonu",
            trip_params: "Seyahat Parametreleri",
            badge_turkey: "Türkiye 81 İl",
            origin_city: "Kalkış Şehri (Nereden)",
            dest_city: "Varış Şehri (Nereye)",
            adults_label: "Yetişkin",
            children_label: "Çocuk",
            rooms_label: "Oda",
            nights_label: "Gece",
            child_age_label: "Çocuk Yaşı (Tam Yaş)",
            transport_by: "Ulaşım Tercihi",
            budget_strategy: "Bütçe Stratejisi",
            cheapest_best: "En Ucuz & En İyi",
            fixed_budget: "Sabit Bütçe",
            min_hotel_rating: "Min Otel Puanı (10 Üzerinden)",
            hotel_location: "Otel Konumu",
            loc_center: "Şehir Merkezi / Tarihi Çarşıya Yakın",
            loc_sea: "Denize Sıfır / Sahil Kordonu / Plaj",
            loc_nature: "Doğa & Dağ / Yayla Manzaralı",
            loc_quiet: "Sakin Bölge & Yüksek Huzur",
            hotel_amenities: "Otel Olanakları (Gerekli)",
            amenity_beach: "🏖️ Özel Plaj / İskele",
            amenity_aqua: "🌊 Aquapark / Kaydırak",
            amenity_pool: "🏊 Yüzme Havuzu",
            amenity_spa: "🧖 Spa & Türk Hamamı",
            meal_package: "Pansiyon Tipi (Yemek)",
            board_bb: "Oda Kahvaltı (Öğle & Akşam Restoranlarını YZ Planlasın)",
            board_ro: "Sadece Oda (Sabah, Öğle, Akşam Tüm Restoranları YZ Planlasın)",
            board_hb: "Yarım Pansiyon (Sabah Kahvaltısı + Akşam Yemeği Dahil)",
            board_fb: "Tam Pansiyon (Sabah + Öğle + Akşam Yemeği Dahil)",
            board_ai: "Her Şey Dahil (Açık Büfe, Snack Bar & İçecekler Dahil)",
            notes_label: "Yapay Zeka İçin Özel Notlar",
            generate_btn: "Türkiye Rotalarını Tara & Planla",
            ready_title: "81 İl Akıllı Seyahat Optimizasyonu",
            ready_desc: "Kalkış ve varış şehrinizi seçin. Yapay zeka gerçek zamanlı arama yaparak en iyi otel, ulaşım ve gezi rotasını bulacaktır.",
            loading_title: "Gerçek Zamanlı Arama Yapılıyor...",
            loading_sub: "Otel, ulaşım ve mekan bilgileri AI ile aranıyor",
            total_cost_label: "Hesaplanan Toplam Tutar",
            dates_label: "Önerilen Tarihler",
            trans_label: "Ulaşım Planı",
            hotel_label: "Önerilen Otel",
            transfers_header: "Havalimanı / Otogar / İstasyon → Otel Transferi",
            score_factors: "Puanlama Faktörleri",
            btn_disabled_ferry: "⚠️ Bu güzergahta feribot hattı yoktur",
            btn_disabled_train: "⚠️ Bu güzergahta YHT tren hattı yoktur"
        },
        en: {
            tagline: "Real-Time Route, Hotel & Review Optimization for 81 Provinces",
            trip_params: "Travel Parameters",
            badge_turkey: "Turkey 81 Provinces",
            origin_city: "Departure City (From)",
            dest_city: "Arrival City (To)",
            adults_label: "Adults",
            children_label: "Children",
            rooms_label: "Rooms",
            nights_label: "Nights",
            child_age_label: "Child Age",
            transport_by: "Transport Preference",
            budget_strategy: "Budget Strategy",
            cheapest_best: "Cheapest & Best",
            fixed_budget: "Fixed Budget",
            min_hotel_rating: "Min Hotel Rating (out of 10)",
            hotel_location: "Hotel Location",
            loc_center: "City Center / Near Historical Sites",
            loc_sea: "Beachfront / Seaside",
            loc_nature: "Nature & Mountain / Countryside",
            loc_quiet: "Quiet & Peaceful Area",
            hotel_amenities: "Hotel Amenities (Required)",
            amenity_beach: "🏖️ Private Beach",
            amenity_aqua: "🌊 Aquapark / Water Slides",
            amenity_pool: "🏊 Swimming Pool",
            amenity_spa: "🧖 Spa & Turkish Bath",
            meal_package: "Meal Plan",
            board_bb: "Bed & Breakfast (AI plans lunch & dinner)",
            board_ro: "Room Only (AI plans all meals)",
            board_hb: "Half Board (Breakfast + Dinner included)",
            board_fb: "Full Board (All meals included)",
            board_ai: "All Inclusive (Buffet, Snacks & Drinks)",
            notes_label: "Special Notes for AI",
            generate_btn: "Search & Plan Turkey Routes",
            ready_title: "Smart Travel Optimization for 81 Provinces",
            ready_desc: "Select your departure and arrival cities. AI will search in real-time for the best hotels, transport, and itinerary.",
            loading_title: "Searching in Real-Time...",
            loading_sub: "Hotels, transport, and places being searched via AI",
            total_cost_label: "Estimated Total Cost",
            dates_label: "Suggested Dates",
            trans_label: "Transport Plan",
            hotel_label: "Suggested Hotel",
            transfers_header: "Airport / Bus Station / Train Station → Hotel Transfer",
            score_factors: "Scoring Factors",
            btn_disabled_ferry: "⚠️ No ferry route available",
            btn_disabled_train: "⚠️ No YHT train line available"
        },
        ar: {
            tagline: "تحسين المسارات والفنادق والتقييمات لـ 81 مدينة في الوقت الفعلي",
            trip_params: "معايير السفر",
            badge_turkey: "تركيا 81 مدينة",
            origin_city: "مدينة المغادرة (من أين)",
            dest_city: "مدينة الوصول (إلى أين)",
            adults_label: "بالغين",
            children_label: "أطفال",
            rooms_label: "غرف",
            nights_label: "ليالي",
            child_age_label: "عمر الطفل",
            transport_by: "وسيلة النقل المفضلة",
            budget_strategy: "استراتيجية الميزانية",
            cheapest_best: "الأرخص والأفضل",
            fixed_budget: "ميزانية محددة",
            min_hotel_rating: "أقل تقييم فندق (من 10)",
            hotel_location: "موقع الفندق",
            loc_center: "وسط المدينة / قريب من المواقع التاريخية",
            loc_sea: "على البحر مباشرة / شاطئ",
            loc_nature: "طبيعة وجبال / ريف",
            loc_quiet: "منطقة هادئة ومريحة",
            hotel_amenities: "مرافق الفندق (المطلوبة)",
            amenity_beach: "🏖️ شاطئ خاص",
            amenity_aqua: "🌊 أكوابارك / زلاقات مائية",
            amenity_pool: "🏊 مسبح",
            amenity_spa: "🧖 سبا وحمام تركي",
            meal_package: "نوع الإقامة (الوجبات)",
            board_bb: "إقامة وإفطار (الذكاء الاصطناعي يخطط الغداء والعشاء)",
            board_ro: "غرفة فقط (الذكاء الاصطناعي يخطط كل الوجبات)",
            board_hb: "نصف إقامة (إفطار + عشاء)",
            board_fb: "إقامة كاملة (كل الوجبات)",
            board_ai: "شامل كلياً (بوفيه، وجبات خفيفة ومشروبات)",
            notes_label: "ملاحظات خاصة للذكاء الاصطناعي",
            generate_btn: "ابحث وخطط مسارات تركيا",
            ready_title: "تحسين السفر الذكي لـ 81 مدينة",
            ready_desc: "اختر مدينة المغادرة والوصول. سيبحث الذكاء الاصطناعي في الوقت الفعلي عن أفضل الفنادق والنقل وخط السير.",
            loading_title: "جاري البحث في الوقت الفعلي...",
            loading_sub: "يتم البحث عن الفنادق والنقل والأماكن عبر الذكاء الاصطناعي",
            total_cost_label: "التكلفة الإجمالية المقدرة",
            dates_label: "التواريخ المقترحة",
            trans_label: "خطة النقل",
            hotel_label: "الفندق المقترح",
            transfers_header: "المطار / محطة الحافلات / محطة القطار → نقل إلى الفندق",
            score_factors: "عوامل التقييم",
            btn_disabled_ferry: "⚠️ لا يوجد خط عبّارة لهذا المسار",
            btn_disabled_train: "⚠️ لا يوجد خط قطار سريع لهذا المسار"
        }
    };

    let currentLang = "tr";
    let currentCurrency = "TRY";
    let currentTripData = null;

    const currencyRates = {
        TRY: { symbol: "₺", rate: 33.50 },
        USD: { symbol: "$", rate: 1.0 },
        EUR: { symbol: "€", rate: 0.92 },
        SAR: { symbol: "﷼", rate: 3.75 },
        EGP: { symbol: "L.E ", rate: 48.50 },
        GBP: { symbol: "£", rate: 0.78 }
    };

    function fmtPrice(amountUSD) {
        const c = currencyRates[currentCurrency] || currencyRates.TRY;
        const converted = Math.round((amountUSD || 0) * c.rate);
        return `${converted.toLocaleString()} ${c.symbol}`;
    }

    function applyTranslations() {
        const t = translations[currentLang] || translations.tr;
        document.querySelectorAll("[data-i18n]").forEach(el => {
            const key = el.getAttribute("data-i18n");
            if (t[key]) el.innerText = t[key];
        });
        document.documentElement.setAttribute("dir", currentLang === "ar" ? "rtl" : "ltr");
        document.documentElement.setAttribute("lang", currentLang);
    }

    document.getElementById("langSelector")?.addEventListener("change", (e) => {
        currentLang = e.target.value;
        applyTranslations();
        if (currentTripData) renderResults(currentTripData);
    });

    document.getElementById("currencySelector")?.addEventListener("change", (e) => {
        currentCurrency = e.target.value;
        if (currentTripData) renderResults(currentTripData);
    });

    // TRANSPORT FEASIBILITY CHECK
    const yhtCities = new Set(["İstanbul", "Istanbul", "Ankara", "Eskişehir", "Konya", "Karaman", "Sivas", "Yozgat", "Kırıkkale", "Bilecik", "Sakarya", "Kocaeli"]);
    const ferryPairs = new Set([
        "Bursa-İstanbul", "İstanbul-Bursa", "Bursa-Istanbul", "Istanbul-Bursa",
        "Yalova-İstanbul", "İstanbul-Yalova", "Yalova-Istanbul", "Istanbul-Yalova",
        "Balıkesir-İstanbul", "İstanbul-Balıkesir", "Çanakkale-Tekirdağ", "Tekirdağ-Çanakkale"
    ]);

    const transportSelect = document.getElementById("transport_mode");
    const warningBanner = document.getElementById("transportWarningBanner");
    const warningText = document.getElementById("transportWarningText");
    const submitBtn = document.getElementById("submitBtn");

    function checkTransportFeasibility() {
        if (!originSelect || !destSelect || !transportSelect || !warningBanner) return;
        const orig = originSelect.value;
        const dest = destSelect.value;
        const mode = transportSelect.value;
        const pair = `${orig}-${dest}`;
        const t = translations[currentLang] || translations.tr;

        let isFeasible = true;
        let warningMsg = "";

        if (mode === "Train" && (!yhtCities.has(orig) || !yhtCities.has(dest))) {
            isFeasible = false;
            warningMsg = t.btn_disabled_train || `⚠️ No YHT train line between ${orig} and ${dest}`;
        } else if ((mode === "Passenger Ferry" || mode === "Car Ferry") && !ferryPairs.has(pair)) {
            isFeasible = false;
            warningMsg = t.btn_disabled_ferry || `⚠️ No ferry route between ${orig} and ${dest}`;
        }

        if (!isFeasible) {
            warningBanner.classList.remove("hidden");
            if (warningText) warningText.innerText = warningMsg;
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.classList.add("opacity-50", "cursor-not-allowed");
            }
        } else {
            warningBanner.classList.add("hidden");
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.classList.remove("opacity-50", "cursor-not-allowed");
            }
        }
    }

    transportSelect?.addEventListener("change", checkTransportFeasibility);
    originSelect?.addEventListener("change", checkTransportFeasibility);
    destSelect?.addEventListener("change", checkTransportFeasibility);

    // FORM SUBMISSION
    document.getElementById("tripForm")?.addEventListener("submit", async (e) => {
        e.preventDefault();

        const payload = {
            origin: originSelect?.value || "Bursa",
            destination: destSelect?.value || "Bartın",
            adults_count: parseInt(document.getElementById("adults_count")?.value) || 4,
            children_count: parseInt(document.getElementById("children_count")?.value) || 0,
            rooms_count: document.getElementById("rooms_count")?.value || "2",
            child_age: parseInt(document.getElementById("child_age")?.value) || 12,
            nights: parseInt(document.getElementById("nights")?.value) || 3,
            transport_mode: transportSelect?.value || "Bus",
            hotel_min_rating: parseFloat(document.getElementById("hotel_min_rating")?.value) || 8.0,
            hotel_location: document.getElementById("hotel_location")?.value || "city_center",
            amenities: Array.from(document.querySelectorAll("input[name='amenity']:checked")).map(cb => cb.value),
            has_beach: document.getElementById("chkBeach")?.checked || false,
            meal_board: document.getElementById("meal_board")?.value || "breakfast_only",
            language: currentLang
        };

        document.getElementById("emptyState")?.classList.add("hidden");
        document.getElementById("resultsContainer")?.classList.add("hidden");
        document.getElementById("loadingState")?.classList.remove("hidden");

        try {
            const res = await fetch("/api/plan-trip", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const json = await res.json();
            if (!res.ok || !json.success) {
                alert(json.error || "Error generating trip");
                return;
            }

            currentTripData = json.data;
            renderResults(currentTripData);
        } catch (err) {
            alert("Connection error: " + err.message);
        } finally {
            document.getElementById("loadingState")?.classList.add("hidden");
        }
    });

    function renderResults(data) {
        if (!data) return;

        document.getElementById("resRouteBadge").innerText = `${(data.origin_city || '').toUpperCase()} ➔ ${(data.destination_city || '').toUpperCase()}`;
        document.getElementById("resDestinationTitle").innerText = `${data.destination_city || ''} Gezi & Tatil Programı`;
        document.getElementById("resTotalCost").innerText = fmtPrice(data.grand_total_trip_cost_usd);
        document.getElementById("resPerPersonCost").innerText = `≈ ${fmtPrice((data.grand_total_trip_cost_usd || 0) / (data.total_travelers || 1))} / kişi başı`;

        // Hotel & Links
        document.getElementById("resHotelName").innerText = data.hotel?.name || "---";
        const hotelLinksContainer = document.getElementById("resHotelLinks");
        if (hotelLinksContainer) {
            hotelLinksContainer.innerHTML = (data.hotel?.booking_links || []).map(l => `
                <a href="${l.url}" target="_blank" rel="noopener" class="text-[11px] bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 px-2 py-0.5 rounded flex items-center gap-1">
                    <i class="fa-solid fa-hotel text-[9px]"></i> ${l.provider_name}
                </a>
            `).join("");
        }

        // Daily Schedule
        const dailyContainer = document.getElementById("dailyItineraryContainer");
        if (dailyContainer) {
            dailyContainer.innerHTML = (data.daily_schedule || []).map(day => `
                <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                    <div class="font-bold text-white border-b border-slate-800 pb-2">
                        <span class="text-sky-400 text-xs">GÜN ${day.day_number}:</span> ${day.day_title}
                    </div>
                    ${(day.activities || []).map(act => `
                        <div class="bg-slate-950 border border-slate-800 rounded-xl p-3 flex justify-between items-center">
                            <div>
                                <span class="text-xs text-sky-400 font-bold">${act.time_slot}</span>
                                <h5 class="text-sm font-bold text-white">${act.place_name}</h5>
                                <p class="text-xs text-slate-400">📍 ${act.distance_from_hotel_km} km • ★ ${act.aggregated_rating_10}/10</p>
                            </div>
                            <a href="${act.map_url}" target="_blank" rel="noopener" class="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded border border-slate-700">
                                <i class="fa-solid fa-location-dot text-red-400"></i> Harita
                            </a>
                        </div>
                    `).join("")}
                </div>
            `).join("");
        }

        document.getElementById("resultsContainer")?.classList.remove("hidden");
    }

    applyTranslations();
    checkTransportFeasibility();
});