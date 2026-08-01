document.addEventListener("DOMContentLoaded", () => {
    // Currency rates relative to 1 USD
    const currencyRates = {
        USD: { symbol: "$", rate: 1.0 },
        EUR: { symbol: "€", rate: 0.92 },
        TRY: { symbol: "₺", rate: 33.50 },
        SAR: { symbol: "﷼", rate: 3.75 },
        GBP: { symbol: "£", rate: 0.78 },
        EGP: { symbol: "L.E ", rate: 48.50 } // Added Egyptian Pound
    };

    // Multi-language dictionaries
    const translations = {
        en: {
            tagline: "Smart Algorithmic Travel Intelligence",
            trip_params: "Trip Parameters",
            step_1: "Step 1",
            origin_city: "Origin City",
            dest_city: "Destination",
            travelers: "Travelers / People",
            nights: "Nights",
            transport_by: "Transport Method",
            budget_strategy: "Budget Strategy",
            cheapest_best: "Cheapest & Best",
            fixed_budget: "Fixed Budget",
            min_hotel_rating: "Min Hotel Level (Out of 10)",
            hotel_location: "Hotel Preferred Location",
            hotel_amenities: "Hotel Amenities (Must Have)",
            meal_package: "Hotel Meal Board",
            generate_btn: "Generate AI Itinerary",
            ready_title: "Smart Algorithmic Trip Optimization",
            ready_desc: "Enter your trip parameters. The AI will synthesize multi-platform ratings (Google Maps, Otelz, TripAdvisor), compute verified transfers, and explain all decisions.",
            analyzing: "Aggregating Verified Reviews, Routes & Costs...",
            total_cost_label: "Total Calculated Cost",
            dates_label: "Dates",
            trans_label: "Transport",
            hotel_label: "Ranked Hotel",
            airport_transfer_title: "Airport-to-Hotel Transfer:",
            score_factors: "Aggregated Score Factors",
            why_place: "Why this place?",
            why_rest: "Why this restaurant?",
            book_ticket: "Book / Check Rates",
            view_map: "View on Map"
        },
        tr: {
            tagline: "Akıllı Algoritmik Seyahat ve Yorum Optimizasyonu",
            trip_params: "Seyahat Parametreleri",
            step_1: "1. Adım",
            origin_city: "Kalkış Şehri",
            dest_city: "Varış Şehri",
            travelers: "Kişi Sayısı",
            nights: "Gece Sayısı",
            transport_by: "Ulaşım Türü",
            budget_strategy: "Bütçe Stratejisi",
            cheapest_best: "En Ucuz ve En İyi",
            fixed_budget: "Sabit Bütçe",
            min_hotel_rating: "Min Otel Puanı (10 Üzerinden)",
            hotel_location: "Otel Konum Tercihi",
            hotel_amenities: "Otel Olanakları (Gerekli)",
            meal_package: "Otel Pansiyon Tipi",
            generate_btn: "Yapay Zeka Planını Oluştur",
            ready_title: "Akıllı Algoritmik Seyahat Planlama",
            ready_desc: "Seyahat bilgilerinizi girin. Yapay zeka Google Haritalar, Otelz ve TripAdvisor puanlarını birleştirerek en iyi fiyat/performans rotasını çıkarsın.",
            analyzing: "Doğrulanmış Yorumlar, Rotalar ve Fiyatlar Hesaplanıyor...",
            total_cost_label: "Hesaplanan Toplam Tutar",
            dates_label: "Tarihler",
            trans_label: "Ulaşım",
            hotel_label: "1. Sıradaki Otel",
            airport_transfer_title: "Havalimanı - Otel Transferi:",
            score_factors: "Skor Faktörleri ve Gerekçeler",
            why_place: "Neden burası?",
            why_rest: "Neden bu restoran?",
            book_ticket: "Bilet / Fiyat İncele",
            view_map: "Haritada Gör"
        },
        ar: {
            tagline: "نظام الذكاء الاصطناعي لتخطيط وتحسين الرحلات",
            trip_params: "بيانات ومعايير الرحلة",
            step_1: "الخطوة الأولى",
            origin_city: "مدينة الإقلاع / المغادرة",
            dest_city: "الوجهة السياحية",
            travelers: "عدد المسافرين",
            nights: "عدد الليالي",
            transport_by: "وسيلة السفر",
            budget_strategy: "استراتيجية الميزانية",
            cheapest_best: "الأرخص والأفضل تقييماً",
            fixed_budget: "ميزانية محددة",
            min_hotel_rating: "الحد الأدنى لمستوى الفندق (من 10)",
            hotel_location: "الموقع المفضل للفندق",
            hotel_amenities: "ميزات الفندق المطلوبة",
            meal_package: "نظام الوجبات بالفندق",
            generate_btn: "إنشاء برنامج الرحلة الذكي",
            ready_title: "تخطيط ذكي معتمد على خوارزميات التقييم",
            ready_desc: "أدخل معايير رحلتك، ليقوم الذكاء الاصطناعي بجمع تقييمات Google Maps و Otelz و TripAdvisor لحساب التكلفة بدقة وتوضيح أسباب كل خيار.",
            analyzing: "جاري تحليل التقييمات، المسارات الحقيقية، والأسعار...",
            total_cost_label: "التكلفة الإجمالية المحسوبة",
            dates_label: "التواريخ المقترحة",
            trans_label: "وسيلة النقل",
            hotel_label: "الفندق المصنف الأول",
            airport_transfer_title: "المواصلات من المطار إلى الفندق:",
            score_factors: "عوامل التقييم والأسباب",
            why_place: "لماذا هذا المكان؟",
            why_rest: "لماذا هذا المطعم؟",
            book_ticket: "حجز / فحص الأسعار",
            view_map: "عرض في الخريطة"
        }
    };

    let currentLang = "en";
    let currentCurrency = "USD";
    let currentTripData = null;
    let currentBudgetMode = "cheapest_best";

    // Format currency helper
    function fmtPrice(amountUSD) {
        const c = currencyRates[currentCurrency] || currencyRates.USD;
        const converted = (amountUSD * c.rate).toFixed(0);
        return `${c.symbol}${Number(converted).toLocaleString()}`;
    }

    // Language switch
    const langSelector = document.getElementById("langSelector");
    langSelector.addEventListener("change", (e) => {
        currentLang = e.target.value;
        document.documentElement.dir = currentLang === "ar" ? "rtl" : "ltr";
        document.querySelectorAll("[data-i18n]").forEach(el => {
            const key = el.getAttribute("data-i18n");
            if (translations[currentLang] && translations[currentLang][key]) {
                el.innerText = translations[currentLang][key];
            }
        });
        if (currentTripData) renderResults(currentTripData);
    });

    // Currency switch
    const currencySelector = document.getElementById("currencySelector");
    currencySelector.addEventListener("change", (e) => {
        currentCurrency = e.target.value;
        if (currentTripData) renderResults(currentTripData);
    });

    // Hotel Rating Slider
    const hotelSlider = document.getElementById("hotel_min_rating");
    const ratingVal = document.getElementById("ratingVal");
    hotelSlider.addEventListener("input", (e) => {
        ratingVal.innerText = `${parseFloat(e.target.value).toFixed(1)} / 10`;
    });

    // Budget Mode Toggle
    const btnCheapest = document.getElementById("btnBudgetCheapest");
    const btnCustom = document.getElementById("btnBudgetCustom");
    const customContainer = document.getElementById("customBudgetContainer");
    const budgetAmount = document.getElementById("budget_amount");

    btnCheapest.addEventListener("click", () => {
        currentBudgetMode = "cheapest_best";
        btnCheapest.className = "py-2 px-2 text-xs font-medium rounded-lg border border-sky-500 bg-sky-500/20 text-sky-300";
        btnCustom.className = "py-2 px-2 text-xs font-medium rounded-lg border border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200";
        customContainer.classList.add("hidden");
        budgetAmount.removeAttribute("required");
    });

    btnCustom.addEventListener("click", () => {
        currentBudgetMode = "custom";
        btnCustom.className = "py-2 px-2 text-xs font-medium rounded-lg border border-sky-500 bg-sky-500/20 text-sky-300";
        btnCheapest.className = "py-2 px-2 text-xs font-medium rounded-lg border border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200";
        customContainer.classList.remove("hidden");
        budgetAmount.setAttribute("required", "true");
    });

    // Modal logic
    const whyModal = document.getElementById("whyModal");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const modalTitle = document.getElementById("modalTitle");
    const modalSubtitle = document.getElementById("modalSubtitle");
    const modalExplanation = document.getElementById("modalExplanation");
    const modalMetrics = document.getElementById("modalMetrics");

    function showWhyModal(whyData) {
        modalTitle.innerText = whyData.title || "AI Decision Breakdown";
        modalSubtitle.innerText = "Algorithmic & Review Justification";
        modalExplanation.innerText = whyData.explanation;
        modalMetrics.innerHTML = "";
        if (whyData.score_metrics) {
            whyData.score_metrics.forEach(m => {
                const b = document.createElement("div");
                b.className = "flex items-center text-xs font-medium text-sky-300 bg-sky-950/60 border border-sky-800/60 px-3 py-1.5 rounded-lg";
                b.innerHTML = `<i class="fa-solid fa-chart-line mr-2 text-sky-400"></i> ${m}`;
                modalMetrics.appendChild(b);
            });
        }
        whyModal.classList.remove("hidden");
    }

    closeModalBtn.addEventListener("click", () => whyModal.classList.add("hidden"));
    whyModal.addEventListener("click", (e) => { if (e.target === whyModal) whyModal.classList.add("hidden"); });

    // Submit handler
    const tripForm = document.getElementById("tripForm");
    const emptyState = document.getElementById("emptyState");
    const loadingState = document.getElementById("loadingState");
    const resultsContainer = document.getElementById("resultsContainer");

    tripForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Selected amenities
        const selectedAmenities = Array.from(document.querySelectorAll("input[name='amenity']:checked")).map(cb => cb.value);

        const payload = {
            origin: document.getElementById("origin").value.trim(),
            destination: document.getElementById("destination").value.trim(),
            travelers_count: parseInt(document.getElementById("travelers_count").value),
            nights: parseInt(document.getElementById("nights").value),
            transport_mode: document.getElementById("transport_mode").value,
            budget_type: currentBudgetMode,
            budget_amount: currentBudgetMode === "custom" ? parseFloat(budgetAmount.value) : null,
            hotel_min_rating: parseFloat(hotelSlider.value),
            hotel_location: document.getElementById("hotel_location").value,
            amenities: selectedAmenities,
            meal_board: document.getElementById("meal_board").value
        };

        emptyState.classList.add("hidden");
        resultsContainer.classList.add("hidden");
        loadingState.classList.remove("hidden");

        try {
            const res = await fetch("/api/plan-trip", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const json = await res.json();
            if (!json.success) {
                alert("Error: " + json.error);
                loadingState.classList.add("hidden");
                emptyState.classList.remove("hidden");
                return;
            }

            currentTripData = json.data;
            renderResults(currentTripData);

        } catch (err) {
            alert("Connection error: " + err.message);
        } finally {
            loadingState.classList.add("hidden");
        }
    });

    // Main Render Function
    function renderResults(data) {
        const t = translations[currentLang];
        const travelers = data.travelers_count;

        // Header and Costs
        document.getElementById("resRouteBadge").innerText = `${data.origin_city.toUpperCase()} ➔ ${data.destination_city.toUpperCase()}`;
        document.getElementById("resDestinationTitle").innerText = `${data.destination_city} Complete Program`;
        document.getElementById("resTravelersNote").innerText = `${travelers} Traveler(s) • ${data.daily_schedule.length} Nights • ${data.meal_board.replace('_', ' ').toUpperCase()}`;
        
        document.getElementById("resTotalCost").innerText = fmtPrice(data.grand_total_trip_cost_usd);
        document.getElementById("resPerPersonCost").innerText = `≈ ${fmtPrice(data.grand_total_trip_cost_usd / travelers)} / person`;

        // Cost breakdown badges
        const bd = data.cost_breakdown;
        const badgesContainer = document.getElementById("costBreakdownBadges");
        badgesContainer.innerHTML = `
            <div class="bg-slate-950 p-2 rounded-lg border border-slate-800 text-center">
                <div class="text-slate-400 text-[10px]">🏨 Hotel Total</div>
                <div class="font-bold text-sky-300">${fmtPrice(bd.hotel_total_usd)}</div>
            </div>
            <div class="bg-slate-950 p-2 rounded-lg border border-slate-800 text-center">
                <div class="text-slate-400 text-[10px]">✈️ Transport Total</div>
                <div class="font-bold text-indigo-300">${fmtPrice(bd.transport_total_usd)}</div>
            </div>
            <div class="bg-slate-950 p-2 rounded-lg border border-slate-800 text-center">
                <div class="text-slate-400 text-[10px]">🍽️ Dining / Meals</div>
                <div class="font-bold text-amber-300">${fmtPrice(bd.food_budget_total_usd)}</div>
            </div>
            <div class="bg-slate-950 p-2 rounded-lg border border-slate-800 text-center">
                <div class="text-slate-400 text-[10px]">🎟️ Activities & Local</div>
                <div class="font-bold text-emerald-300">${fmtPrice(bd.activities_and_transfers_usd)}</div>
            </div>
        `;

        // Pillar: Dates
        document.getElementById("resDates").innerText = data.date_window.suggested_dates;
        document.getElementById("resSeason").innerText = data.date_window.season_status;
        document.getElementById("whyDatesBtn").onclick = () => showWhyModal(data.date_window.why);

        // Pillar: Transport
        document.getElementById("resTransport").innerText = `${data.transportation.mode}: ${data.transportation.carrier_or_route}`;
        document.getElementById("resTransportCost").innerText = `${fmtPrice(data.transportation.estimated_cost_per_person_usd)}/person (Total: ${fmtPrice(data.transportation.total_transport_cost_usd)})`;
        document.getElementById("whyTransportBtn").onclick = () => showWhyModal(data.transportation.why);

        const transLinks = document.getElementById("resTransportLinks");
        transLinks.innerHTML = data.transportation.booking_links.map(l => `
            <a href="${l.url}" target="_blank" class="text-[11px] bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 px-2 py-0.5 rounded flex items-center gap-1">
                <i class="fa-solid fa-arrow-up-right-from-square text-[9px]"></i> ${l.provider_name}
            </a>
        `).join("");

        // Airport Ground Transfer
        const groundSection = document.getElementById("groundTransferSection");
        if (data.transportation.ground_transfer_from_terminal) {
            const gt = data.transportation.ground_transfer_from_terminal;
            groundSection.classList.remove("hidden");
            document.getElementById("resGroundTransferText").innerText = `${gt.mode} (~${gt.duration_minutes} mins) — ${gt.instructions}`;
            document.getElementById("resGroundTransferCost").innerText = fmtPrice(gt.estimated_cost_usd);
        } else {
            groundSection.classList.add("hidden");
        }

        // Pillar: Hotel
        document.getElementById("resHotelName").innerText = data.hotel.name;
        document.getElementById("resHotelRating").innerHTML = `
            <i class="fa-solid fa-star text-amber-400 mr-1"></i> ${data.hotel.aggregated_rating_10}/10 (${data.hotel.stars}★)
            <span class="text-slate-400 ml-auto font-bold text-slate-300">${fmtPrice(data.hotel.price_per_night_usd)}/night</span>
        `;
        document.getElementById("whyHotelBtn").onclick = () => showWhyModal(data.hotel.why);

        const hotelLinks = document.getElementById("resHotelLinks");
        hotelLinks.innerHTML = data.hotel.booking_links.map(l => `
            <a href="${l.url}" target="_blank" class="text-[11px] bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 px-2 py-0.5 rounded flex items-center gap-1">
                <i class="fa-solid fa-hotel text-[9px]"></i> ${l.provider_name}
            </a>
        `).join("");

        // Daily Itinerary Rendering
        const dailyContainer = document.getElementById("dailyItineraryContainer");
        dailyContainer.innerHTML = "";

        data.daily_schedule.forEach(day => {
            const dayCard = document.createElement("div");
            dayCard.className = "bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4";

            // Breakfast Banner
            const breakfastHTML = `
                <div class="bg-amber-950/30 border border-amber-500/20 rounded-xl p-2.5 text-xs text-amber-200 flex items-center gap-2">
                    <span class="text-amber-400 text-base">🥐</span>
                    <span><strong class="text-amber-300">Breakfast:</strong> ${day.breakfast_plan}</span>
                </div>
            `;

            // Activities
            let actsHTML = day.activities.map((act, idx) => `
                <div class="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="text-xs font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded">${act.time_slot}</span>
                            <h5 class="text-sm font-bold text-slate-100">${act.place_name}</h5>
                            <span class="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">${act.category}</span>
                        </div>
                        <p class="text-xs text-slate-400 mt-1">
                            <i class="fa-solid fa-person-walking text-slate-500 mr-1"></i> ${act.transport_from_prev} 
                            (${act.transport_cost_usd > 0 ? fmtPrice(act.transport_cost_usd) : 'Free'})
                            • Ticket: <span class="text-slate-300">${act.entry_cost_usd > 0 ? fmtPrice(act.entry_cost_usd) : 'Free'}</span>
                            • Aggregated Rating: <span class="text-amber-400 font-semibold">${act.aggregated_rating_10}/10</span>
                        </p>
                    </div>
                    <div class="flex items-center gap-2">
                        <a href="${act.booking_or_map_url}" target="_blank" class="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-lg flex items-center gap-1">
                            <i class="fa-solid fa-location-dot text-red-400"></i> ${t.view_map}
                        </a>
                        <button class="why-act-btn text-xs bg-sky-950/60 hover:bg-sky-900/60 text-sky-300 border border-sky-800/60 px-2.5 py-1 rounded-lg" 
                            data-day="${day.day_number}" data-act-idx="${idx}">
                            ${t.why_place}
                        </button>
                    </div>
                </div>
            `).join("");

            // Restaurants
            let restHTML = "";
            if (day.restaurants && day.restaurants.length > 0) {
                restHTML = `
                <div class="pt-2 border-t border-slate-800/80">
                    <h6 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">🍽️ Curated Dining Spots (Aggregated Ratings)</h6>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        ${day.restaurants.map((rest, rIdx) => `
                            <div class="bg-slate-950/60 border border-slate-800 rounded-lg p-3 flex justify-between items-center">
                                <div>
                                    <div class="text-xs font-bold text-emerald-400">${rest.meal_type}: ${rest.restaurant_name}</div>
                                    <div class="text-xs text-slate-400">${rest.cuisine} • Est: ${fmtPrice(rest.estimated_cost_per_person_usd)}/p • ★ ${rest.aggregated_rating_10}/10</div>
                                </div>
                                <div class="flex items-center gap-1">
                                    <a href="${rest.booking_or_map_url}" target="_blank" class="text-xs text-slate-400 hover:text-white p-1">
                                        <i class="fa-solid fa-location-dot"></i>
                                    </a>
                                    <button class="why-rest-btn text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded" 
                                        data-day="${day.day_number}" data-rest-idx="${rIdx}">Why?</button>
                                </div>
                            </div>
                        `).join("")}
                    </div>
                </div>`;
            }

            dayCard.innerHTML = `
                <div class="flex justify-between items-center pb-2 border-b border-slate-800">
                    <div>
                        <span class="text-xs font-bold text-sky-400">DAY ${day.day_number}</span>
                        <h4 class="text-base font-bold text-white">${day.day_title}</h4>
                    </div>
                </div>
                ${breakfastHTML}
                <div class="space-y-2">
                    ${actsHTML}
                </div>
                ${restHTML}
            `;
            dailyContainer.appendChild(dayCard);
        });

        // Dynamic activity/rest why listeners
        document.querySelectorAll(".why-act-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const dayNum = parseInt(btn.getAttribute("data-day"));
                const actIdx = parseInt(btn.getAttribute("data-act-idx"));
                showWhyModal(data.daily_schedule[dayNum - 1].activities[actIdx].why);
            });
        });

        document.querySelectorAll(".why-rest-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const dayNum = parseInt(btn.getAttribute("data-day"));
                const rIdx = parseInt(btn.getAttribute("data-rest-idx"));
                showWhyModal(data.daily_schedule[dayNum - 1].restaurants[rIdx].why);
            });
        });

        // Departure Buffer
        const dep = data.departure_day_buffer;
        const depCard = document.getElementById("departureBufferCard");
        depCard.innerHTML = `
            <div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div class="flex items-center space-x-2">
                    <span class="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                        <i class="fa-solid fa-shield-halved"></i>
                    </span>
                    <div>
                        <h4 class="text-sm font-bold text-white">Departure Day Strategy (4-Hour Airport Buffer)</h4>
                        <p class="text-xs text-slate-400">Departure: ${dep.flight_departure_time} | Terminal Target Arrival: ${dep.airport_arrival_target_time}</p>
                    </div>
                </div>
                <button id="whyDepartureBtn" class="text-xs bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full">
                    Why this 4-hr buffer?
                </button>
            </div>
            <div class="mt-4 space-y-3">
                <div class="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
                    <span class="font-bold text-sky-400">Final Afternoon Activity:</span> 
                    ${dep.activities_before_buffer[0] ? dep.activities_before_buffer[0].place_name + ' (' + dep.activities_before_buffer[0].time_slot + ')' : 'City promenade'}
                </div>
                <div class="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
                    <span class="font-bold text-emerald-400">Pre-Departure Meal:</span> 
                    ${dep.recommended_last_meal.restaurant_name} (${dep.recommended_last_meal.cuisine}) — Quick prep speed & close to terminal route.
                </div>
            </div>
        `;
        document.getElementById("whyDepartureBtn").onclick = () => showWhyModal(dep.why);

        resultsContainer.classList.remove("hidden");
    }
});