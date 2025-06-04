// Wait for DOM to be ready and ensure server data is available
document.addEventListener('DOMContentLoaded', function() {
    // Check if server data exists, provide fallbacks
    let mapCenter, markers;
    
    if (window.serverData && window.serverData.mapCenter) {
        mapCenter = window.serverData.mapCenter;
        markers = window.serverData.markers || [];
    } else {
        // Fallback values if server data is not available
        console.warn('Server data not available, using fallback values');
        mapCenter = { lat: 39.8283, lng: -98.5795, zoom: 4 }; // Center of USA
        markers = [];

    }

    // Initialize the map
    const map = L.map('map').setView([mapCenter.lat, mapCenter.lng], mapCenter.zoom);

    
  map.on('moveend', function () {
        const bounds = map.getBounds();
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();
    
        const query = new URLSearchParams({
            swLat: sw.lat,
            swLng: sw.lng,
            neLat: ne.lat,
            neLng: ne.lng,
        });
    
        fetch(`posts/?${query.toString()}`)
            .then(res => res.json())
            .then(data => {
                console.log("Fetched posts in view:", data);
    
                if (window.dynamicMarkers) {
                    window.dynamicMarkers.forEach(marker => map.removeLayer(marker));
                }
    
                window.dynamicMarkers = [];
    
                data.forEach(post => {
                    if (post.location && post.location.coordinates) {
                        const lat = post.location.coordinates[1];
                        const lng = post.location.coordinates[0];
    
                        // Select appropriate icon
                        let icon;
                        switch (post.type) {
                            case 'accessibility':
                                icon = accessibilityIcon;
                                break;
                            case 'safety':
                            case 'lighting':
                                icon = warningIcon;
                                break;
                            case 'maintenance':
                                icon = cautionIcon;
                                break;
                            default:
                                icon = infoIcon;
                                break;
                        }
    
                        const marker = L.marker([lat, lng], { icon: icon })
                            .addTo(map)
                            .bindPopup(`
                                ${post.type?.charAt(0).toUpperCase() + post.type?.slice(1) || 'Info'}
                                ${post.description || 'No description'}
                            `);
    
                        window.dynamicMarkers.push(marker);
                    }
                });
            })
            .catch(err => {
                console.error("Error fetching posts:", err);
            });
    });

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    

    // Define custom icons for each incident type
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

    // Add markers to map (FIXED - uncommented and added error handling)
    if (markers && markers.length > 0) {
        markers.forEach(marker => {
            if (marker.lat && marker.lng) {
                let icon;
                switch (marker.type) {
                    case 'accessibility':
                        icon = accessibilityIcon;
                        break;
                    case 'suspiciousActivity':
                    case 'motorAccident':
                        icon = warningIcon;
                        break;
                   
                    
                    case 'infrastructure':
                        icon = cautionIcon;
                        break;
                    default:
                        icon = infoIcon;
                        break;
                }

                L.marker([marker.lat, marker.lng], { icon: icon })
                    .addTo(map)
                    .bindPopup(marker.title || marker.description || 'No description available');
            }
        });
    }

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

        // Validate required fields
        if (!formData.incidentType || !formData.address) {
            alert('Please fill in all required fields (Incident Type and Address).');
            return;
        }

        // Geocode the address and place a marker
        const geocoder = L.Control.Geocoder.nominatim({
            geocodingQueryParams: {
                countrycodes: 'us',
                limit: 1
            }
        });

        geocoder.geocode(formData.address, function(results) {
            if (results && results.length > 0) {
                const result = results[0];
                const lat = result.center.lat;
                const lng = result.center.lng;

                // Validate that result is within U.S. bounds
                if (!isWithinUSBounds(lat, lng)) {
                    alert('Please enter a valid U.S. address. International locations are not supported.');
                    return;
                }

                // Select appropriate icon based on incident type
                let icon;
                switch (formData.incidentType) {
                    case 'accessibility':
                        icon = accessibilityIcon;
                        break;
                    case 'safety':
                    case 'lighting':
                        icon = warningIcon;
                        break;
                    case 'maintenance':
                        icon = cautionIcon;
                        break;
                    default:
                        icon = infoIcon;
                        break;
                }

                // Add marker to map
                const newMarker = L.marker([lat, lng], { icon: icon })
                    .addTo(map)
                    .bindPopup(`
                        <strong>${formData.incidentType.charAt(0).toUpperCase() + formData.incidentType.slice(1)}</strong><br/>
                        ${formData.address}<br/>
                        ${formData.description ? formData.description : 'No description provided'}
                    `);

                // Center map on the new marker
                map.setView([lat, lng], 16);

                // Open the popup
                newMarker.openPopup();

                // Store alert in database via fetch POST
                fetch('/posts/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        title: `${formData.incidentType.charAt(0).toUpperCase() + formData.incidentType.slice(1)} Alert`,
                        type: formData.incidentType,
                        address: formData.address,
                        description: formData.description,
                        latitude: lat.toString(),
                        longitude: lng.toString(),
                        city: result.city || result.county || result.state || "Unknown", 
                        isResolved: false,
                        isHidden: false,
                        isAnonymous: false,
                        isVerified: false,
                        upvotes: 0,
                        downvotes: 0,
                        createdAt: new Date().toISOString()
                    })
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Alert stored successfully:', data);
                    alert('Alert submitted successfully and marker added to map!');
                    
                    // Reset form
                    document.getElementById('alertForm').reset();
                })
                .catch(error => {
                    
                   
                    
                    // Still reset form even if database save failed
                    document.getElementById('alertForm').reset();
                });

            } else {
                alert('Could not find the specified address. Please check the address and try again.');
            }
        }, function(error) {
            console.error('Geocoding error:', error);
            alert('Error finding address location. Please try again.');
        });
    });

    // Make functions globally accessible
    window.searchAlerts = searchAlerts;
    window.map = map; // For debugging purposes
});

