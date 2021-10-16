//store the searched city
var city = "";
// variable declaration
var citySearch = $("#city-search");
var searchForButton = $("#search-for-button");
var clearHistoryButton = $("#clear-history-button");
var currentLocationOrCity = $("#current-location");
var currentTemperature = $("#current-temperature");
var currentHumidityMeasurement = $("#current-humidity");
var currentWindSpeed = $("#current-wind-speed");
var uvIndex = $("current-uv-index");
var searchCity = [];
// search city - see if it exists in the storage
//The FINDC function searches string for the first occurrence of the specified characters, and returns the position of the first character found. If no characters are found in string, then FINDC returns a value of 0.
//https://www.w3schools.com/jsref/jsref_find.asp
function find(c) {
    for (var i = 0; i < sCity.length; i++) {
        if (c.toUpperCase() === sCity[i]) {
            return -1;
        }
    }
    //https://stackoverflow.com/questions/8282802/what-do-return-1-1-and-0-mean-in-this-javascript-code/8282827
    return 1;
}


//the API key
var APIKey = "993e66d0b0d5090af76f55db0856f1ab";
// Display current & future weather after getting the city form input text box.
// WHEN I search for a city
// THEN I am presented with current and future conditions
// for that city and that city is added to the search history
//see the project requirements file
function displayWeather(event) {
    event.preventDefault();
    if (citySearch.val().trim() !== "") {
        city = citySearch.val().trim();
        currentWeather(city);
    }
}
// AJAX call
function currentWeather(city) {
    // get data from server side
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=" + APIKey;
    $.ajax({
        url: queryURL,
        method: "GET",
    }).then(function (response) {
        // WHEN I view current weather conditions
        // for that city
        // THEN I am presented with the city name, the date, an icon representation of weather conditions, 
        // the temperature, the humidity, the wind speed, and the UV index
        // parse response - display current weather - include City name, Date and weather icon. 
        //see the project requirements file
        console.log(response);
        //Data object from server side Api for icon property.
        var weathericon = response.weather[0].icon;
        var iconurl = "https://openweathermap.org/img/wn/" + weathericon + "@2x.png";
        // The date format method  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
        var date = new Date(response.dt * 1000).toLocaleDateString();
        //parse the response for name of city and concanatig the date and icon.
        $(currentLocationOrCity).html(response.name + "(" + date + ")" + "<img src=" + iconurl + ">");
        // parse response -display current temperature
        // Change temp to fahrenheit

        var tempFahrenheit  = (response.main.temp - 273.15) * 1.80 + 32;
        $(currentTemperature).html((tempFahrenheit ).toFixed(2) + "&#8457");
        // Display the Humidity
        $(currentHumidityMeasurement).html(response.main.humidity + "%");
        //Display Wind speed and convert to MPH
        var ws = response.wind.speed;
        var currentWindSpeed = (ws * 2.237).toFixed(1);
        $(currentWSpeed).html(currentWindSpeed + "MPH");
        //  var windsmph = (ws * 2.237).toFixed(1);
        //  $(currentWSpeed).html(windsmph + "MPH");

        // Show UVIndex.
        //
        UVIndex(response.coord.lon, response.coord.lat);
        forecast(response.id);
        if (response.cod == 200) {
            sCity = JSON.parse(localStorage.getItem("cityname"));
            console.log(sCity);
            if (sCity == null) {
                sCity = [];
                sCity.push(city.toUpperCase());
                localStorage.setItem("cityname", JSON.stringify(sCity));
                addToList(city);
            } else {
                if (find(city) > 0) {
                    sCity.push(city.toUpperCase());
                    localStorage.setItem("cityname", JSON.stringify(sCity));
                    addToList(city);
                }
            }
        }

    });
}
// WHEN I view the UV index
// THEN I am presented with a color that indicates whether the conditions are 
// favorable, moderate, or severe
//see the project requirements file
// Function returns the UVI index response
function UVIndex(ln, lt) {
    //lets build the url for uvindex
    var uvqURL = "https://api.openweathermap.org/data/2.5/uvi?appid=" + APIKey + "&lat=" + lt + "&lon=" + ln;
    //https://www.w3schools.com/js/js_ajax_intro.asp
    $.ajax({
        url: uvqURL,
        method: "GET"
    }).then(function (response) {
        $(currentUvindex).html(response.value);
    });
}
//WHEN I view future weather conditions for that city
// THEN I am presented with a 5 - day forecast that displays the date, an icon representation
//  of weather conditions, the temperature, the wind speed, and the humidity
//see the project requirements file
// Display the 5 days forecast for the current city
function forecast(cityid) {
    var dayover = false;
    var queryforcastURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + cityid + "&appid=" + APIKey;
    $.ajax({
        url: queryforcastURL,
        method: "GET"
    }).then(function (response) {

        for (i = 0; i < 5; i++) {
            var date = new Date((response.list[((i + 1) * 8) - 1].dt) * 1000).toLocaleDateString();
            var iconcode = response.list[((i + 1) * 8) - 1].weather[0].icon;
            var iconurl = "https://openweathermap.org/img/wn/" + iconcode + ".png";
            var tempK = response.list[((i + 1) * 8) - 1].main.temp;
            var tempFahrenheit  = (((tempK - 273.5) * 1.80) + 32).toFixed(2);
            var humidity = response.list[((i + 1) * 8) - 1].main.humidity;

            $("#futureDate" + i).html(date);
            $("#futureWeatherImage" + i).html("<img src=" + iconurl + ">");
            $("#futureWeatherTemp" + i).html(tempFahrenheit  + "&#8457");
            $("#futureHumidity" + i).html(humidity + "%");
        }

    });
}


// WHEN I click on a city in the search history
// THEN I am again presented with current and future conditions
// for that city
//see the project requirements file for more information
function addToList(c) {
    var listEl = $("<li>" + c.toUpperCase() + "</li>");
    $(listEl).attr("class", "list-group-item");
    $(listEl).attr("data-value", c.toUpperCase());
    $(".list-group").append(listEl);
}
// display past search again when list group item clicked in search history
function invokePastSearch(event) {
    var liEl = event.target;
    if (event.target.matches("li")) {
        city = liEl.textContent.trim();
        currentWeather(city);
    }

}

// render function
function loadLastCity() {
    $("ul").empty();
    var sCity = JSON.parse(localStorage.getItem("cityname"));
    if (sCity !== null) {
        sCity = JSON.parse(localStorage.getItem("cityname"));
        for (i = 0; i < sCity.length; i++) {
            addToList(sCity[i]);
        }
        city = sCity[i - 1];
        currentWeather(city);
    }

}
//Clear search history from page
function clearHistory(event) {
    event.preventDefault();
    sCity = [];
    localStorage.removeItem("cityname");
    document.location.reload();

}
//click handlers
$("#search-for-button").on("click", displayWeather);
$(document).on("click", invokePastSearch);
$(window).on("load", loadLastCity);
$("#clear-history").on("click", clearHistory);


//Resources and References 
//https://getbootstrap.com/ Bootstrap
//https://getbootstrap.com/docs/5.1/getting-started/introduction/