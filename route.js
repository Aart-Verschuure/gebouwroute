/*
 * ROUTEPLANNER
 * Bouwt een netwerk (graaf) van de gebouwdata, zoekt de kortste route met
 * Dijkstra en zet die route om in begrijpelijke (gesproken) instructies.
 */
const Route = (() => {
    const TRAP_KOSTEN = 8;       // "meters" per verdieping met de trap
    const LIFT_KOSTEN = 20;      // wachten op de lift
    const LIFT_PER_VERDIEPING = 2;

    let knopen = {};   // id -> { id, verdieping, x, y, naam, lokaal, deur, verbinding }
    let buren = {};    // id -> [{ naar, kosten, verbinding }]

    const verdieping = (id) => GEBOUW.verdiepingen.find((v) => v.id === id);
    const knoopId = (verdiepingId, sleutel) => `${verdiepingId}:${sleutel}`;
    // "Kantine" -> "kantine", maar "WC" blijft "WC"
    const metKleineLetter = (tekst) => (/^[A-Z]{2}/.test(tekst) ? tekst : tekst.charAt(0).toLowerCase() + tekst.slice(1));

    // Positie in "meterruimte": x wordt gecorrigeerd voor de verhouding van de afbeelding
    function punt(knoop) {
        const v = verdieping(knoop.verdieping);
        return { x: knoop.x * (v.breedte / v.hoogte), y: knoop.y };
    }

    function afstand(a, b) {
        const pa = punt(a), pb = punt(b);
        return Math.hypot(pb.x - pa.x, pb.y - pa.y) * GEBOUW.meterPerEenheid;
    }

    function verbind(a, b, kosten, verbinding = null) {
        (buren[a] ||= []).push({ naar: b, kosten, verbinding });
        (buren[b] ||= []).push({ naar: a, kosten, verbinding });
    }

    function bouw() {
        knopen = {};
        buren = {};

        for (const v of GEBOUW.verdiepingen) {
            const punten = GEBOUW.punten[v.id] || {};
            for (const [sleutel, [x, y, naam]] of Object.entries(punten)) {
                const id = knoopId(v.id, sleutel);
                knopen[id] = { id, sleutel, verdieping: v.id, x, y, naam: naam || null };
            }

            for (const keten of GEBOUW.gangen[v.id] || []) {
                const delen = keten.split('-');
                for (let i = 0; i < delen.length - 1; i++) {
                    const a = knopen[knoopId(v.id, delen[i])];
                    const b = knopen[knoopId(v.id, delen[i + 1])];
                    if (!a || !b) {
                        console.warn(`Onbekend punt in gang "${keten}" op verdieping ${v.id}`);
                        continue;
                    }
                    verbind(a.id, b.id, afstand(a, b));
                }
            }

            for (const [sleutel, [x, y, deur, weergave]] of Object.entries(GEBOUW.lokalen[v.id] || {})) {
                const id = knoopId(v.id, sleutel);
                const deurKnoop = knopen[knoopId(v.id, deur)];
                knopen[id] = {
                    id, sleutel, verdieping: v.id, x, y,
                    naam: weergave ? `de ${metKleineLetter(weergave)}` : `lokaal ${sleutel}`,
                    label: weergave || sleutel,
                    lokaal: true, deur: deurKnoop ? deurKnoop.id : null,
                };
                if (deurKnoop) verbind(id, deurKnoop.id, afstand(knopen[id], deurKnoop) * 0.5);
                else console.warn(`Lokaal ${sleutel} heeft een onbekend deurpunt "${deur}"`);
            }
        }

        for (const verb of GEBOUW.verbindingen) {
            const stops = verb.verdiepingen
                .map((v) => knopen[knoopId(v, verb.punt)])
                .filter(Boolean);
            for (const k of stops) k.verbinding = verb;

            if (verb.type === 'lift') {
                // Met de lift kun je direct naar elke verdieping
                for (let i = 0; i < stops.length; i++) {
                    for (let j = i + 1; j < stops.length; j++) {
                        const verschil = Math.abs(verdieping(stops[i].verdieping).niveau - verdieping(stops[j].verdieping).niveau);
                        verbind(stops[i].id, stops[j].id, LIFT_KOSTEN + verschil * LIFT_PER_VERDIEPING, verb);
                    }
                }
            } else {
                // Met de trap ga je verdieping voor verdieping
                for (let i = 0; i < stops.length - 1; i++) {
                    verbind(stops[i].id, stops[i + 1].id, TRAP_KOSTEN, verb);
                }
            }
        }
    }

    // Kortste route met Dijkstra. Geeft een lijst met knoop-id's terug, of null.
    function zoek(vanId, naarId, { vermijdTrappen = false } = {}) {
        const kosten = { [vanId]: 0 };
        const vorige = {};
        const vorigeVerbinding = {};
        const open = new Set([vanId]);
        const klaar = new Set();

        while (open.size) {
            let huidige = null;
            for (const id of open) if (huidige === null || kosten[id] < kosten[huidige]) huidige = id;
            open.delete(huidige);
            klaar.add(huidige);
            if (huidige === naarId) break;

            for (const { naar, kosten: k, verbinding } of buren[huidige] || []) {
                if (klaar.has(naar)) continue;
                if (vermijdTrappen && verbinding && verbinding.type === 'trap') continue;
                // Niet dwars door een ander lokaal lopen
                if (knopen[naar].lokaal && naar !== naarId) continue;
                const nieuw = kosten[huidige] + k;
                if (kosten[naar] === undefined || nieuw < kosten[naar]) {
                    kosten[naar] = nieuw;
                    vorige[naar] = huidige;
                    vorigeVerbinding[naar] = verbinding;
                    open.add(naar);
                }
            }
        }

        if (kosten[naarId] === undefined) return null;
        const pad = [];
        for (let id = naarId; id !== undefined; id = vorige[id]) {
            pad.unshift({ id, verbinding: vorigeVerbinding[id] || null });
        }
        return pad;
    }

    // ---------- Instructies maken ----------

    // Hoek in graden tussen twee looprichtingen. Positief = rechtsaf.
    function draai(a, b, c) {
        const pa = punt(a), pb = punt(b), pc = punt(c);
        const v1 = { x: pb.x - pa.x, y: pb.y - pa.y };
        const v2 = { x: pc.x - pb.x, y: pc.y - pb.y };
        const kruis = v1.x * v2.y - v1.y * v2.x; // y-as wijst omlaag, dus positief = met de klok mee = rechts
        const punt_ = v1.x * v2.x + v1.y * v2.y;
        return (Math.atan2(kruis, punt_) * 180) / Math.PI;
    }

    function draaiZin(hoek) {
        const a = Math.abs(hoek);
        const kant = hoek > 0 ? 'rechts' : 'links';
        if (a < 25) return 'Loop rechtdoor';
        if (a < 60) return `Houd ${kant} aan`;
        if (a < 150) return `Sla ${kant}af`;
        return 'Keer om';
    }

    function meters(m) {
        if (m < 10) return `${Math.max(2, Math.round(m))} meter`;
        return `${Math.round(m / 5) * 5} meter`;
    }

    // Een herkenningspunt bij een gangknoop: eigen naam of een lokaal dat hier zijn deur heeft
    function herkenningspunt(knoop, uitsluiten = []) {
        if (knoop.verbinding) return knoop.verbinding.naam;
        if (knoop.naam && !knoop.lokaal) return knoop.naam;
        const lokalen = Object.values(knopen).filter(
            (k) => k.lokaal && k.verdieping === knoop.verdieping && !uitsluiten.includes(k.id)
        );
        let beste = null, besteAfstand = Infinity;
        for (const l of lokalen) {
            const d = l.deur === knoop.id ? 0 : afstand(l, knoop);
            if (d < besteAfstand) { beste = l; besteAfstand = d; }
        }
        return beste && besteAfstand < 12 ? beste.naam : null;
    }

    function verdiepingNaam(id) {
        const v = verdieping(id);
        if (v.id === 'K') return 'de kelder';
        if (v.niveau === 0) return 'de begane grond';
        return `de ${v.naam}`;
    }

    // Zet een pad om in stappen: { tekst, verdieping, van, naar }
    function instructies(pad) {
        const stappen = [];
        const knoopLijst = pad.map((p) => knopen[p.id]);
        const begin = knoopLijst[0];
        const eind = knoopLijst[knoopLijst.length - 1];

        // Pad opdelen in stukken per verdieping en stukken trap/lift
        const stukken = [];
        let huidig = { type: 'lopen', knopen: [knoopLijst[0]] };
        for (let i = 1; i < pad.length; i++) {
            const k = knoopLijst[i];
            const verb = pad[i].verbinding;
            if (verb) {
                if (huidig.type === 'lopen') {
                    stukken.push(huidig);
                    huidig = { type: 'wissel', verbinding: verb, knopen: [knoopLijst[i - 1], k] };
                } else if (huidig.verbinding === verb) {
                    huidig.knopen.push(k);
                } else {
                    stukken.push(huidig);
                    huidig = { type: 'wissel', verbinding: verb, knopen: [knoopLijst[i - 1], k] };
                }
            } else {
                if (huidig.type === 'wissel') {
                    stukken.push(huidig);
                    huidig = { type: 'lopen', knopen: [knoopLijst[i - 1]] };
                }
                huidig.knopen.push(k);
            }
        }
        stukken.push(huidig);

        let vorigeWissel = null;
        stukken.forEach((stuk, stukIndex) => {
            if (stuk.type === 'wissel') {
                const van = stuk.knopen[0];
                const naar = stuk.knopen[stuk.knopen.length - 1];
                const omhoog = verdieping(naar.verdieping).niveau > verdieping(van.verdieping).niveau;
                const tekst = stuk.verbinding.type === 'lift'
                    ? `Neem ${stuk.verbinding.naam} naar ${verdiepingNaam(naar.verdieping)}.`
                    : `Neem ${stuk.verbinding.naam} naar ${omhoog ? 'boven' : 'beneden'}, naar ${verdiepingNaam(naar.verdieping)}.`;
                stappen.push({ tekst, verdieping: van.verdieping, naarVerdieping: naar.verdieping, van, naar, wissel: true });
                vorigeWissel = stuk.verbinding;
                return;
            }

            let punten = stuk.knopen;
            if (punten.length < 2) return;

            // Het laatste stukje naar een lokaal lopen we niet, dat beschrijven we
            const naarLokaal = punten[punten.length - 1].lokaal && stukIndex === stukken.length - 1;
            const vanLokaal = punten[0].lokaal && stukIndex === 0;
            const lokaalAankomst = naarLokaal ? punten[punten.length - 1] : null;
            if (naarLokaal) punten = punten.slice(0, -1);

            if (vanLokaal && punten.length > 1) {
                stappen.push({
                    tekst: `Verlaat ${begin.naam} en ga de gang in.`,
                    verdieping: begin.verdieping, van: punten[0], naar: punten[1],
                });
                punten = punten.slice(1);
            }

            // Punten waar je (bijna) rechtdoor loopt samenvoegen
            const hoeken = [punten[0]];
            for (let i = 1; i < punten.length - 1; i++) {
                const hoek = draai(hoeken[hoeken.length - 1], punten[i], punten[i + 1]);
                if (Math.abs(hoek) >= 25) hoeken.push(punten[i]);
            }
            if (punten.length > 1) hoeken.push(punten[punten.length - 1]);

            for (let i = 0; i < hoeken.length - 1; i++) {
                const a = hoeken[i], b = hoeken[i + 1];
                const doel = herkenningspunt(b, lokaalAankomst ? [lokaalAankomst.id] : []);
                const laatste = i === hoeken.length - 2;
                let tekst;

                if (i === 0) {
                    const richting = doel ? ` richting ${doel}` : '';
                    if (stukIndex === 0 && !vanLokaal) {
                        tekst = `Loop vanaf ${begin.naam || 'je startpunt'} ongeveer ${meters(afstand(a, b))}${richting}.`;
                    } else if (vorigeWissel) {
                        tekst = `Stap uit ${vorigeWissel.naam} en loop ongeveer ${meters(afstand(a, b))}${richting}.`;
                    } else {
                        tekst = `Loop ongeveer ${meters(afstand(a, b))}${richting}.`;
                    }
                } else {
                    const hoek = draai(hoeken[i - 1], a, b);
                    // Bij het laatste stuk naar een lokaal zegt de volgende stap al waar het is
                    const tot = doel && !(laatste && lokaalAankomst) ? ` tot bij ${doel}` : '';
                    tekst = `${draaiZin(hoek)} en loop ongeveer ${meters(afstand(a, b))}${tot}.`;
                }
                stappen.push({ tekst, verdieping: a.verdieping, van: a, naar: b });
            }

            if (lokaalAankomst) {
                let kant = '';
                if (hoeken.length >= 2) {
                    const hoek = draai(hoeken[hoeken.length - 2], hoeken[hoeken.length - 1], lokaalAankomst);
                    if (Math.abs(hoek) < 30) kant = ' recht voor je';
                    else if (Math.abs(hoek) < 150) kant = hoek > 0 ? ' aan je rechterhand' : ' aan je linkerhand';
                    else kant = ' achter je';
                }
                stappen.push({
                    tekst: `Je bent er bijna: ${lokaalAankomst.naam} is${kant}.`,
                    verdieping: lokaalAankomst.verdieping,
                    van: hoeken[hoeken.length - 1], naar: lokaalAankomst,
                });
            }
        });

        stappen.push({
            tekst: `Je bent aangekomen bij ${eind.naam}.`,
            verdieping: eind.verdieping, van: eind, naar: eind, einde: true,
        });
        return stappen;
    }

    function plan(vanId, naarId, opties) {
        const pad = zoek(vanId, naarId, opties);
        if (!pad) return null;
        const knoopPad = pad.map((p) => knopen[p.id]);
        let totaal = 0;
        for (let i = 1; i < knoopPad.length; i++) {
            if (knoopPad[i].verdieping === knoopPad[i - 1].verdieping) totaal += afstand(knoopPad[i - 1], knoopPad[i]);
        }
        return { pad: knoopPad, stappen: instructies(pad), meters: Math.round(totaal) };
    }

    // Dichtstbijzijnde gangpunt op een verdieping (voor GPS-locatie)
    function dichtstbij(verdiepingId, x, y) {
        let beste = null, besteAfstand = Infinity;
        const hier = { verdieping: verdiepingId, x, y };
        for (const k of Object.values(knopen)) {
            if (k.verdieping !== verdiepingId || k.lokaal) continue;
            const d = afstand(k, hier);
            if (d < besteAfstand) { beste = k; besteAfstand = d; }
        }
        return beste;
    }

    function bestemmingen() {
        const lijst = [];
        for (const k of Object.values(knopen)) {
            if (k.lokaal || (k.naam && !k.verbinding)) {
                lijst.push({ id: k.id, label: k.label || k.naam.replace(/^de /, '').replace(/^./, (c) => c.toUpperCase()), verdieping: verdieping(k.verdieping) });
            }
        }
        return lijst.sort((a, b) => a.verdieping.niveau - b.verdieping.niveau || a.label.localeCompare(b.label, 'nl', { numeric: true }));
    }

    return { bouw, plan, dichtstbij, bestemmingen, afstand, verdieping, verdiepingNaam, get knopen() { return knopen; }, get buren() { return buren; } };
})();