// U.S. zip code validation function
function isValidUSZipCode(input) {
    const zipRegex = /^\d{5}(-\d{4})?$/;
    return zipRegex.test(input.trim());
}

// Check if coordinates are within U.S. bounds
function isWithinUSBounds(lat, lng) {
    const continentalUS = lat >= 25.0 && lat <= 49.0 && lng >= -125.0 && lng <= -66.9;
    const alaska = lat >= 51.0 && lat <= 71.5 && lng >= -179.0 && lng <= -129.0;
    const hawaii = lat >= 18.9 && lat <= 28.5 && lng >= -178.0 && lng <= -154.0;
    const puertoRico = lat >= 17.8 && lat <= 18.5 && lng >= -67.3 && lng <= -65.2;
    
    return continentalUS || alaska || hawaii || puertoRico;
}

// Search alerts function using Leaflet Control Geocoder
function searchAlerts() {
    const location = document.getElementById('searchLocation').value.trim();

    if (!location) {
        alert('Please enter an address or zip code.');
        return;
    }

    if (isValidUSZipCode(location)) {
        const searchQuery = `${location}, United States`;
        performGeocode(searchQuery, location);
    } else {
        performGeocode(location, location);
    }
}

// Perform geocoding using Leaflet Control Geocoder
function performGeocode(query, originalInput) {
    const geocoder = L.Control.Geocoder.nominatim({
        geocodingQueryParams: {
            countrycodes: 'us',
            limit: 1
        }
    });

    console.log('Searching alerts near:', originalInput);

    geocoder.geocode(query, function(results) {
        if (results && results.length > 0) {
            const result = results[0];
            const lat = result.center.lat;
            const lng = result.center.lng;

            if (!isWithinUSBounds(lat, lng)) {
                alert('Please enter a valid U.S. address or zip code. International locations are not supported.');
                return;
            }

            // Make sure map is available
            if (window.map) {
                window.map.setView([lat, lng], 15);
                
                if (window.searchMarker) {
                    window.map.removeLayer(window.searchMarker);
                }
                window.searchMarker = L.marker([lat, lng], {
                    icon: L.divIcon({
                        className: 'custom-div-icon',
                        html: '<svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg"><path d="M20 0C8.95 0 0 8.95 0 20c0 15 20 30 20 30s20-15 20-30c0-11.05-8.95-20-20-20z" fill="#ff6b6b"/><circle cx="20" cy="20" r="15" fill="white"/><path d="M20 10c2.76 0 5 2.24 5 5s-2.24 5-5 5-5-2.24-5-5 2.24-5 5-5z" fill="#ff6b6b"/></svg>',
                        iconSize: [40, 50],
                        iconAnchor: [20, 50]
                    })
                }).addTo(window.map).bindPopup(`Searched: ${result.name}`);
            }

        } else {
            if (isValidUSZipCode(originalInput)) {
                alert('Zip code not found. Please check the zip code and try again.');
            } else {
                alert('Location not found. Please try a different address.');
            }
        }
    }, function(error) {
        console.error('Geocoding error:', error);
        alert('Error searching for location. Please try again.');
    });
}