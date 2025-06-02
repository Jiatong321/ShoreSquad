// ShoreSquad App JS
// Features: interactive map (iframe), weather API placeholder, crew management placeholder, accessibility enhancements

async function fetchWeather() {
    const weatherDiv = document.getElementById('weather');
    weatherDiv.innerHTML = '<div class="spinner" title="Loading weather..."></div>';

    try {
        // Fetch NEA 2-hour weather forecast
        const resp = await fetch('https://api.data.gov.sg/v1/environment/2-hour-weather-forecast');
        const data = await resp.json();
        // Find forecast for Pasir Ris
        const areaForecast = data.items[0].forecasts.find(f => f.area.toLowerCase() === 'pasir ris');
        const forecast = areaForecast ? areaForecast.forecast : 'No data';
        const updateTime = data.items[0].update_timestamp;

        // Fetch NEA air temperature readings for all stations
        const tempResp = await fetch('https://api.data.gov.sg/v1/environment/air-temperature');
        const tempData = await tempResp.json();
        let temp = null;
        let stationName = null;
        if (tempData.items && tempData.items[0] && tempData.items[0].readings) {
            // Try to find the closest station to Pasir Ris by coordinates if 'Pasir Ris' is not in the station list
            const PASIR_RIS_COORDS = { lat: 1.381497, lng: 103.955574 };
            let minDist = Infinity;
            let closestReading = null;
            for (const station of tempData.metadata.stations) {
                const reading = tempData.items[0].readings.find(r => r.station_id === station.id);
                if (reading) {
                    // Calculate distance to Pasir Ris
                    const dLat = station.location.latitude - PASIR_RIS_COORDS.lat;
                    const dLng = station.location.longitude - PASIR_RIS_COORDS.lng;
                    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
                    if (dist < minDist) {
                        minDist = dist;
                        closestReading = reading.value;
                        stationName = station.name;
                    }
                }
            }
            if (closestReading !== null) temp = closestReading;
        }

        // Emoji for forecast
        let emoji = '🌤️';
        if (/rain|showers|thunder/i.test(forecast)) emoji = '🌧️';
        else if (/cloud/i.test(forecast)) emoji = '⛅';
        else if (/fair|clear|sun/i.test(forecast)) emoji = '☀️';

        weatherDiv.innerHTML = `
            <div style="width:100%;text-align:center;">
                <span class="emoji">${emoji}</span>
                <span class="forecast">${forecast}</span>
                <div class="temp">${temp !== null ? `${temp}&deg;C` : '<span class="error">Temperature unavailable</span>'}</div>
                ${stationName ? `<div class="station">Nearest station: ${stationName}</div>` : ''}
                <div class="updated">Updated: ${new Date(updateTime).toLocaleString()}</div>
                <div class="source">Source: NEA Singapore</div>
            </div>
        `;
    } catch (e) {
        weatherDiv.innerHTML = '<div class="error">Unable to load weather data. Please try again later.</div>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchWeather();
    // Generate random crew info
    const crewNames = [
        'Kai', 'Aisyah', 'Lucas', 'Mei', 'Zara', 'Ethan', 'Siti', 'Ryan', 'Jia Wei', 'Priya', 'Dylan', 'Hui Min', 'Amir', 'Samantha', 'Wei Jie'
    ];
    const crewRoles = [
        'Squad Leader', 'Eco Warrior', 'Logistics', 'Photographer', 'First Aid', 'Trash Tracker', 'Motivator', 'Hydration Chief'
    ];
    const emojis = ['🌊', '🦀', '🧤', '🧢', '🦑', '🪣', '🧴', '🦜'];
    function getRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
    const crew = Array.from({length: 4}, () => {
        const name = getRandom(crewNames);
        const role = getRandom(crewRoles);
        const emoji = getRandom(emojis);
        return `<div><span class='emoji'>${emoji}</span><span class='name'>${name}</span> <span class='role'>${role}</span></div>`;
    }).join('');
    document.getElementById('crew').innerHTML = crew;
    // Accessibility: keyboard navigation
    document.body.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            document.body.classList.add('user-is-tabbing');
        }
    });
});
