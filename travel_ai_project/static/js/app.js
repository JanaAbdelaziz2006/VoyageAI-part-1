document.addEventListener("DOMContentLoaded", () => {
    // City country code mapping for road connectivity checks
    const cityCountries = {
        "Bursa": "TR", "Istanbul": "TR", "Ankara": "TR", "Trabzon": "TR", "Antalya": "TR", "Izmir": "TR", "Bodrum": "TR",
        "Cairo": "EG", "Sharm El Sheikh": "EG", "Hurghada": "EG", "Alexandria": "EG",
        "Athens": "GR", "Thessaloniki": "GR",
        "Dubai": "AE", "Riyadh": "SA", "Jeddah": "SA",
        "Paris": "FR", "Rome": "IT", "London": "GB"
    };

    const drivableInternationalPairs = new Set([
        "TR-GR", "GR-TR", "FR-IT", "IT-FR", "SA-AE", "AE-SA"
    ]);

    const currencyRates = {
        TRY: { symbol: "₺", rate: 33.50 },
        USD: { symbol: "$", rate: 1.0 },
        EUR: { symbol: "€", rate: 0.92 },
        EGP: { symbol: "L.E ", rate: 48.50 },
        SAR: { symbol: "﷼", rate: 3.75 },
        GBP: { symbol: "£", rate: 0.78 }
    };

    const translations = {
        en: {
            tagline: "Smart Algorithmic Travel Intelligence",
            trip_params: "Trip Parameters",
            origin_city: "Origin City",
            dest_city: "Destination",
            transport_by: "Transport Method",
            budget_strategy: "Budget Strategy",
            cheapest_best: "Cheapest & Best",
            fixed_budget: "Fixed Budget",
            min_hotel_rating: "Min Hotel Level (Out of 10)",
            hotel_location: "Hotel Location",
            hotel_amenities: "Hotel Amenities (Must Have)",
            meal_package: "Hotel Meal Board",
            generate_btn: "Generate AI Itinerary",
            ready_title: "Worldwide AI Trip Optimization",
            ready_desc: "Select your origin and destination. The AI verifies transit feasibility, calculates passenger totals, finds 100% real verified hotels, and provides working booking links.",
            analyzing: "Verifying Real Routes, Hotels & Deep Links...",
            total_cost_label: "Total Calculated Cost",
            dates_label: "Dates",
            trans_label: "Transport",
            hotel_label: "Verified Hotel",
            score_factors: "Aggregated Score Factors",
            why_place: "Why this place?",
            why_rest: "Why this restaurant?",
            view_map: "View on Map"
        },
        tr: {
            tagline: "Akıllı Algoritmik Seyahat ve Rota Optimizasyonu",
            trip_params: "Seyahat Parametreleri",
            origin_city: "Kalkış Şehri",
            dest_city: "Varış Şehri",
            transport_by: "Ulaşım Türü",
            budget_strategy: "Bütçe Stratejisi",
            cheapest_best: "En Ucuz ve En İyi",
            fixed_budget: "Sabit Bütçe",
            min_hotel_rating: "Min Otel Puanı (10 Üzerinden)",
            hotel_location: "Otel Konumu",
            hotel_amenities: "Otel Olanakları (Gerekli)",
            meal_package: "Otel Pansiyon Tipi",
            generate_btn: "Yapay Zeka Planını Oluştur",
            ready_title: "Dünya Çapında Akıllı Seyahat Planlama",
            ready_desc: "Kalkış ve varış şehirlerinizi seçin. Yapay zeka kara bağlantılarını doğrular, kişi sayısını hesaplar ve gerçek rezervasyon linkleri sunar.",
            analyzing: "Gerçek Rotalar, Oteller ve Rezervasyon Linkleri Doğrulanıyor...",
            total_cost_label: "Hesaplanan Toplam Tutar",
            dates_label: "Tarihler",
            trans_label: "Ulaşım",
            hotel_label: "Doğrulanmış Otel",
            score_factors: "Skor Faktörleri ve Gerekçeler",
            why_place: "Neden burası?",
            why_rest: "Neden bu restoran?",
            view_map: "Haritada Gör"
        },
        ar: {
            tagline: "نظام الذكاء الاصطناعي العالمي لتخطيط وتحسين الرحلات",
            trip_params: "بيانات ومعايير الرحلة",
            origin_city: "مدينة الإقلاع / المغادرة",
            dest_city: "الوجهة السياحية",
            transport_by: "وسيلة السفر",
            budget_strategy: "استراتيجية الميزانية",
            cheapest_best: "الأرخص والأفضل تقييماً",
            fixed_budget: "ميزانية محددة",
            min_hotel_rating: "الحد الأدنى لمستوى الفندق (من 10)",
            hotel_location: "موقع الفندق المفضل",
            hotel_amenities: "ميزات الفندق المطلوبة",
            meal_package: "نظام الوجبات بالفندق",
            generate_btn: "إنشاء برنامج الرحلة الذكي",
            ready_title: "تخطيط ذكي معتمد على خوارزميات التقييم العالمية",
            ready_desc: "اختر مدن الرحلة، ليقوم الذكاء الاصطناعي بفحص إمكانية السفر بالسيارة، وحساب تكلفة الأفراد بدقة، وتقديم فنادق حقيقية بروابط حجز مباشرة.",
            analyzing: "جاري فحص المسارات الحقيقية وروابط الحجز المباشرة...",
            total_cost_label: "التكلفة الإجمالية المحسوبة",
            dates_label: "التواريخ المقترحة",
            trans_label: "وسيلة النقل",
            hotel_label: "الفندق المعتمد",
            score_factors: "عوامل التقييم والأسباب",
            why_place: "لماذا هذا المكان؟",
            why_rest: "لماذا هذا المطعم؟",
            view_map: "عرض في الخريطة"
        }
    };

    let currentLang = "en";
    let currentCurrency = "TRY";
    let currentTripData = null;
    let currentBudgetMode = "cheapest_best";
    let currentTransportMode = "public_smart"; // 'public_smart' or 'own_car'

    function fmtPrice(amountUSD) {
        const c = currencyRates[currentCurrency] || currencyRates.TRY;
        const converted = Math.round(amountUSD * c.rate);
        return `${c.symbol}${converted.toLocaleString()}`;
    }

    // Road feasibility check
    const originSelect = document.getElementById("origin");
    const destSelect = document.getElementById("destination");
    const btnTransCar = document.getElementById("btnTransCar");
    const btnTransPublic = document.getElementById("btnTransPublic");
    const carDisabledBanner = document.getElementById("carDisabledBanner");

    function validateRoadFeasibility() {
        const origCountry = cityCountries[originSelect.value] || "TR";
        const destCountry = cityCountries[destSelect.value] || "EG";
        const pairKey = `${origCountry}-${destCountry}`;

        const isDrivable = (origCountry === destCountry) || drivableInternationalPairs.has(pairKey);

        if (!isDrivable) {
            btnTransCar.classList.add("opacity-40", "cursor-not-allowed");
            btnTransCar.setAttribute("disabled", "true");
            carDisabledBanner.classList.remove("hidden");

            // Auto-switch to Public Smart
            currentTransportMode = "public_smart";
            btnTransPublic.className = "py-2.5 px-2 text-xs font-medium rounded-lg border border-sky-500 bg-sky-500/20 text-sky-300 text-center";
            btnTransCar.className = "py-2.5 px-2 text-xs font-medium rounded-lg border border-slate-700 bg-slate-800 text-slate-400 text-center opacity-40 cursor-not-allowed";
        } else {
            btnTransCar.classList.remove("opacity-40", "cursor-not-allowed");
            btnTransCar.removeAttribute("disabled");
            carDisabledBanner.classList.add("hidden");
        }
    }

    originSelect.addEventListener("change", validateRoadFeasibility);
    destSelect.addEventListener("change", validateRoadFeasibility);
    validateRoadFeasibility();

    // Transport buttons toggle
    btnTransPublic.addEventListener("click", () => {
        currentTransportMode = "public_smart";
        btnTransPublic.className = "py-2.5 px-2 text-xs font-medium rounded-lg border border-sky-500 bg-sky-500/20 text-sky-300 text-center";
        btnTransCar.className = "py-2.5 px-2 text-xs font-medium rounded-lg border border-slate-700 bg-slate-800 text-slate-400 text-center";
    });

    btnTransCar.addEventListener("click", () => {
        if (btnTransCar.hasAttribute("disabled")) return;
        currentTransportMode = "own_car";
        btnTransCar.className = "py-2.5 px-2 text-xs font-medium rounded-lg border border-sky-500 bg-sky-500/20 text-sky-300 text-center";
        btnTransPublic.className = "py-2.5 px-2 text-xs font-medium rounded-lg border border-slate-700 bg-slate-800 text-slate-400 text-center";
    });

    // Language & currency selectors
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

    const currencySelector = document.getElementById("currencySelector");
    currencySelector.addEventListener("change", (e) => {
        currentCurrency = e.target.value;
        if (currentTripData) renderResults(currentTripData);
    });

    // Slider
    const hotelSlider = document.getElementById("hotel_min_rating");
    const ratingVal = document.getElementById("ratingVal");
    hotelSlider.addEventListener("input", (e) => {
        ratingVal.innerText = `${parseFloat(e.target.value).toFixed(1)} / 10`;
    });

    // Budget toggle
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

    // Modal
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

        const selectedAmenities = Array.from(document.querySelectorAll("input[name='amenity']:checked")).map(cb => cb.value);
        const hasBeach = document.getElementById("chkBeach").checked;

        const payload = {
            origin: originSelect.value,
            destination: destSelect.value,
            adults_count: parseInt(document.getElementById("adults_count").value),
            children_count: parseInt(document.getElementById("children_count").value),
            nights: parseInt(document.getElementById("nights").value),
            transport_mode: currentTransportMode,
            budget_type: currentBudgetMode,
            budget_amount: currentBudgetMode === "custom" ? parseFloat(budgetAmount.value) : null,
            hotel_min_rating: parseFloat(hotelSlider.value),
            hotel_location: document.getElementById("hotel_location").value,
            amenities: selectedAmenities,
            has_beach: hasBeach,
            meal_board: document.getElementById("meal_board").value,
            language: currentLang
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

    // Render results
    function renderResults(data) {
        const t = translations[currentLang];
        const adults = data.adults_count;
        const children = data.children_count;
        const totalTravelers = data.total_travelers;

        document.getElementById("resRouteBadge").innerText = `${data.origin_city.toUpperCase()} ➔ ${data.destination_city.toUpperCase()}`;
        document.getElementById("resDestinationTitle").innerText = `${data.destination_city} Complete Program`;
        
        let guestStr = `${adults} Adult(s)`;
        if (children > 0) guestStr += ` • ${children} Child(ren)`;
        document.getElementById("resTravelersNote").innerText = `${guestStr} • ${data.daily_schedule.length} Nights • ${data.meal_board.replace('_', ' ').toUpperCase()}`;

        document.getElementById("resTotalCost").innerText = fmtPrice(data.grand_total_trip_cost_usd);
        document.getElementById("resPerPersonCost").innerText = `≈ ${fmtPrice(data.grand_total_trip_cost_usd / totalTravelers)} / person`;

        const bd = data.cost_breakdown;
        document.getElementById("costBreakdownBadges").innerHTML = `
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

        document.getElementById("resDates").innerText = data.date_window.suggested_dates;
        document.getElementById("resSeason").innerText = data.date_window.season_status;
        document.getElementById("whyDatesBtn").onclick = () => showWhyModal(data.date_window.why);

        document.getElementById("resTransport").innerText = `${data.transportation.mode}: ${data.transportation.carrier_summary}`;
        document.getElementById("resTransportCost").innerText = `${fmtPrice(data.transportation.cost_per_adult_usd)}/adult (Total: ${fmtPrice(data.transportation.total_transport_cost_usd)})`;
        document.getElementById("whyTransportBtn").onclick = () => showWhyModal(data.transportation.why);

        document.getElementById("resTransportLinks").innerHTML = data.transportation.booking_links.map(l => `
            <a href="${l.url}" target="_blank" class="text-[11px] bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 px-2 py-0.5 rounded flex items-center gap-1">
                <i class="fa-solid fa-arrow-up-right-from-square text-[9px]"></i> ${l.provider_name}
            </a>
        `).join("");

        const flightCard = document.getElementById("flightLegsCard");
        const flightGrid = document.getElementById("flightLegsGrid");
        if (data.transportation.outbound_leg && data.transportation.return_leg) {
            flightCard.classList.remove("hidden");
            const outL = data.transportation.outbound_leg;
            const retL = data.transportation.return_leg;
            flightGrid.innerHTML = `
                <div class="bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
                    <div class="font-bold text-sky-400 flex justify-between">
                        <span>🛫 Outbound: ${outL.airline}</span>
                        <span class="text-slate-300 font-mono">${outL.flight_number}</span>
                    </div>
                    <div class="text-slate-300 mt-1">${outL.departure_time} (${outL.origin_airport}) ➔ ${outL.arrival_time} (${outL.dest_airport})</div>
                </div>
                <div class="bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
                    <div class="font-bold text-amber-400 flex justify-between">
                        <span>🛬 Return: ${retL.airline}</span>
                        <span class="text-slate-300 font-mono">${retL.flight_number}</span>
                    </div>
                    <div class="text-slate-300 mt-1">${retL.departure_time} (${retL.origin_airport}) ➔ ${retL.arrival_time} (${retL.dest_airport})</div>
                </div>
            `;
        } else {
            flightCard.classList.add("hidden");
        }

        const groundContainer = document.getElementById("groundTransfersContainer");
        const groundGrid = document.getElementById("groundTransfersGrid");
        if (data.transportation.ground_transfers && data.transportation.ground_transfers.length > 0) {
            groundContainer.classList.remove("hidden");
            groundGrid.innerHTML = data.transportation.ground_transfers.map(gt => `
                <div class="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
                    <div>
                        <div class="font-bold text-xs text-indigo-200">${gt.name}</div>
                        <div class="text-emerald-400 font-bold text-xs mt-0.5">${fmtPrice(gt.cost_usd)} <span class="text-slate-400 font-normal">(~${gt.duration_mins} mins)</span></div>
                        <p class="text-[11px] text-slate-400 mt-1">${gt.how_to_use}</p>
                    </div>
                    ${gt.booking_link ? `
                    <a href="${gt.booking_link}" target="_blank" class="mt-2 text-[11px] bg-slate-800 hover:bg-slate-700 text-sky-400 px-2 py-1 rounded text-center border border-slate-700">
                        Check Schedule / Rates <i class="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
                    </a>` : ''}
                </div>
            `).join("");
        } else {
            groundContainer.classList.add("hidden");
        }

        document.getElementById("resHotelName").innerText = data.hotel.name;
        document.getElementById("resHotelRating").innerHTML = `
            <i class="fa-solid fa-star text-amber-400 mr-1"></i> ${data.hotel.aggregated_rating_10}/10 (${data.hotel.stars}★)
            <span class="text-slate-400 ml-auto font-bold text-slate-300">${fmtPrice(data.hotel.price_per_night_usd)}/night</span>
        `;
        document.getElementById("whyHotelBtn").onclick = () => showWhyModal(data.hotel.why);

        document.getElementById("resHotelLinks").innerHTML = data.hotel.booking_links.map(l => `
            <a href="${l.url}" target="_blank" class="text-[11px] bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 px-2 py-0.5 rounded flex items-center gap-1">
                <i class="fa-solid fa-hotel text-[9px]"></i> ${l.provider_name}
            </a>
        `).join("");

        const dailyContainer = document.getElementById("dailyItineraryContainer");
        dailyContainer.innerHTML = "";

        data.daily_schedule.forEach(day => {
            const dayCard = document.createElement("div");
            dayCard.className = "bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4";

            let bfastContent = `
                <div class="bg-amber-950/30 border border-amber-500/20 rounded-xl p-2.5 text-xs text-amber-200 flex items-center gap-2">
                    <span class="text-amber-400 text-base">🥐</span>
                    <span><strong class="text-amber-300">Breakfast:</strong> ${day.breakfast_plan}</span>
                </div>
            `;

            if (day.breakfast_restaurant) {
                const bf = day.breakfast_restaurant;
                bfastContent += `
                <div class="bg-slate-950 border border-amber-500/30 rounded-xl p-3 flex gap-3 items-center">
                    <img src="${bf.image_url}" alt="${bf.restaurant_name}" class="w-14 h-14 object-cover rounded-lg border border-slate-800">
                    <div class="flex-1 min-w-0">
                        <div class="text-xs font-bold text-amber-300">🥐 ${bf.meal_type}: ${bf.restaurant_name}</div>
                        <div class="text-[11px] text-slate-400">${bf.cuisine} • Est: ${fmtPrice(bf.estimated_cost_per_adult_usd)}/ad • ★ ${bf.aggregated_rating_10}/10</div>
                    </div>
                    <a href="${bf.map_url}" target="_blank" class="text-xs text-slate-400 hover:text-white p-1">
                        <i class="fa-solid fa-location-dot"></i>
                    </a>
                </div>`;
            }

            let actsHTML = day.activities.map((act, idx) => `
                <div class="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex flex-col md:flex-row gap-3 items-start md:items-center">
                    <img src="${act.image_url}" alt="${act.place_name}" class="w-full md:w-28 h-20 object-cover rounded-lg border border-slate-800">
                    <div class="flex-1">
                        <div class="flex flex-wrap items-center gap-2">
                            <span class="text-xs font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded">${act.time_slot}</span>
                            <h5 class="text-sm font-bold text-slate-100">${act.place_name}</h5>
                            <span class="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">${act.category}</span>
                        </div>
                        <p class="text-xs text-slate-400 mt-1">
                            📍 <strong>${act.distance_from_hotel_km} km from hotel</strong> • 🚌 ${act.transport_mode} (${act.transport_cost_usd > 0 ? fmtPrice(act.transport_cost_usd) : 'Free'}) 
                            • Ticket: <span class="text-slate-300">${act.entry_ticket_adult_usd > 0 ? fmtPrice(act.entry_ticket_adult_usd) : 'Free'}</span>
                            • ★ <span class="text-amber-400 font-semibold">${act.aggregated_rating_10}/10</span>
                        </p>
                        <p class="text-[11px] text-sky-300/90 mt-0.5">${act.transit_card_tip}</p>
                    </div>
                    <div class="flex md:flex-col gap-1.5 self-end md:self-center">
                        <a href="${act.map_url}" target="_blank" class="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-lg flex items-center gap-1">
                            <i class="fa-solid fa-location-dot text-red-400"></i> ${t.view_map}
                        </a>
                        <button class="why-act-btn text-xs bg-sky-950/60 hover:bg-sky-900/60 text-sky-300 border border-sky-800/60 px-2.5 py-1 rounded-lg" 
                            data-day="${day.day_number}" data-act-idx="${idx}">
                            ${t.why_place}
                        </button>
                    </div>
                </div>
            `).join("");

            let restHTML = "";
            if (day.restaurants && day.restaurants.length > 0) {
                restHTML = `
                <div class="pt-2 border-t border-slate-800/80">
                    <h6 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">🍽️ Curated Dining Spots (Aggregated Ratings)</h6>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        ${day.restaurants.map((rest, rIdx) => `
                            <div class="bg-slate-950/60 border border-slate-800 rounded-lg p-3 flex gap-3 items-center">
                                <img src="${rest.image_url}" alt="${rest.restaurant_name}" class="w-16 h-16 object-cover rounded-lg border border-slate-800">
                                <div class="flex-1 min-w-0">
                                    <div class="text-xs font-bold text-emerald-400 truncate">${rest.meal_type}: ${rest.restaurant_name}</div>
                                    <div class="text-[11px] text-slate-400 truncate">${rest.cuisine}</div>
                                    <div class="text-[11px] text-slate-300">Est: ${fmtPrice(rest.estimated_cost_per_adult_usd)}/ad • 📍 ${rest.distance_from_hotel_km}km • ★ ${rest.aggregated_rating_10}/10</div>
                                </div>
                                <div class="flex flex-col gap-1">
                                    <a href="${rest.map_url}" target="_blank" class="text-xs text-slate-400 hover:text-white p-1 text-center">
                                        <i class="fa-solid fa-location-dot"></i>
                                    </a>
                                    <button class="why-rest-btn text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded" 
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
                ${bfastContent}
                <div class="space-y-2">
                    ${actsHTML}
                </div>
                ${restHTML}
            `;
            dailyContainer.appendChild(dayCard);
        });

        const dep = data.departure_day_buffer;
        const depCard = document.getElementById("departureBufferCard");
        depCard.innerHTML = `
            <div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div class="flex items-center space-x-2">
                    <span class="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                        <i class="fa-solid fa-shield-halved"></i>
                    </span>
                    <div>
                        <h4 class="text-sm font-bold text-white">Departure Day Program (${dep.departure_mode})</h4>
                        <p class="text-xs text-slate-400">${dep.flight_or_drive_departure_time} | Terminal Target Arrival: ${dep.terminal_arrival_or_drive_start}</p>
                    </div>
                </div>
                <button id="whyDepartureBtn" class="text-xs bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full">
                    Why this buffer?
                </button>
            </div>
            <div class="mt-4 space-y-3">
                <div class="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
                    <span class="font-bold text-sky-400">Final Afternoon Program:</span> 
                    ${dep.activities_before_departure[0] ? dep.activities_before_departure[0].place_name + ' (' + dep.activities_before_departure[0].time_slot + ')' : 'City promenade'}
                    • 📍 <strong>${dep.distance_from_final_spot_to_terminal_km > 0 ? dep.distance_from_final_spot_to_terminal_km + ' km to terminal (' + dep.transit_time_to_terminal_mins + ' mins transit)' : 'Direct departure'}</strong>
                </div>
                <div class="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
                    <span class="font-bold text-emerald-400">Recommended Meal:</span> 
                    ${dep.recommended_final_meal.restaurant_name} (${dep.recommended_final_meal.cuisine}) — Quick prep speed & zero departure risk.
                </div>
            </div>
        `;
        document.getElementById("whyDepartureBtn").onclick = () => showWhyModal(dep.why);

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

        resultsContainer.classList.remove("hidden");
    }
});


//py main.py
//http://127.0.0.1:8000