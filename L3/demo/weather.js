function getWeather(q = 'Seoul') {
  const API_KEY = '';
  let url = `https://api.openweathermap.org/data/2.5/weather`;
  url += `?q=${q}&appid=${API_KEY}`;
  url += `&units=metric&lang=kr`;
  fetch(url).then((res) => {
    console.log(res);
    res.json().then((data) => {
      console.log(data);
    });
  });
}

getWeather('Seoul');
