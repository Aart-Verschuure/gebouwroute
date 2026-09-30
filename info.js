/*
 * INFO
 * De teksten in het informatievak: wat er te doen is per verdieping en per lokaal.
 * De standaardteksten staan in data.js (info). In de bewerkmodus kun je ze in de app
 * aanpassen; die wijzigingen worden op dit apparaat bewaard. Met "Exporteer data"
 * gaan ze mee in de tekst die je in data.js plakt, zodat iedereen ze krijgt.
 */
const Info = (() => {
    const OPSLAG = 'gebouwroute-infoteksten';
    let eigen = { verdiepingen: {}, lokalen: {} };

    try {
        const opgeslagen = JSON.parse(localStorage.getItem(OPSLAG));
        if (opgeslagen) eigen = { verdiepingen: opgeslagen.verdiepingen || {}, lokalen: opgeslagen.lokalen || {} };
    } catch (e) { /* geen eigen teksten */ }

    const standaard = () => GEBOUW_STANDAARD.info || { verdiepingen: {}, lokalen: {} };

    function opslaan() {
        try { localStorage.setItem(OPSLAG, JSON.stringify(eigen)); } catch (e) { /* vol of geblokkeerd */ }
    }

    // Standaardteksten met de eigen wijzigingen eroverheen. Een lege tekst betekent: verwijderd.
    function alles() {
        const samen = {};
        for (const soort of ['verdiepingen', 'lokalen']) {
            samen[soort] = { ...(standaard()[soort] || {}), ...eigen[soort] };
            for (const [sleutel, tekst] of Object.entries(samen[soort])) if (!tekst) delete samen[soort][sleutel];
        }
        return samen;
    }

    function verdieping(id) {
        return alles().verdiepingen[id] || '';
    }

    function lokaal(knoop) {
        const l = alles().lokalen;
        return l[`${knoop.verdieping}:${knoop.sleutel}`] || l[knoop.sleutel] || '';
    }

    // Komt dezelfde naam (bijv. 'wc-a') op meer verdiepingen voor? Dan bewaren we per verdieping.
    function lokaalSleutel(knoop) {
        const opVerdiepingen = Object.values(GEBOUW.lokalen).filter((l) => knoop.sleutel in l).length;
        const perVerdieping = `${knoop.verdieping}:${knoop.sleutel}`;
        if (opVerdiepingen > 1 || perVerdieping in (standaard().lokalen || {})) return perVerdieping;
        return knoop.sleutel;
    }

    function zetVerdieping(id, tekst) {
        eigen.verdiepingen[id] = tekst.trim();
        opslaan();
    }

    function zetLokaal(knoop, tekst) {
        eigen.lokalen[lokaalSleutel(knoop)] = tekst.trim();
        opslaan();
    }

    function wis() {
        eigen = { verdiepingen: {}, lokalen: {} };
        try { localStorage.removeItem(OPSLAG); } catch (e) { /* niets te wissen */ }
    }

    return {
        verdieping, lokaal, zetVerdieping, zetLokaal, alles, wis,
        get aantalWijzigingen() { return Object.keys(eigen.verdiepingen).length + Object.keys(eigen.lokalen).length; },
    };
})();
