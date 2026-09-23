/*
 * GPS
 * Leest de locatie van het apparaat (werkt zonder internet, de GPS-chip heeft
 * geen internet nodig) en rekent die om naar een plek op de plattegrond.
 *
 * Daarvoor moet de app eerst "gekalibreerd" worden: op minstens 2 plekken die je
 * op de kaart kunt aanwijzen meet je de GPS-positie. Daaruit berekent de app
 * hoe de plattegrond op de wereldkaart ligt (verschuiving, draaiing en schaal).
 *
 * Let op: binnen in een gebouw is GPS vaak maar op 5-30 meter nauwkeurig en
 * weet GPS niet op welke verdieping je bent. Daarom kiest de gebruiker zelf de
 * verdieping, en kan de route ook altijd met de hand worden doorlopen.
 */
const Gps = (() => {
    const OPSLAG = 'gebouwroute-kalibratie';
    let watchId = null;
    let laatste = null; // { lat, lon, nauwkeurigheid, tijd }
    const luisteraars = [];
    let foutLuisteraar = () => {};

    // ---------- Locatie volgen ----------

    function start() {
        if (!('geolocation' in navigator)) {
            foutLuisteraar('Dit apparaat ondersteunt geen GPS-locatie.');
            return false;
        }
        if (watchId !== null) return true;
        watchId = navigator.geolocation.watchPosition(
            (pos) => {
                laatste = {
                    lat: pos.coords.latitude,
                    lon: pos.coords.longitude,
                    nauwkeurigheid: pos.coords.accuracy,
                    tijd: pos.timestamp,
                };
                luisteraars.forEach((f) => f(laatste));
            },
            (fout) => {
                const berichten = {
                    1: 'Geen toestemming voor je locatie. Sta locatie toe in de instellingen van je browser.',
                    2: 'Je locatie kan niet bepaald worden. Staat GPS/locatie aan op je telefoon?',
                    3: 'Het duurt te lang om je locatie te bepalen. Ga eventueel dichter bij een raam staan.',
                };
                foutLuisteraar(berichten[fout.code] || fout.message);
            },
            { enableHighAccuracy: true, maximumAge: 2000, timeout: 30000 }
        );
        return true;
    }

    function stop() {
        if (watchId !== null) navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }

    // Meet een tijdje en neem het gemiddelde (voor kalibratie). Betere metingen tellen zwaarder.
    function meetGemiddelde(duurMs, voortgang) {
        return new Promise((resolve, reject) => {
            const metingen = [];
            const luister = (p) => {
                metingen.push(p);
                voortgang && voortgang(metingen.length, p.nauwkeurigheid);
            };
            luisteraars.push(luister);
            if (!start()) return reject(new Error('Geen GPS'));
            if (laatste && Date.now() - laatste.tijd < 3000) luister(laatste);

            setTimeout(() => {
                luisteraars.splice(luisteraars.indexOf(luister), 1);
                if (!metingen.length) return reject(new Error('Geen GPS-meting ontvangen'));
                let som = 0, lat = 0, lon = 0, nauw = 0;
                for (const m of metingen) {
                    const gewicht = 1 / Math.max(m.nauwkeurigheid, 1) ** 2;
                    som += gewicht; lat += m.lat * gewicht; lon += m.lon * gewicht;
                    nauw = Math.min(nauw || Infinity, m.nauwkeurigheid);
                }
                resolve({ lat: lat / som, lon: lon / som, nauwkeurigheid: nauw, aantal: metingen.length });
            }, duurMs);
        });
    }

    // ---------- Kalibratie ----------

    function kalibratiePunten() {
        try {
            const eigen = JSON.parse(localStorage.getItem(OPSLAG) || '[]');
            return [...(GEBOUW.gpsKalibratie || []), ...eigen];
        } catch (e) {
            return GEBOUW.gpsKalibratie || [];
        }
    }

    function voegKalibratieToe(punt) {
        let eigen = [];
        try { eigen = JSON.parse(localStorage.getItem(OPSLAG) || '[]'); } catch (e) { /* leeg */ }
        eigen.push(punt);
        localStorage.setItem(OPSLAG, JSON.stringify(eigen));
    }

    function wisKalibratie() {
        localStorage.removeItem(OPSLAG);
    }

    // De kelder heeft een andere uitsnede dan de verdiepingen, die krijgt een eigen kalibratie
    const groep = (verdiepingId) => (verdiepingId === 'K' ? 'K' : 'gebouw');

    function verhouding(verdiepingId) {
        const v = GEBOUW.verdiepingen.find((v) => v.id === verdiepingId);
        return v.breedte / v.hoogte;
    }

    // lat/lon -> meters t.o.v. een referentiepunt (x = oost, y = zuid, zodat y net als op de kaart omlaag loopt)
    function naarMeters(lat, lon, ref) {
        return {
            x: (lon - ref.lon) * Math.cos((ref.lat * Math.PI) / 180) * 111320,
            y: -(lat - ref.lat) * 110540,
        };
    }

    // Berekent een gelijkvormigheidstransformatie w = a*z + t (complexe getallen)
    // van meters (z) naar kaartruimte (w) met de kleinste-kwadratenmethode.
    function transformatie(verdiepingId) {
        const punten = kalibratiePunten().filter((p) => groep(p.verdieping) === groep(verdiepingId));
        if (punten.length < 2) return null;
        const ref = punten[0];
        const z = punten.map((p) => naarMeters(p.lat, p.lon, ref));
        const w = punten.map((p) => ({ x: p.x * verhouding(p.verdieping), y: p.y }));
        const n = punten.length;
        const zg = { x: z.reduce((s, p) => s + p.x, 0) / n, y: z.reduce((s, p) => s + p.y, 0) / n };
        const wg = { x: w.reduce((s, p) => s + p.x, 0) / n, y: w.reduce((s, p) => s + p.y, 0) / n };

        let teller = { x: 0, y: 0 }, noemer = 0;
        for (let i = 0; i < n; i++) {
            const dz = { x: z[i].x - zg.x, y: z[i].y - zg.y };
            const dw = { x: w[i].x - wg.x, y: w[i].y - wg.y };
            // dw * conj(dz)
            teller.x += dw.x * dz.x + dw.y * dz.y;
            teller.y += dw.y * dz.x - dw.x * dz.y;
            noemer += dz.x * dz.x + dz.y * dz.y;
        }
        if (noemer < 4) return null; // punten liggen te dicht bij elkaar (< ~2 meter)
        const a = { x: teller.x / noemer, y: teller.y / noemer };
        const t = { x: wg.x - (a.x * zg.x - a.y * zg.y), y: wg.y - (a.x * zg.y + a.y * zg.x) };
        return { ref, a, t, eenhedenPerMeter: Math.hypot(a.x, a.y) };
    }

    // GPS-positie -> { x, y, straal } in procenten op de plattegrond van deze verdieping
    function naarKaart(positie, verdiepingId) {
        const tf = transformatie(verdiepingId);
        if (!tf || !positie) return null;
        const z = naarMeters(positie.lat, positie.lon, tf.ref);
        const wx = tf.a.x * z.x - tf.a.y * z.y + tf.t.x;
        const wy = tf.a.x * z.y + tf.a.y * z.x + tf.t.y;
        return {
            x: wx / verhouding(verdiepingId),
            y: wy,
            straal: positie.nauwkeurigheid * tf.eenhedenPerMeter, // in procenten van de hoogte
        };
    }

    return {
        start, stop, meetGemiddelde, naarKaart,
        kalibratiePunten, voegKalibratieToe, wisKalibratie,
        isGekalibreerd: (verdiepingId) => transformatie(verdiepingId) !== null,
        opPositie(f) { luisteraars.push(f); },
        opFout(f) { foutLuisteraar = f; },
        get laatste() { return laatste; },
        get actief() { return watchId !== null; },
    };
})();
