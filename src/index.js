import './styles/style.css';

// UI Elements
const domElements = {
  form: document.querySelector('form'),
  locationInput: document.getElementById('input-location'),
  unitInput: document.getElementById('unit-group'),
  icon: document.getElementById('icon-container'),
  location: document.getElementById('location'),
  temperatureValue: document.getElementById('value'),
  temperatureUnit: document.getElementById('unit'),
  condition: document.getElementById('condition'),
  description: document.getElementById('description'),
};

// SVG Handling with caching
const svgContext = require.context('./assets/svg/', false, /\.svg$/);
const svgCache = {}; // Cache for loaded SVGs

function getSvgPath(iconName) {
  try {
    return svgContext(`./${iconName}.svg`);
  } catch (e) {
    return svgContext('./clear-day.svg');
  }
}

function preloadSvg(iconName) {
  if (!svgCache[iconName]) {
    const path = getSvgPath(iconName);
    svgCache[iconName] = path;

    // Create image element to trigger browser caching
    const img = new Image();
    img.src = path;
  }
  return svgCache[iconName];
}

// Preload common weather icons
[
  'clear-day',
  'clear-night',
  'cloudy',
  'partly-cloudy-day',
  'partly-cloudy-night',
  'rain',
  'snow',
].forEach(preloadSvg);

// API Handling
function createRequest(location, unit) {
  return new Request(
    `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?unitGroup=${unit}&key=MP3D2RJDZT35RXZGQV7S4AKTT&contentType=json`
  );
}

async function getResponse(request) {
  const response = await fetch(request);
  if (response.ok) {
    return response.json();
  }
  throw new Error('Invalid location!');
}

function processWeatherData(weatherData, unit) {
  return {
    icon: weatherData.currentConditions.icon,
    location: weatherData.resolvedAddress,
    temperature: weatherData.currentConditions.temp,
    condition: weatherData.currentConditions.conditions,
    description: weatherData.days[0].description,
    unit,
  };
}

// UI Update Functions
function updateTextElements(data) {
  const {
    location: locationElement,
    temperatureValue: tempValueElement,
    temperatureUnit: tempUnitElement,
    condition: conditionElement,
    description: descriptionElement,
  } = domElements;

  locationElement.textContent = data.location;
  tempValueElement.textContent = data.temperature;
  tempUnitElement.textContent = data.unit === 'us' ? '°F' : '°C';
  conditionElement.textContent = data.condition;
  descriptionElement.textContent = data.description;
}

function createWeatherIcon(iconName, condition) {
  const img = document.createElement('img');
  img.width = 240;
  img.height = 240;
  img.id = 'weather-icon';
  img.alt = condition;
  img.src = svgCache[iconName] || getSvgPath(iconName);

  // Preload for future use
  preloadSvg(iconName);

  return img;
}

function updateWeatherIcon(data) {
  const { icon: iconElement } = domElements;
  const newImg = createWeatherIcon(data.icon, data.condition);

  // Add the animate-in class once the image is loaded
  if (newImg.complete) {
    newImg.classList.add('animate-rotate-in');
  } else {
    newImg.onload = () => newImg.classList.add('animate-rotate-in');
  }

  if (iconElement.hasChildNodes()) {
    const oldImg = iconElement.firstChild;
    oldImg.classList.add('animate-rotate-out');

    iconElement.appendChild(newImg);

    oldImg.addEventListener('animationend', () => {
      iconElement.removeChild(oldImg);
    });
  } else {
    iconElement.appendChild(newImg);
  }
}

function updateIconBackground(iconName) {
  const { icon: iconElement } = domElements;

  if (iconName.indexOf('day') !== -1) {
    iconElement.classList.remove('night');
    iconElement.classList.add('day');
  } else {
    iconElement.classList.remove('day');
    iconElement.classList.add('night');
  }
}

function updateUI(data) {
  updateTextElements(data);
  updateWeatherIcon(data);
  updateIconBackground(data.icon);
}

// Error handling
function handleError(error) {
  console.error('Error:', error.message);
}

// Event Handler
async function handleFormSubmit(event) {
  event.preventDefault();
  if (domElements.locationInput.value === '') return;

  try {
    const weatherRequest = createRequest(
      domElements.locationInput.value,
      domElements.unitInput.value
    );
    const weatherData = await getResponse(weatherRequest);
    const processedData = processWeatherData(weatherData, domElements.unitInput.value);
    updateUI(processedData);
  } catch (error) {
    handleError(error);
  }
}

// Initialization
function init() {
  domElements.form.addEventListener('submit', handleFormSubmit);
}

init();
