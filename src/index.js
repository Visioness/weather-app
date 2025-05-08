import './styles/style.css';

const form = document.querySelector('form');
const locationInput = document.getElementById('location');
const unitInput = document.getElementById('unit-group');

const weatherContainer = document.querySelector('.weather-container');
const iconElement = weatherContainer.querySelector('.icon');
const locationElement = weatherContainer.querySelector('.location');
const temperatureElement = weatherContainer.querySelector('.temperature');
const conditionElement = weatherContainer.querySelector('.condition');
const descriptionElement = weatherContainer.querySelector('.description');

const svgContext = require.context('./assets/svg/', false, /\.svg$/);
const getSvgPath = (iconName) => {
  try {
    return svgContext(`./${iconName}.svg`);
  } catch (e) {
    return svgContext('./clear-day.svg');
  }
};

function createRequest(location, unit) {
  const request = new Request(
    `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?unitGroup=${unit}&key=MP3D2RJDZT35RXZGQV7S4AKTT&contentType=json`
  );

  return request;
}

async function getResponse(request) {
  const response = await fetch(request);
  if (response.ok) {
    const data = await response.json();

    return data;
  }

  throw new Error('Invalid location!');
}

function updateUI(data) {
  locationElement.textContent = data.location;
  temperatureElement.textContent = data.temperature;
  conditionElement.textContent = data.condition;
  descriptionElement.textContent = data.description;
  iconElement.innerHTML = `<img width="240" height"240" id="weather-icon" src="${data.icon}" alt="${data.condition}"/ >`;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (locationInput.value === '') return;

  try {
    const weatherRequest = createRequest(locationInput.value, unitInput.value);
    const weatherData = await getResponse(weatherRequest);
    console.log(weatherData.days[0].description);

    const croppedData = {
      icon: getSvgPath(weatherData.currentConditions.icon),
      location: weatherData.resolvedAddress,
      temperature: weatherData.currentConditions.temp,
      condition: weatherData.currentConditions.conditions,
      description: weatherData.days[0].description,
    };

    updateUI(croppedData);
  } catch (error) {
    throw new Error('Could not get the response!');
  }
});
