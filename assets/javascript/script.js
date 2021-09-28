//Declare a variable to store the searched city
var city = "";
// variable declaration
var searchCity = $("#search-for-city");
var searchButton = $("#search-button");
var clearHistoryButton = $("#clear-history-button");
var currentCity = $("#current-city");
var currentTemperature = $("#current-temperature");
var currentHumidity = $("#current-humidity");
var currentWindSpeed = $("#current-wind-speed");
var currentUvIndex = $("#current-uv-index");
var sCity = [];



// searches the city to see if it exists in the entries from the storage
function find(c) {
  for (var i = 0; i < sCity.length; i++) {
    if (c.toUpperCase() === sCity[i]) {
      return -1;
    }
  }
  return 1;
}


//Set up the API key
var APIKey = "993e66d0b0d5090af76f55db0856f1ab";
// Display the curent and future weather to the user after grabing the city form the input text box.
function displayWeather(event) {
  event.preventDefault();
  if (searchCity.val().trim() !== "") {
    city = searchCity.val().trim();
    currentWeather(city);
  }
}



// Here we create the AJAX call
function currentWeather(city) {
  // Here we build the URL so we can get a data from server side.
  var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=" + APIKey;
  $.ajax({
    url: queryURL,
    method: "GET",
  }).then(function (response) {

    // parse the response to display the current weather including the City name. the Date and the weather icon. 
    console.log(response);


    //Dta object from server side Api for icon property.
    var weathericon = response.weather[0].icon;
    var iconurl = "https://openweathermap.org/img/wn/" + weathericon + "@2x.png";
    // The date format method is taken from the  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
    var date = new Date(response.dt * 1000).toLocaleDateString();
    //parse the response for name of city and concanatig the date and icon.
    $(currentCity).html(response.name + "(" + date + ")" + "<img src=" + iconurl + ">");
    // parse the response to display the current temperature.
    // Convert the temp to fahrenheit

    var tempF = (response.main.temp - 273.15) * 1.80 + 32;
    $(currentTemperature).html((tempF).toFixed(2) + "&#8457");
    // Display the Humidity
    $(currentHumidty).html(response.main.humidity + "%");
    //Display Wind speed and convert to MPH
    var ws = response.wind.speed;
    var windsmph = (ws * 2.237).toFixed(1);
    $(currentWSpeed).html(windsmph + "MPH");
    // Display UVIndex.
    //By Geographic coordinates method and using appid and coordinates as a parameter we are going build our uv query url inside the function below.
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


// This function returns the UVIindex response.
function UVIndex(ln, lt) {
  //lets build the url for uvindex.
  var uvqURL = "https://api.openweathermap.org/data/2.5/uvi?appid=" + APIKey + "&lat=" + lt + "&lon=" + ln;
  $.ajax({
    url: uvqURL,
    method: "GET"
  }).then(function (response) {
    $(currentUvindex).html(response.value);
  });
}



// Here we display the 5 days forecast for the current city.
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
      var tempF = (((tempK - 273.5) * 1.80) + 32).toFixed(2);
      var humidity = response.list[((i + 1) * 8) - 1].main.humidity;

      $("#fDate" + i).html(date);
      $("#fImg" + i).html("<img src=" + iconurl + ">");
      $("#fTemp" + i).html(tempF + "&#8457");
      $("#fHumidity" + i).html(humidity + "%");
    }

  });
}

//Daynamically add the passed city on the search history
function addToList(c) {
  var listEl = $("<li>" + c.toUpperCase() + "</li>");
  $(listEl).attr("class", "list-group-item");
  $(listEl).attr("data-value", c.toUpperCase());
  $(".list-group").append(listEl);
}
// display the past search again when the list group item is clicked in search history
function invokePastSearch(event) {
  var liEl = event.target;
  if (event.target.matches("li")) {
    city = liEl.textContent.trim();
    currentWeather(city);
  }

}

