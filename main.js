const newsInsertionPoint = document.querySelector("#news .target");
// const weatherSection = document.querySelector('#news');
function renderNews(insertionPoint, data) {
  const list = document.createElement("ul");
  list.classList.add("list-group");
  let HTML = "";

  for (const story of data) {
    HTML += `<li class="list-group-item"><img class='img-thumbnail mr-2' src=${
      story.image
    } width="80" alt=${story.title}>
    <a href=${story.url}>${story.title}</a>  
    <p>${story.summarization || story.description}</p>
    </li>`;
  }
  list.innerHTML = HTML;
  insertionPoint.innerHTML = "";
  insertionPoint.append(list);
}

// Get NEWS
const NEWS_API_HOST = "https://news67.p.rapidapi.com";

const NEWS_ENDPOINT_PATH = "/trending";

const NEWS_ENDPOINT = new URL(NEWS_ENDPOINT_PATH, NEWS_API_HOST);

const news_settings = {
  limit: "10",
  langs: "en",
  skip: "1",
};

const NEWS_URL_PARAMS = new URLSearchParams();

for (const [key, value] of Object.entries(news_settings)) {
  NEWS_URL_PARAMS.append(key, value);
}
const NEWS_API_URL = `${NEWS_ENDPOINT}?${NEWS_URL_PARAMS.toString()}`;
const NEWS_API_KEY = config.NEWS_API_KEY;
fetch(NEWS_API_URL, {
  method: "GET",
  headers: {
    "x-rapidapi-key": NEWS_API_KEY,
  },
})
  .then((resp) => resp.json()) //JSON.parse
  .then((news) => {
    // console.log("news", news);
    renderNews(newsInsertionPoint, news);
  })
  .catch((err) => {
    console.log(err);
    GrowlNotification.notify({
      title: "Error!",
      description: "News fetch failed",
      type: "warning",
      position: "top-left",
      closeWith: "button",
      closeTimeout: 5000,
    });
  });

const weatherInsertionPoint = document.querySelector("#weather .target");

function renderWeather(insertionPoint, data) {
  insertionPoint.innerHTML = "";
  const report = data.weather[0];
  // console.log("report", report);

  const reportEl = document.createElement("div");
  reportEl.classList.add("p-5", "d-flex");

  let backgroundImage;
  switch (report.main.toLowerCase()) {
    case "rain":
      backgroundImage =
        "https://cdn.abcotvs.com/dip/images/5184599_031119-kgo-shutterstock-rain-img.jpg?w=1600";
      break;
    case "clouds":
      backgroundImage =
        "https://www.almanac.com/sites/default/files/image_nodes/cloudy-sky.jpg";
      break;
    case "snow":
      backgroundImage =
        "https://il5.picdn.net/shutterstock/videos/3215686/thumb/1.jpg";
      break;
    case "clear":
      backgroundImage =
        "https://s19499.pcdn.co/wp-content/uploads/2018/09/blue-sky-with-bright-sun-picture-id947314334-1.jpg";
      break;
    case "drizzle":
      backgroundImage =
        "https://cdn.abcotvs.com/dip/images/5184599_031119-kgo-shutterstock-rain-img.jpg?w=1600";
      break;
    case "thunderstorm":
      backgroundImage = "http://i.ytimg.com/vi/el93AooFrgg/maxresdefault.jpg";
      break;
    case "mist":
      backgroundImage =
        "http://3.bp.blogspot.com/-PsBYNl5ltF0/TeeF2HLv_QI/AAAAAAAAAKA/IVrqRAdx_TQ/s1600/Morning+mist%252C+Waitomo%252C+New+Zealand+Pictures.jpg";
      break;
    default:
      backgroundImage =
        "https://s19499.pcdn.co/wp-content/uploads/2018/09/blue-sky-with-bright-sun-picture-id947314334-1.jpg";
  }

  reportEl.style.background = `url(${backgroundImage}) center/cover`;

  const iconURL = `http://openweathermap.org/img/wn/${report.icon}@2x.png`;

  reportEl.innerHTML = `
  <div class='pr-3'>
  <h3 class='cityname'>${data.name}</h3> 
  <img src="${iconURL}" alt="${report.main}" /></div>
    <dl class='weather_info row p-3 mb-0 '>
      <dt class='col-sm-6'>Summary</dt>
      <dd class='col-sm-6'>${report.description}</dd>
      <dt class='col-sm-6'>Temperature</dt>
      <dd class='col-sm-6'>${data.main.temp} &#8451;</dd>
      <dt class='col-sm-6'> Feels Like</dt>
      <dd class='col-sm-6'>${data.main.feels_like} &#8451;</dd>
      <dt class='col-sm-6''>Humidity</dt>
      <dd class='col-sm-6'>${data.main.humidity}%</dd>
      <dt class='col-sm-6'>Wind Speed</dt>
      <dd class='col-sm-6'>${data.wind.speed} meter/sec</dd>
    </dl>
    `;

  insertionPoint.append(reportEl);
}

