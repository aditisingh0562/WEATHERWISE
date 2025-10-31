# 🌤️ WeatherWise

WeatherWise is a simple Node.js-based weather tracking app that fetches real-time weather data from an external API and displays it to users in a clean, minimal interface.  
Built with **Express**, **Axios**, and **Dotenv**.

---

## 🚀 Features

- Fetch real-time weather data using an API (e.g., OpenWeatherMap or WeatherAPI)
- Display temperature, humidity, and weather conditions
- Error handling for invalid city names or API failures
- Secure API key management using `.env`
- Lightweight Express backend for API routing

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-------------|----------|
| **Node.js** | Runtime environment |
| **Express** | Web framework for handling routes and APIs |
| **Axios** | Makes HTTP requests to the weather API |
| **Dotenv** | Manages environment variables securely |

---

## 📂 Project Structure

weatherwise/
├── .vscode/
│   └── settings.json       
│
├── node_modules/              
│
├── public/                    
│   └── index.html              
│
├── .env                       
│
├── README.md                  
│
├── package-lock.json          
│
├── package.json               
│
└── server.js 


---

## ⚙️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/weatherwise.git
   cd weatherwise

2.**Install dependencies**

npm install

3.**Create a .env file**

API_KEY=your_api_key_here
PORT=3000

4.**Run the server**

node server.js

5.**Open in browser**

http://localhost:3000
