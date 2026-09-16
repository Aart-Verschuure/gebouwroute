document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('internetModal');

    // 1. FUNCTIE VOOR DE INTERNET-POP-UP
    function controleerInternet() {
        console.log("Internet status:", navigator.onLine ? "ONLINE" : "OFFLINE");

        if (navigator.onLine) {
            // Gebruiker is ONLINE -> Toon pop-up
            modal.style.display = 'block';
        } else {
            // Gebruiker is OFFLINE -> Verberg pop-up
            modal.style.display = 'none';
        }
    }

    // Luister naar netwerkveranderingen
    window.addEventListener('online', controleerInternet);
    window.addEventListener('offline', controleerInternet);

    // Voer direct uit bij het laden van de pagina
    controleerInternet();

    // 2. REGISTREER DE SERVICE WORKER (PWA)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then((reg) => console.log('Service Worker succesvol geregistreerd!', reg))
            .catch((err) => console.error('Service Worker registratie mislukt:', err));
    }
});