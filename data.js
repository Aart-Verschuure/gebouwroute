/*
 * GEBOUWDATA
 * ----------
 * Alle coördinaten zijn percentages van de plattegrond-afbeelding:
 *   [x, y] -> x = % van links (0-100), y = % van boven (0-100)
 *
 * punten   : knooppunten in de gangen waar je langs kunt lopen.
 *            [x, y] of [x, y, 'naam'] (de naam wordt gebruikt in de gesproken instructies)
 * gangen   : verbindingen tussen punten. 'a-b-c' betekent a<->b en b<->c.
 * lokalen  : bestemmingen. [x, y, 'deurpunt'] of [x, y, 'deurpunt', 'weergavenaam']
 *            'deurpunt' is het gangpunt waar de deur van het lokaal op uitkomt.
 * verbindingen : trappen en liften tussen verdiepingen. 'punt' moet op elke
 *            genoemde verdieping bestaan.
 *
 * Tip: gebruik de bewerkmodus in de app (⚙️ -> Bewerkmodus) om punten te verslepen
 * en exporteer daarna de nieuwe data om hier te plakken.
 */
const GEBOUW_STANDAARD = {
    // Hoeveel meter is 1% van de hoogte van de plattegrond (schatting, voor afstanden)
    meterPerEenheid: 0.85,

    verdiepingen: [
        { id: 'K', naam: 'Kelder (parkeergarage)', kort: 'K', niveau: -1, afbeelding: 'images/plattegrond/kelder.webp', breedte: 1800, hoogte: 1925 },
        { id: '0', naam: 'Begane grond', kort: '0', niveau: 0, afbeelding: 'images/plattegrond/verdieping_0.webp', breedte: 1800, hoogte: 2758 },
        { id: '1', naam: '1e verdieping', kort: '1', niveau: 1, afbeelding: 'images/plattegrond/verdieping_1.webp', breedte: 1800, hoogte: 2718 },
        { id: '2', naam: '2e verdieping', kort: '2', niveau: 2, afbeelding: 'images/plattegrond/verdieping_2.webp', breedte: 1800, hoogte: 2753 },
        { id: '3', naam: '3e verdieping', kort: '3', niveau: 3, afbeelding: 'images/plattegrond/verdieping_3.webp', breedte: 1800, hoogte: 2770 },
        { id: '4', naam: '4e verdieping', kort: '4', niveau: 4, afbeelding: 'images/plattegrond/verdieping_4.webp', breedte: 1800, hoogte: 2775 },
    ],

    punten: {
        K: {
            trap: [88, 58], lift: [88, 65],
            k1: [83, 60], k2: [78, 48], k3: [62, 46], k4: [53, 50], k5: [52, 62], k6: [53, 70],
            ingang: [37, 62, 'de ingang van het schoolterrein'],
        },
        0: {
            w1: [19, 14.5], w2: [24, 14.5], w3: [38, 14], w4: [50, 14],
            d1: [57, 16], d2: [65, 21], d3: [73, 26], d4: [79, 31],
            ingang: [69, 41, 'de ingang'], hal: [79, 41, 'de centrale hal'],
            trap: [87, 37], trapm: [76, 35], lift: [85, 46],
            b1: [81, 50], b2: [81, 58], b3: [79, 66],
        },
        1: {
            w1: [19, 15], w2: [30, 15], w3: [42, 15], w4: [52, 15],
            d1: [57, 15], d2: [64, 20], d3: [71, 25], d4: [79, 31],
            trapm: [74, 34], trap: [88, 35], lift: [86, 46],
            b0: [84, 40], b1: [84, 50], b2: [83, 57], b3: [78, 61], b4: [69, 64],
        },
        2: {
            w1: [18, 15], w2: [28, 15], w3: [42, 14], w4: [52, 14],
            d1: [57, 15], d2: [64, 20], d3: [72, 26], d4: [79, 31],
            trapm: [76, 34], trap: [87, 34], lift: [83, 46],
            b0: [82, 40], b1: [82, 52], b2: [81, 60], b3: [70, 65], b4: [50, 72], b5: [35, 78], b6: [27, 84],
        },
        3: {
            w1: [17, 14.5], w2: [30, 14.5], w3: [42, 14.5], w4: [52, 14],
            d1: [57, 15], d2: [64, 20], d3: [71, 25], d4: [79, 31],
            trapm: [76, 34], trapA: [40, 18], lift: [83, 47],
            b0: [83, 40], b1: [83, 54], b2: [81, 60], b3: [68, 66], b4: [52, 74], b5: [37, 81], b6: [27, 86],
            trapB: [39, 76],
        },
        4: {
            w1: [17, 15], w2: [28, 15], w3: [40, 15], w4: [52, 14.5],
            d1: [57, 15], d2: [65, 20], d3: [72, 25], d4: [80, 31],
            trapm: [77, 34], trapA: [40, 19], lift: [86, 46],
            b0: [85, 38], b1: [85, 52], b2: [80, 60], b3: [70, 64], b4: [60, 70], b5: [47, 78], b6: [35, 80],
            trapB: [38, 76],
        },
    },

    gangen: {
        K: ['trap-k1', 'lift-k1', 'k1-k2-k3-k4-k5-ingang', 'k5-k6'],
        0: ['w1-w2-w3-w4-d1-d2-d3-d4-hal-ingang', 'd4-trapm', 'hal-trapm', 'hal-trap', 'hal-lift', 'hal-b1', 'lift-b1-b2-b3'],
        1: ['w1-w2-w3-w4-d1-d2-d3-d4-trapm', 'd4-b0-trap', 'b0-lift-b1-b2-b3-b4'],
        2: ['w1-w2-w3-w4-d1-d2-d3-d4-trapm', 'd4-b0-trap', 'b0-lift-b1-b2-b3-b4-b5-b6'],
        3: ['w1-w2-w3-w4-d1-d2-d3-d4-trapm', 'w3-trapA', 'd4-b0-lift-b1-b2-b3-b4-b5-b6', 'b5-trapB'],
        4: ['w1-w2-w3-w4-d1-d2-d3-d4-trapm', 'w3-trapA', 'd4-b0-lift-b1-b2-b3-b4-b5-b6', 'b5-trapB', 'b6-trapB'],
    },

    lokalen: {
        K: {
            fietsstalling: [66, 65, 'k6', 'Fietsstalling'],
            parkeren: [45, 45, 'k4', 'Parkeerplaatsen'],
        },
        0: {
            'A0.13': [8, 12, 'w1'], 'A0.11': [21, 5, 'w2'], 'A0.12': [21, 10, 'w2'], 'A0.10': [43, 6, 'w3'],
            'A0.09': [60, 9.5, 'd1'], 'A0.08': [64, 7, 'd1'], 'A0.06': [66, 12.5, 'd2'],
            'A0.02': [80, 23, 'd3'], 'A0.01': [85, 27, 'd4'], 'A0.21': [72, 26, 'd3'], 'A0.20': [67, 31, 'd3'],
            'wc-a': [57, 17, 'd1', 'WC (A-vleugel)'], 'wc-hal': [76, 30, 'd4', 'WC (bij de hal)'],
            garderobe: [70, 20, 'd2', 'Garderobe'],
            'B0.13': [72, 55, 'b2'], 'B0.03': [94, 49, 'b1'], 'B0.01': [91, 56, 'b2'],
            'B0.04': [91, 64, 'b3'], 'B0.05': [84, 71, 'b3'],
            kantine: [50, 74, 'b3', 'Kantine'],
        },
        1: {
            'A1.09': [11, 7, 'w1'], 'A1.11': [6, 16, 'w1'], 'A1.08': [26, 7.5, 'w2'], 'A1.13': [28, 19, 'w2'],
            'A1.14': [35, 19, 'w3'], 'A1.07': [39, 7.5, 'w3'], 'A1.06': [50, 7.5, 'w4'], 'A1.05': [60, 5, 'd1'],
            'A1.04': [63, 13, 'd2'], 'A1.03': [73, 17.5, 'd2'], 'A1.02': [77, 21.5, 'd3'], 'A1.01': [84, 26.5, 'd4'],
            'A1.22': [72, 30, 'd3'], 'A1.21': [67, 33, 'd3'], 'wc-a': [57, 18, 'd1', 'WC (A-vleugel)'],
            'B1.01': [93, 50, 'b1'], 'B1.02': [90, 56, 'b2'], 'B1.09': [74, 55, 'b2'], 'B1.03': [86, 65, 'b3'],
            'B1.04': [70, 74, 'b4'], 'wc-b': [59, 69, 'b4', 'WC (B-vleugel)'],
        },
        2: {
            'A2.06': [7, 12, 'w1'], 'A2.05': [23, 7, 'w2'], 'A2.08': [28, 16.5, 'w2'], 'A2.04': [42, 7, 'w3'],
            'A2.03': [62, 11, 'd2'], 'A2.02': [72, 17.5, 'd2'], 'A2.01': [81, 23.5, 'd3'], 'A2.16': [68, 30.5, 'd3'],
            'wc-a': [56, 17.5, 'd1', 'WC (A-vleugel)'],
            'B2.01': [92, 52, 'b1'], 'B2.03': [89, 58.5, 'b2'], 'B2.04': [90, 63, 'b2'], 'B2.05': [88, 68, 'b2'],
            'B2.06': [76, 73.5, 'b3'], 'wc-b': [59, 69, 'b3', 'WC (B-vleugel)'], 'B2.07': [56, 82, 'b4'],
            'B2.08': [34, 91, 'b5'], 'B2.09': [20, 83, 'b6'],
        },
        3: {
            'A3.07': [6, 15, 'w1'], 'A3.06': [18, 7, 'w1'], 'A3.05': [35, 7, 'w2'], 'A3.04': [48, 7.5, 'w4'],
            'A3.03': [60, 11, 'd1'], 'A3.02': [72, 17.5, 'd2'], 'A3.01': [80, 23, 'd3'],
            'wc-a': [56, 17, 'd1', 'WC (A-vleugel)'],
            'B3.01': [91, 54.5, 'b1'], 'B3.02': [89, 64, 'b2'], 'B3.03': [81, 72.5, 'b2'], 'B3.04': [66, 79, 'b3'],
            'B3.05': [53, 84, 'b4'], 'B3.06': [37, 91, 'b5'], 'B3.07': [20, 84, 'b6'],
            'wc-b': [59, 70, 'b3', 'WC (B-vleugel)'],
        },
        4: {
            'A4.09': [7, 16.5, 'w1'], 'A4.07': [12, 6, 'w1'], 'A4.06': [33, 6, 'w2'], 'A4.11': [29, 19, 'w2'],
            'A4.05': [48, 6, 'w4'], 'A4.04': [61, 11, 'd1'], 'A4.03': [71, 16, 'd2'], 'A4.02': [76, 20, 'd3'],
            'A4.01': [84, 25.5, 'd4'], 'A4.17': [74, 29.5, 'd3'], 'A4.16': [68, 32.5, 'd3'],
            'wc-a': [57, 18, 'd1', 'WC (A-vleugel)'],
            'B4.15': [78, 50, 'b1'], 'B4.02': [95, 49.5, 'b1'], 'B4.01': [88, 64, 'b2'], 'B4.03': [72, 76.5, 'b3'],
            'B4.05': [66, 74, 'b4'], 'wc-b': [61, 71, 'b4', 'WC (B-vleugel)'], 'B4.10': [48, 72, 'b5'], 'B4.04': [55, 82, 'b5'],
        },
    },

    verbindingen: [
        { id: 'lift', naam: 'de lift', type: 'lift', punt: 'lift', verdiepingen: ['K', '0', '1', '2', '3', '4'] },
        { id: 'hoofdtrap', naam: 'de trap naast de lift', type: 'trap', punt: 'trap', verdiepingen: ['K', '0', '1', '2'] },
        { id: 'middentrap', naam: 'de middelste trap', type: 'trap', punt: 'trapm', verdiepingen: ['0', '1', '2', '3', '4'] },
        { id: 'trapA', naam: 'de trap in de A-vleugel', type: 'trap', punt: 'trapA', verdiepingen: ['3', '4'] },
        { id: 'trapB', naam: 'de trap in de B-vleugel', type: 'trap', punt: 'trapB', verdiepingen: ['3', '4'] },
    ],

    // GPS-kalibratiepunten: { lat, lon, verdieping, x, y }
    // Voeg ze toe via ⚙️ -> GPS kalibreren en plak de export hier, zodat iedereen ze krijgt.
    gpsKalibratie: [],
};

// Aanpassingen uit de bewerkmodus (opgeslagen op dit apparaat) gaan voor.
const GEBOUW = (() => {
    try {
        const opgeslagen = localStorage.getItem('gebouwroute-data');
        if (opgeslagen) return JSON.parse(opgeslagen);
    } catch (e) { /* geen opgeslagen data */ }
    return structuredClone(GEBOUW_STANDAARD);
})();
