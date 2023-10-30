document.addEventListener("DOMContentLoaded", () => {
    const cityNameInput = document.getElementById("5day");
    const previousSearchesElement = document.getElementById("previous-searches");

    const addSearchToPrevious = (search) => {
        let previousSearches = JSON.parse(localStorage.getItem("previous-searches")) || [];

        if (!previousSearches.includes(search)) {
            if (previousSearches.length >= 4) {
                previousSearches.shift();
            }
            previousSearches.push(search);
            console.log("Setting to localStorage:", previousSearches);
            localStorage.setItem("previous-searches", JSON.stringify(previousSearches));
        }
    };

    const redirectToSearch = (cityName) => {
        addSearchToPrevious(cityName); 
        updatePreviousSearchButtons();  
        console.log("Attempting to redirect...");
        window.location.href = `search-results.html?city=${cityName}`; 
    };
    
    const findResultsButton = document.getElementById("find-results");
    findResultsButton.addEventListener("click", (e) => {
        e.preventDefault();
        const cityName = cityNameInput.value;
        redirectToSearch(cityName);
    });
    
    function updatePreviousSearchButtons() {
        const previousSearches = JSON.parse(localStorage.getItem("previous-searches")) || [];
    
        if (!previousSearchesElement) {
            console.error('Element with ID "previous-searches" is missing from the DOM.');
            return;
        }
    
        while (previousSearchesElement.firstChild) {
            previousSearchesElement.removeChild(previousSearchesElement.firstChild);
        }
    
        for (let i = previousSearches.length - 1; i >= Math.max(0, previousSearches.length - 4); i--) {
            const search = previousSearches[i];
            const button = document.createElement("button");
            button.classList.add("btn", "custom-btn", "previous-search");
            button.textContent = search;
            button.addEventListener("click", () => {
                cityNameInput.value = search;
                fetchWeatherForecast(search);
                redirectToSearch(search);
            });
            
            previousSearchesElement.appendChild(button);
        }
    }
    

    function fetchWeatherForecast(cityName) {
        const apiKey = '5ecdd58a667d9ab9801a998a6ab6d228';
        const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}`;

        fetch(apiUrl)
            .then((response) => response.json())
            .then((data) => {
                displayWeatherForecast(data);
            })
            .catch((error) => {
                console.error(error);
            });
    }

    function displayWeatherForecast(data) {
        const cityNameDisplay = document.getElementById("city-name");
        const forecastDataElement = document.getElementById("forecast-data");
        const forecastList = data.list;
        forecastDataElement.innerHTML = "";

        
        cityNameDisplay.textContent = data.city.name;

        const days = {};

        forecastList.forEach((forecast) => {
            const date = new Date(forecast.dt * 1000);
            const day = date.toDateString();
            if (!days[day]) {
                days[day] = [];
            }
            days[day].push(forecast);
        });

        const currentDate = new Date();
        const currentDay = currentDate.toDateString();

        if (days[currentDay]) {
            const currentForecast = days[currentDay][0];
            const currentTemperature = (currentForecast.main.temp - 273.15) * 9/5 + 32;
            const currentDescription = currentForecast.weather[0].description;
            const currentWeatherIcon = currentForecast.weather[0].icon;
            const currentWindSpeed = currentForecast.wind.speed * 2.237;
            const currentHumidity = currentForecast.main.humidity;

            const currentForecastBox = document.createElement("div");
            currentForecastBox.classList.add("current-forecast-box");
            const todayOrDate = currentDay === new Date().toDateString() ? "Today" : currentDay;
            currentForecastBox.innerHTML = `
                <div class="current-date">${todayOrDate}</div>
                <div class="current-icon">
                    <img src="https://openweathermap.org/img/w/${currentWeatherIcon}.png" alt="Weather Icon">
                </div>
                <div class="current-temperature">Temperature: ${Math.round(currentTemperature)}°F</div>
                <div class="current-description">Description: ${currentDescription}</div>
                <div class="current-wind-speed">Wind Speed: ${Math.round(currentWindSpeed)} MPH</div>
                <div class="current-humidity">Humidity: ${currentHumidity}%</div>
            `;
            forecastDataElement.appendChild(currentForecastBox);
        }

        for (const day in days) {
            if (Object.hasOwnProperty.call(days, day) && day !== currentDay) {
                const forecastsForDay = days[day];
                const firstForecast = forecastsForDay[0];
                const temperature = (firstForecast.main.temp - 273.15) * 9/5 + 32;
                const description = firstForecast.weather[0].description;
                const weatherIcon = firstForecast.weather[0].icon;
                const windSpeed = firstForecast.wind.speed * 2.237;
                const humidity = firstForecast.main.humidity;

                const forecastItem = document.createElement("div");
                forecastItem.classList.add("forecast-box");
                forecastItem.innerHTML = `
                    <div class="date">${day}</div>
                    <div class="icon">
                        <img src="https://openweathermap.org/img/w/${weatherIcon}.png" alt="Weather Icon">
                    </div>
                    <div class="temperature">Temperature: ${Math.round(temperature)}°F</div>
                    <div class="description">Description: ${description}</div>
                    <div class="wind-speed">Wind Speed: ${Math.round(windSpeed)} MPH</div>
                    <div class="humidity">Humidity: ${humidity}%</div>
                `;
                forecastDataElement.appendChild(forecastItem);
            }
        }
    }

    const urlParams = new URLSearchParams(window.location.search);
const cityName = urlParams.get("city");

if (cityName) {
    fetchWeatherForecast(cityName);
}

updatePreviousSearchButtons();

});
