// ShoreSquad App JS
// Features to add: interactive map, weather API, crew management, accessibility enhancements

document.addEventListener('DOMContentLoaded', () => {
    // Placeholder for map
    document.getElementById('map').innerText = 'Map will load here.';
    // Placeholder for weather
    document.getElementById('weather').innerText = 'Weather info will appear here.';
    // Placeholder for crew
    document.getElementById('crew').innerText = 'Your crew info will show here.';

    // Accessibility: keyboard navigation
    document.body.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            document.body.classList.add('user-is-tabbing');
        }
    });
});
