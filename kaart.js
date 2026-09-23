/*
 * KAART
 * Toont de plattegrond van één verdieping met daarover een SVG-laag voor de
 * route, je GPS-positie en (in bewerkmodus) alle punten.
 * Ondersteunt slepen, knijpen (pinch) en scrollen om te zoomen.
 */
const Kaart = (() => {
    const SVG = 'http://www.w3.org/2000/svg';
    let houder, laag, img, svg;
    let verdieping = null;              // huidig verdieping-object
    let schaal = 1, tx = 0, ty = 0;     // transformatie
    let minSchaal = 0.1;
    const pointers = new Map();
    let sleepStart = null;
    let tekenFunctie = () => {};        // wordt ingesteld door app.js
    const tikLuisteraars = [];
    const sleepLuisteraars = { start: null, beweeg: null, eind: null };

    function init(element) {
        houder = element;
        laag = document.createElement('div');
        laag.className = 'kaart-laag';
        img = document.createElement('img');
        img.alt = 'Plattegrond';
        img.draggable = false;
        svg = document.createElementNS(SVG, 'svg');
        laag.append(img, svg);
        houder.append(laag);

        houder.addEventListener('pointerdown', pointerDown);
        houder.addEventListener('pointermove', pointerMove);
        houder.addEventListener('pointerup', pointerUp);
        houder.addEventListener('pointercancel', pointerUp);
        houder.addEventListener('wheel', wiel, { passive: false });
        new ResizeObserver(() => { if (verdieping) passend(false); }).observe(houder);
    }

    function toonVerdieping(v, behoudZoom = false) {
        const zelfde = verdieping && verdieping.id === v.id;
        verdieping = v;
        img.src = v.afbeelding;
        img.alt = `Plattegrond ${v.naam}`;
        laag.style.width = `${v.breedte}px`;
        laag.style.height = `${v.hoogte}px`;
        svg.setAttribute('viewBox', `0 0 ${v.breedte} ${v.hoogte}`);
        svg.setAttribute('width', v.breedte);
        svg.setAttribute('height', v.hoogte);
        if (!(zelfde && behoudZoom)) passend(false);
        teken();
    }

    // ---------- Transformatie ----------

    function pasToe() {
        laag.style.transform = `translate(${tx}px, ${ty}px) scale(${schaal})`;
    }

    function passend(tekenen = true) {
        const b = houder.clientWidth, h = houder.clientHeight;
        minSchaal = Math.min(b / verdieping.breedte, h / verdieping.hoogte);
        schaal = minSchaal;
        tx = (b - verdieping.breedte * schaal) / 2;
        ty = (h - verdieping.hoogte * schaal) / 2;
        pasToe();
        if (tekenen) teken();
    }

    function zoomOm(factor, cx, cy) {
        const nieuw = Math.min(Math.max(schaal * factor, minSchaal * 0.8), minSchaal * 12);
        factor = nieuw / schaal;
        tx = cx - (cx - tx) * factor;
        ty = cy - (cy - ty) * factor;
        schaal = nieuw;
        pasToe();
        teken();
    }

    function zoom(factor) {
        zoomOm(factor, houder.clientWidth / 2, houder.clientHeight / 2);
    }

    // Centreer op een punt (in procenten), optioneel met een zoomniveau t.o.v. passend
    function centreer(x, y, zoomNiveau = null) {
        if (zoomNiveau) schaal = minSchaal * zoomNiveau;
        const px = (x / 100) * verdieping.breedte * schaal;
        const py = (y / 100) * verdieping.hoogte * schaal;
        tx = houder.clientWidth / 2 - px;
        ty = houder.clientHeight / 2 - py;
        laag.classList.add('animeer');
        pasToe();
        teken();
        setTimeout(() => laag.classList.remove('animeer'), 350);
    }

    // Zoom zo dat een lijst met punten (procenten) in beeld is
    function toonGebied(punten) {
        if (!punten.length) return;
        const xs = punten.map((p) => (p.x / 100) * verdieping.breedte);
        const ys = punten.map((p) => (p.y / 100) * verdieping.hoogte);
        const marge = 0.15 * verdieping.breedte;
        const bw = Math.max(...xs) - Math.min(...xs) + marge * 2;
        const bh = Math.max(...ys) - Math.min(...ys) + marge * 2;
        schaal = Math.min(houder.clientWidth / bw, houder.clientHeight / bh, minSchaal * 3);
        schaal = Math.max(schaal, minSchaal);
        const mx = (Math.max(...xs) + Math.min(...xs)) / 2;
        const my = (Math.max(...ys) + Math.min(...ys)) / 2;
        tx = houder.clientWidth / 2 - mx * schaal;
        ty = houder.clientHeight / 2 - my * schaal;
        laag.classList.add('animeer');
        pasToe();
        teken();
        setTimeout(() => laag.classList.remove('animeer'), 350);
    }

    // Schermpositie -> procenten op de plattegrond
    function naarProcent(clientX, clientY) {
        const r = houder.getBoundingClientRect();
        const px = (clientX - r.left - tx) / schaal;
        const py = (clientY - r.top - ty) / schaal;
        return { x: (px / verdieping.breedte) * 100, y: (py / verdieping.hoogte) * 100 };
    }

    // ---------- Aanraking / muis ----------

    function pointerDown(e) {
        houder.setPointerCapture(e.pointerId);
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pointers.size === 1) {
            // Op welk punt (bewerkmodus) werd gedrukt? Na setPointerCapture is e.target altijd de houder.
            const knoop = e.target.closest && e.target.closest('[data-knoop]');
            sleepStart = { x: e.clientX, y: e.clientY, tx, ty, bewogen: false, doel: null, knoop: knoop ? knoop.dataset.knoop : null };
            if (knoop && sleepLuisteraars.start && sleepLuisteraars.start(knoop.dataset.knoop)) {
                sleepStart.doel = knoop.dataset.knoop;
            }
        } else {
            sleepStart = null;
        }
    }

    function pointerMove(e) {
        if (!pointers.has(e.pointerId)) return;
        const vorige = pointers.get(e.pointerId);
        const nu = { x: e.clientX, y: e.clientY };

        if (pointers.size === 2) {
            const [id2] = [...pointers.keys()].filter((id) => id !== e.pointerId);
            const ander = pointers.get(id2);
            const r = houder.getBoundingClientRect();
            const oudAfstand = Math.hypot(vorige.x - ander.x, vorige.y - ander.y);
            const nieuwAfstand = Math.hypot(nu.x - ander.x, nu.y - ander.y);
            const oudMidden = { x: (vorige.x + ander.x) / 2, y: (vorige.y + ander.y) / 2 };
            const nieuwMidden = { x: (nu.x + ander.x) / 2, y: (nu.y + ander.y) / 2 };
            tx += nieuwMidden.x - oudMidden.x;
            ty += nieuwMidden.y - oudMidden.y;
            if (oudAfstand > 0) zoomOm(nieuwAfstand / oudAfstand, nieuwMidden.x - r.left, nieuwMidden.y - r.top);
        } else if (sleepStart) {
            const dx = nu.x - sleepStart.x, dy = nu.y - sleepStart.y;
            if (Math.hypot(dx, dy) > 6) sleepStart.bewogen = true;
            if (sleepStart.doel) {
                if (sleepStart.bewogen) sleepLuisteraars.beweeg(sleepStart.doel, naarProcent(nu.x, nu.y));
            } else {
                tx = sleepStart.tx + dx;
                ty = sleepStart.ty + dy;
                pasToe();
            }
        }
        pointers.set(e.pointerId, nu);
    }

    function pointerUp(e) {
        if (!pointers.has(e.pointerId)) return;
        pointers.delete(e.pointerId);
        if (sleepStart && pointers.size === 0) {
            if (sleepStart.doel && sleepStart.bewogen) {
                sleepLuisteraars.eind(sleepStart.doel);
            } else if (!sleepStart.bewogen) {
                const p = naarProcent(e.clientX, e.clientY);
                tikLuisteraars.forEach((f) => f(p, sleepStart.knoop));
            }
        }
        sleepStart = null;
    }

    function wiel(e) {
        e.preventDefault();
        const r = houder.getBoundingClientRect();
        zoomOm(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX - r.left, e.clientY - r.top);
    }

    // ---------- SVG-hulpfuncties (coördinaten in procenten) ----------

    // Grootte in schermpixels omrekenen naar afbeeldingspixels, zodat lijnen
    // en stippen altijd even groot op het scherm blijven bij in- en uitzoomen
    const px = (schermPixels) => schermPixels / schaal;
    const X = (x) => (x / 100) * verdieping.breedte;
    const Y = (y) => (y / 100) * verdieping.hoogte;

    function element(naam, attributen = {}, ouder = svg) {
        const el = document.createElementNS(SVG, naam);
        for (const [k, v] of Object.entries(attributen)) el.setAttribute(k, v);
        ouder.append(el);
        return el;
    }

    const teken_ = {
        lijn(punten, klasse, dikte) {
            return element('polyline', {
                points: punten.map((p) => `${X(p.x)},${Y(p.y)}`).join(' '),
                class: klasse, 'stroke-width': px(dikte),
            });
        },
        cirkel(p, straal, klasse, extra = {}) {
            return element('circle', { cx: X(p.x), cy: Y(p.y), r: px(straal), class: klasse, 'stroke-width': px(2.5), ...extra });
        },
        cirkelEchteMaat(p, straalAfbeeldingPx, klasse) {
            return element('circle', { cx: X(p.x), cy: Y(p.y), r: straalAfbeeldingPx, class: klasse });
        },
        tekst(p, tekst, klasse, grootte = 13, dy = 0) {
            const el = element('text', { x: X(p.x), y: Y(p.y) + px(dy), class: klasse, 'font-size': px(grootte), 'stroke-width': px(3) });
            el.textContent = tekst;
            return el;
        },
        lijnStuk(a, b, klasse, dikte, extra = {}) {
            return element('line', { x1: X(a.x), y1: Y(a.y), x2: X(b.x), y2: Y(b.y), class: klasse, 'stroke-width': px(dikte), ...extra });
        },
        schaal: () => schaal,
        breedte: () => verdieping.breedte,
    };

    function teken() {
        if (!verdieping) return;
        svg.replaceChildren();
        tekenFunctie(teken_, verdieping);
    }

    return {
        init, toonVerdieping, teken, passend, zoom, centreer, toonGebied,
        set tekenaar(f) { tekenFunctie = f; },
        opTik(f) { tikLuisteraars.push(f); },
        opSlepen(start, beweeg, eind) { Object.assign(sleepLuisteraars, { start, beweeg, eind }); },
        get verdieping() { return verdieping; },
    };
})();
