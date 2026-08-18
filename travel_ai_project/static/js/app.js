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

    // Populate cities
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

    const currencyRates = {
        TRY: { symbol: "₺", rate: 33.50 },
        USD: { symbol: "$", rate: 1.0 },
        EUR: { symbol: "€", rate: 0.92 },
        SAR: { symbol: "﷼", rate: 3.75 },
        EGP: { symbol: "L.E ", rate: 48.50 },
        GBP: { symbol: "£", rate: 0.78 }
    };

    // Full 3-Language i18n Dictionary
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
            ready_desc: "Kalkış ve varış şehrinizi seçin. Yapay zeka TCDD YHT hatlarını, İDO/BUDO feribotlarını, THY/Pegasus uçuşlarını, Otelz ve Obilet fiyatlarını karşılaştırarak en iyi rotayı çıkarır.",
            loading_title: "Türkiye Ulaşım Ağları & Otel Yorumları Taranıyor...",
            loading_sub: "Otelz, Obilet, TCDD ve Google Haritalar verileri birleştiriliyor",
            total_cost_label: "Hesaplanan Toplam Tutar",
            dates_label: "Önerilen Tarihler",
            trans_label: "Ulaşım Planı",
            hotel_label: "Önerilen Otel",
            transfers_header: "Havalimanı / Otogar / İskele Şehir İçi Transferi",
            score_factors: "Puanlama Faktörleri"
        },
        en: {
            tagline: "81 Provinces Real-Time Route, Hotel & Review Optimization",
            trip_params: "Trip Parameters",
            badge_turkey: "81 Turkish Cities",
            origin_city: "Origin City",
            dest_city: "Destination City",
            adults_label: "Adults",
            children_label: "Children",
            rooms_label: "Rooms",
            nights_label: "Nights",
            child_age_label: "Child Age (Exact Years)",
            transport_by: "Transport Mode",
            budget_strategy: "Budget Strategy",
            cheapest_best: "Cheapest & Best",
            fixed_budget: "Fixed Budget",
            min_hotel_rating: "Min Hotel Rating (Out of 10)",
            hotel_location: "Hotel Location",
            loc_center: "City Center / Near Historical Bazaar",
            loc_sea: "Beachfront / Coastal Promenade",
            loc_nature: "Nature & Mountain / Highland View",
            loc_quiet: "Quiet Area & High Serenity",
            hotel_amenities: "Hotel Amenities (Required)",
            amenity_beach: "🏖️ Private Beach / Pier",
            amenity_aqua: "🌊 Aquapark / Water Slides",
            amenity_pool: "🏊 Swimming Pool",
            amenity_spa: "🧖 Spa & Turkish Bath",
            meal_package: "Hotel Meal Board",
            board_bb: "Bed & Breakfast (AI plans Lunch & Dinner)",
            board_ro: "Room Only (AI plans Breakfast, Lunch & Dinner)",
            board_hb: "Half Board (Breakfast + Dinner Included)",
            board_fb: "Full Board (Breakfast + Lunch + Dinner Included)",
            board_ai: "All-Inclusive (Buffet, Snacks & Beverages Included)",
            notes_label: "Special Notes for AI",
            generate_btn: "Search Turkey Routes & Plan",
            ready_title: "81 Provinces Smart Travel Optimization",
            ready_desc: "Select origin and destination. AI compares TCDD YHT trains, IDO/BUDO ferries, flights, Otelz and Obilet rates.",
            loading_title: "Scanning Turkey Transit Networks & Reviews...",
            loading_sub: "Aggregating Otelz, Obilet, TCDD and Google Maps data",
            total_cost_label: "Total Calculated Cost",
            dates_label: "Suggested Dates",
            trans_label: "Transport Plan",
            hotel_label: "Recommended Hotel",
            transfers_header: "Airport / Terminal / Port Local Transfers",
            score_factors: "Ranking Factors"
        },
        ar: {
            tagline: "تخطيط وتحسين الرحلات الحية لـ 81 ولاية تركية",
            trip_params: "معايير وبيانات الرحلة",
            badge_turkey: "81 مدينة تركية",
            origin_city: "مدينة الإقلاع / المغادرة",
            dest_city: "الوجهة السياحية",
            adults_label: "البالغين",
            children_label: "الأطفال",
            rooms_label: "الغرف",
            nights_label: "الليالي",
            child_age_label: "عمر الطفل (بالسنوات)",
            transport_by: "وسيلة السفر",
            budget_strategy: "استراتيجية الميزانية",
            cheapest_best: "الأرخص والأفضل تقييماً",
            fixed_budget: "ميزانية محددة",
            min_hotel_rating: "الحد الأدنى لمستوى الفندق (من 10)",
            hotel_location: "موقع الفندق",
            loc_center: "وسط المدينة / قريب من السوق التاريخي",
            loc_sea: "على البحر مباشرة / الكورنيش والشاطئ",
            loc_nature: "إطلالة جبلية وطبيعية",
            loc_quiet: "منطقة هادئة ومريحة",
            hotel_amenities: "ميزات الفندق (مطلوبة)",
            amenity_beach: "🏖️ شاطئ خاص / رصيف بحري",
            amenity_aqua: "🌊 ألعاب مائية / أكوابارك",
            amenity_pool: "🏊 حمام سباحة",
            amenity_spa: "🧖 سبا وحمام تركي",
            meal_package: "نظام الوجبات بالفندق",
            board_bb: "شامل الإفطار (الذكاء الاصطناعي يخطط الغداء والعشاء)",
            board_ro: "غرفة فقط (الذكاء الاصطناعي يخطط جميع الوجبات)",
            board_hb: "نصف إقامة (شامل الإفطار والعشاء)",
            board_fb: "إقامة كاملة (شامل الإفطار والغداء والعشاء)",
            board_ai: "شامل كلياً (بوفيه مفتوح ومشروبات وسناكس)",
            notes_label: "ملاحظات خاصة للذكاء الاصطناعي",
            generate_btn: "فحص المسارات التركية وإنشاء البرنامج",
            ready_title: "تخطيط ذكي معتمد على 81 ولاية تركية",
            ready_desc: "اختر مدينتك، ليقوم الذكاء الاصطناعي بفحص قطارات YHT وعبارات BUDO والرحلات الجوية ومقارنة أسعار Otelz و Obilet.",
            loading_title: "جاري تحليل شبكات النقل والتقييمات التركية...",
            loading_sub: "دمج بيانات Otelz و Obilet و TCDD و Google Maps",
            total_cost_label: "التكلفة الإجمالية المحسوبة",
            dates_label: "التواريخ المقترحة",
            trans_label: "خطة النقل والمواصلات",
            hotel_label: "الفندق المقترح",
            transfers_header: "المواصلات من المطار / المحطة إلى الفندق",
            score_factors: "عوامل التقييم"
        }
    };

    let currentLang = "tr";
    let currentCurrency = "TRY";
    let currentTripData = null;
    let currentBudgetMode = "cheapest_best";

    function fmtPrice(amountUSD) {
        const c = currencyRates[currentCurrency] || currencyRates.TRY;
        const converted = Math.round(amountUSD * c.rate);
        return `${converted.toLocaleString()} ${c.symbol}`;
    }

    // Language switch handler
    const langSelector = document.getElementById("langSelector");
    langSelector.addEventListener("change", (e) => {
        currentLang = e.target.value;
        document.documentElement.dir = currentLang === "ar" ? "rtl" : "ltr";
        const dict = translations[currentLang] || translations.tr;
        document.querySelectorAll("[data-i18n]").forEach(el => {
            const key = el.getAttribute("data-i18n");
            if (dict[key]) el.innerText = dict[key];
        });
        if (currentTripData) renderResults(currentTripData);
    });

    const currencySelector = document.getElementById("currencySelector");
    currencySelector.addEventListener("change", (e) => {
        currentCurrency = e.target.value;
        if (currentTripData) renderResults(currentTripData);
    });

    // Feasibility checks for Train and Ferries
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
        const orig = originSelect.value;
        const dest = destSelect.value;
        const mode = transportSelect.value;
        const pair = `${orig}-${dest}`;

        if (mode === "Train" && (!yhtCities.includes(orig) || !yhtCities.includes(dest))) {
            warningBanner.classList.remove("hidden");
            warningText.innerText = `⚠️ ${orig} - ${dest} arasında doğrudan TCDD YHT tren hattı yoktur. Otobüs / Uçak hesaplanacaktır.`;
        } else if ((mode === "Passenger Ferry" || mode === "Car Ferry") && !ferryPairs.has(pair)) {
            warningBanner.classList.remove("hidden");
            warningText.innerText = `⚠️ ${orig} ile ${dest} arasında deniz/feribot hattı bulunmamaktadır. Karayolu VIP Otobüs hesaplanacaktır.`;
        } else {
            warningBanner.classList.add("hidden");
        }
    }

    transportSelect.addEventListener("change", checkTransportFeasibility);
    originSelect.addEventListener("change", checkTransportFeasibility);
    destSelect.addEventListener("change", checkTransportFeasibility);

    // Child age logic
    const childrenInput = document.getElementById("children_count");
    const childAgeContainer = document.getElementById("childAgeContainer");
    const childAgeInput = document.getElementById("child_age");
    const childPolicyBadge = document.getElementById("childPolicyBadge");

    function updateChildAge() {
        if (parseInt(childrenInput.value) > 0) {
            childAgeContainer.classList.remove("hidden");
            const age = parseInt(childAgeInput.value) || 0;
            if (age < 12) {
                childPolicyBadge.innerText = "0-11 Yaş: Otelde Ücretsiz";
                childPolicyBadge.className = "text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20";
            } else {
                childPolicyBadge.innerText = "12+ Yaş: Yetişkin Yatak / Fiyat";
                childPolicyBadge.className = "text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20";
            }
        } else {
            childAgeContainer.classList.add("hidden");
        }
    }

    childrenInput.addEventListener("input", updateChildAge);
    childAgeInput.addEventListener("input", updateChildAge);

    // Slider
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

    // Modal
    const whyModal = document.getElementById("whyModal");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const modalTitle = document.getElementById("modalTitle");
    const modalSubtitle = document.getElementById("modalSubtitle");
    const modalExplanation = document.getElementById("modalExplanation");
    const modalMetrics = document.getElementById("modalMetrics");

    function showWhyModal(whyData) {
        modalTitle.innerText = whyData.title || "Gerekçe ve Değerlendirme";
        modalSubtitle.innerText = "Yorum Puanları ve Fiyat/Performans Hesabı";
        modalExplanation.innerText = whyData.explanation;
        modalMetrics.innerHTML = "";
        if (whyData.score_metrics) {
            whyData.score_metrics.forEach(m => {
                const b = document.createElement("div");
                b.className = "flex items-center text-xs font-medium text-sky-300 bg-slate-950 border border-sky-800/60 px-3 py-1.5 rounded-lg";
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
            adults_count: parseInt(document.getElementById("adults_count").value) || 4,
            children_count: parseInt(document.getElementById("children_count").value) || 0,
            rooms_count: document.getElementById("rooms_count").value || "2",
            child_age: parseInt(document.getElementById("child_age").value) || 12,
            nights: parseInt(document.getElementById("nights").value) || 3,
            transport_mode: transportSelect.value,
            budget_type: currentBudgetMode,
            budget_amount: currentBudgetMode === "custom" ? parseFloat(budgetAmount.value) : null,
            hotel_min_rating: parseFloat(hotelSlider.value) || 8.0,
            hotel_location: document.getElementById("hotel_location").value,
            amenities: selectedAmenities,
            has_beach: hasBeach,
            meal_board: document.getElementById("meal_board").value,
            special_notes: document.getElementById("special_notes").value.trim(),
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
            if (!res.ok || !json.success) {
                alert("Bilgi: " + (json.error || "Sunucu yanıt vermedi"));
                loadingState.classList.add("hidden");
                emptyState.classList.remove("hidden");
                return;
            }

            currentTripData = json.data;
            renderResults(currentTripData);

        } catch (err) {
            alert("Bağlantı hatası: " + err.message);
        } finally {
            loadingState.classList.add("hidden");
        }
    });

    // Render results
    function renderResults(data) {
        const adults = data.adults_count;
        const children = data.children_count;
        const totalTravelers = data.total_travelers;

        document.getElementById("resRouteBadge").innerText = `${data.origin_city.toUpperCase()} ➔ ${data.destination_city.toUpperCase()}`;
        document.getElementById("resDestinationTitle").innerText = `${data.destination_city} Gezi & Tatil Programı`;
        
        let guestStr = `${adults} Yetişkin`;
        if (children > 0) guestStr += ` • ${children} Çocuk (${data.child_age || '12'} Yaş)`;
        document.getElementById("resTravelersNote").innerText = `${guestStr} • ${data.hotel.rooms_booked} Oda • ${data.daily_schedule.length} Gece • ${data.meal_board.replace('_', ' ').toUpperCase()}`;

        document.getElementById("resTotalCost").innerText = fmtPrice(data.grand_total_trip_cost_usd);
        document.getElementById("resPerPersonCost").innerText = `≈ ${fmtPrice(data.grand_total_trip_cost_usd / totalTravelers)} / kişi başı`;

        const bd = data.cost_breakdown;
        document.getElementById("costBreakdownBadges").innerHTML = `
            <div class="bg-slate-950 p-2 rounded-lg border border-slate-800 text-center">
                <div class="text-slate-400 text-[10px]">🏨 Otel (${data.hotel.rooms_booked} Oda)</div>
                <div class="font-bold text-sky-300">${fmtPrice(bd.hotel_total_usd)}</div>
            </div>
            <div class="bg-slate-950 p-2 rounded-lg border border-slate-800 text-center">
                <div class="text-slate-400 text-[10px]">🚗/🚌 Ulaşım Toplam</div>
                <div class="font-bold text-indigo-300">${fmtPrice(bd.transport_total_usd)}</div>
            </div>
            <div class="bg-slate-950 p-2 rounded-lg border border-slate-800 text-center">
                <div class="text-slate-400 text-[10px]">🍽️ Yeme / İçme Bütçesi</div>
                <div class="font-bold text-amber-300">${bd.food_budget_total_usd > 0 ? fmtPrice(bd.food_budget_total_usd) : '0 ₺ (Otele Dahil)'}</div>
            </div>
            <div class="bg-slate-950 p-2 rounded-lg border border-slate-800 text-center">
                <div class="text-slate-400 text-[10px]">🎟️ Aktiviteler & Şehir İçi</div>
                <div class="font-bold text-emerald-300">${fmtPrice(bd.activities_and_transfers_usd)}</div>
            </div>
        `;

        document.getElementById("resDates").innerText = data.date_window.suggested_dates;
        document.getElementById("resSeason").innerText = data.date_window.season_status;
        document.getElementById("whyDatesBtn").onclick = () => showWhyModal(data.date_window.why);

        document.getElementById("resTransport").innerText = data.transportation.carrier_summary;
        document.getElementById("resTransportCost").innerText = `${fmtPrice(data.transportation.cost_per_adult_usd)}/kişi (Toplam: ${fmtPrice(data.transportation.total_transport_cost_usd)})`;
        document.getElementById("whyTransportBtn").onclick = () => showWhyModal(data.transportation.why);

        // Pre-filled transport booking links
        document.getElementById("resTransportLinks").innerHTML = data.transportation.booking_links.map(l => `
            <a href="${l.url}" target="_blank" class="text-[11px] bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 px-2 py-0.5 rounded flex items-center gap-1">
                <i class="fa-solid fa-arrow-up-right-from-square text-[9px]"></i> ${l.provider_name}
            </a>
        `).join("");

        // Flight / Transit leg
        const flightCard = document.getElementById("flightLegsCard");
        const flightGrid = document.getElementById("flightLegsGrid");
        if (data.transportation.outbound_leg && data.transportation.return_leg) {
            flightCard.classList.remove("hidden");
            const outL = data.transportation.outbound_leg;
            const retL = data.transportation.return_leg;
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
        } else {
            flightCard.classList.add("hidden");
        }

        // Detailed Ground Transfers with Navigation Steps
        const groundContainer = document.getElementById("groundTransfersContainer");
        const groundGrid = document.getElementById("groundTransfersGrid");
        if (data.transportation.ground_transfers && data.transportation.ground_transfers.length > 0) {
            groundContainer.classList.remove("hidden");
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
        } else {
            groundContainer.classList.add("hidden");
        }

        // Hotel Pillar with Pre-filled Booking.com / Otelz links
        document.getElementById("resHotelName").innerText = data.hotel.name;
        document.getElementById("resHotelRating").innerHTML = `
            <i class="fa-solid fa-star text-amber-400 mr-1"></i> ${data.hotel.aggregated_rating_10}/10 (${data.hotel.stars}★)
            <span class="text-slate-400 ml-auto font-bold text-slate-300">${fmtPrice(data.hotel.price_per_room_per_night_usd)}/oda/gece</span>
        `;
        document.getElementById("whyHotelBtn").onclick = () => showWhyModal(data.hotel.why);

        document.getElementById("resHotelLinks").innerHTML = data.hotel.booking_links.map(l => `
            <a href="${l.url}" target="_blank" class="text-[11px] bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 px-2 py-0.5 rounded flex items-center gap-1">
                <i class="fa-solid fa-hotel text-[9px]"></i> ${l.provider_name}
            </a>
        `).join("");

        // Non-Repeating Daily Itinerary
        const dailyContainer = document.getElementById("dailyItineraryContainer");
        dailyContainer.innerHTML = "";

        data.daily_schedule.forEach(day => {
            const dayCard = document.createElement("div");
            dayCard.className = "bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4";

            let bfastHTML = `
                <div class="bg-amber-950/30 border border-amber-500/20 rounded-xl p-2.5 text-xs text-amber-200 flex items-center gap-2">
                    <span class="text-amber-400 text-base">🥐</span>
                    <span><strong class="text-amber-300">Kahvaltı:</strong> ${day.breakfast_banner}</span>
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

        // Departure Day Schedule
        const dep = data.departure_day_buffer;
        const depCard = document.getElementById("departureBufferCard");
        depCard.innerHTML = `
            <div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div class="flex items-center space-x-2">
                    <span class="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                        <i class="fa-solid fa-shield-halved"></i>
                    </span>
                    <div>
                        <h4 class="text-sm font-bold text-white">Dönüş Günü Planı (${dep.departure_mode})</h4>
                        <p class="text-xs text-slate-400">${dep.flight_or_drive_departure_time} | Terminale Varış: ${dep.terminal_arrival_or_drive_start}</p>
                    </div>
                </div>
                <button id="whyDepartureBtn" class="text-xs bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full">
                    Neden Bu Zaman Planı?
                </button>
            </div>
            <div class="mt-4 space-y-3">
                <div class="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
                    <span class="font-bold text-sky-400">Öğleden Sonra Kapanış Programı:</span> 
                    ${dep.activities_before_departure[0] ? dep.activities_before_departure[0].place_name + ' (' + dep.activities_before_departure[0].time_slot + ')' : 'Şehir içi gezinti'}
                    • 📍 <strong>Terminale ${dep.distance_from_final_spot_to_terminal_km} km (${dep.transit_time_to_terminal_mins} dk sürüş)</strong>
                </div>
                <div class="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
                    <span class="font-bold text-emerald-400">Kalkış Öncesi Yemek:</span> 
                    ${dep.recommended_final_meal.restaurant_name} (${dep.recommended_final_meal.cuisine}) — Hızlı servis garantisi.
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