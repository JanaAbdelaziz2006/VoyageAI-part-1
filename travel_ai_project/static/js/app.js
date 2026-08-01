document.addEventListener("DOMContentLoaded", () => {
    // Elements
    const tripForm = document.getElementById("tripForm");
    const hotelSlider = document.getElementById("hotel_min_rating");
    const ratingVal = document.getElementById("ratingVal");
    const btnBudgetCheapest = document.getElementById("btnBudgetCheapest");
    const btnBudgetCustom = document.getElementById("btnBudgetCustom");
    const customBudgetContainer = document.getElementById("customBudgetContainer");
    const budgetAmountInput = document.getElementById("budget_amount");

    const emptyState = document.getElementById("emptyState");
    const loadingState = document.getElementById("loadingState");
    const resultsContainer = document.getElementById("resultsContainer");

    // Modal elements
    const whyModal = document.getElementById("whyModal");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const modalTitle = document.getElementById("modalTitle");
    const modalSubtitle = document.getElementById("modalSubtitle");
    const modalExplanation = document.getElementById("modalExplanation");
    const modalMetrics = document.getElementById("modalMetrics");

    let currentBudgetMode = "cheapest_best"; // 'cheapest_best' or 'custom'
    let currentTripData = null;

    // Slider listener
    hotelSlider.addEventListener("input", (e) => {
        ratingVal.innerText = `${parseFloat(e.target.value).toFixed(1)} / 10`;
    });

    // Budget Mode Toggle
    btnBudgetCheapest.addEventListener("click", () => {
        currentBudgetMode = "cheapest_best";
        btnBudgetCheapest.className = "py-2 px-3 text-xs font-medium rounded-lg border border-sky-500 bg-sky-500/20 text-sky-300";
        btnBudgetCustom.className = "py-2 px-3 text-xs font-medium rounded-lg border border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200";
        customBudgetContainer.classList.add("hidden");
        budgetAmountInput.removeAttribute("required");
    });

    btnBudgetCustom.addEventListener("click", () => {
        currentBudgetMode = "custom";
        btnBudgetCustom.className = "py-2 px-3 text-xs font-medium rounded-lg border border-sky-500 bg-sky-500/20 text-sky-300";
        btnBudgetCheapest.className = "py-2 px-3 text-xs font-medium rounded-lg border border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200";
        customBudgetContainer.classList.remove("hidden");
        budgetAmountInput.setAttribute("required", "true");
    });

    // Modal Handlers
    function showWhyModal(whyData) {
        modalTitle.innerText = whyData.title || "AI Decision Breakdown";
        modalSubtitle.innerText = "Mathematical & Review-Weighted Justification";
        modalExplanation.innerText = whyData.explanation;

        modalMetrics.innerHTML = "";
        if (whyData.score_metrics && whyData.score_metrics.length > 0) {
            whyData.score_metrics.forEach(metric => {
                const badge = document.createElement("div");
                badge.className = "flex items-center text-xs font-medium text-sky-300 bg-sky-950/60 border border-sky-800/60 px-3 py-1.5 rounded-lg";
                badge.innerHTML = `<i class="fa-solid fa-chart-simple mr-2 text-sky-400"></i> ${metric}`;
                modalMetrics.appendChild(badge);
            });
        }
        whyModal.classList.remove("hidden");
    }

    closeModalBtn.addEventListener("click", () => whyModal.classList.add("hidden"));
    whyModal.addEventListener("click", (e) => {
        if (e.target === whyModal) whyModal.classList.add("hidden");
    });

    // Form Submit Handler
    tripForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const payload = {
            origin: document.getElementById("origin").value.trim(),
            destination: document.getElementById("destination").value.trim(),
            transport_mode: document.getElementById("transport_mode").value,
            budget_type: currentBudgetMode,
            budget_amount: currentBudgetMode === "custom" ? parseFloat(budgetAmountInput.value) : null,
            nights: parseInt(document.getElementById("nights").value),
            hotel_min_rating: parseFloat(hotelSlider.value),
            meal_board: document.getElementById("meal_board").value
        };

        // UI Transition to Loading
        emptyState.classList.add("hidden");
        resultsContainer.classList.add("hidden");
        loadingState.classList.remove("hidden");

        try {
            const response = await fetch("/api/plan-trip", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const resJson = await response.json();

            if (!resJson.success) {
                alert("Error generating trip: " + resJson.error);
                loadingState.classList.add("hidden");
                emptyState.classList.remove("hidden");
                return;
            }

            currentTripData = resJson.data;
            renderResults(currentTripData);

        } catch (err) {
            alert("Network or Server error: " + err.message);
        } finally {
            loadingState.classList.add("hidden");
        }
    });

    // Render Full AI Results
    function renderResults(data) {
        // Headers & Summary
        document.getElementById("resRouteBadge").innerText = `${data.origin_city} ➔ ${data.destination_city}`;
        document.getElementById("resDestinationTitle").innerText = `${data.destination_city} Complete Program`;
        document.getElementById("resTotalCost").innerText = `$${data.total_calculated_trip_cost_usd.toFixed(2)}`;

        // Pillars
        document.getElementById("resDates").innerText = data.date_window.suggested_dates;
        document.getElementById("resSeason").innerText = data.date_window.season_status;
        document.getElementById("whyDatesBtn").onclick = () => showWhyModal(data.date_window.why);

        document.getElementById("resTransport").innerText = `${data.transportation.mode}: ${data.transportation.carrier_or_provider}`;
        document.getElementById("resTransportCost").innerText = `Est. $${data.transportation.estimated_total_cost_usd} total`;
        document.getElementById("whyTransportBtn").onclick = () => showWhyModal(data.transportation.why);

        document.getElementById("resHotelName").innerText = data.hotel.name;
        document.getElementById("resHotelRating").innerHTML = `
            <i class="fa-solid fa-star text-amber-400 mr-1"></i> ${data.hotel.aggregated_rating_10}/10 
            <span class="text-slate-500 text-xs ml-1">(${data.hotel.stars}★)</span>
            <span class="text-slate-400 ml-auto font-bold text-slate-300">$${data.hotel.price_per_night_usd}/night</span>
        `;
        document.getElementById("whyHotelBtn").onclick = () => showWhyModal(data.hotel.why);

        // Daily Itinerary
        const dailyContainer = document.getElementById("dailyItineraryContainer");
        dailyContainer.innerHTML = "";

        data.daily_schedule.forEach(day => {
            const dayCard = document.createElement("div");
            dayCard.className = "bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4";

            let activitiesHTML = day.activities.map((act, idx) => `
                <div class="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="text-xs font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded">${act.time_slot}</span>
                            <h5 class="text-sm font-bold text-slate-100">${act.place_name}</h5>
                        </div>
                        <p class="text-xs text-slate-400 mt-1">
                            <i class="fa-solid fa-person-walking text-slate-500 mr-1"></i> ${act.transport_from_prev} 
                            (${act.transport_cost_usd > 0 ? '$' + act.transport_cost_usd : 'Free'})
                            • Rating: <span class="text-amber-400 font-semibold">${act.aggregated_rating_10}/10</span>
                        </p>
                    </div>
                    <button class="why-act-btn self-start sm:self-auto text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1 rounded-lg" 
                        data-day="${day.day_number}" data-act-idx="${idx}">
                        Why this place?
                    </button>
                </div>
            `).join("");

            let mealsHTML = "";
            if (day.restaurants && day.restaurants.length > 0) {
                mealsHTML = `
                <div class="pt-2 border-t border-slate-800/80">
                    <h6 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Recommended Restaurants (Aggregated Reviews)</h6>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        ${day.restaurants.map((rest, rIdx) => `
                            <div class="bg-slate-950/60 border border-slate-800 rounded-lg p-3 flex justify-between items-center">
                                <div>
                                    <div class="text-xs font-bold text-emerald-400">${rest.meal_type}: ${rest.restaurant_name}</div>
                                    <div class="text-xs text-slate-400">${rest.cuisine} • Est: $${rest.estimated_cost_usd} • ★ ${rest.aggregated_rating_10}/10</div>
                                </div>
                                <button class="why-rest-btn text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded" 
                                    data-day="${day.day_number}" data-rest-idx="${rIdx}">Why?</button>
                            </div>
                        `).join("")}
                    </div>
                </div>`;
            }

            dayCard.innerHTML = `
                <div class="flex justify-between items-center pb-2 border-b border-slate-800">
                    <div>
                        <span class="text-xs font-bold text-sky-400">DAY ${day.day_number}</span>
                        <h4 class="text-base font-bold text-white">${day.theme_or_summary}</h4>
                    </div>
                </div>
                <div class="space-y-2">
                    ${activitiesHTML}
                </div>
                ${mealsHTML}
            `;
            dailyContainer.appendChild(dayCard);
        });

        // Attach dynamic activity & restaurant why listeners
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

        // Departure Buffer Card
        const dep = data.departure_day_buffer;
        const depContainer = document.getElementById("departureBufferCard");
        depContainer.innerHTML = `
            <div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div class="flex items-center space-x-2">
                    <span class="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                        <i class="fa-solid fa-shield-halved"></i>
                    </span>
                    <div>
                        <h4 class="text-sm font-bold text-white">Departure Day Strategy (4-Hour Airport Buffer)</h4>
                        <p class="text-xs text-slate-400">Flight: ${dep.flight_departure_time} | Target Station Arrival: ${dep.airport_arrival_target_time}</p>
                    </div>
                </div>
                <button id="whyDepartureBtn" class="text-xs bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full">
                    Why this 4-hr buffer?
                </button>
            </div>
            <div class="mt-4 space-y-3">
                <div class="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
                    <span class="font-bold text-sky-400">Final Afternoon Activity:</span> 
                    ${dep.activities_before_buffer[0] ? dep.activities_before_buffer[0].place_name + ' (' + dep.activities_before_buffer[0].time_slot + ')' : 'Direct checkout & city promenade'}
                </div>
                <div class="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
                    <span class="font-bold text-emerald-400">Pre-Departure Meal:</span> 
                    ${dep.recommended_last_meal.restaurant_name} (${dep.recommended_last_meal.cuisine}) — Quick prep speed & close to terminal route.
                </div>
            </div>
        `;

        document.getElementById("whyDepartureBtn").onclick = () => showWhyModal(dep.why);

        // Show Results
        resultsContainer.classList.remove("hidden");
    }
});