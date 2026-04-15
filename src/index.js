import "./style.css";

const icons = import.meta.webpackContext("./assets/icons", {
	recursive: false,
	regExp: /\.svg$/,
});

let display = document.querySelector(".display");
let mainLocation = document.querySelector(".main.location");
let mainTemperature = document.querySelector(".main.temperature");
let mainDescription = document.querySelector(".main.description");
let mainDate = document.querySelector(".main.date");
let mainIcon = document.querySelector(".main.icon");

async function getRawWeatherData(searchedLocation) {
	try {
		const response = await fetch(
			`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(searchedLocation)}/next5days?unitGroup=metric&key=4RBD4YZUWD22X2XAEHF829CMP&iconSet=icons2`,
		);
		if (!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		const result = await response.json();
		console.log(result);
		return result;
	} catch (error) {
		console.error(error.message);
	}
}

function getWeatherFromData(rawWeatherData) {
	let parsedWeather = {
		location: rawWeatherData.resolvedAddress,
		temperature: rawWeatherData.currentConditions.temp,
		description: rawWeatherData.description,
		datetime: rawWeatherData.days[0].datetime,
		days: [...rawWeatherData.days],
	};

	return parsedWeather;
}

const searchForm = document.querySelector("#searchForm");

searchForm.addEventListener("submit", async (event) => {
	event.preventDefault();

	// get data from form
	const searchData = new FormData(searchForm);
	const searchedLocation = searchData.get("searchBar").trim();

	// get raw data from API
	const rawWeather = await getRawWeatherData(searchedLocation);
	if (!rawWeather) return;

	// parse only the data we need to an object
	const weather = getWeatherFromData(rawWeather);

	// view fetched data
	mainLocation.textContent = weather.location.at(0).toUpperCase() + weather.location.slice(1);
	mainTemperature.textContent = `${weather.temperature}°C`;
	mainDescription.textContent = weather.description;
	mainDate.textContent = new Date(weather.datetime).toLocaleDateString();

	mainIcon.src = icons(`./${weather.days[0].icon}.svg`);

	console.log(weather); //


	weather.days.map((day, index) => {
		const icon = document.querySelector(`#day-${index} .icon`)
		const temperature = document.querySelector(`#day-${index} .temperature`);
		const datetime = document.querySelector(`#day-${index} .datetime`);

		icon.src = icons(`./${weather.days[index].icon}.svg`);
		temperature.textContent = `${day.temp}°C`;
		datetime.textContent = new Date(day.datetime).toLocaleDateString();

	})

	const hours = document.querySelector(".hours");

	

	weather.days[0].hours.map((hourData) => {

		const hour = document.createElement("div");
		hour.className = "hour";

		const icon = document.createElement("img");
		icon.src = icons(`./${hourData.icon}.svg`);
		icon.className = "icon";
		hour.appendChild(icon);

		const temperature = document.createElement("div");
		temperature.textContent = `${hourData.temp}°C`;
		temperature.className = "temperature";
		hour.appendChild(temperature);
		
		const datetime = document.createElement("div");
		datetime.className = "datetime;"
		const time = Temporal.PlainTime.from(hourData.datetime);
		datetime.textContent = `${String(time.hour).padStart(2, "0")}:${String(time.minute).padStart(2, "0")}`;
			
		hour.appendChild(datetime);

		hours.appendChild(hour);

	})

});

