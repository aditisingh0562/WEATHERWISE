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

    const daily = weatherRes.data.daily || {};
    const dates = Array.isArray(daily.time) ? daily.time : [];
    const maxTemps = Array.isArray(daily.temperature_2m_max) ? daily.temperature_2m_max : [];
    const minTemps = Array.isArray(daily.temperature_2m_min) ? daily.temperature_2m_min : [];
    const codes = Array.isArray(daily.weathercode) ? daily.weathercode : [];

    const numDays = Math.min(5, dates.length, maxTemps.length || dates.length, minTemps.length || dates.length, codes.length || dates.length);
    const forecast = dates.slice(0, numDays).map((d, i) => ({
      date: d,
      max: maxTemps[i] ?? null,
      min: minTemps[i] ?? null,
      code: codes[i] ?? null
    }));

    const current = weatherRes.data.current_weather || {};
    const nowHour = new Date().getHours();
    const hourly = weatherRes.data.hourly || {};
    const humidityArr = Array.isArray(hourly.relative_humidity_2m) ? hourly.relative_humidity_2m : [];
    const rainArr = Array.isArray(hourly.precipitation_probability) ? hourly.precipitation_probability : [];

    let humidity = null;
    let rainProb = null;
    if (humidityArr.length > 0) {
      if (Array.isArray(hourly.time)) {
        const now = new Date();
        const idx = hourly.time.findIndex(t => {
          const dt = new Date(t);
          return dt.getHours() === now.getHours() && dt.getDate() === now.getDate();
        });
        const usedIndex = idx >= 0 ? idx : Math.min(nowHour, humidityArr.length - 1);
        humidity = humidityArr[usedIndex];
      } else {
        humidity = humidityArr[Math.min(nowHour, humidityArr.length - 1)];
      }
    }
    if (rainArr.length > 0) {
      rainProb = rainArr[Math.min(nowHour, rainArr.length - 1)];
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
      temp: current.temperature ?? null,
      condition,
      humidity,
      rainProb,
      forecast
    });

  } catch (err) {
    console.error('Error:', err.response?.data || err.message);
    return res.status(500).json({ error: 'Unable to fetch weather' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

