/*
 * STEM
 * Leest de route-instructies voor met de ingebouwde spraak van het apparaat
 * (Web Speech API). Stemmen die op het apparaat zelf staan werken ook offline.
 *
 * De browser zegt niet of een stem mannelijk of vrouwelijk is, daarom herkennen
 * we vrouwenstemmen aan hun naam. De gebruiker kan in ⚙️ ook zelf een stem kiezen.
 * De taal van die stem bepaalt de taal van de instructies (zie taal.js).
 */
const Stem = (() => {
    const OPSLAG_STEM = 'gebouwroute-stemkeuze';
    let aan = true;
    let stem = null;
    let stemmen = [];      // Nederlandse stemmen, beste eerst (voor de automatische keuze)
    let alleStemmen = [];  // alle stemmen op dit apparaat in een taal die taal.js kent
    let eigenKeuze = null; // naam van de stem die de gebruiker koos

    // Bekende Nederlandse (en Vlaamse) vrouwen- en mannenstemmen op Windows, Edge, Chrome, iOS en macOS
    const VROUW = ['colette', 'fenna', 'dena', 'claire', 'ellen', 'lotte', 'google nederlands', 'female', 'vrouw'];
    const MAN = ['frank', 'maarten', 'arnaud', 'xander', 'bart', 'male'];
    const bevat = (s, lijst) => lijst.some((n) => s.name.toLowerCase().includes(n));
    const isVrouw = (s) => bevat(s, VROUW) && !/\bmale\b/i.test(s.name);
    const isMan = (s) => bevat(s, MAN) && !/female/i.test(s.name);

    // Hoe hoger, hoe liever: vrouwenstem eerst, dan offline, dan nl-NL boven nl-BE en natuurlijk klinkende stemmen
    function score(s) {
        return (isVrouw(s) ? 8 : 0) - (isMan(s) ? 8 : 0) + (s.localService ? 2 : 0) + (s.lang.toLowerCase() === 'nl-nl' ? 1 : 0) + (/natural/i.test(s.name) ? 1 : 0);
    }

    function kiesStem() {
        if (!('speechSynthesis' in window)) return;
        const nl = (s) => s.lang.toLowerCase().replace('_', '-').startsWith('nl');
        const alle = speechSynthesis.getVoices();
        stemmen = alle.filter(nl).sort((a, b) => score(b) - score(a));
        const anders = alle.filter((s) => !nl(s) && Taal.vanStem(s.lang));
        alleStemmen = [...stemmen, ...anders.sort((a, b) => a.lang.localeCompare(b.lang) || a.name.localeCompare(b.name))];
        stem = alleStemmen.find((s) => s.name === eigenKeuze) || stemmen[0] || null;
        // Een Engelse stem spreekt Engelse instructies, een Duitse Duitse, enzovoort
        Taal.zet(stem ? Taal.vanStem(stem.lang) : 'nl');
    }

    try {
        aan = localStorage.getItem('gebouwroute-stem') !== 'uit';
        eigenKeuze = localStorage.getItem(OPSLAG_STEM);
    } catch (e) { /* standaard */ }

    if ('speechSynthesis' in window) {
        kiesStem();
        speechSynthesis.addEventListener('voiceschanged', kiesStem);

        // Telefoons (iOS Safari, Chrome op Android) laten pas spraak toe nadat er één keer
        // gesproken is tijdens een tik van de gebruiker. De eerste instructie komt vaak later
        // (na GPS of een await) en zou dan stil worden geweigerd. Daarom bij de eerste tik
        // een stille uiting afspelen: daarna mag de pagina vrij praten.
        const ontgrendel = () => {
            const stil = new SpeechSynthesisUtterance(' ');
            stil.volume = 0;
            speechSynthesis.speak(stil);
            ['pointerdown', 'touchend', 'click', 'keydown'].forEach((t) => document.removeEventListener(t, ontgrendel, true));
        };
        ['pointerdown', 'touchend', 'click', 'keydown'].forEach((t) => document.addEventListener(t, ontgrendel, true));
    }

    let huidige = null; // referentie bewaren: anders ruimt Chrome de uiting soms op voordat hij klaar is
    let wachtTimer = null;

    function spreek(tekst, metStem) {
        const uiting = new SpeechSynthesisUtterance(tekst);
        uiting.lang = metStem ? metStem.lang : Taal.t.stemTaal;
        if (metStem) uiting.voice = metStem;
        // Iets rustiger en een fractie hoger klinkt vriendelijker
        uiting.rate = 0.92;
        uiting.pitch = 1.1;
        // Online stemmen (zoals die van Edge) werken niet zonder internet: probeer dan een stem op het apparaat
        uiting.onerror = (e) => {
            if (!metStem || metStem.localService || e.error === 'interrupted' || e.error === 'canceled') return;
            const offline = stemmen.find((s) => s.localService);
            if (offline) spreek(tekst, offline);
        };
        huidige = uiting;
        speechSynthesis.resume(); // Chrome op Android blijft soms op pauze hangen
        speechSynthesis.speak(uiting);
    }

    // Lokaalnummers cijfer voor cijfer uitspreken: "B4.15" -> "B vier één vijf" (in de taal van de stem).
    // Anders leest de spraak "4.15" als tijd ("kwart over vier") of als kommagetal.
    function voorUitspraak(tekst) {
        const cijfers = Taal.t.cijfers;
        return tekst.replace(/\b([A-Z]{1,2})(\d+)\.(\d+)\b/g, (_, letters, a, b) =>
            `${letters} ${[...(a + b)].map((c) => cijfers[c]).join(' ')}`);
    }

    function zeg(tekst) {
        if (!aan || !('speechSynthesis' in window)) return;
        clearTimeout(wachtTimer);
        // Op Android slikt Chrome een speak() direct na cancel() vaak in: dan even wachten
        if (speechSynthesis.speaking || speechSynthesis.pending) {
            speechSynthesis.cancel();
            wachtTimer = setTimeout(() => spreek(voorUitspraak(tekst), stem), 150);
        } else {
            spreek(voorUitspraak(tekst), stem);
        }
    }

    function zetAan(waarde) {
        aan = waarde;
        try { localStorage.setItem('gebouwroute-stem', aan ? 'aan' : 'uit'); } catch (e) { /* niet opgeslagen */ }
        if (!aan && 'speechSynthesis' in window) speechSynthesis.cancel();
    }

    // naam = null betekent: automatisch (liefst een vrouwenstem)
    function kies(naam) {
        eigenKeuze = naam;
        try {
            if (naam) localStorage.setItem(OPSLAG_STEM, naam);
            else localStorage.removeItem(OPSLAG_STEM);
        } catch (e) { /* niet opgeslagen */ }
        kiesStem();
    }

    return {
        zeg, zetAan, kies,
        get aan() { return aan; },
        get beschikbaar() { return 'speechSynthesis' in window; },
        get heeftNederlandseStem() { return !!stem; },
        get stemmen() {
            return alleStemmen.map((s) => ({
                naam: s.name, taal: s.lang, taalCode: Taal.vanStem(s.lang), vrouw: isVrouw(s), offline: s.localService,
                nederlands: s.lang.toLowerCase().replace('_', '-').startsWith('nl'),
            }));
        },
        get gekozen() { return eigenKeuze; },
    };
})();
