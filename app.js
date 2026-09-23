/*
 * APP
 * Verbindt alles: de keuzevelden, de kaart, de route, GPS en de stem.
 */
document.addEventListener('DOMContentLoaded', () => {
    const $ = (id) => document.getElementById(id);
    const GPS_OPTIE = '__gps__';

    const staat = {
        van: null,          // knoop-id of GPS_OPTIE
        naar: null,         // knoop-id
        route: null,        // { pad, stappen, meters }
        stap: 0,
        volgen: false,      // kaart meebewegen met GPS
        kalibratie: null,   // lopende kalibratiemeting
        autoVolgende: true,
    };

    try { staat.autoVolgende = localStorage.getItem('gebouwroute-auto') !== 'uit'; } catch (e) { /* standaard */ }

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
        const pos = Gps.laatste && Gps.naarKaart(Gps.laatste, v.id);
        if (pos) {
            t.cirkelEchteMaat(pos, (pos.straal / 100) * v.hoogte, 'gps-bereik');
            t.cirkel(pos, 8, 'gps-punt');
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
            const resultaat = alle.slice(0, 60).map((b) => ({ id: b.id, label: b.label, sub: b.verdieping.naam }));
            if (metGps && !zoek) resultaat.unshift({ id: GPS_OPTIE, label: '📍 Mijn locatie (GPS)', sub: 'Kies ook de verdieping op de kaart' });
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
                li.addEventListener('pointerdown', (e) => { e.preventDefault(); kies(o.id); });
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
        invoer.addEventListener('blur', () => setTimeout(() => (lijst.hidden = true), 150));
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
            if (id === GPS_OPTIE) gebruikGps();
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
        if (Kaart.verdieping.id !== k.verdieping) toonVerdieping(k.verdieping);
        Kaart.centreer(k.x, k.y, 2.5);
    }

    $('knopWissel').addEventListener('click', () => {
        const van = staat.van, naar = staat.naar;
        if (van === GPS_OPTIE) return melding('Je GPS-locatie kan geen bestemming zijn.');
        staat.van = naar; staat.naar = van;
        kiezerVan.kies(naar, true);
        kiezerNaar.kies(van, true);
    });

    $('knopMijnLocatie').addEventListener('click', () => {
        kiezerVan.kies(GPS_OPTIE, true);
        staat.van = GPS_OPTIE;
        gebruikGps();
    });

    // Tikken op de kaart
    Kaart.opTik((p, knoop) => {
        if (staat.kalibratie && staat.kalibratie.meting) return rondKalibratieAf(p);
        if (Editor.actief) return Editor.tik(p, knoop);
        // Tik op een lokaal = kies als bestemming
        let beste = null, afstand = Infinity;
        for (const k of Object.values(Route.knopen)) {
            if (!k.lokaal || k.verdieping !== Kaart.verdieping.id) continue;
            const d = Route.afstand(k, { verdieping: k.verdieping, x: p.x, y: p.y });
            if (d < afstand) { afstand = d; beste = k; }
        }
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
    Gps.opFout((tekst) => {
        gpsStatus.hidden = false;
        gpsStatus.textContent = `⚠️ ${tekst}`;
        gpsStatus.classList.add('fout');
    });

    function gebruikGps() {
        if (!window.isSecureContext) {
            melding('GPS werkt alleen via https:// of op localhost.');
            return false;
        }
        Gps.start();
        gpsStatus.hidden = false;
        if (!Gps.laatste) gpsStatus.textContent = 'GPS zoeken…';
        if (!Gps.isGekalibreerd(Kaart.verdieping.id)) {
            melding('De GPS is nog niet gekalibreerd voor dit gebouw. Zie ⚙️ Instellingen → GPS kalibreren. Kies anders je startpunt in de lijst.');
            return false;
        }
        return true;
    }

    Gps.opPositie((p) => {
        gpsStatus.hidden = false;
        gpsStatus.classList.toggle('fout', p.nauwkeurigheid > 30);
        const gekalibreerd = Gps.isGekalibreerd(Kaart.verdieping.id);
        gpsStatus.textContent = `📍 GPS ±${Math.round(p.nauwkeurigheid)} m${gekalibreerd ? '' : ' (niet gekalibreerd)'}`;

        const pos = Gps.naarKaart(p, Kaart.verdieping.id);
        if (pos && staat.volgen) Kaart.centreer(pos.x, pos.y);
        else Kaart.teken();

        if (staat.route) controleerVoortgang(p);
    });

    $('knopVolg').addEventListener('click', () => {
        staat.volgen = !staat.volgen;
        $('knopVolg').classList.toggle('actief', staat.volgen);
        if (staat.volgen && gebruikGps()) {
            const pos = Gps.laatste && Gps.naarKaart(Gps.laatste, Kaart.verdieping.id);
            if (pos) Kaart.centreer(pos.x, pos.y, 3);
        }
    });

    // Tijdens het lopen: ben je dicht genoeg bij het doel van deze stap?
    function controleerVoortgang(p) {
        const stap = staat.route.stappen[staat.stap];
        const afstandEl = $('stapAfstand');
        if (!stap || stap.wissel || stap.einde) { afstandEl.hidden = true; return; }
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

    // ---------- Route ----------

    $('knopStart').addEventListener('click', startRoute);

    function startRoute() {
        let vanId = staat.van;
        if (!vanId) return melding('Kies eerst waar je bent (Van).');
        if (!staat.naar) return melding('Kies eerst waar je heen wilt (Naar).');

        if (vanId === GPS_OPTIE) {
            if (!gebruikGps()) return;
            const pos = Gps.laatste && Gps.naarKaart(Gps.laatste, Kaart.verdieping.id);
            if (!pos) return melding('Nog geen GPS-positie. Wacht even en probeer het opnieuw.');
            const knoop = Route.dichtstbij(Kaart.verdieping.id, pos.x, pos.y);
            if (!knoop) return melding('Geen looppad gevonden op deze verdieping.');
            vanId = knoop.id;
        }
        if (vanId === staat.naar) return melding('Je bent er al!', false);

        const route = Route.plan(vanId, staat.naar, { vermijdTrappen: $('vermijdTrappen').checked });
        if (!route) return melding('Er is geen route gevonden. Probeer "Vermijd trappen" uit te zetten.');

        staat.route = route;
        $('planner').hidden = true;
        $('navigatie').hidden = false;
        document.body.classList.add('navigeren');
        $('routeInfo').textContent = `± ${route.meters} m lopen`;

        const lijst = $('stappenLijst');
        lijst.replaceChildren(...route.stappen.map((s, i) => {
            const li = document.createElement('li');
            li.textContent = s.tekst;
            li.addEventListener('click', () => gaNaarStap(i));
            return li;
        }));

        if (Gps.isGekalibreerd(route.pad[0].verdieping)) Gps.start();
        schermAanHouden(true);
        gaNaarStap(0);
    }

    function gaNaarStap(i) {
        const route = staat.route;
        if (!route) return;
        staat.stap = Math.max(0, Math.min(i, route.stappen.length - 1));
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

        Stem.zeg(stap.tekst);
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
        $('stemInfo').textContent = !Stem.beschikbaar
            ? 'Spraak wordt niet ondersteund door deze browser.'
            : Stem.heeftNederlandseStem ? '' : 'Let op: er is geen Nederlandse stem gevonden op dit apparaat.';
        $('autoVolgende').checked = staat.autoVolgende;
        werkKalibratieInfoBij();
        $('exportVeld').hidden = true;
        dialoog.showModal();
    });

    $('stemAan').addEventListener('change', (e) => {
        Stem.zetAan(e.target.checked);
        if (e.target.checked) Stem.zeg('Gesproken instructies staan aan.');
    });
    $('autoVolgende').addEventListener('change', (e) => {
        staat.autoVolgende = e.target.checked;
        try { localStorage.setItem('gebouwroute-auto', staat.autoVolgende ? 'aan' : 'uit'); } catch (err) { /* niet opgeslagen */ }
    });

    function werkKalibratieInfoBij() {
        const punten = Gps.kalibratiePunten();
        const gebouw = punten.filter((p) => p.verdieping !== 'K').length;
        const kelder = punten.length - gebouw;
        $('kalibratieInfo').textContent = `Kalibratiepunten: ${gebouw} in het gebouw${kelder ? `, ${kelder} in de kelder` : ''}. `
            + (Gps.isGekalibreerd('0') ? '✅ GPS-positie wordt getoond.' : 'Nog minimaal 2 punten nodig.');
    }

    // Kalibratie: 1) GPS meten, 2) op de kaart tikken waar je staat
    $('knopKalibreer').addEventListener('click', async () => {
        dialoog.close();
        if (!window.isSecureContext) return melding('GPS werkt alleen via https:// of op localhost.');
        const balk = $('kalibratieBalk');
        const tekst = $('kalibratieTekst');
        balk.hidden = false;
        staat.kalibratie = { meting: null };
        tekst.textContent = 'Blijf stilstaan… GPS wordt gemeten (15 sec)';
        try {
            const meting = await Gps.meetGemiddelde(15000, (n, nauw) => {
                tekst.textContent = `Blijf stilstaan… ${n} metingen (±${Math.round(nauw)} m)`;
            });
            if (!staat.kalibratie) return; // geannuleerd
            staat.kalibratie.meting = meting;
            tekst.textContent = `Gemeten (±${Math.round(meting.nauwkeurigheid)} m). Kies de juiste verdieping en tik op de kaart waar je staat.`;
            Stem.zeg('Tik nu op de kaart waar je staat.');
        } catch (e) {
            tekst.textContent = `Mislukt: ${e.message}`;
            staat.kalibratie = null;
            setTimeout(() => (balk.hidden = true), 4000);
        }
    });

    function rondKalibratieAf(p) {
        const m = staat.kalibratie.meting;
        Gps.voegKalibratieToe({
            lat: m.lat, lon: m.lon, nauwkeurigheid: Math.round(m.nauwkeurigheid),
            verdieping: Kaart.verdieping.id, x: Math.round(p.x * 10) / 10, y: Math.round(p.y * 10) / 10,
        });
        staat.kalibratie = null;
        $('kalibratieBalk').hidden = true;
        const n = Gps.kalibratiePunten().length;
        melding(n < 2
            ? 'Punt opgeslagen! Voeg nog een punt toe, minstens 20 meter verderop.'
            : `Punt opgeslagen (${n} punten). Je GPS-positie wordt nu op de kaart getoond.`, false);
        Kaart.teken();
    }

    $('kalibratieAnnuleer').addEventListener('click', () => {
        staat.kalibratie = null;
        $('kalibratieBalk').hidden = true;
    });

    $('knopWisKalibratie').addEventListener('click', () => {
        if (!confirm('Alle kalibratiepunten die je op dit apparaat hebt gemaakt wissen?')) return;
        Gps.wisKalibratie();
        werkKalibratieInfoBij();
        Kaart.teken();
    });

    // Bewerkmodus
    const bewerkBalk = $('bewerkBalk');
    $('knopBewerk').addEventListener('click', () => {
        dialoog.close();
        if (staat.route) stopRoute();
        Editor.actief = true;
        bewerkBalk.hidden = false;
        document.body.classList.add('bewerken');
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
        if (confirm('Alle wijzigingen uit de bewerkmodus op dit apparaat verwijderen?')) Editor.herstel();
    });
});
