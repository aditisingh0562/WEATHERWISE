document.getElementById('weather-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const city = document.getElementById('city-input').value.trim();
  const resultDiv = document.getElementById('weather-result');
  const suggestionDiv = document.getElementById('suggestion');
  const forecastDiv = document.getElementById('forecast');
  const forecastList = document.getElementById('forecast-list');
  const clothingImage = document.getElementById('clothing-image');

  resultDiv.textContent = '';
  suggestionDiv.textContent = '';
  forecastList.innerHTML = '';
  forecastDiv.style.display = 'none';
  clothingImage.style.display = 'none';

  if (!city) {
    resultDiv.textContent = 'Please enter a city.';
    return;
  }

  try {
    const res = await fetch('/api/weather', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ city })
    });

    const data = await res.json();

    if (data.error) {
      resultDiv.textContent = data.error;
      return;
    }

    const { temp, condition, humidity, rainProb, forecast } = data;

    // Background theme
    if (condition.toLowerCase().includes('rain')) {
      document.body.style.background = 'linear-gradient(to right, #a1c4fd, #c2e9fb)';
    } else if (temp < 15) {
      document.body.style.background = 'linear-gradient(to right, #d7d2cc, #304352)';
    } else {
      document.body.style.background = 'linear-gradient(to right, #fdfbfb, #ebedee)';
    }

    resultDiv.innerHTML = `
      🌡️ Temp: ${temp}°C<br>
      🌥️ Condition: ${condition}<br>
      💧 Humidity: ${humidity}%<br>
      🌧️ Rain Probability: ${rainProb}%
    `;

    // Clothing suggestion
    let suggestion = '';
    let img = '';

    if (rainProb > 40) {
      suggestion += '☔ Rain is likely — carry an umbrella!<br>';
    }

    if (temp < 10) {
      suggestion += '🧥 It\'s cold — wear a heavy jacket and dress in layers.';
      img = 'jacket.png';
    } else if (temp >= 10 && temp < 20) {
      suggestion += '🧢 A light jacket would be comfortable.';
      img = 'light-jacket.png';
    } else if (temp >= 20 && humidity > 70) {
      suggestion += '🌡️ Sticky weather — breathable cotton clothes are preferable.';
      img = 'cotton.png';
    } else {
      suggestion += '👕 T-shirt weather! Light and casual is good.';
      img = 'tshirt.png';
    }

    suggestionDiv.innerHTML = suggestion;
    clothingImage.src = `images/${img}`;
    clothingImage.style.display = 'block';

    // 5-Day forecast
    forecastDiv.style.display = 'block';
    forecast.forEach(day => {
      const date = new Date(day.date).toDateString().slice(0, 10);
      let cond = 'Clear';
      if (day.code >= 61) cond = 'Rainy';
      else if (day.code >= 1) cond = 'Cloudy';

      forecastList.innerHTML += `
        <div class="forecast-day">
          <strong>${date}</strong><br>
          🌡️ ${day.min}°C - ${day.max}°C<br>
          🌥️ ${cond}
        </div>
      `;
    });

  } catch (err) {
    resultDiv.textContent = 'Error fetching weather.';
    console.error(err);
  }
});
