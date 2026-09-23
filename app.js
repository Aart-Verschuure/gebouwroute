const x = document.getElementById("demo");

// Initialiseer de geocoder
const geocoder = window.OfflineGeocoder();

function getLocation() {
    if (navigator.geolocation) {
        x.innerHTML = "Locatie bepalen via GPS...";
        navigator.geolocation.getCurrentPosition(success, error);
    } else {
        x.innerHTML = "Geolocation wordt niet ondersteund.";
    }
}

function success(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    // Zoek de dichtstbijzijnde plaatsnaam op op het apparaat zelf
    geocoder.reverse(lat, lon)
        .then(results => {
            if (results && results.length > 0) {
                const plaats = results[0];
                x.innerHTML = `<strong>Locatie:</strong> ${plaats.name}, ${plaats.admin1}`;
            } else {
                x.innerHTML = `Coördinaten: ${lat}, ${lon}`;
            }
        })
        .catch(() => {
            x.innerHTML = `Coördinaten: ${lat}, ${lon}`;
        });
}

function error() {
    x.innerHTML = "Geen GPS signaal of toestemming geweigerd.";
}

getLocation();