const searchForm = document.getElementById("search-form");

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  city = searchForm.querySelector("#city").value;
  getWeather();
});

let city = "London";
const API_HOST = "https://api.openweathermap.org";
const API_VERSION = 2.5;
const ENDPOINT_PATH = `/data/${API_VERSION}/weather`;

const ENDPOINT = new URL(ENDPOINT_PATH, API_HOST);
const WEATHER_API_KEY = config.WEATHER_API_KEY;
const settings = {
  APPID: WEATHER_API_KEY,
  units: "metric",
};

const URL_PARAMS = new URLSearchParams();

for (const [key, value] of Object.entries(settings)) {
  URL_PARAMS.append(key, value);
}

function getWeather() {
  URL_PARAMS.set("q", city);
  const FULL_API_URL = `${ENDPOINT}?${URL_PARAMS.toString()}`;
  fetch(FULL_API_URL)
    .then((response) => {
      if (response.status >= 200 && response.status < 300) {
        return response.json();
      } else {
        throw response;
      }
    })
    .then((data) => {
      // console.log(data);
      renderWeather(weatherInsertionPoint, data);
    })
    .catch((err) => {
      GrowlNotification.notify({
        title: "Error!",
        description: err.statusText || err.message || "An error occured",
        type: "warning",
        position: "top-left",
        closeWith: "button",
        closeTimeout: 5000,
      });
    });
}
getWeather();

//CURRENCY CONVERTER

const endpoint = "https://api.exchangeratesapi.io/latest";
const ratesByBase = {};
const fromCurrency = document.querySelector('[name="from_currency"]');
const toCurrency = document.querySelector('[name="to_currency"]');
const form = document.querySelector(".converter");
const amountInput = document.querySelector('[name="from_amount"]');
const totalDisplay = document.querySelector(".to_amount");

//populate selects:
function generateOptions(options) {
  return Object.entries(options)
    .map(
      ([currencyCode, currencyName]) =>
        `<option value='${currencyCode}'>${currencyCode} - ${currencyName}</option>`,
    )
    .join("");
}

//fetch rates
async function fetchRates(base = "GBP") {
  const res = await fetch(`${endpoint}?base=${base}`);
  const rates = await res.json();
  console.log(rates);
  return rates;
}

//convert:
async function convertCurrency(amount, from, to) {
  // check if we already have the rates to convert from that currency
  if (!ratesByBase[from]) {
    const rates = await fetchRates(from);
    // store them for next conversion
    ratesByBase[from] = rates;
  }
  // convert that amount that was passed in
  const rate = ratesByBase[from].rates[to];
  const convertedTotal = amount * rate;
  // console.log(`${amount} ${from} is ${convertedTotal} in ${to}`);
  return convertedTotal;
}

function formatTotal(amount, currency) {
  return Intl.NumberFormat("en-UK", {
    style: "currency",
    currency,
  }).format(amount);
}

async function handleInput(e) {
  const total = await convertCurrency(
    amountInput.value,
    fromCurrency.value,
    toCurrency.value,
  );
  // console.log(total);
  totalDisplay.value = formatTotal(total, toCurrency.value);
  // console.log(totalDisplay.value);
}

async function initApp() {
  const currencies = await import("/modules/currencies.js");
  // console.log(currencies);
  const optionsHTML = generateOptions(currencies.default);
  // console.log(optionsHTML);
  fromCurrency.innerHTML = optionsHTML;
  toCurrency.innerHTML = optionsHTML;
  form.addEventListener("input", handleInput);
}

form.addEventListener("mouseenter", initApp, { once: true });
