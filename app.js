/*
 * APP
 * Verbindt alles: de keuzevelden, de kaart, de route, GPS en de stem.
 */
document.addEventListener('DOMContentLoaded', () => {
    const $ = (id) => document.getElementById(id);
    // Zelfde nummer als CACHE_NAME in sw.js. Staat in ⚙️ Instellingen, zo zie je of een apparaat de nieuwste versie heeft.
    const VERSIE = 'v24';
    const GPS_OPTIE = '__gps__';

    const staat = {
        van: null,          // knoop-id of GPS_OPTIE
        naar: null,         // knoop-id
        route: null,        // { pad, stappen, meters }
        stap: 0,
        volgen: false,      // kaart meebewegen met GPS
        gpsVerdieping: null, // verdieping die de gebruiker opgaf bij "Mijn locatie"
        autoVolgende: true,
        bijWissel: false,   // is de gebruiker al bij de trap/lift van de huidige stap geweest?
        wegVanWissel: 0,    // aantal metingen achter elkaar dat de gebruiker van de trap/lift wegloopt
        toonHoogte: false,  // proef: GPS-hoogte in de statusregel
        infoLokaal: null,   // lokaal (knoop-id) dat in het informatievak getoond wordt
    };

    try { staat.autoVolgende = localStorage.getItem('gebouwroute-auto') !== 'uit'; } catch (e) { /* standaard */ }
    try { staat.toonHoogte = localStorage.getItem('gebouwroute-hoogte') === 'aan'; } catch (e) { /* standaard uit */ }

    let gpsWeergave = null; // positie van het blauwe bolletje (schuift vloeiend naar de laatste GPS-positie)

    // Trap of lift: de keuze blijft bewaard op dit apparaat
    const trapOfLift = () => document.querySelector('input[name="trapOfLift"]:checked').value || null;
    try {
        const bewaard = localStorage.getItem('gebouwroute-trapoflift') || '';
        document.querySelector(`input[name="trapOfLift"][value="${bewaard}"]`).checked = true;
    } catch (e) { /* standaard: maakt niet uit */ }
    $('trapOfLift').addEventListener('change', () => {
        try { localStorage.setItem('gebouwroute-trapoflift', trapOfLift() || ''); } catch (e) { /* niet opgeslagen */ }
    });

    Route.bouw();

    // ---------- Kaart en verdiepingen ----------

    Kaart.init($('kaart'));
    Kaart.tekenaar = tekenOverlay;

    const verdiepingKnoppen = $('verdiepingKnoppen');
    function maakVerdiepingKnoppen() {
        verdiepingKnoppen.replaceChildren();
        for (const v of [...GEBOUW.verdiepingen].sort((a, b) => b.niveau - a.niveau)) {
            const knop = document.createElement('button');
            knop.textContent = v.kort;
            knop.title = v.naam;
            knop.setAttribute('aria-label', v.naam);
            knop.dataset.verdieping = v.id;
            knop.addEventListener('click', () => toonVerdieping(v.id));
            verdiepingKnoppen.append(knop);
        }
    }

    function toonVerdieping(id, behoudZoom = false) {
        Kaart.toonVerdieping(Route.verdieping(id), behoudZoom);
        werkVerdiepingKnoppenBij();
    }

    function werkVerdiepingKnoppenBij() {
        const opRoute = new Set(staat.route ? staat.route.pad.map((k) => k.verdieping) : []);
        for (const knop of verdiepingKnoppen.children) {
            knop.classList.toggle('actief', knop.dataset.verdieping === Kaart.verdieping.id);
            knop.classList.toggle('op-route', opRoute.has(knop.dataset.verdieping));
        }
        tekenInfo();
    }

    // ---------- Informatievak: wat is er te doen op deze verdieping / in dit lokaal ----------

    const infoPaneel = $('infoPaneel');
    const isSmal = () => window.matchMedia('(max-width: 899px)').matches;
    // Op een telefoon standaard dicht (dan houdt de kaart de meeste ruimte), op een computer open
    let infoOpen = !isSmal();
    try { const b = localStorage.getItem('gebouwroute-info'); if (b && !isSmal()) infoOpen = b === 'open'; } catch (e) { /* standaard */ }

    function zetInfoOpen(open) {
        infoOpen = open;
        infoPaneel.classList.toggle('dicht', !open);
        $('knopInfo').classList.toggle('actief', open);
        if (!isSmal()) try { localStorage.setItem('gebouwroute-info', open ? 'open' : 'dicht'); } catch (e) { /* niet opgeslagen */ }
        // Op een telefoon staat het vak onder de kaart: een stukje scrollen zodat je de kaart én het begin van de info ziet
        else if (open) requestAnimationFrame(() => {
            const houder = $('appInhoud');
            const boven = infoPaneel.getBoundingClientRect().top - houder.getBoundingClientRect().top + houder.scrollTop;
            houder.scrollTo({ top: Math.max(0, boven - houder.clientHeight * 0.6), behavior: 'smooth' });
        });
    }
    $('knopInfo').addEventListener('click', () => zetInfoOpen(!infoOpen));
    $('infoSluit').addEventListener('click', () => zetInfoOpen(false));
    zetInfoOpen(infoOpen);

    const ICONEN = [[/wc|toilet/i, '🚻'], [/kantine|restaurant/i, '🍽️'], [/garderobe/i, '🧥'], [/fiets/i, '🚲'],
        [/parkeer/i, '🅿️'], [/ingang/i, '🚪'], [/hal/i, '🏛️']];
    const icoonVoor = (tekst) => (ICONEN.find(([re]) => re.test(tekst)) || [null, '📍'])[1];
    const beschrijving = (k) => Info.lokaal(k);

    // Beschrijving tonen, en in de bewerkmodus een knop om hem aan te passen
    function beschrijvingBlok(tekst, opslaan) {
        const blok = el('div', 'info-beschrijving');
        if (tekst) blok.append(el('p', null, tekst));
        if (!Editor.actief) return blok;

        const bewerk = el('button', 'knop klein', tekst ? '✏️ Tekst aanpassen' : '✏️ Tekst toevoegen');
        bewerk.type = 'button';
        bewerk.addEventListener('click', () => {
            const veld = el('textarea', 'info-veld');
            veld.rows = 4;
            veld.value = tekst;
            veld.placeholder = 'Wat is hier te doen? Bijv. "Lokaal voor Nederlands en Engels."';
            const bewaar = el('button', 'knop klein primair', 'Opslaan');
            const annuleer = el('button', 'knop klein', 'Annuleren');
            bewaar.type = annuleer.type = 'button';
            bewaar.addEventListener('click', () => {
                opslaan(veld.value);
                melding('Tekst opgeslagen op dit apparaat. Via ⚙️ → Exporteer data zet je hem in data.js voor iedereen.', false);
                tekenInfo();
            });
            annuleer.addEventListener('click', tekenInfo);
            const rij = el('div', 'knoppen-rij');
            rij.append(bewaar, annuleer);
            blok.replaceChildren(veld, rij);
            veld.focus();
        });
        blok.append(bewerk);
        return blok;
    }

    function el(tag, klasse, tekst) {
        const e = document.createElement(tag);
        if (klasse) e.className = klasse;
        if (tekst != null) e.textContent = tekst;
        return e;
    }

    function knopRegel(icoon, tekst, opKlik) {
        const li = el('li');
        const knop = el('button');
        knop.type = 'button';
        knop.append(el('span', 'icoon', icoon), el('span', null, tekst));
        knop.addEventListener('click', opKlik);
        li.append(knop);
        return li;
    }

    function toonInfoLokaal(id) {
        staat.infoLokaal = id;
        tekenInfo();
    }

    function tekenInfo() {
        const v = Kaart.verdieping;
        if (!v) return;
        const inhoud = $('infoInhoud');
        const titel = $('infoTitel');
        inhoud.replaceChildren();
        titel.replaceChildren();

        const lokaal = staat.infoLokaal && Route.knopen[staat.infoLokaal];
        if (lokaal && lokaal.verdieping === v.id) {
            // ---- Eén lokaal ----
            titel.append(lokaal.label || lokaal.naam, el('small', null, Route.verdieping(lokaal.verdieping).naam));
            inhoud.append(beschrijvingBlok(beschrijving(lokaal), (t) => Info.zetLokaal(lokaal, t)));
            const knoppen = el('div', 'knoppen-rij');
            const naar = el('button', 'knop primair', 'Hier wil ik heen');
            naar.type = 'button';
            naar.addEventListener('click', () => {
                kiezerNaar.kies(lokaal.id, true);
                staat.naar = lokaal.id;
                Kaart.teken();
                if (isSmal()) zetInfoOpen(false);
                melding(`Bestemming: ${lokaal.label || lokaal.naam}. Kies waar je bent en druk op "Start route".`, false);
            });
            const van = el('button', 'knop', 'Hier ben ik');
            van.type = 'button';
            van.addEventListener('click', () => {
                kiezerVan.kies(lokaal.id, true);
                staat.van = lokaal.id;
                if (isSmal()) zetInfoOpen(false);
            });
            knoppen.append(naar, van);
            inhoud.append(knoppen);
            const terug = el('button', 'info-terug', `‹ Alles op ${Route.verdiepingNaam(v.id)}`);
            terug.type = 'button';
            terug.addEventListener('click', () => toonInfoLokaal(null));
            inhoud.append(terug);
            return;
        }

        // ---- De hele verdieping ----
        titel.append(v.naam);
        if (Editor.actief) {
            inhoud.append(el('p', 'info-bewerkuitleg',
                'Bewerkmodus: pas hieronder de tekst van deze verdieping aan, of tik op een lokaal of voorziening om de tekst daarvan aan te passen.'));
        }
        inhoud.append(beschrijvingBlok(Info.verdieping(v.id), (t) => Info.zetVerdieping(v.id, t)));

        const knopen = Object.values(Route.knopen).filter((k) => k.verdieping === v.id);
        const voorzieningen = knopen.filter((k) => (k.lokaal && k.label && k.label !== k.sleutel) || (!k.lokaal && k.naam && !k.verbinding));
        const verbindingen = GEBOUW.verbindingen.filter((vb) => vb.verdiepingen.includes(v.id));

        if (voorzieningen.length || verbindingen.length) {
            inhoud.append(el('h3', null, 'Voorzieningen'));
            const lijst = el('ul', 'info-lijst');
            for (const k of voorzieningen) {
                const naam = k.label || k.naam.replace(/^de /, '').replace(/^./, (c) => c.toUpperCase());
                lijst.append(knopRegel(icoonVoor(naam), naam, () => { toonKnoop(k.id); toonInfoLokaal(k.id); }));
            }
            for (const vb of verbindingen) {
                const k = Route.knopen[`${v.id}:${vb.punt}`];
                const naar = vb.verdiepingen.map((id) => Route.verdieping(id).kort).join(', ');
                const tekst = `${vb.naam.replace(/^./, (c) => c.toUpperCase())} (${naar})`;
                lijst.append(knopRegel(vb.type === 'lift' ? '🛗' : '🪜', tekst, () => { if (k) Kaart.centreer(k.x, k.y, 2.5); }));
            }
            inhoud.append(lijst);
        }

        const lokalen = knopen.filter((k) => k.lokaal && (!k.label || k.label === k.sleutel))
            .sort((a, b) => a.sleutel.localeCompare(b.sleutel, 'nl', { numeric: true }));
        if (lokalen.length) {
            inhoud.append(el('h3', null, `Lokalen (${lokalen.length})`));
            const rij = el('div', 'info-lokalen');
            for (const k of lokalen) {
                const knop = el('button', null, k.sleutel);
                knop.type = 'button';
                if (beschrijving(k)) knop.title = beschrijving(k);
                knop.addEventListener('click', () => { toonKnoop(k.id); toonInfoLokaal(k.id); });
                rij.append(knop);
            }
            inhoud.append(rij);
        }
    }

    maakVerdiepingKnoppen();
    toonVerdieping('0');

    $('zoomIn').addEventListener('click', () => Kaart.zoom(1.4));
    $('zoomUit').addEventListener('click', () => Kaart.zoom(1 / 1.4));
    $('zoomPassend').addEventListener('click', () => Kaart.passend());

    // Alles wat over de plattegrond getekend wordt
    function tekenOverlay(t, v) {
        const route = staat.route;
        if (route) {
            // Route op deze verdieping (in losse stukken, want je kunt een verdieping verlaten en terugkomen)
            let stuk = [];
            const stukken = [];
            for (const k of route.pad) {
                if (k.verdieping === v.id) stuk.push(k);
                else if (stuk.length) { stukken.push(stuk); stuk = []; }
            }
            if (stuk.length) stukken.push(stuk);
            for (const s of stukken) {
                if (s.length < 2) continue;
                t.lijn(s, 'route-rand', 11);
                t.lijn(s, 'route-lijn', 6);
            }

            // Huidige stap extra duidelijk
            const stap = route.stappen[staat.stap];
            if (stap && !stap.einde) {
                const iVan = route.pad.indexOf(stap.van);
                const iNaar = route.pad.indexOf(stap.naar, iVan);
                const actief = route.pad.slice(iVan, iNaar + 1).filter((k) => k.verdieping === v.id);
                if (actief.length >= 2) t.lijn(actief, 'route-actief', 7);
                if (stap.naar.verdieping === v.id) t.cirkel(stap.naar, 9, 'stap-doel');
            }

            // Trappen/liften op de route
            for (let i = 1; i < route.pad.length; i++) {
                const a = route.pad[i - 1], b = route.pad[i];
                if (a.verdieping === b.verdieping) continue;
                const hier = a.verdieping === v.id ? a : b.verdieping === v.id ? b : null;
                if (!hier) continue;
                const ander = hier === a ? b : a;
                const pijl = Route.verdieping(ander.verdieping).niveau > Route.verdieping(hier.verdieping).niveau ? '▲' : '▼';
                t.cirkel(hier, 13, 'wissel-punt');
                t.tekst(hier, `${a.verbinding && a.verbinding.type === 'lift' ? 'Lift' : 'Trap'} ${pijl} ${Route.verdieping(ander.verdieping).kort}`, 'kaart-label', 13, -20);
            }

            const begin = route.pad[0], eind = route.pad[route.pad.length - 1];
            if (begin.verdieping === v.id) {
                t.cirkel(begin, 10, 'start-punt');
                t.tekst(begin, 'Start', 'kaart-label', 13, -18);
            }
            if (eind.verdieping === v.id) {
                t.cirkel(eind, 12, 'eind-punt');
                t.tekst(eind, eind.label || eind.naam, 'kaart-label', 14, -20);
            }
        } else if (staat.naar && Route.knopen[staat.naar] && Route.knopen[staat.naar].verdieping === v.id) {
            const eind = Route.knopen[staat.naar];
            t.cirkel(eind, 12, 'eind-punt');
            t.tekst(eind, eind.label || eind.naam, 'kaart-label', 14, -20);
        }

        // GPS-positie
        const pos = gpsWeergave && Gps.naarKaart(gpsWeergave, v.id);
        if (pos) {
            // Blauw bolletje met een lichte cirkel eromheen: hoe groter de cirkel, hoe onzekerder de GPS
            const oud = Date.now() - Gps.laatste.tijd > 20000; // al een tijd geen nieuwe positie
            t.cirkelEchteMaat(pos, (pos.straal / 100) * v.hoogte, 'gps-bereik');
            if (!oud) t.cirkel(pos, 10, 'gps-puls');
            t.cirkel(pos, 10, oud ? 'gps-punt oud' : 'gps-punt');
        }

        Editor.teken(t);
    }

    // ---------- Keuzevelden (zoeken naar lokaal) ----------

    const bestemmingen = () => Route.bestemmingen();
    const normaal = (s) => s.toLowerCase().replace(/[\s.\-()]/g, '');

    function maakKiezer(houder, { metGps = false, opKies }) {
        const invoer = houder.querySelector('input');
        const lijst = houder.querySelector('ul');
        let waarde = null;

        function opties() {
            const zoek = normaal(invoer.value);
            const alle = bestemmingen().filter((b) => !zoek || normaal(b.label).includes(zoek) || normaal(b.verdieping.naam).includes(zoek));
            // Resultaten die met de zoekterm beginnen eerst
            const score = (b) => (normaal(b.label) === zoek ? 2 : normaal(b.label).startsWith(zoek) ? 1 : 0);
            if (zoek) alle.sort((a, b) => score(b) - score(a));
            const resultaat = alle.map((b) => ({ id: b.id, label: b.label, sub: b.verdieping.naam }));
            if (metGps && !zoek) resultaat.unshift({ id: GPS_OPTIE, label: '📍 Mijn locatie (GPS)', sub: 'Daarna kies je op welke verdieping je bent' });
            return resultaat;
        }

        function toon() {
            const items = opties();
            lijst.replaceChildren(...items.map((o, i) => {
                const li = document.createElement('li');
                li.role = 'option';
                li.dataset.id = o.id;
                li.innerHTML = `<span></span><small></small>`;
                li.firstChild.textContent = o.label;
                li.lastChild.textContent = o.sub;
                if (i === 0) li.classList.add('eerste');
                // 'click' en niet 'pointerdown': dan kun je op een telefoon door de lijst scrollen
                // zonder dat het lokaal onder je vinger meteen gekozen wordt
                li.addEventListener('click', () => kies(o.id));
                return li;
            }));
            if (!items.length) {
                const li = document.createElement('li');
                li.className = 'leeg';
                li.textContent = 'Niets gevonden';
                lijst.append(li);
            }
            lijst.hidden = false;
        }

        function kies(id, stil = false) {
            waarde = id;
            if (id === GPS_OPTIE) invoer.value = '📍 Mijn locatie (GPS)';
            else if (id && Route.knopen[id]) {
                const b = bestemmingen().find((b) => b.id === id);
                invoer.value = b ? `${b.label} (${b.verdieping.naam})` : id;
            } else invoer.value = '';
            lijst.hidden = true;
            invoer.blur();
            if (!stil) opKies(id);
        }

        invoer.addEventListener('focus', () => { invoer.select(); toon(); });
        invoer.addEventListener('input', () => { waarde = null; toon(); });
        // Tik je in de lijst, dan gaat de focus naar de lijst zelf (en blijft hij open, ook tijdens scrollen)
        lijst.tabIndex = -1;
        // Met de muis: niet het invoerveld verlaten als je in de lijst klikt (de lijst blijft dan open)
        lijst.addEventListener('pointerdown', (e) => { if (e.pointerType === 'mouse') e.preventDefault(); });
        // Lijst sluiten als je ergens anders tikt. Niet bij 'blur', want op een telefoon gaat het
        // invoerveld uit focus zodra je de lijst aanraakt om te scrollen.
        document.addEventListener('pointerdown', (e) => { if (!houder.contains(e.target)) lijst.hidden = true; });
        invoer.addEventListener('blur', () => setTimeout(() => {
            if (!houder.contains(document.activeElement) && !lijst.matches(':hover')) lijst.hidden = true;
        }, 150));
        invoer.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const eerste = lijst.querySelector('li[data-id]');
                if (eerste) kies(eerste.dataset.id);
            } else if (e.key === 'Escape') {
                lijst.hidden = true;
                invoer.blur();
            }
        });

        return { get waarde() { return waarde; }, kies };
    }

    const kiezerVan = maakKiezer($('kiezerVan'), {
        metGps: true,
        opKies: (id) => {
            staat.van = id;
            if (id === GPS_OPTIE) kiesMijnLocatie();
            else if (id) toonKnoop(id);
        },
    });
    const kiezerNaar = maakKiezer($('kiezerNaar'), {
        opKies: (id) => {
            staat.naar = id;
            if (id) toonKnoop(id);
        },
    });

    function toonKnoop(id) {
        const k = Route.knopen[id];
        if (!k) return;
        if (k.lokaal || k.naam) staat.infoLokaal = id;
        if (Kaart.verdieping.id !== k.verdieping) toonVerdieping(k.verdieping);
        Kaart.centreer(k.x, k.y, 2.5);
        tekenInfo();
    }

    $('knopWissel').addEventListener('click', () => {
        const van = staat.van, naar = staat.naar;
        if (van === GPS_OPTIE) return melding('Je GPS-locatie kan geen bestemming zijn.');
        staat.van = naar; staat.naar = van;
        kiezerVan.kies(naar, true);
        kiezerNaar.kies(van, true);
    });

    $('knopMijnLocatie').addEventListener('click', kiesMijnLocatie);

    // Keuzevenster met knoppen. opties: [{ waarde, kort, tekst, actief }]. Geeft de gekozen waarde of null.
    function vraag(titel, uitleg, opties) {
        const dlg = $('keuzeVraag');
        $('keuzeTitel').textContent = titel;
        $('keuzeUitleg').textContent = uitleg;
        $('keuzeOpties').replaceChildren(...opties.map((o) => {
            const knop = document.createElement('button');
            knop.value = o.waarde;
            knop.className = o.actief ? 'knop primair' : 'knop';
            knop.innerHTML = '<b></b> <span></span>';
            knop.firstChild.textContent = o.kort;
            knop.lastChild.textContent = o.tekst;
            return knop;
        }));
        dlg.returnValue = '';
        dlg.showModal();
        return new Promise((klaar) => dlg.addEventListener('close', () => klaar(dlg.returnValue || null), { once: true }));
    }

    // GPS weet niet op welke verdieping je bent, dus dat vragen we
    function vraagVerdieping() {
        return vraag('Op welke verdieping ben je?', 'GPS weet waar je in het gebouw bent, maar niet op welke verdieping.',
            [...GEBOUW.verdiepingen].sort((a, b) => b.niveau - a.niveau).map((v) => ({
                waarde: v.id,
                kort: v.kort,
                tekst: Gps.isGekalibreerd(v.id) ? v.naam : `${v.naam} (geen GPS)`,
                actief: v.id === staat.gpsVerdieping,
            })));
    }

    // Wacht (maximaal een paar seconden) op een verse GPS-positie
    function wachtOpPositie(maxMs = 8000) {
        const vers = () => Gps.laatste && Date.now() - Gps.laatste.tijd < 15000;
        return new Promise((klaar) => {
            const begin = Date.now();
            const kijk = () => {
                if (vers() || Date.now() - begin > maxMs) return klaar(vers() ? Gps.laatste : null);
                setTimeout(kijk, 250);
            };
            kijk();
        });
    }

    // GPS is binnen 5-30 m nauwkeurig: te grof om zeker te weten in welk lokaal je bent.
    // Daarom laten we de lokalen (en plekken zoals de ingang) in de buurt zien en kiest de gebruiker.
    const GANG = '__gang__';
    function vraagLokaal(verdiepingId, positie) {
        const pos = Gps.naarKaart(positie, verdiepingId);
        const hier = { verdieping: verdiepingId, x: pos.x, y: pos.y };
        const straal = Math.max(15, positie.nauwkeurigheid * 1.5);
        const inDeBuurt = Route.bestemmingen()
            .filter((b) => b.verdieping.id === verdiepingId)
            .map((b) => ({ ...b, meters: Route.afstand(Route.knopen[b.id], hier) }))
            .sort((a, b) => a.meters - b.meters);
        // Alles binnen het bereik van de GPS, maar altijd minstens 3 en hooguit 6 keuzes
        const lijst = inDeBuurt.filter((b, i) => i < 3 || b.meters <= straal).slice(0, 6);
        return vraag('Waar ben je precies?', `Dit is wat er in de buurt is (GPS ±${Math.round(positie.nauwkeurigheid)} m). Tik aan waar je nu bent.`, [
            ...lijst.map((b) => ({ waarde: b.id, kort: '🚪', tekst: `${b.label}  ·  ± ${Math.max(1, Math.round(b.meters))} m` })),
            { waarde: GANG, kort: '🚶', tekst: 'Ik sta in de gang' },
        ]);
    }

    async function kiesMijnLocatie() {
        kiezerVan.kies(GPS_OPTIE, true);
        staat.van = GPS_OPTIE;
        const terug = () => { kiezerVan.kies(null, true); staat.van = null; staat.gpsVerdieping = null; };

        const id = await vraagVerdieping();
        if (!id) return terug();
        toonVerdieping(id);
        if (!gebruikGps(id)) return terug();
        staat.gpsVerdieping = id;
        $('vanInvoer').value = `📍 Mijn locatie (${Route.verdieping(id).naam})`;

        const positie = await wachtOpPositie();
        if (!positie) return melding('Nog geen GPS-positie gevonden. Je kunt ook zelf je startpunt in de lijst kiezen.');
        const pos = Gps.naarKaart(positie, id);
        Kaart.centreer(pos.x, pos.y, 2.5);
        zetVolgen(true);

        const plek = await vraagLokaal(id, positie);
        if (!plek) return terug();
        if (plek === GANG) return; // route start bij het dichtstbijzijnde gangpunt
        // Een echt lokaal als startpunt: de route begint dan met "Verlaat lokaal ... en ga de gang in"
        staat.van = plek;
        staat.gpsVerdieping = null;
        kiezerVan.kies(plek, true);
        toonKnoop(plek);
    }

    // Tikken op de kaart
    Kaart.opTik((p, knoop) => {
        if (Editor.actief) return Editor.tik(p, knoop);
        // Tik op een lokaal = kies als bestemming
        let beste = null, afstand = Infinity;
        for (const k of Object.values(Route.knopen)) {
            if (!k.lokaal || k.verdieping !== Kaart.verdieping.id) continue;
            const d = Route.afstand(k, { verdieping: k.verdieping, x: p.x, y: p.y });
            if (d < afstand) { afstand = d; beste = k; }
        }
        if (beste && afstand < 6) toonInfoLokaal(beste.id);
        if (beste && afstand < 6 && !staat.route) {
            kiezerNaar.kies(beste.id, true);
            staat.naar = beste.id;
            Kaart.teken();
            melding(`Bestemming: ${beste.label}. Druk op "Start route".`, false);
        }
    });
    Kaart.opSlepen(Editor.sleepStart, Editor.sleepBeweeg, Editor.sleepEind);

    // ---------- Meldingen ----------

    let meldingTimer;
    function melding(tekst, fout = true) {
        const el = $('melding');
        el.textContent = tekst;
        el.classList.toggle('fout', fout);
        el.hidden = false;
        clearTimeout(meldingTimer);
        meldingTimer = setTimeout(() => (el.hidden = true), 6000);
    }

    // ---------- GPS ----------

    const gpsStatus = $('gpsStatus');
    // Hoeveel metingen er binnenkomen en hoe oud de laatste is. Zo zie je of het apparaat
    // echt nieuwe posities doorgeeft (laptops zonder GPS doen dat vaak maar zelden).
    let aantalMetingen = 0;
    let gpsStatusTekst = '';
    function werkGpsStatusBij() {
        if (!gpsStatusTekst || !Gps.laatste) return;
        const sec = Math.max(0, Math.round((Date.now() - Gps.laatste.tijd) / 1000));
        let hoogte = '';
        if (staat.toonHoogte) {
            const h = Gps.laatste.hoogte;
            hoogte = h == null
                ? ' · hoogte: niet beschikbaar'
                : ` · hoogte ${h.toFixed(1)} m${Gps.laatste.hoogteNauwkeurigheid != null ? ` (±${Math.round(Gps.laatste.hoogteNauwkeurigheid)} m)` : ''}`;
        }
        gpsStatus.textContent = `${gpsStatusTekst} · ${aantalMetingen} metingen · ${sec < 2 ? 'net' : `${sec} s geleden`}${hoogte}`;
    }
    setInterval(() => { if (Gps.actief) werkGpsStatusBij(); }, 1000);
    Gps.opFout((tekst) => {
        gpsStatus.hidden = false;
        gpsStatus.textContent = `⚠️ ${tekst}`;
        gpsStatus.classList.add('fout');
    });

    function gebruikGps(verdiepingId = Kaart.verdieping.id) {
        if (!window.isSecureContext) {
            melding('GPS werkt alleen via https:// of op localhost.');
            return false;
        }
        Gps.start();
        gpsStatus.hidden = false;
        if (!Gps.laatste) gpsStatus.textContent = 'GPS zoeken…';
        if (!Gps.isGekalibreerd(verdiepingId)) {
            melding(verdiepingId === 'K'
                ? 'In de kelder werkt GPS niet. Kies je startpunt in de lijst.'
                : 'GPS-locatie is nog niet ingesteld voor dit gebouw. Kies je startpunt in de lijst.');
            return false;
        }
        return true;
    }

    // Het bolletje glijdt in ongeveer een seconde naar de nieuwe positie in plaats van te springen.
    // We schuiven in lat/lon, zodat het op elke verdieping hetzelfde werkt.
    const GLIJDEN_MS = 900;
    let animatie = null, eindTimer = null;
    function schuifBolletje(doel) {
        cancelAnimationFrame(animatie);
        clearTimeout(eindTimer);
        if (!gpsWeergave) { gpsWeergave = { ...doel }; Kaart.teken(); return; }
        const van = { ...gpsWeergave };
        const begin = performance.now();
        const stap = () => {
            const t = Math.min((performance.now() - begin) / GLIJDEN_MS, 1);
            const e = 1 - (1 - t) ** 3; // rustig afremmen
            gpsWeergave = {
                lat: van.lat + (doel.lat - van.lat) * e,
                lon: van.lon + (doel.lon - van.lon) * e,
                nauwkeurigheid: van.nauwkeurigheid + (doel.nauwkeurigheid - van.nauwkeurigheid) * e,
                tijd: doel.tijd,
            };
            Kaart.teken();
            if (t < 1) animatie = requestAnimationFrame(stap);
        };
        animatie = requestAnimationFrame(stap);
        // Vangnet: als de browser geen animatieframes geeft (tabblad op de achtergrond), toch op de juiste plek eindigen
        eindTimer = setTimeout(() => {
            cancelAnimationFrame(animatie);
            gpsWeergave = { ...doel };
            Kaart.teken();
        }, GLIJDEN_MS + 100);
    }

    Gps.opPositie((p) => {
        gpsStatus.hidden = false;
        gpsStatus.classList.toggle('fout', p.nauwkeurigheid > 30);
        const pos = Gps.naarKaart(p, Kaart.verdieping.id);
        const buiten = pos && (pos.x < -15 || pos.x > 115 || pos.y < -15 || pos.y > 115);
        aantalMetingen++;
        gpsStatusTekst = `📍 GPS ±${Math.round(p.nauwkeurigheid)} m${buiten ? ' (je bent niet bij het gebouw)' : ''}`;
        werkGpsStatusBij();

        schuifBolletje(p);
        // De kaart schuift mee zodat je bolletje in beeld blijft, bijvoorbeeld als je naar de andere vleugel loopt
        if (pos && staat.volgen && !buiten) Kaart.centreer(pos.x, pos.y);

        if (staat.route) controleerVoortgang(p);
    });

    function zetVolgen(aan) {
        staat.volgen = aan;
        $('knopVolg').classList.toggle('actief', aan);
        const pos = aan && Gps.laatste && Gps.naarKaart(Gps.laatste, Kaart.verdieping.id);
        if (pos) Kaart.centreer(pos.x, pos.y);
    }

    $('knopVolg').addEventListener('click', () => {
        if (staat.volgen) return zetVolgen(false);
        if (gebruikGps()) zetVolgen(true);
    });

    // Zelf de kaart verschuiven of zoomen = even niet meebewegen (anders trekt de kaart je steeds terug)
    Kaart.opHandmatig(() => {
        if (!staat.volgen) return;
        zetVolgen(false);
        melding('Meebewegen staat even uit. Druk op ◎ om je locatie weer te volgen.', false);
    });

    // Tijdens het lopen: ben je dicht genoeg bij het doel van deze stap?
    function controleerVoortgang(p) {
        const stap = staat.route.stappen[staat.stap];
        const afstandEl = $('stapAfstand');
        if (stap && stap.wissel) return controleerWissel(stap, p);
        if (!stap || stap.einde) { afstandEl.hidden = true; return; }
        const pos = Gps.naarKaart(p, stap.naar.verdieping);
        if (!pos) { afstandEl.hidden = true; return; }

        const meters = Route.afstand({ verdieping: stap.naar.verdieping, x: pos.x, y: pos.y }, stap.naar);
        afstandEl.hidden = false;
        afstandEl.textContent = p.nauwkeurigheid > 30
            ? `GPS is nu onnauwkeurig (±${Math.round(p.nauwkeurigheid)} m)`
            : `Nog ongeveer ${Math.round(meters)} m tot het volgende punt`;

        const drempel = Math.max(4, Math.min(p.nauwkeurigheid * 0.5, 8));
        if (staat.autoVolgende && p.nauwkeurigheid <= 25 && meters < drempel) gaNaarStap(staat.stap + 1);
    }

    // Trap of lift nemen. GPS weet niet op welke verdieping je bent, maar wel waar je bent:
    // eerst sta je bij de trap/lift, en als je daarna weer wegloopt ben je op de nieuwe verdieping.
    // Dan schakelt de app vanzelf door naar de volgende stap (en dus naar de plattegrond van die verdieping).
    function controleerWissel(stap, p) {
        const afstandEl = $('stapAfstand');
        // Trappen en liften liggen recht boven elkaar, dus we meten vanaf het punt op de verdieping met GPS
        const verdiepingId = Gps.isGekalibreerd(stap.van.verdieping) ? stap.van.verdieping : stap.naar.verdieping;
        const knoop = verdiepingId === stap.van.verdieping ? stap.van : stap.naar;
        const pos = Gps.naarKaart(p, verdiepingId);
        if (!pos || !Gps.isGekalibreerd(stap.naar.verdieping)) { afstandEl.hidden = true; return; }

        const meters = Route.afstand({ verdieping: verdiepingId, x: pos.x, y: pos.y }, knoop);
        const dichtbij = Math.max(6, Math.min(p.nauwkeurigheid * 0.6, 12));
        const goed = p.nauwkeurigheid <= 30;
        const soort = stap.van.verbinding && stap.van.verbinding.type === 'lift' ? 'de lift' : 'de trap';

        if (goed && meters < dichtbij) staat.bijWissel = true;
        afstandEl.hidden = false;
        if (!goed) afstandEl.textContent = `GPS is nu onnauwkeurig (±${Math.round(p.nauwkeurigheid)} m)`;
        else if (!staat.bijWissel) afstandEl.textContent = `Nog ongeveer ${Math.round(meters)} m tot ${soort}`;
        else afstandEl.textContent = `Neem ${soort}. Loop je daarna verder, dan gaat de kaart vanzelf naar ${Route.verdiepingNaam(stap.naar.verdieping)}.`;

        // Aangekomen op de nieuwe verdieping als je (na bij de trap/lift te zijn geweest) weer een eind
        // van de trap/lift vandaan bent, of al vlak bij waar je op die verdieping heen moet.
        // Dat laatste is nodig als het lokaal vlak naast de trap ligt.
        const pad = staat.route.pad;
        let doel = stap.naar;
        for (let i = pad.indexOf(stap.naar) + 1; i < pad.length && pad[i].verdieping === stap.naar.verdieping; i++) doel = pad[i];
        const posNieuw = Gps.naarKaart(p, stap.naar.verdieping);
        const totDoel = Route.afstand({ verdieping: stap.naar.verdieping, x: posNieuw.x, y: posNieuw.y }, doel);
        const aangekomen = meters > dichtbij + 3 || (doel !== stap.naar && totDoel < Math.max(5, p.nauwkeurigheid * 0.5));
        // Twee metingen achter elkaar, zodat één verspringende meting (bijv. wachten bij de lift) niet telt
        staat.wegVanWissel = goed && staat.bijWissel && aangekomen ? staat.wegVanWissel + 1 : 0;
        if (staat.autoVolgende && staat.wegVanWissel >= 2) {
            melding(`Je bent nu op ${Route.verdiepingNaam(stap.naar.verdieping)}.`, false);
            gaNaarStap(staat.stap + 1, Taal.t.nuOp(stap.naar.verdieping));
        }
    }

    // ---------- Route ----------

    $('knopStart').addEventListener('click', startRoute);

    async function startRoute() {
        let vanId = staat.van;
        if (!vanId) return melding('Kies eerst waar je bent (Van).');
        if (!staat.naar) return melding('Kies eerst waar je heen wilt (Naar).');

        if (vanId === GPS_OPTIE) {
            if (!staat.gpsVerdieping) await kiesMijnLocatie();
            const verdiepingId = staat.gpsVerdieping;
            if (!verdiepingId) return;
            if (!gebruikGps(verdiepingId)) return;
            const pos = Gps.laatste && Gps.naarKaart(Gps.laatste, verdiepingId);
            if (!pos) return melding('Nog geen GPS-positie. Wacht even en probeer het opnieuw.');
            const knoop = Route.dichtstbij(verdiepingId, pos.x, pos.y);
            if (!knoop) return melding('Geen looppad gevonden op deze verdieping.');
            vanId = knoop.id;
        }
        if (vanId === staat.naar) return melding('Je bent er al!', false);

        const voorkeur = trapOfLift();
        const route = Route.plan(vanId, staat.naar, { voorkeur });
        if (!route) {
            return melding(voorkeur
                ? `Er is geen route gevonden met alleen de ${voorkeur}. Kies "Maakt niet uit" en probeer het opnieuw.`
                : 'Er is geen route gevonden.');
        }

        staat.route = route;
        $('planner').hidden = true;
        $('navigatie').hidden = false;
        document.body.classList.add('navigeren');
        $('routeInfo').textContent = `± ${route.meters} m lopen`;

        $('stappenLijst').replaceChildren(...route.stappen.map((s, i) => {
            const li = document.createElement('li');
            li.addEventListener('click', () => gaNaarStap(i));
            return li;
        }));
        toonStapTeksten();

        if (Gps.isGekalibreerd(route.pad[0].verdieping)) {
            // Werd GPS al gebruikt (Mijn locatie)? Dan beweegt de kaart tijdens het lopen met je mee
            if (Gps.laatste) zetVolgen(true);
            Gps.start();
        }
        schermAanHouden(true);
        gaNaarStap(0);
    }

    // Stap-teksten in de taal van de gekozen stem (Arabisch van rechts naar links)
    function toonStapTeksten() {
        if (!staat.route) return;
        for (const el of [$('stapTekst'), $('stappenLijst')]) {
            el.lang = Taal.code;
            el.dir = Taal.t.rtl ? 'rtl' : 'ltr';
        }
        $('stapTekst').textContent = staat.route.stappen[staat.stap].tekst;
        [...$('stappenLijst').children].forEach((li, j) => (li.textContent = staat.route.stappen[j].tekst));
    }

    function gaNaarStap(i, voorzin = '') {
        const route = staat.route;
        if (!route) return;
        staat.stap = Math.max(0, Math.min(i, route.stappen.length - 1));
        staat.bijWissel = false;
        staat.wegVanWissel = 0;
        const stap = route.stappen[staat.stap];

        $('stapTekst').textContent = stap.tekst;
        $('stapTeller').textContent = `Stap ${staat.stap + 1} van ${route.stappen.length}`;
        $('knopVorige').disabled = staat.stap === 0;
        $('knopVolgende').textContent = stap.einde ? 'Klaar ✓' : 'Volgende ›';
        $('stapAfstand').hidden = true;
        [...$('stappenLijst').children].forEach((li, j) => {
            li.classList.toggle('huidig', j === staat.stap);
            li.classList.toggle('gedaan', j < staat.stap);
        });

        if (Kaart.verdieping.id !== stap.verdieping) toonVerdieping(stap.verdieping);
        else werkVerdiepingKnoppenBij();
        const gebied = route.pad
            .slice(route.pad.indexOf(stap.van), route.pad.indexOf(stap.naar, route.pad.indexOf(stap.van)) + 1)
            .filter((k) => k.verdieping === stap.verdieping);
        Kaart.toonGebied(gebied.length ? gebied : [stap.van]);

        Stem.zeg(i === 0 ? `${Taal.t.start} ${stap.tekst}` : voorzin ? `${voorzin} ${stap.tekst}` : stap.tekst);
        if (navigator.vibrate) navigator.vibrate(stap.einde ? [100, 80, 100, 80, 200] : 120);
    }

    $('knopVorige').addEventListener('click', () => gaNaarStap(staat.stap - 1));
    $('knopVolgende').addEventListener('click', () => {
        if (staat.route.stappen[staat.stap].einde) stopRoute();
        else gaNaarStap(staat.stap + 1);
    });
    $('knopHerhaal').addEventListener('click', () => Stem.zeg(staat.route.stappen[staat.stap].tekst));
    $('knopStop').addEventListener('click', stopRoute);

    function stopRoute() {
        staat.route = null;
        staat.stap = 0;
        $('planner').hidden = false;
        $('navigatie').hidden = true;
        document.body.classList.remove('navigeren');
        if ('speechSynthesis' in window) speechSynthesis.cancel();
        schermAanHouden(false);
        werkVerdiepingKnoppenBij();
        Kaart.teken();
    }

    // Scherm niet laten uitgaan tijdens het lopen
    let wakeLock = null;
    async function schermAanHouden(aan) {
        try {
            if (aan && 'wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen');
            else if (!aan && wakeLock) { await wakeLock.release(); wakeLock = null; }
        } catch (e) { /* niet ondersteund of geweigerd */ }
    }
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && staat.route) schermAanHouden(true);
    });

    // ---------- Instellingen ----------

    const dialoog = $('instellingen');
    $('knopInstellingen').addEventListener('click', () => {
        $('stemAan').checked = Stem.aan;
        $('stemAan').disabled = !Stem.beschikbaar;
        $('versieInfo').textContent = `Versie ${VERSIE} · ${window.isSecureContext ? 'beveiligde verbinding (GPS toegestaan)' : 'GEEN https: GPS wordt geblokkeerd'}`;
        $('stemInfo').textContent = !Stem.beschikbaar
            ? 'Spraak wordt niet ondersteund door deze browser.'
            : Stem.heeftNederlandseStem ? '' : 'Let op: er is geen Nederlandse stem gevonden op dit apparaat.';
        vulStemKeuze();
        $('autoVolgende').checked = staat.autoVolgende;
        $('toonHoogte').checked = staat.toonHoogte;
        $('exportVeld').hidden = true;
        dialoog.showModal();
    });

    $('stemAan').addEventListener('change', (e) => {
        Stem.zetAan(e.target.checked);
        $('stemKeuze').disabled = !e.target.checked;
        if (e.target.checked) Stem.zeg(Taal.t.hallo);
    });
    // De stemmen op dit apparaat, per taal. Kies je een stem in een andere taal,
    // dan krijg je de route-instructies ook in die taal (zie taal.js).
    function vulStemKeuze() {
        const keuze = $('stemKeuze');
        const optie = (s) => new Option(`${s.naam}${s.vrouw ? ' ♀' : ''}${s.offline ? '' : ' (alleen met internet)'} [${s.taal}]`, s.naam);
        const groep = (label, lijst) => {
            const g = document.createElement('optgroup');
            g.label = label;
            g.append(...lijst.map(optie));
            return g;
        };
        keuze.replaceChildren(new Option('Automatisch (Nederlandse vrouwenstem als die er is)', ''));
        const talen = [...new Set(Stem.stemmen.map((s) => s.taalCode))];
        for (const code of talen) {
            const lijst = Stem.stemmen.filter((s) => s.taalCode === code);
            keuze.append(groep(`${code === 'nl' ? 'Nederlands / Vlaams' : Taal.naamVan(code)} (${lijst.length})`, lijst));
        }
        keuze.value = Stem.gekozen || '';
        keuze.disabled = !Stem.aan || !Stem.stemmen.length;
    }
    $('stemKeuze').addEventListener('change', (e) => {
        Stem.kies(e.target.value || null);
        toonStapTeksten(); // loop je al een route, dan staan de stappen meteen in de nieuwe taal
        Stem.zeg(Taal.t.proef);
    });
    $('toonHoogte').addEventListener('change', (e) => {
        staat.toonHoogte = e.target.checked;
        try { localStorage.setItem('gebouwroute-hoogte', staat.toonHoogte ? 'aan' : 'uit'); } catch (err) { /* niet opgeslagen */ }
        werkGpsStatusBij();
    });
    $('autoVolgende').addEventListener('change', (e) => {
        staat.autoVolgende = e.target.checked;
        try { localStorage.setItem('gebouwroute-auto', staat.autoVolgende ? 'aan' : 'uit'); } catch (err) { /* niet opgeslagen */ }
    });

    // Bewerkmodus
    const bewerkBalk = $('bewerkBalk');
    $('knopBewerk').addEventListener('click', () => {
        dialoog.close();
        if (staat.route) stopRoute();
        Editor.actief = true;
        bewerkBalk.hidden = false;
        document.body.classList.add('bewerken');
        if (!isSmal()) zetInfoOpen(true);
        tekenInfo();
    });
    bewerkBalk.querySelectorAll('[data-gereedschap]').forEach((knop) => {
        knop.addEventListener('click', () => {
            Editor.gereedschap = knop.dataset.gereedschap;
            bewerkBalk.querySelectorAll('[data-gereedschap]').forEach((k) => k.classList.toggle('actief', k === knop));
        });
    });
    $('bewerkKlaar').addEventListener('click', () => {
        Editor.actief = false;
        bewerkBalk.hidden = true;
        document.body.classList.remove('bewerken');
        tekenInfo();
    });
    Editor.opWijziging = () => { /* netwerk is al opnieuw opgebouwd in Editor */ };

    $('knopExport').addEventListener('click', async () => {
        const veld = $('exportVeld');
        veld.value = Editor.exporteer();
        veld.hidden = false;
        veld.select();
        try {
            await navigator.clipboard.writeText(veld.value);
            melding('Data gekopieerd. Plak dit in data.js in plaats van GEBOUW_STANDAARD.', false);
        } catch (e) { /* kopieer handmatig uit het tekstvak */ }
    });

    $('knopHerstel').addEventListener('click', () => {
        if (confirm('Alle wijzigingen uit de bewerkmodus (looppaden, lokalen en teksten) op dit apparaat verwijderen?')) Editor.herstel();
    });
});
