
   // 2. REGISTREER DE SERVICE WORKER (PWA)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
        .then((reg) => console.log('Service Worker succesvol geregistreerd!', reg))
        .catch((err) => console.error('Service Worker registratie mislukt:', err));
}

// 3. INSTALLEREN ALS APP
// De browser biedt installeren aan via 'beforeinstallprompt'. Dat bewaren we, zodat de knop
// "App installeren" in ⚙️ Instellingen het later kan tonen (zie app.js).
window.installatieAanbod = null;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // geen eigen balk van de browser, we gebruiken onze knop
    window.installatieAanbod = e;
    document.dispatchEvent(new Event('installatie-wijziging'));
});
window.addEventListener('appinstalled', () => {
    window.installatieAanbod = null;
    document.dispatchEvent(new Event('installatie-wijziging'));
});
