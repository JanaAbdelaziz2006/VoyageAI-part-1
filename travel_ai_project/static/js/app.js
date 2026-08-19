document.addEventListener("DOMContentLoaded", () => {
    // 81 Official Turkish Provinces
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

    // Populate cities cleanly
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
            if (city === "İstanbul") opt2.selected = true;
            destSelect.appendChild(opt2);
        });
    }

    const currencyRates = {
        TRY: { symbol: "₺", rate: 33.50 },
        USD: { symbol: "$", rate: 1.0 },
        EUR: { symbol: "€", rate: 0.92 },
        SAR: { symbol: "﷼", rate: 3.75 },
        EGP: { symbol: "L.E ", rate: 48.50 },
        GBP: { symbol: "£", rate: 0.78 }
    };

    let currentLang = "tr";
    let currentCurrency = "TRY";
    let currentTripData = null;
    let currentBudgetMode = "cheapest_best";

    function fmtPrice(amountUSD) {
        const c = currencyRates[currentCurrency] || currencyRates.TRY;
        const converted = Math.round((amountUSD || 0) * c.rate);
        return `${converted.toLocaleString()} ${c.symbol}`;
    }

    // Feasibility checks
    const yhtCities = ["İstanbul", "Istanbul", "Ankara", "Eskişehir", "Konya", "Karaman", "Sivas", "Yozgat", "Kırıkkale", "Bilecik", "Sakarya", "Kocaeli"];
    const ferryPairs = new Set([
        "Bursa-İstanbul", "İstanbul-Bursa", "Bursa-Istanbul", "Istanbul-Bursa",
        "Yalova-İstanbul", "İstanbul-Yalova", "Yalova-Istanbul", "Istanbul-Yalova",
        "Balıkesir-İstanbul", "İstanbul-Balıkesir", "Çanakkale-Tekirdağ"
    ]);

    const transportSelect = document.getElementById("transport_mode");
    const warningBanner = document.getElementById("transportWarningBanner");
    const warningText = document.getElementById("transportWarningText");

    function checkTransportFeasibility() {
        if (!originSelect || !destSelect || !transportSelect || !warningBanner) return;
        const orig = originSelect.value;
        const dest = destSelect.value;
        const mode = transportSelect.value;
        const pair = `${orig}-${dest}`;

        if (mode === "Train" && (!yhtCities.includes(orig) || !yhtCities.includes(dest))) {
            warningBanner.classList.remove("hidden");
            if (warningText) warningText.innerText = `⚠️ ${orig} - ${dest} arasında doğrudan TCDD YHT tren hattı yoktur. Otobüs / Uçak hesaplanacaktır.`;
        } else if ((mode === "Passenger Ferry" || mode === "Car Ferry") && !ferryPairs.has(pair)) {
            warningBanner.classList.remove("hidden");
            if (warningText) warningText.innerText = `⚠️ ${orig} ile ${dest} arasında feribot hattı bulunmamaktadır. VIP Otobüs hesaplanacaktır.`;
        } else {
            warningBanner.classList.add("hidden");
        }
    }

    transportSelect?.addEventListener("change", checkTransportFeasibility);
    originSelect?.addEventListener("change", checkTransportFeasibility);
    destSelect?.addEventListener("change", checkTransportFeasibility);

    // Child age logic
    const childrenInput = document.getElementById("children_count");
    const childAgeContainer = document.getElementById("childAgeContainer");
    const childAgeInput = document.getElementById("child_age");
    const childPolicyBadge = document.getElementById("childPolicyBadge");

    function updateChildAge() {
        if (parseInt(childrenInput?.value || 0) > 0) {
            childAgeContainer?.classList.remove("hidden");
            const age = parseInt(childAgeInput?.value || 0);
            if (childPolicyBadge) {
                if (age < 12) {
                    childPolicyBadge.innerText = "0-11 Yaş: Otelde Ücretsiz";
                    childPolicyBadge.className = "text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20";
                } else {
                    childPolicyBadge.innerText = "12+ Yaş: Yetişkin Yatak / Fiyat";
                    childPolicyBadge.className = "text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20";
                }
            }
        } else {
            childAgeContainer?.classList.add("hidden");
        }
    }

    childrenInput?.addEventListener("input", updateChildAge);
    childAgeInput?.addEventListener("input", updateChildAge);

    // Slider
    const hotelSlider = document.getElementById("hotel_min_rating");
    const ratingVal = document.getElementById("ratingVal");
    hotelSlider?.addEventListener("input", (e) => {
        if (ratingVal) ratingVal.innerText = `${parseFloat(e.target.value).toFixed(1)} / 10`;
    });

    // Budget Mode Toggle
    const btnCheapest = document.getElementById("btnBudgetCheapest");
    const btnCustom = document.getElementById("btnBudgetCustom");
    const customContainer = document.getElementById("customBudgetContainer");
    const budgetAmount = document.getElementById("budget_amount");

    btnCheapest?.addEventListener("click", () => {
        currentBudgetMode = "cheapest_best";
        btnCheapest.className = "py-2 px-2 text-xs font-medium rounded-lg border border-sky-500 bg-sky-500/20 text-sky-300";
        if (btnCustom) btnCustom.className = "py-2 px-2 text-xs font-medium rounded-lg border border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200";
        customContainer?.classList.add("hidden");
        budgetAmount?.removeAttribute("required");
    });

    btnCustom?.addEventListener("click", () => {
        currentBudgetMode = "custom";
        btnCustom.className = "py-2 px-2 text-xs font-medium rounded-lg border border-sky-500 bg-sky-500/20 text-sky-300";
        if (btnCheapest) btnCheapest.className = "py-2 px-2 text-xs font-medium rounded-lg border border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200";
        customContainer?.classList.remove("hidden");
        budgetAmount?.setAttribute("required", "true");
    });

    // Modal
    const whyModal = document.getElementById("whyModal");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const modalTitle = document.getElementById("modalTitle");
    const modalSubtitle = document.getElementById("modalSubtitle");
    const modalExplanation = document.getElementById("modalExplanation");
    const modalMetrics = document.getElementById("modalMetrics");

    function showWhyModal(whyData) {
        if (!whyData) return;
        if (modalTitle) modalTitle.innerText = whyData.title || "Gerekçe ve Değerlendirme";
        if (modalSubtitle) modalSubtitle.innerText = "Yorum Puanları ve Fiyat/Performans Hesabı";
        if (modalExplanation) modalExplanation.innerText = whyData.explanation || "Gerekçe detayları";
        if (modalMetrics) {
            modalMetrics.innerHTML = "";
            (whyData.score_metrics || []).forEach(m => {
                const b = document.createElement("div");
                b.className = "flex items-center text-xs font-medium text-sky-300 bg-slate-950 border border-sky-800/60 px-3 py-1.5 rounded-lg";
                b.innerHTML = `<i class="fa-solid fa-chart-line mr-2 text-sky-400"></i> ${m}`;
                modalMetrics.appendChild(b);
            });
        }
        whyModal?.classList.remove("hidden");
    }

    closeModalBtn?.addEventListener("click", () => whyModal?.classList.add("hidden"));
    whyModal?.addEventListener("click", (e) => { if (e.target === whyModal) whyModal?.classList.add("hidden"); });

    // Submit handler
    const tripForm = document.getElementById("tripForm");
    const emptyState = document.getElementById("emptyState");
    const loadingState = document.getElementById("loadingState");
    const resultsContainer = document.getElementById("resultsContainer");

    tripForm?.addEventListener("submit", async (e) => {
        e.preventDefault();

        const selectedAmenities = Array.from(document.querySelectorAll("input[name='amenity']:checked")).map(cb => cb.value);
        const hasBeach = document.getElementById("chkBeach")?.checked || false;

        const payload = {
            origin: originSelect?.value || "Bursa",
            destination: destSelect?.value || "İstanbul",
            adults_count: parseInt(document.getElementById("adults_count")?.value) || 4,
            children_count: parseInt(document.getElementById("children_count")?.value) || 0,
            rooms_count: document.getElementById("rooms_count")?.value || "2",
            child_age: parseInt(document.getElementById("child_age")?.value) || 12,
            nights: parseInt(document.getElementById("nights")?.value) || 3,
            transport_mode: transportSelect?.value || "Bus",
            budget_type: currentBudgetMode,
            budget_amount: currentBudgetMode === "custom" ? parseFloat(budgetAmount?.value) : null,
            hotel_min_rating: parseFloat(hotelSlider?.value) || 8.0,
            hotel_location: document.getElementById("hotel_location")?.value || "city_center",
            amenities: selectedAmenities,
            has_beach: hasBeach,
            meal_board: document.getElementById("meal_board")?.value || "breakfast_only",
            special_notes: document.getElementById("special_notes")?.value?.trim() || "",
            language: currentLang
        };

        emptyState?.classList.add("hidden");
        resultsContainer?.classList.add("hidden");
        loadingState?.classList.remove("hidden");

        try {
            const res = await fetch("/api/plan-trip", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const json = await res.json();
            if (!res.ok || !json.success) {
                alert("Bilgi: " + (json.error || "Sunucu yanıt vermedi"));
                loadingState?.classList.add("hidden");
                emptyState?.classList.remove("hidden");
                return;
            }

            currentTripData = json.data;
            renderResults(currentTripData);

        } catch (err) {
            console.error("Render Error:", err);
            alert("Bağlantı hatası: " + err.message);
        } finally {
            loadingState?.classList.add("hidden");
        }
    });

    // 100% Safe Render Function
    function renderResults(data) {
        if (!data) return;

        const adults = data.adults_count || 1;
        const children = data.children_count || 0;
        const totalTravelers = data.total_travelers || (adults + children);

        const routeEl = document.getElementById("resRouteBadge");
        if (routeEl) routeEl.innerText = `${(data.origin_city || '').toUpperCase()} ➔ ${(data.destination_city || '').toUpperCase()}`;
        
        const titleEl = document.getElementById("resDestinationTitle");
        if (titleEl) titleEl.innerText = `${data.destination_city || ''} Gezi & Tatil Programı`;
        
        let guestStr = `${adults} Yetişkin`;
        if (children > 0) guestStr += ` • ${children} Çocuk (${data.child_age || '12'} Yaş)`;
        
        const noteEl = document.getElementById("resTravelersNote");
        if (noteEl) noteEl.innerText = `${guestStr} • ${data.hotel?.rooms_booked || 1} Oda • ${data.daily_schedule?.length || 3} Gece • ${(data.meal_board || '').replace('_', ' ').toUpperCase()}`;

        const totalCostEl = document.getElementById("resTotalCost");
        if (totalCostEl) totalCostEl.innerText = fmtPrice(data.grand_total_trip_cost_usd);
        
        const ppCostEl = document.getElementById("resPerPersonCost");
        if (ppCostEl) ppCostEl.innerText = `≈ ${fmtPrice((data.grand_total_trip_cost_usd || 0) / totalTravelers)} / kişi başı`;

        const bd = data.cost_breakdown || {};
        const badgesContainer = document.getElementById("costBreakdownBadges");
        if (badgesContainer) {
            badgesContainer.innerHTML = `
                <div class="bg-slate-950 p-2 rounded-lg border border-slate-800 text-center">
                    <div class="text-slate-400 text-[10px]">🏨 Otel (${data.hotel?.rooms_booked || 1} Oda)</div>
                    <div class="font-bold text-sky-300">${fmtPrice(bd.hotel_total_usd)}</div>
                </div>
                <div class="bg-slate-950 p-2 rounded-lg border border-slate-800 text-center">
                    <div class="text-slate-400 text-[10px]">🚗/🚌 Ulaşım Toplam</div>
                    <div class="font-bold text-indigo-300">${fmtPrice(bd.transport_total_usd)}</div>
                </div>
                <div class="bg-slate-950 p-2 rounded-lg border border-slate-800 text-center">
                    <div class="text-slate-400 text-[10px]">🍽️ Yeme / İçme Bütçesi</div>
                    <div class="font-bold text-amber-300">${(bd.food_budget_total_usd || 0) > 0 ? fmtPrice(bd.food_budget_total_usd) : '0 ₺ (Otele Dahil)'}</div>
                </div>
                <div class="bg-slate-950 p-2 rounded-lg border border-slate-800 text-center">
                    <div class="text-slate-400 text-[10px]">🎟️ Aktiviteler & Şehir İçi</div>
                    <div class="font-bold text-emerald-300">${fmtPrice(bd.activities_and_transfers_usd)}</div>
                </div>
            `;
        }

        const datesEl = document.getElementById("resDates");
        if (datesEl) datesEl.innerText = data.date_window?.suggested_dates || "Önerilen Tarihler";
        
        const seasonEl = document.getElementById("resSeason");
        if (seasonEl) seasonEl.innerText = data.date_window?.season_status || "En İdeal Sezon";
        
        const whyDatesBtn = document.getElementById("whyDatesBtn");
        if (whyDatesBtn) whyDatesBtn.onclick = () => showWhyModal(data.date_window?.why);

        const transEl = document.getElementById("resTransport");
        if (transEl) transEl.innerText = data.transportation?.carrier_summary || "Ulaşım Güzergahı";
        
        const transCostEl = document.getElementById("resTransportCost");
        if (transCostEl) transCostEl.innerText = `${fmtPrice(data.transportation?.cost_per_adult_usd)}/kişi (Toplam: ${fmtPrice(data.transportation?.total_transport_cost_usd)})`;
        
        const whyTransportBtn = document.getElementById("whyTransportBtn");
        if (whyTransportBtn) whyTransportBtn.onclick = () => showWhyModal(data.transportation?.why);

        // Booking links
        const transLinksContainer = document.getElementById("resTransportLinks");
        if (transLinksContainer) {
            transLinksContainer.innerHTML = (data.transportation?.booking_links || []).map(l => `
                <a href="${l.url}" target="_blank" class="text-[11px] bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 px-2 py-0.5 rounded flex items-center gap-1">
                    <i class="fa-solid fa-arrow-up-right-from-square text-[9px]"></i> ${l.provider_name}
                </a>
            `).join("");
        }

        // Flight details
        const flightCard = document.getElementById("flightLegsCard");
        const flightGrid = document.getElementById("flightLegsGrid");
        if (data.transportation?.outbound_leg && data.transportation?.return_leg) {
            flightCard?.classList.remove("hidden");
            const outL = data.transportation.outbound_leg;
            const retL = data.transportation.return_leg;
            if (flightGrid) {
                flightGrid.innerHTML = `
                    <div class="bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
                        <div class="font-bold text-sky-400 flex justify-between">
                            <span>🛫 Gidiş: ${outL.airline}</span>
                            <span class="text-slate-300 font-mono">${outL.flight_number}</span>
                        </div>
                        <div class="text-slate-300 mt-1">${outL.departure_time} (${outL.origin_airport}) ➔ ${outL.arrival_time} (${outL.dest_airport})</div>
                    </div>
                    <div class="bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
                        <div class="font-bold text-amber-400 flex justify-between">
                            <span>🛬 Dönüş: ${retL.airline}</span>
                            <span class="text-slate-300 font-mono">${retL.flight_number}</span>
                        </div>
                        <div class="text-slate-300 mt-1">${retL.departure_time} (${retL.origin_airport}) ➔ ${retL.arrival_time} (${retL.dest_airport})</div>
                    </div>
                `;
            }
        } else {
            flightCard?.classList.add("hidden");
        }

        // Ground Transfers
        const groundContainer = document.getElementById("groundTransfersContainer");
        const groundGrid = document.getElementById("groundTransfersGrid");
        if (data.transportation?.ground_transfers && data.transportation.ground_transfers.length > 0) {
            groundContainer?.classList.remove("hidden");
            if (groundGrid) {
                groundGrid.innerHTML = data.transportation.ground_transfers.map(gt => `
                    <div class="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
                        <div>
                            <div class="font-bold text-xs text-indigo-200">${gt.name}</div>
                            <div class="text-emerald-400 font-bold text-xs mt-0.5">${fmtPrice(gt.cost_usd)} <span class="text-slate-400 font-normal">(~${gt.duration_mins} dk)</span></div>
                            <p class="text-[11px] text-slate-300 mt-1.5 leading-relaxed">${gt.how_to_use}</p>
                        </div>
                        ${gt.booking_link ? `
                        <a href="${gt.booking_link}" target="_blank" class="mt-2 text-[11px] bg-slate-800 hover:bg-slate-700 text-sky-400 px-2 py-1 rounded text-center border border-slate-700">
                            Haritada / Web Sitesinde Aç <i class="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
                        </a>` : ''}
                    </div>
                `).join("");
            }
        } else {
            groundContainer?.classList.add("hidden");
        }

        // Hotel
        const hotelNameEl = document.getElementById("resHotelName");
        if (hotelNameEl) hotelNameEl.innerText = data.hotel?.name || "Önerilen Otel";
        
        const hotelRatingEl = document.getElementById("resHotelRating");
        if (hotelRatingEl) {
            hotelRatingEl.innerHTML = `
                <i class="fa-solid fa-star text-amber-400 mr-1"></i> ${data.hotel?.aggregated_rating_10 || 9.0}/10 (${data.hotel?.stars || 5}★)
                <span class="text-slate-400 ml-auto font-bold text-slate-300">${fmtPrice(data.hotel?.price_per_room_per_night_usd)}/oda/gece</span>
            `;
        }
        
        const whyHotelBtn = document.getElementById("whyHotelBtn");
        if (whyHotelBtn) whyHotelBtn.onclick = () => showWhyModal(data.hotel?.why);

        const hotelLinksContainer = document.getElementById("resHotelLinks");
        if (hotelLinksContainer) {
            hotelLinksContainer.innerHTML = (data.hotel?.booking_links || []).map(l => `
                <a href="${l.url}" target="_blank" class="text-[11px] bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 px-2 py-0.5 rounded flex items-center gap-1">
                    <i class="fa-solid fa-hotel text-[9px]"></i> ${l.provider_name}
                </a>
            `).join("");
        }

        // Daily Itinerary
        const dailyContainer = document.getElementById("dailyItineraryContainer");
        if (dailyContainer) {
            dailyContainer.innerHTML = "";

            (data.daily_schedule || []).forEach(day => {
                const dayCard = document.createElement("div");
                dayCard.className = "bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4";

                let bfastHTML = `
                    <div class="bg-amber-950/30 border border-amber-500/20 rounded-xl p-2.5 text-xs text-amber-200 flex items-center gap-2">
                        <span class="text-amber-400 text-base">🥐</span>
                        <span><strong class="text-amber-300">Kahvaltı:</strong> ${day.breakfast_banner || 'Sabah Kahvaltısı'}</span>
                    </div>
                `;

                let bfastRestCard = "";
                if (day.breakfast_restaurant) {
                    const bf = day.breakfast_restaurant;
                    bfastRestCard = `
                    <div class="bg-slate-950 border border-amber-500/30 rounded-xl p-3 flex gap-3 items-center">
                        <img src="${bf.image_url}" alt="${bf.restaurant_name}" class="w-14 h-14 object-cover rounded-lg border border-slate-800">
                        <div class="flex-1 min-w-0">
                            <div class="text-xs font-bold text-amber-300">🥐 ${bf.meal_type}: ${bf.restaurant_name}</div>
                            <div class="text-[11px] text-slate-400">${bf.cuisine} • Yaklaşık: ${fmtPrice(bf.estimated_cost_per_adult_usd)}/kişi • ★ ${bf.aggregated_rating_10}/10</div>
                        </div>
                        <a href="${bf.map_url}" target="_blank" class="text-xs text-slate-400 hover:text-white p-1">
                            <i class="fa-solid fa-location-dot"></i>
                        </a>
                    </div>`;
                }

                let actsHTML = (day.activities || []).map((act, idx) => `
                    <div class="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex flex-col md:flex-row gap-3 items-start md:items-center">
                        <img src="${act.image_url}" alt="${act.place_name}" class="w-full md:w-28 h-20 object-cover rounded-lg border border-slate-800">
                        <div class="flex-1">
                            <div class="flex flex-wrap items-center gap-2">
                                <span class="text-xs font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded">${act.time_slot}</span>
                                <h5 class="text-sm font-bold text-slate-100">${act.place_name}</h5>
                                <span class="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">${act.category}</span>
                            </div>
                            <p class="text-xs text-slate-400 mt-1">
                                📍 <strong>Otele ${act.distance_from_hotel_km} km</strong> • 🚌 ${act.transport_mode} (${act.transport_cost_usd > 0 ? fmtPrice(act.transport_cost_usd) : 'Ücretsiz'}) 
                                • Giriş: <span class="text-slate-300">${act.entry_ticket_adult_usd > 0 ? fmtPrice(act.entry_ticket_adult_usd) : 'Ücretsiz'}</span>
                                • ★ <span class="text-amber-400 font-semibold">${act.aggregated_rating_10}/10</span>
                            </p>
                            <p class="text-[11px] text-sky-300/90 mt-0.5">${act.transit_card_tip}</p>
                        </div>
                        <div class="flex md:flex-col gap-1.5 self-end md:self-center">
                            <a href="${act.map_url}" target="_blank" class="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-lg flex items-center gap-1">
                                <i class="fa-solid fa-location-dot text-red-400"></i> Harita
                            </a>
                            <button class="why-act-btn text-xs bg-sky-950/60 hover:bg-sky-900/60 text-sky-300 border border-sky-800/60 px-2.5 py-1 rounded-lg" 
                                data-day="${day.day_number}" data-act-idx="${idx}">
                                Neden burası?
                            </button>
                        </div>
                    </div>
                `).join("");

                let restHTML = "";
                if (day.restaurants && day.restaurants.length > 0) {
                    restHTML = `
                    <div class="pt-2 border-t border-slate-800/80">
                        <h6 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">🍽️ Yöresel Restoran Tavsiyeleri (Yorum Puanlı)</h6>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            ${day.restaurants.map((rest, rIdx) => `
                                <div class="bg-slate-950/60 border border-slate-800 rounded-lg p-3 flex gap-3 items-center">
                                    <img src="${rest.image_url}" alt="${rest.restaurant_name}" class="w-16 h-16 object-cover rounded-lg border border-slate-800">
                                    <div class="flex-1 min-w-0">
                                        <div class="text-xs font-bold text-emerald-400 truncate">${rest.meal_type}: ${rest.restaurant_name}</div>
                                        <div class="text-[11px] text-slate-400 truncate">${rest.cuisine}</div>
                                        <div class="text-[11px] text-slate-300">Ort: ${fmtPrice(rest.estimated_cost_per_adult_usd)}/kişi • 📍 ${rest.distance_from_hotel_km} km • ★ ${rest.aggregated_rating_10}/10</div>
                                    </div>
                                    <div class="flex flex-col gap-1">
                                        <a href="${rest.map_url}" target="_blank" class="text-xs text-slate-400 hover:text-white p-1 text-center">
                                            <i class="fa-solid fa-location-dot"></i>
                                        </a>
                                        <button class="why-rest-btn text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded" 
                                            data-day="${day.day_number}" data-rest-idx="${rIdx}">Neden?</button>
                                    </div>
                                </div>
                            `).join("")}
                        </div>
                    </div>`;
                }

                dayCard.innerHTML = `
                    <div class="flex justify-between items-center pb-2 border-b border-slate-800">
                        <div>
                            <span class="text-xs font-bold text-sky-400">GÜN ${day.day_number}</span>
                            <h4 class="text-base font-bold text-white">${day.day_title}</h4>
                        </div>
                    </div>
                    ${bfastHTML}
                    ${bfastRestCard}
                    <div class="space-y-2">
                        ${actsHTML}
                    </div>
                    ${restHTML}
                `;
                dailyContainer.appendChild(dayCard);
            });
        }

        // Safe Departure Buffer Rendering
        const dep = data.departure_day_buffer;
        const depCard = document.getElementById("departureBufferCard");
        if (dep && depCard) {
            const firstAct = (dep.activities_before_departure && dep.activities_before_departure.length > 0) ? dep.activities_before_departure[0] : null;
            const finalMeal = dep.recommended_final_meal || dep.lunch_spot_near_hub;

            depCard.innerHTML = `
                <div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                    <div class="flex items-center space-x-2">
                        <span class="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                            <i class="fa-solid fa-shield-halved"></i>
                        </span>
                        <div>
                            <h4 class="text-sm font-bold text-white">Dönüş Günü Planı (${dep.departure_mode || 'Dönüş Ulaşımı'})</h4>
                            <p class="text-xs text-slate-400">${dep.flight_or_drive_departure_time || 'Kalkış Saati'} | ${dep.terminal_arrival_or_drive_start || 'Varış Saati'}</p>
                        </div>
                    </div>
                    <button id="whyDepartureBtn" class="text-xs bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full">
                        Neden Bu Zaman Planı?
                    </button>
                </div>
                <div class="mt-4 space-y-3">
                    ${firstAct ? `
                    <div class="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
                        <span class="font-bold text-sky-400">Öğleden Sonra Kapanış Programı:</span> 
                        ${firstAct.place_name} (${firstAct.time_slot})
                        • 📍 <strong>Terminale ${dep.distance_from_final_spot_to_terminal_km || 3.5} km (${dep.transit_time_to_terminal_mins || 15} dk sürüş)</strong>
                    </div>` : ''}
                    ${finalMeal ? `
                    <div class="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
                        <span class="font-bold text-emerald-400">Kalkış Öncesi Yemek:</span> 
                        ${finalMeal.restaurant_name} (${finalMeal.cuisine}) — Hızlı servis garantisi.
                    </div>` : ''}
                </div>
            `;
            
            const whyDepBtn = document.getElementById("whyDepartureBtn");
            if (whyDepBtn) whyDepBtn.onclick = () => showWhyModal(dep.why);
        }

        // Attach listeners safely
        document.querySelectorAll(".why-act-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const dayNum = parseInt(btn.getAttribute("data-day"));
                const actIdx = parseInt(btn.getAttribute("data-act-idx"));
                const whyData = data.daily_schedule?.[dayNum - 1]?.activities?.[actIdx]?.why;
                if (whyData) showWhyModal(whyData);
            });
        });

        document.querySelectorAll(".why-rest-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const dayNum = parseInt(btn.getAttribute("data-day"));
                const rIdx = parseInt(btn.getAttribute("data-rest-idx"));
                const whyData = data.daily_schedule?.[dayNum - 1]?.restaurants?.[rIdx]?.why;
                if (whyData) showWhyModal(whyData);
            });
        });

        resultsContainer?.classList.remove("hidden");
    }
});


//py main.py
//http://127.0.0.1:8000