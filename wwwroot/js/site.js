// === КЭШ ЗАПРОСОВ ===
// Сохраняем уже сделанные запросы, чтобы не делать их повторно
const cache = {};

// === DOM-ЭЛЕМЕНТЫ ===
const input = document.getElementById("cityInput");
const suggestionsContainer = document.getElementById("autocomplete");

// === API КЛЮЧ ===
const DADATA_API_KEY = "27f077490f4dc0ea7da47391b3b0118818592f67";

// === ТАЙМЕР ДЛЯ DEBOUNCE ===
let debounceTimeout;

function extractCityName(value) {
    let cleaned = value.split(',').pop().trim();
    cleaned = cleaned.replace(/^([гсдп]+\.? |село |город |деревня |пос[ёе]лок |насел[^\s]+ )/gi, '').trim();
    return cleaned;
}

async function fetchSuggestions(query) {
    if (!query.trim()) return [];

    if (cache[query]) {
        console.log("Берём из кэша:", query);
        return cache[query];
    }

    try {
        const response = await fetch("https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Token " + DADATA_API_KEY
            },
            body: JSON.stringify({
                query: query,
                count: 7,
                locations: [{ country_iso_code: "RU" }],
                from_bound: { value: "city" },
                to_bound: { value: "city" }
            })
        });

        if (!response.ok) throw new Error("Ошибка сети");

        const data = await response.json();

        const cities = data.suggestions.map(suggestion => {
            const directCity = suggestion.data?.city;
            return directCity ? directCity : extractCityName(suggestion.value);
        });

        const uniqueCities = [...new Set(cities)];
        cache[query] = uniqueCities;

        return uniqueCities;
    } catch (error) {
        console.error("Ошибка при получении подсказок:", error);
        return [];
    }
}

/**
 * Отображает список найденных городов под полем ввода
 * @param {string[]} suggestions - массив названий городов
 */
function showSuggestions(suggestions) {
    suggestionsContainer.innerHTML = "";

    suggestions.forEach(city => {
        const div = document.createElement("div");
        div.className = "autocomplete-item";
        div.textContent = city;

        // При клике — подставляем в инпут и скрываем подсказки
        div.addEventListener("click", () => {
            input.value = city;
            suggestionsContainer.innerHTML = "";
        });

        suggestionsContainer.appendChild(div);
    });
}

/**
 * Обработчик ввода пользователя
 * Делает задержку перед отправкой запроса (debounce)
 */
input.addEventListener("input", () => {
    const query = input.value;

    // Очищаем предыдущий таймер
    if (debounceTimeout) clearTimeout(debounceTimeout);

    // Делаем запрос с задержкой
    debounceTimeout = setTimeout(async () => {
        const results = await fetchSuggestions(query);
        showSuggestions(results);
    }, 500); // Ждём 500 мс после окончания ввода
});

