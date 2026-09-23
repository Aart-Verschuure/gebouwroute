const x = document.getElementById("demo");

    function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, error);
    } else {
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
    }

    function success(position) {
    x.innerHTML = "Latitude: " + position.coords.latitude +
    "<br>Longitude: " + position.coords.longitude;
    }

    function error() {
    alert("Sorry, no position available.");
    }

    getLocation();


   // 2. REGISTREER DE SERVICE WORKER (PWA)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
        .then((reg) => console.log('Service Worker succesvol geregistreerd!', reg))
        .catch((err) => console.error('Service Worker registratie mislukt:', err));
}
