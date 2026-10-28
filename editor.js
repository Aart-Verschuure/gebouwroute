/*
 * BEWERKMODUS
 * Hiermee pas je de looppaden en lokalen aan door op de kaart te tikken en te slepen.
 * Wijzigingen worden op dit apparaat bewaard. Met "Exporteer" krijg je de data om
 * in data.js te plakken, zodat iedereen de nieuwe versie krijgt.
 *
 * Weggehaalde lokalen, voorzieningen en benoemde punten kun je terugzetten (zie weggehaald()).
 * Wat je in deze app wist, gaat naar een prullenbak; wat in data.js staat maar ontbreekt,
 * halen we uit de standaarddata.
 */
const Editor = (() => {
    let actief = false;
    let gereedschap = 'verplaats';
    let geselecteerd = null; // sleutel van geselecteerd punt
    let gekozenLokaal = null; // lokaal dat je aan een ander gangpunt wilt koppelen
    let opWijziging = () => {};
    let opHint = () => {};   // aanwijzing in de bewerkbalk tonen (tekst) of weghalen (null)

    const PRULLENBAK = 'gebouwroute-prullenbak';
    // { verdieping: { lokalen: { sleutel: [x, y, deur, naam] }, punten: { sleutel: { punt: [x, y, naam], buren: [...] } } } }
    let prullenbak = {};
    try { prullenbak = JSON.parse(localStorage.getItem(PRULLENBAK)) || {}; } catch (e) { /* leeg */ }

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
        try {
            localStorage.setItem('gebouwroute-data', JSON.stringify(GEBOUW));
            localStorage.setItem(PRULLENBAK, JSON.stringify(prullenbak));
        } catch (e) { /* vol */ }
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
        } else if (gereedschap === 'lokaal' && soort === 'lokaal') {
            // Lokaal kiezen (of nog eens tikken = niet meer kiezen); daarna tik je op het nieuwe deurpunt
            kiesLokaal(gekozenLokaal === sleutel ? null : sleutel);
            return true;
        } else if (gereedschap === 'lokaal' && soort === 'punt' && gekozenLokaal) {
            const l = lokalen()[gekozenLokaal];
            const naam = l[3] || gekozenLokaal;
            l[2] = sleutel;
            opslaan();
            kiesLokaal(null);
            opHint(`✔ ${naam} is nu gekoppeld aan gangpunt ${sleutel}. Tik op een ander lokaal om dat te koppelen.`);
            return true;
        } else if (gereedschap === 'lokaal' && !knoop && gekozenLokaal) {
            kiesLokaal(null); // naast de punten getikt: niets gekozen
            return true;
        } else if (gereedschap === 'lokaal' && !knoop) {
            const naam = prompt('Naam/nummer van het lokaal (bijv. A1.04):');
            if (!naam) return true;
            const deur = dichtstbijzijndPunt(p.x, p.y);
            if (!deur) { alert('Maak eerst een gangpunt op deze verdieping.'); return true; }
            lokalen()[naam.trim()] = [rond(p.x), rond(p.y), deur];
        } else if (gereedschap === 'wis' && soort === 'punt') {
            if (Object.values(GEBOUW.verbindingen).some((vb) => vb.punt === sleutel && vb.verdiepingen.includes(v()))) {
                alert('Dit punt hoort bij een trap of lift. Verplaats het liever.');
                return true;
            }
            // Een punt met een naam (bijv. "de ingang") bewaren, zodat je het kunt terugzetten
            if (punten()[sleutel][2]) {
                const buren = paren().filter((paar) => paar.includes(sleutel)).map(([a, b]) => (a === sleutel ? b : a));
                bak(v()).punten[sleutel] = { punt: punten()[sleutel], buren };
            }
            delete punten()[sleutel];
            zetParen(paren().filter(([a, b]) => a !== sleutel && b !== sleutel));
            for (const l of Object.values(lokalen())) if (l[2] === sleutel) l[2] = dichtstbijzijndPunt(l[0], l[1]);
            if (geselecteerd === sleutel) geselecteerd = null;
        } else if (gereedschap === 'wis' && soort === 'lokaal') {
            bak(v()).lokalen[sleutel] = lokalen()[sleutel];
            delete lokalen()[sleutel];
            if (gekozenLokaal === sleutel) gekozenLokaal = null;
        } else {
            return true;
        }
        opslaan();
        return true;
    }

    // Een lokaal kiezen om aan een ander gangpunt te koppelen (null = niets gekozen)
    function kiesLokaal(sleutel) {
        gekozenLokaal = sleutel && lokalen()[sleutel] ? sleutel : null;
        if (gekozenLokaal) {
            const l = lokalen()[gekozenLokaal];
            opHint(`🔗 ${l[3] || gekozenLokaal} gekozen (nu aan punt ${l[2]}). Tik op het gangpunt (rode stip) waar de deur op uitkomt.`);
        } else {
            opHint(gereedschap === 'lokaal' ? 'Tik op een lokaal (paarse stip) om het aan een ander gangpunt te koppelen, of op een lege plek om een lokaal toe te voegen.' : null);
        }
        Kaart.teken();
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

    // ---------- Weggehaald en terugzetten ----------

    function bak(verdiepingId) {
        return (prullenbak[verdiepingId] ||= { lokalen: {}, punten: {} });
    }

    // Wat stond er in data.js op deze verdieping, maar is nu weg?
    function uitStandaard(verdiepingId) {
        const st = GEBOUW_STANDAARD;
        const lok = {}, pnt = {};
        for (const [sleutel, l] of Object.entries(st.lokalen[verdiepingId] || {})) {
            if (!(GEBOUW.lokalen[verdiepingId] || {})[sleutel]) lok[sleutel] = l;
        }
        for (const [sleutel, p] of Object.entries(st.punten[verdiepingId] || {})) {
            if (!p[2] || (GEBOUW.punten[verdiepingId] || {})[sleutel]) continue;
            const buren = [];
            for (const keten of st.gangen[verdiepingId] || []) {
                const d = keten.split('-');
                d.forEach((k, i) => {
                    if (k !== sleutel) return;
                    if (d[i - 1]) buren.push(d[i - 1]);
                    if (d[i + 1]) buren.push(d[i + 1]);
                });
            }
            pnt[sleutel] = { punt: p, buren };
        }
        return { lokalen: lok, punten: pnt };
    }

    // Alles wat je op een verdieping kunt terugzetten: [{ soort, sleutel, naam, voorziening }]
    function weggehaald(verdiepingId) {
        const b = bak(verdiepingId), st = uitStandaard(verdiepingId);
        const lijst = [];
        const lok = { ...st.lokalen, ...b.lokalen };
        for (const [sleutel, l] of Object.entries(lok)) {
            if ((GEBOUW.lokalen[verdiepingId] || {})[sleutel]) continue; // al terug (bijv. opnieuw gemaakt)
            lijst.push({ soort: 'lokaal', sleutel, naam: l[3] || sleutel, voorziening: !!l[3] });
        }
        const pnt = { ...st.punten, ...b.punten };
        for (const [sleutel, { punt }] of Object.entries(pnt)) {
            if ((GEBOUW.punten[verdiepingId] || {})[sleutel]) continue;
            lijst.push({ soort: 'punt', sleutel, naam: punt[2].replace(/^de /, '').replace(/^./, (c) => c.toUpperCase()), voorziening: true });
        }
        return lijst.sort((a, c) => c.voorziening - a.voorziening || a.naam.localeCompare(c.naam, 'nl', { numeric: true }));
    }

    function zetTerug(verdiepingId, soort, sleutel) {
        const b = bak(verdiepingId), st = uitStandaard(verdiepingId);
        const pts = (GEBOUW.punten[verdiepingId] ||= {});
        if (soort === 'lokaal') {
            const l = [...(b.lokalen[sleutel] || st.lokalen[sleutel])];
            // Bestaat het deurpunt niet meer? Neem dan het dichtstbijzijnde gangpunt
            if (!pts[l[2]]) {
                let beste = null, d = Infinity;
                for (const [k, [px, py]] of Object.entries(pts)) {
                    const afst = Math.hypot(px - l[0], py - l[1]);
                    if (afst < d) { d = afst; beste = k; }
                }
                if (!beste) { alert('Maak eerst een gangpunt op deze verdieping.'); return; }
                l[2] = beste;
            }
            (GEBOUW.lokalen[verdiepingId] ||= {})[sleutel] = l;
            delete b.lokalen[sleutel];
        } else {
            const { punt, buren } = b.punten[sleutel] || st.punten[sleutel];
            pts[sleutel] = [...punt];
            // De gangen naar buurpunten die nog bestaan weer aanleggen
            const gangen = (GEBOUW.gangen[verdiepingId] ||= []);
            for (const buur of buren) {
                if (pts[buur] && !gangen.includes(`${sleutel}-${buur}`) && !gangen.includes(`${buur}-${sleutel}`)) gangen.push(`${sleutel}-${buur}`);
            }
            delete b.punten[sleutel];
        }
        opslaan();
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
            const gekozen = sleutel === gekozenLokaal;
            if (pts[deur]) t.lijnStuk({ x, y }, { x: pts[deur][0], y: pts[deur][1] }, gekozen ? 'ed-deur gekozen' : 'ed-deur', gekozen ? 4 : 2, { 'stroke-dasharray': `${6 / t.schaal()} ${4 / t.schaal()}` });
            const r = t.cirkel({ x, y }, gekozen ? 12 : 9, gekozen ? 'ed-lokaal geselecteerd' : 'ed-lokaal');
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
        data.gpsKalibratie = Gps.kalibratiePunten(); // komen altijd uit data.js
        data.info = Info.alles(); // teksten uit data.js plus wat je in de app hebt aangepast
        return `const GEBOUW_STANDAARD = ${JSON.stringify(data, null, 4)};`;
    }

    function herstel() {
        localStorage.removeItem('gebouwroute-data');
        localStorage.removeItem(PRULLENBAK);
        Info.wis();
        location.reload();
    }

    return {
        tik, teken, exporteer, herstel, weggehaald, zetTerug,
        // Vanuit het informatievak: meteen het Lokaal-gereedschap met dit lokaal gekozen
        koppel(sleutel) { gereedschap = 'lokaal'; geselecteerd = null; kiesLokaal(sleutel); },
        sleepStart, sleepBeweeg, sleepEind: opslaan,
        set gereedschap(g) { gereedschap = g; geselecteerd = null; kiesLokaal(null); },
        get gereedschap() { return gereedschap; },
        set actief(a) { actief = a; geselecteerd = null; gekozenLokaal = null; if (!a) opHint(null); Kaart.teken(); },
        get actief() { return actief; },
        set opWijziging(f) { opWijziging = f; },
        set opHint(f) { opHint = f; },
    };
})();
