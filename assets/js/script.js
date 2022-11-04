var currentWeather = {
    name: "",
    date: "",
    temp: "",
    humidity: "",
    wind: "",
    uv: "",
    uvAlert: "",
    icon: ""
}

var forecast = [];
var searchHistory = [];

var apiKey = "aefe67976d6b16cea997109cc7b0ac82";

var cityNameEl = document.querySelector("#name");
var curDateEl = document.querySelector("#date");
var curIconEl = document.querySelector("#icon");
var curTempEl = document.querySelector("#temp");
var curHumidityEl = document.querySelector("#humidity");
var curWindEl = document.querySelector("#wind");
var curUvEl = document.querySelector("#uv");
var searchInputEl = document.querySelector("#search-city");
var formEl = document.querySelector("#search-form");
var historyEl = document.querySelector("#history");
var clearBtnEl = document.querySelector("#clear-history");
var uvAlertEl = document.querySelector("#uv-alert");
var forecastEl = document.querySelector("#forecast-body");
var resultsContEl = document.querySelector("#results-container");
var forecastContEl = document.querySelector("#forecast-container");
var curStatsEl = document.querySelector("#current-stats");

var getWeather = function (city){

    var apiUrl = "https://api.openweathermap.org/data/2.5/weather?q="+city+"&units=metric&appid=" + apiKey;
    var lat = "";
    var lon = "";
    fetch(apiUrl).then(function(response) {
        if(response.ok) {
            response.json().then(function(data) {
                currentWeather.name = data.name;
                currentWeather.date = moment().format("dddd, MMMM Do YYYY");
                currentWeather.temp = data.main.temp + " &#8451";
                currentWeather.humidity = data.main.humidity+"%";
                currentWeather.wind = data.wind.speed + " KPH";
                currentWeather.icon = data.weather[0].icon;
                lat = data.coord.lat;
                lon = data.coord.lon;

                var uvUrl = "https://api.openweathermap.org/data/2.5/uvi?appid=" + apiKey + "&lat="+lat+"&lon="+lon;
                fetch(uvUrl)
                .then(function(uvResponse) {
                    if (uvResponse.ok) {
                        uvResponse.json().then(function(uvData) {
                            currentWeather.uv = uvData.value;
                            displayWeather();
                            getForecast(city);
                        });
                    }
                    else {
                        curUvEl.innerHTML = "Error";
                        currentWeather.uv = "error";
                    }   
                });

            });
        } else {
            clearData();
            cityNameEl.innerHTML = "Error: " + response.status + " " + city + " " + response.statusText;
        }
    })
    .catch (function(error) {
        cityNameEl.innerHTML = error.message + " Please try again later.";
    })
}

var getForecast = function (city) {
    var forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&units=metric&appid=" + apiKey;
    fetch(forecastUrl).then(function(response) {
        if (response.ok) {
            response.json().then(function(data) {
                var today = moment().format("YYYY-MM-DD");
                for (var i=0; i<data.list.length; i++){
                    var dateTime = data.list[i].dt_txt.split(' ');
    
                    if (dateTime[0] !== today && dateTime[1] === "12:00:00" ) {
                        var futureDate = {
                            date: moment(dateTime[0]).format("MM/DD/YYYY"),
                            time: dateTime[1],
                            icon: data.list[i].weather[0].icon,
                            temp: data.list[i].main.temp + " &#8451",
                            humidity: data.list[i].main.humidity + " %",
                            wind: data.list[i].wind.speed + " KPH",
                        };
                        forecast.push(futureDate);
                    }
                }
                displayForecast();
            })
        }
        else {
            forecastEl.innerHTML = "Error: " + response.status + " " + response.statusText;
        }
    })
    .catch (function(error) {
        forecastEl.innerHTML = error.message;
    })
}

