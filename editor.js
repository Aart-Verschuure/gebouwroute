/*
 * BEWERKMODUS
 * Hiermee pas je de looppaden en lokalen aan door op de kaart te tikken en te slepen.
 * Wijzigingen worden op dit apparaat bewaard. Met "Exporteer" krijg je de data om
 * in data.js te plakken, zodat iedereen de nieuwe versie krijgt.
 */
const Editor = (() => {
    let actief = false;
    let gereedschap = 'verplaats';
    let geselecteerd = null; // sleutel van geselecteerd punt
    let opWijziging = () => {};

    const v = () => Kaart.verdieping.id;
    const punten = () => (GEBOUW.punten[v()] ||= {});
    const lokalen = () => (GEBOUW.lokalen[v()] ||= {});

    // Gangen als lijst paren [a, b] (de ketens 'a-b-c' worden uitgesplitst)
    function paren(verdiepingId = v()) {
        const lijst = [];
        for (const keten of GEBOUW.gangen[verdiepingId] || []) {
            const d = keten.split('-');
            for (let i = 0; i < d.length - 1; i++) lijst.push([d[i], d[i + 1]]);
        }
        return lijst;
    }

    function zetParen(lijst) {
        GEBOUW.gangen[v()] = lijst.map(([a, b]) => `${a}-${b}`);
    }

    function opslaan() {
        try { localStorage.setItem('gebouwroute-data', JSON.stringify(GEBOUW)); } catch (e) { /* vol */ }
        Route.bouw();
        opWijziging();
        Kaart.teken();
    }

    function dichtstbijzijndPunt(x, y) {
        let beste = null, d = Infinity;
        for (const [k, [px, py]] of Object.entries(punten())) {
            const afst = Math.hypot(px - x, py - y);
            if (afst < d) { d = afst; beste = k; }
        }
        return beste;
    }

    function nieuweSleutel() {
        let i = 1;
        while (punten()[`p${i}`]) i++;
        return `p${i}`;
    }

    const rond = (n) => Math.round(n * 10) / 10;

    // ---------- Tikken en slepen op de kaart ----------

    function tik(p, knoop) {
        if (!actief) return false;
        const [soort, sleutel] = knoop ? knoop.split(':') : [null, null];

        if (gereedschap === 'punt') {
            if (soort === 'punt') {
                geselecteerd = sleutel;
            } else {
                const nieuw = nieuweSleutel();
                punten()[nieuw] = [rond(p.x), rond(p.y)];
                if (geselecteerd && punten()[geselecteerd]) zetParen([...paren(), [geselecteerd, nieuw]]);
                geselecteerd = nieuw;
            }
        } else if (gereedschap === 'verbind' && soort === 'punt') {
            if (!geselecteerd || geselecteerd === sleutel) {
                geselecteerd = geselecteerd === sleutel ? null : sleutel;
            } else {
                const lijst = paren();
                const bestaand = lijst.findIndex(([a, b]) => (a === geselecteerd && b === sleutel) || (a === sleutel && b === geselecteerd));
                if (bestaand >= 0) lijst.splice(bestaand, 1);
                else lijst.push([geselecteerd, sleutel]);
                zetParen(lijst);
                geselecteerd = sleutel;
            }
        } else if (gereedschap === 'lokaal' && !knoop) {
            const naam = prompt('Naam/nummer van het lokaal (bijv. A1.04):');
            if (!naam) return true;
            const deur = dichtstbijzijndPunt(p.x, p.y);
            if (!deur) { alert('Maak eerst een gangpunt op deze verdieping.'); return true; }
            lokalen()[naam.trim()] = [rond(p.x), rond(p.y), deur];
        } else if (gereedschap === 'lokaal' && soort === 'lokaal') {
            // Deurpunt van een bestaand lokaal wijzigen: tik lokaal, dan wordt het dichtstbijzijnde punt gekozen
            const l = lokalen()[sleutel];
            const deur = prompt(`Deurpunt van ${sleutel} (sleutel van een gangpunt):`, l[2]);
            if (deur && punten()[deur]) l[2] = deur;
        } else if (gereedschap === 'wis' && soort === 'punt') {
            if (Object.values(GEBOUW.verbindingen).some((vb) => vb.punt === sleutel && vb.verdiepingen.includes(v()))) {
                alert('Dit punt hoort bij een trap of lift. Verplaats het liever.');
                return true;
            }
            delete punten()[sleutel];
            zetParen(paren().filter(([a, b]) => a !== sleutel && b !== sleutel));
            for (const l of Object.values(lokalen())) if (l[2] === sleutel) l[2] = dichtstbijzijndPunt(l[0], l[1]);
            if (geselecteerd === sleutel) geselecteerd = null;
        } else if (gereedschap === 'wis' && soort === 'lokaal') {
            delete lokalen()[sleutel];
        } else {
            return true;
        }
        opslaan();
        return true;
    }

    function sleepStart(knoop) {
        return actief && gereedschap === 'verplaats' && !!knoop;
    }

    function sleepBeweeg(knoop, p) {
        const [soort, sleutel] = knoop.split(':');
        const lijst = soort === 'punt' ? punten() : lokalen();
        lijst[sleutel][0] = rond(p.x);
        lijst[sleutel][1] = rond(p.y);
        Kaart.teken();
    }

    // ---------- Tekenen ----------

    function teken(t) {
        if (!actief) return;
        const pts = punten();
        for (const [a, b] of paren()) {
            if (!pts[a] || !pts[b]) continue;
            t.lijnStuk({ x: pts[a][0], y: pts[a][1] }, { x: pts[b][0], y: pts[b][1] }, 'ed-gang', 3);
        }
        for (const [sleutel, [x, y, deur]] of Object.entries(lokalen())) {
            if (pts[deur]) t.lijnStuk({ x, y }, { x: pts[deur][0], y: pts[deur][1] }, 'ed-deur', 2, { 'stroke-dasharray': `${6 / t.schaal()} ${4 / t.schaal()}` });
            const r = t.cirkel({ x, y }, 9, 'ed-lokaal');
            r.dataset.knoop = `lokaal:${sleutel}`;
            t.tekst({ x, y }, sleutel, 'ed-label', 11, -13);
        }
        for (const [sleutel, [x, y]] of Object.entries(pts)) {
            const c = t.cirkel({ x, y }, 10, sleutel === geselecteerd ? 'ed-punt geselecteerd' : 'ed-punt');
            c.dataset.knoop = `punt:${sleutel}`;
            t.tekst({ x, y }, sleutel, 'ed-label', 10, 22);
        }
    }

    // ---------- Export ----------

    function exporteer() {
        const data = structuredClone(GEBOUW);
        data.gpsKalibratie = Gps.kalibratiePunten();
        return `const GEBOUW_STANDAARD = ${JSON.stringify(data, null, 4)};`;
    }

    function herstel() {
        localStorage.removeItem('gebouwroute-data');
        location.reload();
    }

    return {
        tik, teken, exporteer, herstel,
        sleepStart, sleepBeweeg, sleepEind: opslaan,
        set gereedschap(g) { gereedschap = g; geselecteerd = null; Kaart.teken(); },
        get gereedschap() { return gereedschap; },
        set actief(a) { actief = a; geselecteerd = null; Kaart.teken(); },
        get actief() { return actief; },
        set opWijziging(f) { opWijziging = f; },
    };
})();