// render function
function loadlastCity() {
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
//Clear the search history from the page
function clearHistory(event) {
  event.preventDefault();
  sCity = [];
  localStorage.removeItem("cityname");
  document.location.reload();

}
//Click Handlers
$("#search-button").on("click", displayWeather);
$(document).on("click", invokePastSearch);
$(window).on("load", loadlastCity);
$("#clear-history").on("click", clearHistory);






function createCityList(citySearchList) {
  $("#city-list").empty();

  var keys = Object.keys(citySearchList);
  for (var i = 0; i < keys.length; i++) {
    var cityListEntry = $("<button>");
    cityListEntry.addClass("list-group-item list-group-item-action");

    var splitStr = keys[i].toLowerCase().split(" ");
    for (var j = 0; j < splitStr.length; j++) {
      splitStr[j] =
        splitStr[j].charAt(0).toUpperCase() + splitStr[j].substring(1);
    }
    var titleCasedCity = splitStr.join(" ");
    cityListEntry.text(titleCasedCity);

    $("#city-list").append(cityListEntry);
  }
}

function populateCityWeather(city, citySearchList) {
  createCityList(citySearchList);

  var queryURL =
    "https://api.openweathermap.org/data/2.5/weather?&units=imperial&appid=993e66d0b0d5090af76f55db0856f1ab&q=" +
    city;

  var queryURL2 =
    "https://api.openweathermap.org/data/2.5/forecast?&units=imperial&appid=993e66d0b0d5090af76f55db0856f1ab&q=" +
    city;

  var latitude;

  var longitude;

  $.ajax({
      url: queryURL,
      method: "GET"
    })
    // Store all of the retrieved data inside of an object called "weather"
    .then(function (weather) {
      // Log the queryURL
      console.log(queryURL);

      // Log the resulting object
      console.log(weather);

      var nowMoment = moment();

      var displayMoment = $("<h3>");
      $("#city-name").empty();
      $("#city-name").append(
        displayMoment.text("(" + nowMoment.format("M/D/YYYY") + ")")
      );

      var cityName = $("<h3>").text(weather.name);
      $("#city-name").prepend(cityName);

      var weatherIcon = $("<img>");
      weatherIcon.attr(
        "src",
        "https://openweathermap.org/img/w/" + weather.weather[0].icon + ".png"
      );
      $("#current-icon").empty();
      $("#current-icon").append(weatherIcon);

      $("#current-temp").text("Temperature: " + weather.main.temp + " °F");
      $("#current-humidity").text("Humidity: " + weather.main.humidity + "%");
      $("#current-wind").text("Wind Speed: " + weather.wind.speed + " MPH");

      latitude = weather.coord.lat;
      longitude = weather.coord.lon;

      var queryURL3 =
        "https://api.openweathermap.org/data/2.5/uvi/forecast?&units=imperial&appid=993e66d0b0d5090af76f55db0856f1ab&q=" +
        "&lat=" +
        latitude +
        "&lon=" +
        longitude;

      $.ajax({
        url: queryURL3,
        method: "GET"
        // Store all of the retrieved data inside of an object called "uvIndex"
      }).then(function (uvIndex) {
        console.log(uvIndex);

        var uvIndexDisplay = $("<button>");
        uvIndexDisplay.addClass("btn btn-danger");

        $("#current-uv").text("UV Index: ");
        $("#current-uv").append(uvIndexDisplay.text(uvIndex[0].value));
        console.log(uvIndex[0].value);

        $.ajax({
          url: queryURL2,
          method: "GET"
          // Store all of the retrieved data inside of an object called "forecast"
        }).then(function (forecast) {
          console.log(queryURL2);

          console.log(forecast);
          // Loop through the forecast list array and display a single forecast entry/time (5th entry of each day which is close to the highest temp/time of the day) from each of the 5 days
          for (var i = 6; i < forecast.list.length; i += 8) {
            // 6, 14, 22, 30, 38
            var forecastDate = $("<h5>");

            var forecastPosition = (i + 2) / 8;

            console.log("#forecast-date" + forecastPosition);

            $("#forecast-date" + forecastPosition).empty();
            $("#forecast-date" + forecastPosition).append(
              forecastDate.text(nowMoment.add(1, "days").format("M/D/YYYY"))
            );

            var forecastIcon = $("<img>");
            forecastIcon.attr(
              "src",
              "https://openweathermap.org/img/w/" +
              forecast.list[i].weather[0].icon +
              ".png"
            );

            $("#forecast-icon" + forecastPosition).empty();
            $("#forecast-icon" + forecastPosition).append(forecastIcon);

            console.log(forecast.list[i].weather[0].icon);

            $("#forecast-temp" + forecastPosition).text(
              "Temp: " + forecast.list[i].main.temp + " °F"
            );
            $("#forecast-humidity" + forecastPosition).text(
              "Humidity: " + forecast.list[i].main.humidity + "%"
            );

            $(".forecast").attr(
              "style",
              "background-color:dodgerblue; color:white"
            );
          }
        });
      });
    });
}

$(document).ready(function () {
  var citySearchListStringified = localStorage.getItem("citySearchList");

  var citySearchList = JSON.parse(citySearchListStringified);

  if (citySearchList == null) {
    citySearchList = {};
  }

  createCityList(citySearchList);

  $("#current-weather").hide();
  $("#forecast-weather").hide();



  $("#search-button").on("click", function (event) {
    event.preventDefault();
    var city = $("#city-input")
      .val()
      .trim()
      .toLowerCase();

    if (city != "") {
      //Check to see if there is any text entered

      citySearchList[city] = true;
      localStorage.setItem("citySearchList", JSON.stringify(citySearchList));

      populateCityWeather(city, citySearchList);

      $("#current-weather").show();
      $("#forecast-weather").show();
    }


  });

  $("#city-list").on("click", "button", function (event) {
    event.preventDefault();
    var city = $(this).text();

    populateCityWeather(city, citySearchList);

    $("#current-weather").show();
    $("#forecast-weather").show();
  });
});
 








$(document).ready(function () {

      // On click of Search or city list
      $('#getEnteredCityWeather,#past-searches').on('click', function () {

        // get location from user 
        // get location from city history 
        let clickEvent = $(event.target)[0];
        let location = "";
        if (clickEvent.id === "getEnteredCityWeather") {
          location = $('#cityEntered').val().trim().toUpperCase();
        } else if (clickEvent.className === ("cityList")) {
          location = clickEvent.innerText;
        }
        if (location == "") return;

        // update local storage with new city search
        updateInfoStoredLocally(location);

        // get current weather for searched location, pass location
        getCurrentWeather(location);

        // get forecast for searched location, pass location
        getForecastWeather(location);
      });

      // Convert Unix timestamp to MMM DD, YYYY format
      function convertDate(UNIXtimestamp) {
        let convertedDate = "";
        let a = new Date(UNIXtimestamp * 1000);
        let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        let year = a.getFullYear();
        let month = months[a.getMonth()];
        let date = a.getDate();
        convertedDate = month + ' ' + date + ', ' + year;
        return convertedDate;
      }

      function updateInfoStoredLocally(location) {
        // update City in local storage
        let cityList = JSON.parse(localStorage.getItem("cityList")) || [];
        cityList.push(location);
        cityList.sort();

        // removes duplicate cities from saved searches
        for (let i = 1; i < cityList.length; i++) {
          if (cityList[i] === cityList[i - 1]) cityList.splice(i, 1);
        }
        //stores in local storage
        localStorage.setItem('cityList', JSON.stringify(cityList));

        $('#cityEntered').val("");
      }

      // Get current user location
      function enterAndListCurrentLocation() {

        // set location to null
        let location = {};

        // get latitude and longitude
        function success(position) {
          location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            success: true
          }

          // Get current conditions for current location
          getCurrentWeather(location);

          // Get forecast for local conditions 
          getForecastWeather(location);
        }

        // W3Schools.com Navigator Geolocation Property
        // console.log if location is unavailable
        function error() {
          location = {
            success: false
          }
          return location;
        }

        // console.log if browswer doesn't support location
        if (!navigator.geolocation) {
          console.log('Geolocation is not supported by your browser');
        } else {
          navigator.geolocation.getCurrentPosition(success, error);
        }
      }





      // current location weather
      function getCurrentWeather(loc) {

        // function to pull city history from local memory - citylist 
        let cityList = JSON.parse(localStorage.getItem("cityList")) || [];

        // build div for each history location - link to HTML ID="past-searches"
        $('#past-searches').empty();

        // calls for each row of the CityList array
        cityList.forEach(function (city) {
          let cityHistoryNameDiv = $('<div>');
          cityHistoryNameDiv.addClass("cityList");
          cityHistoryNameDiv.attr("value", city);
          cityHistoryNameDiv.text(city);
          $('#past-searches').append(cityHistoryNameDiv);
        });

        // reset search value to null
        $('#city-search').val("");

        // determine if search is based upon city name or lat/lon
        if (typeof loc === "object") {
          city = `lat=${loc.latitude}&lon=${loc.longitude}`;
        } else {
          city = `q=${loc}`;
        }

        // Set up Open Weather API Query - weather request 
        var currentURL = "https://api.openweathermap.org/data/2.5/weather?";
        var cityName = city;
        var unitsURL = "&units=imperial";
        var apiIdURL = "&appid="
        var apiKey = "993e66d0b0d5090af76f55db0856f1ab";
        var openCurrWeatherAPI = currentURL + cityName + unitsURL + apiIdURL + apiKey;

        // Open weather API query - weather request
        $.ajax({
          url: openCurrWeatherAPI,
          method: "GET"
        }).then(function (response1) {

          // load result into weatherObj
          weatherObj = {
            city: `${response1.name}`,
            wind: response1.wind.speed,
            humidity: response1.main.humidity,
            temp: Math.round(response1.main.temp),

            // convert date to usable format [1] = MM/DD/YYYY Format
            date: (convertDate(response1.dt)),
            icon: `http://openweathermap.org/img/w/${response1.weather[0].icon}.png`,
            desc: response1.weather[0].description
          }

          // render current waeather
          // remove the current forecast
          $('#forecast').empty();
          // render the current search city
          $('#cityName').text(weatherObj.city + " (" + weatherObj.date + ")");
          // render the current search city weather icon
          $('#currWeathIcn').attr("src", weatherObj.icon);
          // render the current search city temp
          $('#currTemp').text("Temperature: " + weatherObj.temp + " " + "°F");
          // render the current search city humidity
          $('#currHum').text("Humidity: " + weatherObj.humidity + "%");
          // render current city search wind speed
          $('#currWind').text("Windspeed: " + weatherObj.wind + " MPH");

          // get UVI from open weather using UVI Query and format UVI on current weather
          // Since UVI request searches based upon lat/long, define city using lat/lon
          city = `&lat=${parseInt(response1.coord.lat)}&lon=${parseInt(response1.coord.lon)}`;

          // Initiate API Call to get current weather... use UVI request
          var uvIndexURL = "https://api.openweathermap.org/data/2.5/uvi";
          var apiUvIndexURL = "?appid="
          var apiKey = "993e66d0b0d5090af76f55db0856f1ab";
          var nameOfCity = city;
          var openUvIndexURLWeatherAPI = uvIndexURL + apiUvIndexURL + apiKey + nameOfCity;

          // open weather call... UVI request
          $.ajax({
            url: openUvIndexURLWeatherAPI,
            method: "GET"
          }).then(function (response3) {

            // load response into UviLevel variable
            let UviLevel = parseFloat(response3.value);

            // initiate background as violet
            let backgrdColor = 'violet';
            // determine backgrouind color depending on value
            if (UviLevel < 3) {
              backgrdColor = 'green';
            } else if (UviLevel < 6) {
              backgrdColor = 'yellow';
            } else if (UviLevel < 8) {
              backgrdColor = 'orange';
            } else if (UviLevel < 11) {
              backgrdColor = 'red';
            }

            // insert UVI Lable and value into HTML
            let uviTitle = '<span>UV Index: </span>';
            let color = uviTitle + `<span style="background-color: ${backgrdColor}; padding: 0 7px 0 7px;">${response3.value}</span>`;
            $('#currUVI').html(color);
          });
        });
      }});