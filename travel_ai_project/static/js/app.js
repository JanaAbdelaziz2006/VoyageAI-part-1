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
            if (city === "Edirne") opt2.selected = true;
            destSelect.appendChild(opt2);
        });
    }

    // =========================================================================
    // TRANSLATION SYSTEM
    // =========================================================================
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
            child_age_label: "Çocuk Yaşı",
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
            ready_desc: "Kalkış ve varış şehrinizi seçin. Yapay zeka canlı arama yaparak en iyi otel, ulaşım ve gezi rotasını bulacaktır.",
            loading_title: "Canlı Arama Yapılıyor...",
            loading_sub: "Gerçek otel, ulaşım ve mekan bilgileri taranıyor",
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
            loading_sub: "Live hotels, transport, and places being searched",
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
            loading_sub: "يتم البحث عن الفنادق والنقل والأماكن الحقيقية",
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
    let currentBudgetMode = "cheapest_best";

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
            if (t[key]) {
                el.innerText = t[key];
            }
        });
        if (currentLang === "ar") {
            document.documentElement.setAttribute("dir", "rtl");
            document.documentElement.setAttribute("lang", "ar");
        } else {
            document.documentElement.setAttribute("dir", "ltr");
            document.documentElement.setAttribute("lang", currentLang);
        }
    }

    // Language Selector
    const langSelector = document.getElementById("langSelector");
    langSelector?.addEventListener("change", (e) => {
        currentLang = e.target.value;
        applyTranslations();
        checkTransportFeasibility();
        if (currentTripData) {
            renderResults(currentTripData);
        }
    });

    // Currency Selector
    const currencySelector = document.getElementById("currencySelector");
    currencySelector?.addEventListener("change", (e) => {
        currentCurrency = e.target.value;
        if (currentTripData) {
            renderResults(currentTripData);
        }
    });

    // =========================================================================
    // TRANSPORT FEASIBILITY & SEARCH LOCK
    // =========================================================================
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

        if (orig === dest) {
            isFeasible = false;
            warningMsg = currentLang === "en" ? "Departure and arrival cities cannot be the same." : currentLang === "ar" ? "لا يمكن أن تكون مدينة المغادرة والوصول متطابقتين." : "Kalkış ve varış şehri aynı olamaz.";
        } else if (mode === "Train" && (!yhtCities.has(orig) || !yhtCities.has(dest))) {
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
                submitBtn.classList.remove("hover:from-red-500", "hover:to-sky-500");
            }
        } else {
            warningBanner.classList.add("hidden");
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.classList.remove("opacity-50", "cursor-not-allowed");
                submitBtn.classList.add("hover:from-red-500", "hover:to-sky-500");
            }
        }
    }

    transportSelect?.addEventListener("change", checkTransportFeasibility);
    originSelect?.addEventListener("change", checkTransportFeasibility);
    destSelect?.addEventListener("change", checkTransportFeasibility);

    // =========================================================================
    // CHILD AGE LOGIC
    // =========================================================================
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
                    childPolicyBadge.innerText = currentLang === "en" ? "0-11 Age: Free at hotel" : currentLang === "ar" ? "0-11 سنة: مجاني في الفندق" : "0-11 Yaş: Otelde Ücretsiz";
                    childPolicyBadge.className = "text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20";
                } else {
                    childPolicyBadge.innerText = currentLang === "en" ? "12+ Age: Adult bed/price" : currentLang === "ar" ? "12+ سنة: سرير/سعر بالغ" : "12+ Yaş: Yetişkin Yatak / Fiyat";
                    childPolicyBadge.className = "text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20";
                }
            }
        } else {
            childAgeContainer?.classList.add("hidden");
        }
    }

    childrenInput?.addEventListener("input", updateChildAge);
    childAgeInput?.addEventListener("input", updateChildAge);

    // =========================================================================
    // SLIDER & BUDGET
    // =========================================================================
    const hotelSlider = document.getElementById("hotel_min_rating");
    const ratingVal = document.getElementById("ratingVal");
    hotelSlider?.addEventListener("input", (e) => {
        if (ratingVal) ratingVal.innerText = `${parseFloat(e.target.value).toFixed(1)} / 10`;
    });

    const btnCheapest = document.getElementById("btnBudgetCheapest");
    const btnCustom = document.getElementById("btnBudgetCustom");
    const customContainer = document.getElementById("customBudgetContainer");
    const budgetAmount = document.getElementById("budget_amount");

    btnCheapest?.addEventListener("click", () => {
        currentBudgetMode = "cheapest_best";
        btnCheapest.className = "py-2 px-2 text-xs font-medium rounded-lg border border-sky-500 bg-sky-500/20 text-sky-300";
        if (btnCustom) btnCustom.className = "py-2 px-2 text-xs font-medium rounded-lg border border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200";
        customContainer?.classList.add("hidden");
    });

    btnCustom?.addEventListener("click", () => {
        currentBudgetMode = "custom";
        btnCustom.className = "py-2 px-2 text-xs font-medium rounded-lg border border-sky-500 bg-sky-500/20 text-sky-300";
        if (btnCheapest) btnCheapest.className = "py-2 px-2 text-xs font-medium rounded-lg border border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200";
        customContainer?.classList.remove("hidden");
    });

    // =========================================================================
    // MODAL
    // =========================================================================
    const whyModal = document.getElementById("whyModal");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const modalTitle = document.getElementById("modalTitle");
    const modalSubtitle = document.getElementById("modalSubtitle");
    const modalExplanation = document.getElementById("modalExplanation");
    const modalMetrics = document.getElementById("modalMetrics");

    function showWhyModal(whyData) {
        if (!whyData) return;
        if (modalTitle) modalTitle.innerText = whyData.title || "Reasoning";
        if (modalSubtitle) modalSubtitle.innerText = currentLang === "en" ? "Rating Analysis & Cost/Performance" : currentLang === "ar" ? "تحليل التقييم والتكلفة/الأداء" : "Yorum Puanları ve Fiyat/Performans Hesabı";
        if (modalExplanation) modalExplanation.innerText = whyData.explanation || "";
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

    // =========================================================================
    // FORM SUBMIT
    // =========================================================================
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
            destination: destSelect?.value || "Edirne",
            adults_count: parseInt(document.getElementById("adults_count")?.value) || 2,
            children_count: parseInt(document.getElementById("children_count")?.value) || 0,
            rooms_count: document.getElementById("rooms_count")?.value || "1",
            child_age: parseInt(document.getElementById("child_age")?.value) || 10,
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

        const loadTitle = document.getElementById("liveSearchStepTitle");
        const loadSub = document.getElementById("liveSearchStepSubtitle");
        const t = translations[currentLang] || translations.tr;
        if (loadTitle) loadTitle.innerText = t.loading_title;
        if (loadSub) loadSub.innerText = t.loading_sub;

        try {
            const res = await fetch("/api/plan-trip", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const json = await res.json();
            if (!res.ok || !json.success) {
                const errorMsg = json.error || "Server did not respond";
                loadingState?.classList.add("hidden");
                emptyState?.classList.remove("hidden");
                showToast(errorMsg);
                return;
            }

            currentTripData = json.data;
            renderResults(currentTripData);

        } catch (err) {
            console.error("Network Error:", err);
            loadingState?.classList.add("hidden");
            emptyState?.classList.remove("hidden");
            showToast("Connection error: " + err.message);
        } finally {
            loadingState?.classList.add("hidden");
        }
    });

    function showToast(msg) {
        const existing = document.getElementById("errorToast");
        if (existing) existing.remove();

        const toast = document.createElement("div");
        toast.id = "errorToast";
        toast.className = "fixed top-20 right-4 z-50 bg-red-900/95 border border-red-500/50 rounded-xl p-4 max-w-md shadow-2xl animate-in";
        toast.innerHTML = `
            <div class="flex items-start gap-3">
                <i class="fa-solid fa-circle-exclamation text-red-400 text-lg mt-0.5"></i>
                <div class="flex-1">
                    <h4 class="text-sm font-bold text-red-200 mb-1">${currentLang === "ar" ? "تنبيه" : currentLang === "en" ? "Notice" : "Bilgi"}</h4>
                    <p class="text-xs text-red-300 leading-relaxed">${msg}</p>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" class="text-red-400 hover:text-white">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 8000);
    }

    // =========================================================================
    // RENDER RESULTS
    // =========================================================================
    function renderResults(data) {
        if (!data) return;

        const adults = data.adults_count || 1;
        const children = data.children_count || 0;
        const totalTravelers = data.total_travelers || (adults + children);

        const routeEl = document.getElementById("resRouteBadge");
        if (routeEl) routeEl.innerText = `${(data.origin_city || '').toUpperCase()} ➔ ${(data.destination_city || '').toUpperCase()}`;

        const titleEl = document.getElementById("resDestinationTitle");
        if (titleEl) titleEl.innerText = `${data.destination_city || ''} ${currentLang === "en" ? "Travel Plan" : currentLang === "ar" ? "خطة السفر" : "Gezi & Tatil Programı"}`;

        let guestStr = `${adults} ${currentLang === "en" ? "Adults" : currentLang === "ar" ? "بالغين" : "Yetişkin"}`;
        if (children > 0) guestStr += ` • ${children} ${currentLang === "en" ? "Children" : currentLang === "ar" ? "أطفال" : "Çocuk"}`;

        const noteEl = document.getElementById("resTravelersNote");
        if (noteEl) noteEl.innerText = `${guestStr} • ${data.rooms_count || 1} ${currentLang === "en" ? "Rooms" : currentLang === "ar" ? "غرف" : "Oda"} • ${data.daily_schedule?.length || 3} ${currentLang === "en" ? "Nights" : currentLang === "ar" ? "ليالي" : "Gece"} • ${(data.meal_board || '').replace(/_/g, ' ').toUpperCase()}`;

        const totalCostEl = document.getElementById("resTotalCost");
        if (totalCostEl) totalCostEl.innerText = fmtPrice(data.grand_total_trip_cost_usd);

        const ppCostEl = document.getElementById("resPerPersonCost");
        if (ppCostEl) ppCostEl.innerText = `≈ ${fmtPrice((data.grand_total_trip_cost_usd || 0) / totalTravelers)} / ${currentLang === "en" ? "per person" : currentLang === "ar" ? "للشخص" : "kişi başı"}`;

        // Breakdown
        const bd = data.cost_breakdown || {};
        const badgesContainer = document.getElementById("costBreakdownBadges");
        if (badgesContainer) {
            badgesContainer.innerHTML = `
                <div class="bg-slate-950 p-2 rounded-lg border border-slate-800 text-center">
                    <div class="text-slate-400 text-[10px]">🏨 ${currentLang === "en" ? "Hotel" : currentLang === "ar" ? "الفندق" : "Otel"}</div>
                    <div class="font-bold text-sky-300">${fmtPrice(bd.hotel_total_usd)}</div>
                </div>
                <div class="bg-slate-950 p-2 rounded-lg border border-slate-800 text-center">
                    <div class="text-slate-400 text-[10px]">🚗 ${currentLang === "en" ? "Transport" : currentLang === "ar" ? "النقل" : "Ulaşım"}</div>
                    <div class="font-bold text-indigo-300">${fmtPrice(bd.transport_total_usd)}</div>
                </div>
                <div class="bg-slate-950 p-2 rounded-lg border border-slate-800 text-center">
                    <div class="text-slate-400 text-[10px]">🍽️ ${currentLang === "en" ? "Food" : currentLang === "ar" ? "الطعام" : "Yemek"}</div>
                    <div class="font-bold text-amber-300">${(bd.food_budget_total_usd || 0) > 0 ? fmtPrice(bd.food_budget_total_usd) : (currentLang === "en" ? "Included" : currentLang === "ar" ? "مشمول" : "Dahil")}</div>
                </div>
                <div class="bg-slate-950 p-2 rounded-lg border border-slate-800 text-center">
                    <div class="text-slate-400 text-[10px]">🎟️ ${currentLang === "en" ? "Activities" : currentLang === "ar" ? "الأنشطة" : "Aktiviteler"}</div>
                    <div class="font-bold text-emerald-300">${fmtPrice(bd.activities_and_transfers_usd)}</div>
                </div>
            `;
        }

        // Dates
        const datesEl = document.getElementById("resDates");
        if (datesEl) datesEl.innerText = data.date_window?.suggested_dates || "---";
        const seasonEl = document.getElementById("resSeason");
        if (seasonEl) seasonEl.innerText = data.date_window?.season_status || "";
        const whyDatesBtn = document.getElementById("whyDatesBtn");
        if (whyDatesBtn) whyDatesBtn.onclick = () => showWhyModal(data.date_window?.why);

        // Transport
        const transEl = document.getElementById("resTransport");
        if (transEl) transEl.innerText = data.transportation?.carrier_summary || data.transportation?.mode || "---";
        const transCostEl = document.getElementById("resTransportCost");
        if (transCostEl) transCostEl.innerText = `${fmtPrice(data.transportation?.cost_per_adult_usd)}/${currentLang === "en" ? "person" : currentLang === "ar" ? "شخص" : "kişi"} (${currentLang === "en" ? "Total" : currentLang === "ar" ? "المجموع" : "Toplam"}: ${fmtPrice(data.transportation?.total_transport_cost_usd)})`;
        const whyTransportBtn = document.getElementById("whyTransportBtn");
        if (whyTransportBtn) whyTransportBtn.onclick = () => showWhyModal(data.transportation?.why);

        // Booking links
        const transLinksContainer = document.getElementById("resTransportLinks");
        if (transLinksContainer) {
            transLinksContainer.innerHTML = (data.transportation?.booking_links || []).map(l => `
                <a href="${l.url}" target="_blank" rel="noopener" class="text-[11px] bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 px-2 py-0.5 rounded flex items-center gap-1">
                    <i class="fa-solid fa-arrow-up-right-from-square text-[9px]"></i> ${l.provider_name}
                </a>
            `).join("");
        }

        // Flight or Vehicle Breakdown
        const flightCard = document.getElementById("flightLegsCard");
        const flightGrid = document.getElementById("flightLegsGrid");

        if (data.transportation?.vehicle_breakdown) {
            flightCard?.classList.remove("hidden");
            const vb = data.transportation.vehicle_breakdown;
            const transitBadge = document.getElementById("resTransitBadge");
            if (transitBadge) transitBadge.innerText = currentLang === "en" ? "Own Vehicle" : currentLang === "ar" ? "سيارة خاصة" : "Kendi Araç";
            if (flightGrid) {
                flightGrid.innerHTML = `
                    <div class="bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
                        <div class="font-bold text-sky-400">🛣️ ${currentLang === "en" ? "Route Details" : currentLang === "ar" ? "تفاصيل الطريق" : "Güzergah Detayları"}</div>
                        <div class="text-slate-300 mt-1 text-[11px]">
                            ${currentLang === "en" ? "Round-trip" : currentLang === "ar" ? "ذهاباً وإياباً" : "Gidiş-dönüş"}: <strong>${vb.roundtrip_distance_km} km</strong><br>
                            ${vb.fuel_or_charge_type}
                        </div>
                    </div>
                    <div class="bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
                        <div class="font-bold text-amber-400">💰 ${currentLang === "en" ? "Tolls & Energy" : currentLang === "ar" ? "الرسوم والطاقة" : "Maliyet Dökümü"}</div>
                        <div class="text-slate-300 mt-1 text-[11px]">
                            ⛽ ${currentLang === "en" ? "Fuel/Charge" : currentLang === "ar" ? "وقود/شحن" : "Yakıt/Şarj"}: <strong>${fmtPrice(vb.estimated_fuel_or_ev_cost_usd)}</strong><br>
                            🛤️ HGS/OGS: <strong>${fmtPrice(vb.hgs_bridge_and_highway_tolls_usd)}</strong><br>
                            📊 ${currentLang === "en" ? "Total" : currentLang === "ar" ? "المجموع" : "Toplam"}: <strong class="text-emerald-400">${fmtPrice(vb.total_vehicle_expenses_usd)}</strong>
                        </div>
                    </div>
                `;
            }
        } else if (data.transportation?.outbound_leg && data.transportation?.return_leg) {
            flightCard?.classList.remove("hidden");
            const outL = data.transportation.outbound_leg;
            const retL = data.transportation.return_leg;
            if (flightGrid) {
                flightGrid.innerHTML = `
                    <div class="bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
                        <div class="font-bold text-sky-400 flex justify-between">
                            <span>🛫 ${currentLang === "en" ? "Outbound" : currentLang === "ar" ? "الذهاب" : "Gidiş"}: ${outL.airline}</span>
                            <span class="text-slate-300 font-mono">${outL.flight_number}</span>
                        </div>
                        <div class="text-slate-300 mt-1 text-[11px]">${outL.departure_time} (${outL.origin_airport}) ➔ ${outL.arrival_time} (${outL.dest_airport})</div>
                        <div class="text-slate-400 text-[10px] mt-0.5">${currentLang === "en" ? "Duration" : currentLang === "ar" ? "المدة" : "Süre"}: ${outL.duration}</div>
                    </div>
                    <div class="bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
                        <div class="font-bold text-amber-400 flex justify-between">
                            <span>🛬 ${currentLang === "en" ? "Return" : currentLang === "ar" ? "العودة" : "Dönüş"}: ${retL.airline}</span>
                            <span class="text-slate-300 font-mono">${retL.flight_number}</span>
                        </div>
                        <div class="text-slate-300 mt-1 text-[11px]">${retL.departure_time} (${retL.origin_airport}) ➔ ${retL.arrival_time} (${retL.dest_airport})</div>
                        <div class="text-slate-400 text-[10px] mt-0.5">${currentLang === "en" ? "Duration" : currentLang === "ar" ? "المدة" : "Süre"}: ${retL.duration}</div>
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
                            <div class="text-emerald-400 font-bold text-xs mt-0.5">${fmtPrice(gt.cost_usd)} <span class="text-slate-400 font-normal">(~${gt.duration_mins} ${currentLang === "en" ? "min" : currentLang === "ar" ? "دقيقة" : "dk"})</span></div>
                            <p class="text-[11px] text-slate-300 mt-1.5 leading-relaxed whitespace-pre-line">${gt.how_to_use}</p>
                            <p class="text-[10px] text-sky-300/80 mt-1 italic">${gt.why_recommended}</p>
                        </div>
                        ${gt.booking_link ? `
                        <a href="${gt.booking_link}" target="_blank" rel="noopener" class="mt-2 text-[11px] bg-slate-800 hover:bg-slate-700 text-sky-400 px-2 py-1 rounded text-center border border-slate-700">
                            ${currentLang === "en" ? "Book / Open Map" : currentLang === "ar" ? "احجز / افتح الخريطة" : "Rezervasyon / Haritada Aç"} <i class="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
                        </a>` : ''}
                    </div>
                `).join("");
            }
        } else {
            groundContainer?.classList.add("hidden");
        }

        // Hotel
        const hotelNameEl = document.getElementById("resHotelName");
        if (hotelNameEl) hotelNameEl.innerText = data.hotel?.name || "---";
        const hotelRatingEl = document.getElementById("resHotelRating");
        if (hotelRatingEl) {
            hotelRatingEl.innerHTML = `
                <i class="fa-solid fa-star text-amber-400 mr-1"></i> ${data.hotel?.aggregated_rating_10 || 0}/10 (${data.hotel?.stars || 0}★)
                <span class="text-slate-400 ml-auto font-bold text-slate-300">${fmtPrice(data.hotel?.price_per_room_per_night_usd)}/${currentLang === "en" ? "room/night" : currentLang === "ar" ? "غرفة/ليلة" : "oda/gece"}</span>
            `;
        }
        const whyHotelBtn = document.getElementById("whyHotelBtn");
        if (whyHotelBtn) whyHotelBtn.onclick = () => showWhyModal(data.hotel?.why);

        const hotelLinksContainer = document.getElementById("resHotelLinks");
        if (hotelLinksContainer) {
            hotelLinksContainer.innerHTML = (data.hotel?.booking_links || []).map(l => `
                <a href="${l.url}" target="_blank" rel="noopener" class="text-[11px] bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 px-2 py-0.5 rounded flex items-center gap-1">
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
                        <span><strong class="text-amber-300">${currentLang === "en" ? "Breakfast" : currentLang === "ar" ? "الإفطار" : "Kahvaltı"}:</strong> ${day.breakfast_banner || ''}</span>
                    </div>
                `;

                let bfastRestCard = "";
                if (day.breakfast_restaurant) {
                    const bf = day.breakfast_restaurant;
                    bfastRestCard = `
                    <div class="bg-slate-950 border border-amber-500/30 rounded-xl p-3 flex gap-3 items-center">
                        <img src="${bf.image_url}" alt="${bf.restaurant_name}" class="w-14 h-14 object-cover rounded-lg border border-slate-800" onerror="this.src='https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=200&auto=format&fit=crop&q=60'">
                        <div class="flex-1 min-w-0">
                            <div class="text-xs font-bold text-amber-300 truncate">🥐 ${bf.restaurant_name}</div>
                            <div class="text-[11px] text-slate-400 truncate">${bf.cuisine} • ${fmtPrice(bf.estimated_cost_per_adult_usd)}/${currentLang === "en" ? "person" : currentLang === "ar" ? "شخص" : "kişi"} • ★ ${bf.aggregated_rating_10}/10</div>
                        </div>
                        <a href="${bf.map_url}" target="_blank" rel="noopener" class="text-xs text-slate-400 hover:text-white p-1">
                            <i class="fa-solid fa-location-dot"></i>
                        </a>
                    </div>`;
                }

                let actsHTML = (day.activities || []).map((act, idx) => `
                    <div class="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex flex-col md:flex-row gap-3 items-start md:items-center">
                        <img src="${act.image_url}" alt="${act.place_name}" class="w-full md:w-28 h-20 object-cover rounded-lg border border-slate-800" onerror="this.src='https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&auto=format&fit=crop&q=60'">
                        <div class="flex-1">
                            <div class="flex flex-wrap items-center gap-2">
                                <span class="text-xs font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded">${act.time_slot}</span>
                                <h5 class="text-sm font-bold text-slate-100">${act.place_name}</h5>
                                <span class="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">${act.category}</span>
                            </div>
                            <p class="text-xs text-slate-400 mt-1">
                                📍 <strong>${act.distance_from_hotel_km} km</strong> • 🚌 ${act.transport_mode} (${act.transport_cost_usd > 0 ? fmtPrice(act.transport_cost_usd) : (currentLang === "en" ? 'Free' : currentLang === "ar" ? 'مجاني' : 'Ücretsiz')})
                                • ${currentLang === "en" ? "Entry" : currentLang === "ar" ? "دخول" : "Giriş"}: <span class="text-slate-300">${act.entry_ticket_adult_usd > 0 ? fmtPrice(act.entry_ticket_adult_usd) : (currentLang === "en" ? 'Free' : currentLang === "ar" ? 'مجاني' : 'Ücretsiz')}</span>
                                • ★ <span class="text-amber-400 font-semibold">${act.aggregated_rating_10}/10</span>
                            </p>
                            <p class="text-[11px] text-sky-300/90 mt-0.5">${act.transit_card_tip}</p>
                        </div>
                        <div class="flex md:flex-col gap-1.5 self-end md:self-center">
                            <a href="${act.map_url}" target="_blank" rel="noopener" class="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-lg flex items-center gap-1">
                                <i class="fa-solid fa-location-dot text-red-400"></i> ${currentLang === "en" ? "Map" : currentLang === "ar" ? "خريطة" : "Harita"}
                            </a>
                            <button class="why-act-btn text-xs bg-sky-950/60 hover:bg-sky-900/60 text-sky-300 border border-sky-800/60 px-2.5 py-1 rounded-lg"
                                data-day="${day.day_number}" data-act-idx="${idx}">
                                ${currentLang === "en" ? "Why here?" : currentLang === "ar" ? "لماذا هنا؟" : "Neden burası?"}
                            </button>
                        </div>
                    </div>
                `).join("");

                let restHTML = "";
                if (day.restaurants && day.restaurants.length > 0) {
                    restHTML = `
                    <div class="pt-2 border-t border-slate-800/80">
                        <h6 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">🍽️ ${currentLang === "en" ? "Restaurant Suggestions (Rated)" : currentLang === "ar" ? "اقتراحات المطاعم (مُقيّمة)" : "Restoran Tavsiyeleri (Yorum Puanlı)"}</h6>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            ${day.restaurants.map((rest, rIdx) => `
                                <div class="bg-slate-950/60 border border-slate-800 rounded-lg p-3 flex gap-3 items-center">
                                    <img src="${rest.image_url}" alt="${rest.restaurant_name}" class="w-16 h-16 object-cover rounded-lg border border-slate-800" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&auto=format&fit=crop&q=60'">
                                    <div class="flex-1 min-w-0">
                                        <div class="text-xs font-bold text-emerald-400 truncate">${rest.meal_type}</div>
                                        <div class="text-[11px] text-slate-200 font-semibold truncate">${rest.restaurant_name}</div>
                                        <div class="text-[11px] text-slate-400 truncate">${rest.cuisine}</div>
                                        <div class="text-[11px] text-slate-300">${fmtPrice(rest.estimated_cost_per_adult_usd)}/${currentLang === "en" ? "person" : currentLang === "ar" ? "شخص" : "kişi"} • 📍 ${rest.distance_from_hotel_km} km • ★ ${rest.aggregated_rating_10}/10</div>
                                    </div>
                                    <div class="flex flex-col gap-1">
                                        <a href="${rest.map_url}" target="_blank" rel="noopener" class="text-xs text-slate-400 hover:text-white p-1 text-center">
                                            <i class="fa-solid fa-location-dot"></i>
                                        </a>
                                        <button class="why-rest-btn text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded"
                                            data-day="${day.day_number}" data-rest-idx="${rIdx}">${currentLang === "en" ? "Why?" : currentLang === "ar" ? "لماذا؟" : "Neden?"}</button>
                                    </div>
                                </div>
                            `).join("")}
                        </div>
                    </div>`;
                }

                dayCard.innerHTML = `
                    <div class="flex justify-between items-center pb-2 border-b border-slate-800">
                        <div>
                            <span class="text-xs font-bold text-sky-400">${currentLang === "en" ? "DAY" : currentLang === "ar" ? "اليوم" : "GÜN"} ${day.day_number}</span>
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

        // Departure Buffer
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
                            <h4 class="text-sm font-bold text-white">${currentLang === "en" ? "Departure Day Plan" : currentLang === "ar" ? "خطة يوم المغادرة" : "Dönüş Günü Planı"} (${dep.departure_mode || ''})</h4>
                            <p class="text-xs text-slate-400">${currentLang === "en" ? "Return" : currentLang === "ar" ? "المغادرة" : "Kalkış"}: ${dep.return_departure_time || ''} | ${currentLang === "en" ? "Arrival" : currentLang === "ar" ? "الوصول" : "Varış"}: ${dep.arrival_at_home_time || ''}</p>
                        </div>
                    </div>
                    <button id="whyDepartureBtn" class="text-xs bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full">
                        ${currentLang === "en" ? "Why this timing?" : currentLang === "ar" ? "لماذا هذا التوقيت؟" : "Neden Bu Zaman?"}
                    </button>
                </div>
                <div class="mt-4 space-y-3">
                    <div class="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
                        <span class="font-bold text-indigo-400">⏰ ${currentLang === "en" ? "Timeline" : currentLang === "ar" ? "الجدول الزمني" : "Zaman Çizelgesi"}:</span>
                        <div class="mt-1.5 space-y-1">
                            <div>🏨 ${currentLang === "en" ? "Checkout" : currentLang === "ar" ? "تسجيل الخروج" : "Otel Çıkışı"}: <strong>${dep.checkout_time || "12:00"}</strong></div>
                            ${firstAct ? `<div>🎯 ${firstAct.place_name}: <strong>${firstAct.time_slot}</strong></div>` : ''}
                            <div>🍽️ ${currentLang === "en" ? "Lunch" : currentLang === "ar" ? "الغداء" : "Öğle Yemeği"}: <strong>${dep.time_spent_at_lunch || ''}</strong></div>
                            <div>🚌 ${currentLang === "en" ? "Transit to terminal" : currentLang === "ar" ? "الانتقال إلى المحطة" : "Terminale ulaşım"}: <strong>${dep.transit_time_to_hub_mins || 0} ${currentLang === "en" ? "min" : currentLang === "ar" ? "دقيقة" : "dk"}</strong></div>
                            <div>⏱️ ${currentLang === "en" ? "Safety buffer" : currentLang === "ar" ? "وقت احتياطي" : "Güvenlik tamponu"}: <strong>${dep.required_safety_buffer_mins || 0} ${currentLang === "en" ? "min" : currentLang === "ar" ? "دقيقة" : "dk"}</strong></div>
                            <div>🚀 ${currentLang === "en" ? "Departure" : currentLang === "ar" ? "المغادرة" : "Kalkış"}: <strong>${dep.return_departure_time || ''}</strong></div>
                            <div>🏠 ${currentLang === "en" ? "Arrival home" : currentLang === "ar" ? "الوصول للمنزل" : "Eve varış"}: <strong>${dep.arrival_at_home_time || ''}</strong></div>
                        </div>
                    </div>
                    ${finalMeal ? `
                    <div class="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
                        <span class="font-bold text-emerald-400">🍽️ ${currentLang === "en" ? "Pre-departure meal" : currentLang === "ar" ? "وجبة قبل المغادرة" : "Kalkış Öncesi Yemek"}:</span>
                        <div class="mt-1">${finalMeal.restaurant_name} — ${finalMeal.cuisine}</div>
                        <div class="text-[10px] text-slate-400 mt-0.5">${fmtPrice(finalMeal.estimated_cost_per_adult_usd)}/${currentLang === "en" ? "person" : currentLang === "ar" ? "شخص" : "kişi"} • 📍 ${finalMeal.distance_from_hotel_km} km</div>
                        ${finalMeal.map_url ? `<a href="${finalMeal.map_url}" target="_blank" rel="noopener" class="text-[10px] text-sky-400 hover:underline mt-1 inline-block"><i class="fa-solid fa-location-dot"></i> ${currentLang === "en" ? "Map" : currentLang === "ar" ? "خريطة" : "Harita"}</a>` : ''}
                    </div>` : ''}
                </div>
            `;

            const whyDepBtn = document.getElementById("whyDepartureBtn");
            if (whyDepBtn) whyDepBtn.onclick = () => showWhyModal(dep.why);
        }

        // Attach listeners
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

    // Initial setup
    applyTranslations();
    checkTransportFeasibility();
    updateChildAge();
});