var displayForecast = function () {
    for (var i=0; i<forecast.length; i++) {
        var cardContainerEl = document.createElement("div");
        cardContainerEl.classList.add("col-xl");
        cardContainerEl.classList.add("col-md-4");

        var cardEl = document.createElement("div");
        cardEl.classList.add("card");
        cardEl.classList.add("forecast-card");

        var cardBodyEl = document.createElement("div");
        cardBodyEl.classList.add("card-body");

        var dateEl = document.createElement("h5");
        dateEl.classList.add("card-title");
        dateEl.innerHTML = forecast[i].date;
        cardBodyEl.appendChild(dateEl);

        var iconEl = document.createElement("p");
        iconEl.classList.add("card-text");
        iconEl.innerHTML = "<img src='https://openweathermap.org/img/wn/" + forecast[i].icon + "@2x.png'></img>";
        cardBodyEl.appendChild(iconEl);

        var tempEl = document.createElement("p");
        tempEl.classList.add("card-text");
        tempEl.innerHTML = "Temp: " + forecast[i].temp;
        cardBodyEl.appendChild(tempEl);

        var humidityEl = document.createElement("p");
        humidityEl.classList.add("card-text");
        humidityEl.innerHTML = "Humidity: " + forecast[i].humidity
        cardBodyEl.appendChild(humidityEl);

        var windSpeedEl = document.createElement("p");
        windSpeedEl.classList.add("card-text");
        windSpeedEl.innerHTML = "Wind Speed: " + forecast[i].wind
        cardBodyEl.appendChild(windSpeedEl);

        cardEl.appendChild(cardBodyEl);
        cardContainerEl.appendChild(cardEl);
        forecastEl.appendChild(cardContainerEl);

    }
}

var displayWeather = function() {
    curStatsEl.style.display = "block";
    forecastContEl.style.display = "block";
    cityNameEl.innerHTML = currentWeather.name;
    curDateEl.innerHTML = currentWeather.date;
    curTempEl.innerHTML = currentWeather.temp;
    curHumidityEl.innerHTML = currentWeather.humidity;
    curWindEl.innerHTML = currentWeather.wind;
    curUvEl.innerHTML = currentWeather.uv;
    curIconEl.innerHTML = "<img src='https://openweathermap.org/img/wn/" + currentWeather.icon + "@2x.png'></img>";
    uvCheck();

}

var displayHistory = function() {
    historyEl.innerHTML = "";
    for (var i = 0; i<searchHistory.length; i++) {
        var historyDiv = document.createElement("div");
        historyDiv.classList.add("history-item");
        historyDiv.innerHTML = "<h4>"+searchHistory[i]+"</h4>";
        historyEl.appendChild(historyDiv);
    }
}

var loadHistory = function() {
    searchHistory = JSON.parse(localStorage.getItem("history"));
    if (!searchHistory) {
        searchHistory = [];
    }
    displayHistory();
}

var formSubmitHandler = function(event) {
    event.preventDefault();
    var searchCity = searchInputEl.value.trim();
    if (searchCity) {
        getWeather(searchCity);
        searchHistory.push(searchCity);
        localStorage.removeItem("history");
        localStorage.setItem("history", JSON.stringify(searchHistory));
        clearForecast();
        displayHistory();
        searchInputEl.value = "";
    }
    else {
        return;
    }
}

var clearHistory = function() {
    localStorage.removeItem("history");
    searchHistory = [];
    displayHistory();
}

var uvCheck = function() {
    if (currentWeather.uv === "error") {
        return;
    }

    if (currentWeather.uv < 3) {
        currentWeather.uvAlert = "low";
        uvAlertEl.textContent = "low";
        uvAlertEl.classList.add("alert-success");
        return;
    }
    else if (currentWeather.uv < 6) {
        currentWeather.uvAlert = "moderate";
        uvAlertEl.textContent = "moderate";
        uvAlertEl.classList.add("alert-warning");
        return;
    }
    else if (currentWeather.uv < 8) {
        currentWeather.uvAlert = "high";
        uvAlertEl.textContent = "high";
        uvAlertEl.classList.add("alert-danger");
        return;
    }
    else if (currentWeather.uv < 11) {
        currentWeather.uvAlert = "very high";
        uvAlertEl.textContent = "very high";
        uvAlertEl.classList.add("alert-danger");
        return;
    }
    else {
        currentWeather.uvAlert = "extreme";
        uvAlertEl.textContent = "extreme";
        uvAlertEl.classList.add("alert-danger");
    }
}

var clearForecast = function () {
    forecast = [];
    forecastEl.innerHTML = "";
}

var historyClickHandler = function (event) {
    var histCity = event.target.textContent;
    if (histCity) {
        clearForecast();
        getWeather(histCity);
    }
}

var clearData = function () {
    console.log("inside clearData");
    curStatsEl.style.display = "none";
    forecastContEl.style.display = "none";
    curDateEl.innerHTML = "";
    curIconEl.innerHTML = "";
}

loadHistory();

formEl.addEventListener("submit", formSubmitHandler);
clearBtnEl.addEventListener("click", clearHistory);
historyEl.addEventListener("click", historyClickHandler);