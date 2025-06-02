// ShoreSquad App JS
// Features: interactive map (iframe), weather API placeholder, crew management placeholder, accessibility enhancements

async function fetchWeather() {
    const weatherDiv = document.getElementById('weather');
    weatherDiv.innerHTML = '<span>Loading weather forecast...</span>';

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
                    }
                }
            }
            if (closestReading !== null) temp = closestReading;
        }

        weatherDiv.innerHTML = `
            <div style="text-align:center;">
                <div style="font-size:1.3rem;font-weight:bold;">Pasir Ris Weather (Next 2 Hours)</div>
                <div style="font-size:1.1rem;margin:0.5rem 0;">${forecast}</div>
                <div style="font-size:1.1rem;margin:0.5rem 0;">
                    ${temp !== null ? `<span style='font-size:1.5rem;font-weight:bold;'>${temp}&deg;C</span>` : '<span style="color:#888;">Temperature unavailable</span>'}
                </div>
                <div style="font-size:0.9rem;color:#0077b6;">Updated: ${new Date(updateTime).toLocaleString()}</div>
                <div style="font-size:0.85rem;color:#888;">Source: NEA Singapore</div>
            </div>
        `;
    } catch (e) {
        weatherDiv.innerHTML = '<span style="color:red;">Unable to load weather data.</span>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchWeather();
    // Crew placeholder
    document.getElementById('crew').innerText = 'Your crew info will show here.';

    // Accessibility: keyboard navigation
    document.body.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            document.body.classList.add('user-is-tabbing');
        }
    });
});
