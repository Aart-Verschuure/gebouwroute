/*
 * STEM
 * Leest de route-instructies voor met de ingebouwde spraak van het apparaat
 * (Web Speech API). Stemmen die op het apparaat zelf staan werken ook offline.
 */
const Stem = (() => {
    let aan = true;
    let stem = null;

    function kiesStem() {
        if (!('speechSynthesis' in window)) return;
        const stemmen = speechSynthesis.getVoices().filter((s) => s.lang.toLowerCase().startsWith('nl'));
        // Voorkeur: Nederlandse stem die op het apparaat zelf staat (werkt offline)
        stem = stemmen.find((s) => s.localService && s.lang.toLowerCase() === 'nl-nl')
            || stemmen.find((s) => s.localService)
            || stemmen[0]
            || null;
    }

    if ('speechSynthesis' in window) {
        kiesStem();
        speechSynthesis.addEventListener('voiceschanged', kiesStem);
    }

    try { aan = localStorage.getItem('gebouwroute-stem') !== 'uit'; } catch (e) { /* standaard aan */ }

    function zeg(tekst) {
        if (!aan || !('speechSynthesis' in window)) return;
        speechSynthesis.cancel();
        const uiting = new SpeechSynthesisUtterance(tekst);
        uiting.lang = 'nl-NL';
        if (stem) uiting.voice = stem;
        uiting.rate = 0.95;
        speechSynthesis.speak(uiting);
    }

    function zetAan(waarde) {
        aan = waarde;
        try { localStorage.setItem('gebouwroute-stem', aan ? 'aan' : 'uit'); } catch (e) { /* niet opgeslagen */ }
        if (!aan && 'speechSynthesis' in window) speechSynthesis.cancel();
    }

    return {
        zeg, zetAan,
        get aan() { return aan; },
        get beschikbaar() { return 'speechSynthesis' in window; },
        get heeftNederlandseStem() { return !!stem; },
    };
})();
