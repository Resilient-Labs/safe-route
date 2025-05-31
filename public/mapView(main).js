// Get server data
const { mapCenter, markers } = window.serverData;

// Initialize the map
const map = L.map('map').setView([mapCenter.lat, mapCenter.lng], mapCenter.zoom);

// Add tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Define custom icons
const accessibilityIcon = L.divIcon({
    className: 'custom-div-icon',
    html: '<svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg"><path d="M20 0C8.95 0 0 8.95 0 20c0 15 20 30 20 30s20-15 20-30c0-11.05-8.95-20-20-20z" fill="#3182ce"/><circle cx="20" cy="20" r="15" fill="white"/><path d="M20 10c2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4 1.79-4 4-4zm0 10c3.31 0 6 2.69 6 6v2h-4v-2c0-1.1-.9-2-2-2s-2 .9-2 2v2h-4v-2c0-3.31 2.69-6 6-6z" fill="#3182ce"/></svg>',
    iconSize: [40, 50],
    iconAnchor: [20, 50]
});

const warningIcon = L.divIcon({
    className: 'custom-div-icon',
    html: '<svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg"><path d="M20 0C8.95 0 0 8.95 0 20c0 15 20 30 20 30s20-15 20-30c0-11.05-8.95-20-20-20z" fill="#e53e3e"/><circle cx="20" cy="20" r="15" fill="white"/><path d="M20 10c.55 0 1 .45 1 1v10c0 .55-.45 1-1 1s-1-.45-1-1V11c0-.55.45-1 1-1zm0 16c.83 0 1.5.67 1.5 1.5S20.83 29 20 29s-1.5-.67-1.5-1.5S19.17 26 20 26z" fill="#e53e3e"/></svg>',
    iconSize: [40, 50],
    iconAnchor: [20, 50]
});

const infoIcon = L.divIcon({
    className: 'custom-div-icon',
    html: '<svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg"><path d="M20 0C8.95 0 0 8.95 0 20c0 15 20 30 20 30s20-15 20-30c0-11.05-8.95-20-20-20z" fill="#38a169"/><circle cx="20" cy="20" r="15" fill="white"/><path d="M20 10c.83 0 1.5.67 1.5 1.5S20.83 13 20 13s-1.5-.67-1.5-1.5S19.17 10 20 10zm0 6c.55 0 1 .45 1 1v10c0 .55-.45 1-1 1s-1-.45-1-1V17c0-.55.45-1 1-1z" fill="#38a169"/></svg>',
    iconSize: [40, 50],
    iconAnchor: [20, 50]
});

const cautionIcon = L.divIcon({
    className: 'custom-div-icon',
    html: '<svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg"><path d="M20 0C8.95 0 0 8.95 0 20c0 15 20 30 20 30s20-15 20-30c0-11.05-8.95-20-20-20z" fill="#2d3748"/><circle cx="20" cy="20" r="15" fill="white"/><path d="M16 16h8l-1 8h-6l-1-8zm4 10c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z" fill="#2d3748"/></svg>',
    iconSize: [40, 50],
    iconAnchor: [20, 50]
});

// Add markers to map
markers.forEach(marker => {
    let icon;
    switch (marker.type) {
        case 'accessibility':
            icon = accessibilityIcon;
            break;
        case 'warning':
            icon = warningIcon;
            break;
        case 'info':
            icon = infoIcon;
            break;
        case 'caution':
            icon = cautionIcon;
            break;
    }

    // L.marker([marker.lat, marker.lng], { icon: icon })
    //     .addTo(map)
    //     .bindPopup(marker.title);
});

// Add click handler to map
map.on('click', function(e) {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;

    // Reverse geocode to get address (in production, use a geocoding service)
    document.getElementById('address').value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

    // Scroll to form
    document.getElementById('alertForm').scrollIntoView({ behavior: 'smooth' });
});

// Form submission handler
document.getElementById('alertForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Get form data
    const formData = {
        incidentType: document.getElementById('incidentType').value,
        address: document.getElementById('address').value,
        description: document.getElementById('description').value,
        uploadImage: document.getElementById('uploadImage').checked
    };

    // In production, send this data to your server
    // Example using fetch:
    /*
    fetch('/api/alerts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        alert('Alert submitted successfully!');
        this.reset();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error submitting alert. Please try again.');
    });
    */

    console.log('Alert submitted:', formData);
    alert('Alert submitted successfully!');

    // Reset form
    this.reset();
});

// Search alerts function
function searchAlerts() {
    const location = document.getElementById('searchLocation').value;

    if (location) {
        // In production, geocode the address and center map
        // Example using a geocoding service:
        /*
        fetch(`/api/geocode?address=${encodeURIComponent(location)}`)
            .then(response => response.json())
            .then(data => {
                if (data.lat && data.lng) {
                    map.setView([data.lat, data.lng], 15);
                    // Load alerts for this area
                    loadAlertsNearLocation(data.lat, data.lng);
                }
            })
            .catch(error => {
                console.error('Geocoding error:', error);
            });
        */

        console.log('Searching alerts near:', location);
        alert('Searching for alerts near: ' + location);
    }
}


// Make searchAlerts function globally accessible
window.searchAlerts = searchAlerts;