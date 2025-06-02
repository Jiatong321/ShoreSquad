// ShoreSquad App JS - Cleaned Up Version
// Features: Weather, Impact, Campaigns, Crew, Map

// --- Weather ---
async function fetchWeather() {
    const weatherDiv = document.getElementById('weather');
    weatherDiv.innerHTML = '<div class="spinner" title="Loading weather..."></div>';
    try {
        const resp = await fetch('https://api.data.gov.sg/v1/environment/2-hour-weather-forecast');
        const data = await resp.json();
        const areaForecast = data.items[0].forecasts.find(f => f.area.toLowerCase() === 'pasir ris');
        const forecast = areaForecast ? areaForecast.forecast : 'No data';
        const updateTime = data.items[0].update_timestamp;
        const tempResp = await fetch('https://api.data.gov.sg/v1/environment/air-temperature');
        const tempData = await tempResp.json();
        let temp = null, stationName = null;
        if (tempData.items && tempData.items[0] && tempData.items[0].readings) {
            const PASIR_RIS_COORDS = { lat: 1.381497, lng: 103.955574 };
            let minDist = Infinity, closestReading = null;
            for (const station of tempData.metadata.stations) {
                const reading = tempData.items[0].readings.find(r => r.station_id === station.id);
                if (reading) {
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

// --- Impact Tracker ---
const impactData = [
    { location: 'East Coast', amount: '10kg', emoji: '🦑' },
    { location: 'Sentosa', amount: '7kg', emoji: '🦞' },
    { location: 'Pasir Ris', amount: '5kg', emoji: '🦀' },
    { location: 'Changi', amount: '3kg', emoji: '🦐' }
];
function renderImpact() {
    document.getElementById('impact').innerHTML = impactData.map(item =>
        `<div class="impact-row"><span class="impact-emoji">${item.emoji}</span> <span class="impact-amount">${item.amount}</span> <span class="impact-loc">@ ${item.location} lah!</span></div>`
    ).join('');
}

// --- Campaigns ---
const campaigns = [
  {
    name: 'Pasir Ris Mega Cleanup',
    date: '15 June 2025, 9:00am - 12:00pm',
    location: 'Pasir Ris',
    description: 'Join the squad and make a difference! 🌊',
    participants: parseInt(localStorage.getItem('ss_participants') || '0', 10),
    joined: localStorage.getItem('ss_joined') === 'yes',
    id: 'pasirris'
  },
  {
    name: 'East Coast Park Cleanup',
    date: '22 June 2025, 8:30am - 11:30am',
    location: 'East Coast Park',
    description: 'Let’s keep ECP clean and green! 🦀',
    participants: 12,
    joined: false,
    id: 'ecp'
  },
  {
    name: 'Sentosa Beach Sweep',
    date: '29 June 2025, 10:00am - 1:00pm',
    location: 'Sentosa',
    description: 'Beach vibes and eco-action! 🏝️',
    participants: 8,
    joined: false,
    id: 'sentosa'
  }
];
function renderCampaigns() {
  const list = document.getElementById('campaign-list');
  list.innerHTML = campaigns.map(c => `
    <div class="card">
      <div class="card-body">
        <div style="font-size:1.1rem;font-weight:bold;">${c.name}</div>
        <div style="margin:0.5rem 0;">Date: ${c.date}</div>
        <div style="margin-bottom:0.5rem;">${c.description}</div>
        <button class="join-squad-btn" data-campaign="${c.id}" style="background:${c.joined ? '#43aa8b' : '#0077b6'};color:#fff;border:none;padding:0.7rem 1.5rem;border-radius:0.5rem;font-size:1rem;cursor:pointer;transition:background 0.2s;" ${c.joined ? 'disabled' : ''}>${c.joined ? 'Joined!' : 'Join Squad'}</button>
        <div style="margin-top:0.7rem;font-size:1.1rem;color:#0077b6;font-weight:bold;">Participants: <span class="participant-num">${c.participants}</span></div>
      </div>
    </div>
  `).join('');
  document.querySelectorAll('.join-squad-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.getAttribute('data-campaign');
      if (id === 'pasirris') {
        let count = parseInt(localStorage.getItem('ss_participants') || '0', 10) + 1;
        localStorage.setItem('ss_participants', count);
        localStorage.setItem('ss_joined', 'yes');
        this.previousElementSibling.previousElementSibling.textContent = 'Joined!';
        this.disabled = true;
        this.style.background = '#43aa8b';
        this.parentElement.querySelector('.participant-num').textContent = count;
      } else {
        this.previousElementSibling.previousElementSibling.textContent = 'Joined!';
        this.disabled = true;
        this.style.background = '#43aa8b';
        let num = parseInt(this.parentElement.querySelector('.participant-num').textContent, 10) + 1;
        this.parentElement.querySelector('.participant-num').textContent = num;
      }
    });
  });
}

// --- Crew ---
function renderCrew() {
    const crewNames = ['Kai','Aisyah','Lucas','Mei','Zara','Ethan','Siti','Ryan','Jia Wei','Priya','Dylan','Hui Min','Amir','Samantha','Wei Jie'];
    const crewRoles = ['Squad Leader','Eco Warrior','Logistics','Photographer','First Aid','Trash Tracker','Motivator','Hydration Chief'];
    const emojis = ['🌊','🦀','🧤','🧢','🦑','🪣','🧴','🦜'];
    function getRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
    const crew = Array.from({length: 4}, () => {
        const name = getRandom(crewNames);
        const role = getRandom(crewRoles);
        const emoji = getRandom(emojis);
        return `<div><span class='emoji'>${emoji}</span><span class='name'>${name}</span> <span class='role'>${role}</span></div>`;
    }).join('');
    document.getElementById('crew').innerHTML = crew;
}

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
    fetchWeather();
    renderImpact();
    renderCampaigns();
    renderCrew();
});
