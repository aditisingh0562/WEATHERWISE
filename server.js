const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.post('/api/weather', async (req, res) => {
  const { city } = req.body;

  try {
    const geoRes = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
      params: { name: city, count: 1 }
    });

    if (!geoRes.data.results || geoRes.data.results.length === 0) {
      return res.status(404).json({ error: 'City not found' });
    }

    const { latitude, longitude } = geoRes.data.results[0];

    const weatherRes = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude,
        longitude,
        current_weather: true,
        hourly: 'relative_humidity_2m,precipitation_probability',
        daily: 'temperature_2m_max,temperature_2m_min,weathercode',
        timezone: 'auto'
      }
    });

    const current = weatherRes.data.current_weather;
    const hour = new Date().getHours();
    const humidity = weatherRes.data.hourly.relative_humidity_2m[hour];
    const rainProb = weatherRes.data.hourly.precipitation_probability[hour];

    const forecast = [];
    const dates = weatherRes.data.daily.time;
    const maxTemps = weatherRes.data.daily.temperature_2m_max;
    const minTemps = weatherRes.data.daily.temperature_2m_min;
    const codes = weatherRes.data.daily.weathercode;

    for (let i = 0; i < 5; i++) {
      forecast.push({
        date: dates[i],
        max: maxTemps[i],
        min: minTemps[i],
        code: codes[i]
      });
    }

    let condition = 'Clear';
    const code = current.weathercode;
    if (code >= 1 && code <= 3) condition = 'Cloudy';
    else if (code >= 45 && code <= 48) condition = 'Fog';
    else if (code >= 51 && code <= 67) condition = 'Drizzle';
    else if (code >= 61 && code <= 77) condition = 'Rain';
    else if (code >= 80 && code <= 86) condition = 'Showers';
    else if (code >= 95) condition = 'Thunderstorm';

    return res.json({
      temp: current.temperature,
      condition,
      humidity,
      rainProb,
      forecast
    });

  } catch (err) {
    console.error('Error:', err.message);
    return res.status(500).json({ error: 'Unable to fetch weather' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
