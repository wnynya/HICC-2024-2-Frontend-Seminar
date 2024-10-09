const API_KEY = '5a00d516aa96bdafab7f9048ca2560a6';

async function getWeather(city) {
  let url = `https://api.openweathermap.org/data/2.5/weather`;
  url += `?q=${city}`;
  url += `&appid=${API_KEY}`;
  url += `&units=metric`;
  url += `&lang=kr`;

  let res = await fetch(url);
  let data = await res.json();

  return data;
}

async function check() {
  let city = document.querySelector('#city').value;
  let data = await getWeather(city);
  document.querySelector('#weather-val').innerText =
    data.weather[0].description;
  document.querySelector('#temp-val').innerText = data.main.temp;
  document.querySelector('#feel-val').innerText = data.main.feels_like;
}

check();
