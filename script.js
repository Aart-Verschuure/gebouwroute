    // 2. REGISTREER DE SERVICE WORKER (PWA)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then((reg) => console.log('Service Worker succesvol geregistreerd!', reg))
            .catch((err) => console.error('Service Worker registratie mislukt:', err));
    }