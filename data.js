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
    "meterPerEenheid": 0.85,
    "verdiepingen": [
        {
            "id": "K",
            "naam": "Kelder (parkeergarage)",
            "kort": "K",
            "niveau": -1,
            "afbeelding": "images/plattegrond/kelder.webp",
            "breedte": 1800,
            "hoogte": 1925
        },
        {
            "id": "0",
            "naam": "Begane grond",
            "kort": "0",
            "niveau": 0,
            "afbeelding": "images/plattegrond/verdieping_0.webp",
            "breedte": 1800,
            "hoogte": 2758
        },
        {
            "id": "1",
            "naam": "1e verdieping",
            "kort": "1",
            "niveau": 1,
            "afbeelding": "images/plattegrond/verdieping_1.webp",
            "breedte": 1800,
            "hoogte": 2718
        },
        {
            "id": "2",
            "naam": "2e verdieping",
            "kort": "2",
            "niveau": 2,
            "afbeelding": "images/plattegrond/verdieping_2.webp",
            "breedte": 1800,
            "hoogte": 2753
        },
        {
            "id": "3",
            "naam": "3e verdieping",
            "kort": "3",
            "niveau": 3,
            "afbeelding": "images/plattegrond/verdieping_3.webp",
            "breedte": 1800,
            "hoogte": 2770
        },
        {
            "id": "4",
            "naam": "4e verdieping",
            "kort": "4",
            "niveau": 4,
            "afbeelding": "images/plattegrond/verdieping_4.webp",
            "breedte": 1800,
            "hoogte": 2775
        }
    ],
    "punten": {
        "0": {
            "w1": [
                19.4,
                13.8
            ],
            "w2": [
                25,
                14.4
            ],
            "w3": [
                46.6,
                13.7
            ],
            "w4": [
                50.1,
                16.5
            ],
            "d2": [
                65,
                21
            ],
            "d3": [
                75.6,
                25.6
            ],
            "ingang": [
                69,
                41,
                "de ingang"
            ],
            "hal": [
                84.7,
                39.5,
                "de centrale hal"
            ],
            "trap": [
                87,
                37
            ],
            "trapm": [
                84.7,
                34.3
            ],
            "lift": [
                88.3,
                44.5
            ],
            "b1": [
                78.9,
                48.8
            ],
            "b2": [
                81,
                58
            ],
            "b3": [
                79,
                66
            ],
            "p1": [
                80.1,
                28.6
            ],
            "p2": [
                51.8,
                22.1
            ]
        },
        "1": {
            "w1": [
                19,
                15
            ],
            "w2": [
                30,
                15
            ],
            "w3": [
                38.2,
                14.5
            ],
            "w4": [
                47.4,
                16.7
            ],
            "d2": [
                65.5,
                20.2
            ],
            "d3": [
                71,
                25
            ],
            "d4": [
                80.4,
                30.1
            ],
            "trapm": [
                74,
                34
            ],
            "trap": [
                89.2,
                34.8
            ],
            "lift": [
                85.6,
                44.9
            ],
            "b0": [
                83.7,
                34.1
            ],
            "b1": [
                83.8,
                52.2
            ],
            "b2": [
                83,
                57
            ],
            "b3": [
                75.5,
                60.9
            ],
            "b4": [
                63.5,
                62.6
            ],
            "p1": [
                55.5,
                25.2
            ],
            "p2": [
                50.8,
                71.8
            ]
        },
        "2": {
            "w2": [
                35.6,
                13.3
            ],
            "w4": [
                46.5,
                14.9
            ],
            "d2": [
                64,
                20
            ],
            "d3": [
                71.4,
                23.6
            ],
            "d4": [
                81.7,
                30.2
            ],
            "trapm": [
                75.6,
                32
            ],
            "trap": [
                87,
                34
            ],
            "lift": [
                83.6,
                45.1
            ],
            "b0": [
                82,
                36.9
            ],
            "b1": [
                82,
                52
            ],
            "b2": [
                74.7,
                60.8
            ],
            "b3": [
                63.6,
                62.9
            ],
            "b5": [
                39.2,
                75
            ],
            "b6": [
                29.4,
                81.6
            ],
            "p1": [
                52,
                22.2
            ],
            "p2": [
                49.7,
                69.6
            ]
        },
        "3": {
            "w2": [
                27.4,
                16.1
            ],
            "w4": [
                45.9,
                13.7
            ],
            "d2": [
                63.9,
                20.9
            ],
            "d3": [
                69.3,
                22.3
            ],
            "d4": [
                80.5,
                29.2
            ],
            "trapm": [
                76.5,
                31.4
            ],
            "trapA": [
                40,
                18
            ],
            "lift": [
                84.7,
                46.3
            ],
            "b0": [
                83.3,
                35.3
            ],
            "b1": [
                83,
                54
            ],
            "b2": [
                75.7,
                58.6
            ],
            "b3": [
                63.4,
                64.5
            ],
            "b4": [
                49.5,
                70
            ],
            "b6": [
                34.6,
                81.2
            ],
            "trapB": [
                39,
                76
            ],
            "p1": [
                53.9,
                22.3
            ],
            "p2": [
                44.5,
                78.2
            ]
        },
        "4": {
            "w2": [
                31.2,
                14
            ],
            "w4": [
                48.8,
                14.5
            ],
            "d2": [
                65,
                20
            ],
            "d4": [
                80.4,
                27.7
            ],
            "trapm": [
                78.8,
                31.9
            ],
            "trapA": [
                40,
                19
            ],
            "lift": [
                86.4,
                45.5
            ],
            "b0": [
                85.7,
                33.4
            ],
            "b1": [
                86.2,
                53.9
            ],
            "b2": [
                79.7,
                55.6
            ],
            "b3": [
                67.8,
                64.7
            ],
            "b4": [
                54.9,
                67.2
            ],
            "b6": [
                35.5,
                82
            ],
            "trapB": [
                37.1,
                78.1
            ],
            "p1": [
                53.9,
                23.1
            ],
            "p2": [
                56.1,
                74.6
            ],
            "p3": [
                43.8,
                79.2
            ]
        },
        "K": {
            "trap": [
                88,
                58
            ],
            "lift": [
                88,
                65
            ],
            "k1": [
                83,
                60
            ],
            "ingang": [
                37,
                62,
                "de ingang van het schoolterrein"
            ],
            "p1": [
                46.2,
                83
            ],
            "p2": [
                58.4,
                76.5
            ]
        }
    },
    "gangen": {
        "0": [
            "w1-w2",
            "w2-w3",
            "w3-w4",
            "d2-d3",
            "hal-ingang",
            "hal-trapm",
            "hal-trap",
            "hal-lift",
            "hal-b1",
            "lift-b1",
            "b1-b2",
            "b2-b3",
            "trapm-p1",
            "p1-d3",
            "d2-p2",
            "p2-w4"
        ],
        "1": [
            "w1-w2",
            "w2-w3",
            "w3-w4",
            "d2-d3",
            "d3-d4",
            "d4-trapm",
            "d4-b0",
            "b0-trap",
            "b0-lift",
            "lift-b1",
            "b1-b2",
            "b2-b3",
            "b3-b4",
            "d2-p1",
            "p1-w4",
            "p2-b4"
        ],
        "2": [
            "d2-d3",
            "d3-d4",
            "d4-trapm",
            "d4-b0",
            "b0-trap",
            "b0-lift",
            "lift-b1",
            "b1-b2",
            "b2-b3",
            "b5-b6",
            "d2-p1",
            "p1-w4",
            "w4-w2",
            "b3-p2",
            "p2-b5"
        ],
        "3": [
            "d2-d3",
            "d3-d4",
            "d4-trapm",
            "d4-b0",
            "b0-lift",
            "lift-b1",
            "b1-b2",
            "b2-b3",
            "b3-b4",
            "trapA-w2",
            "d2-p1",
            "p1-w4",
            "w4-w2",
            "trapB-b6",
            "b6-p2",
            "p2-b4"
        ],
        "4": [
            "d4-trapm",
            "d4-b0",
            "b0-lift",
            "lift-b1",
            "b1-b2",
            "b2-b3",
            "b3-b4",
            "b6-trapB",
            "d4-d2",
            "trapA-w2",
            "w2-w4",
            "d2-p1",
            "p1-w4",
            "b4-p2",
            "p2-p3",
            "p3-b6"
        ],
        "K": [
            "trap-k1",
            "lift-k1",
            "ingang-p1",
            "p1-p2",
            "p2-k1"
        ]
    },
    "lokalen": {
        "0": {
            "A0.13": [
                8,
                12,
                "w1"
            ],
            "A0.11": [
                27,
                9.9,
                "w2"
            ],
            "A0.12": [
                20,
                10.6,
                "w2"
            ],
            "A0.10": [
                50.6,
                9.5,
                "w3"
            ],
            "A0.09": [
                60,
                9.5,
                "w4"
            ],
            "A0.06": [
                66,
                12.5,
                "d2"
            ],
            "A0.02": [
                80,
                23,
                "d3"
            ],
            "A0.21": [
                72,
                26,
                "d3"
            ],
            "A0.20": [
                67,
                31,
                "d3"
            ],
            "wc-a": [
                56.5,
                18.5,
                "w4",
                "WC (A-vleugel)"
            ],
            "wc-hal": [
                76,
                30,
                "d3",
                "WC (bij de hal)"
            ],
            "garderobe": [
                73.1,
                19.3,
                "d2",
                "Garderobe"
            ],
            "B0.13": [
                72,
                55,
                "b2"
            ],
            "B0.01": [
                91,
                56,
                "b2"
            ],
            "B0.05": [
                84,
                71,
                "b3"
            ],
            "kantine": [
                50,
                74,
                "b3",
                "Kantine"
            ],
            "A0.01": [
                81.5,
                27.2,
                "p1"
            ]
        },
        "1": {
            "A1.09": [
                19,
                9,
                "w1"
            ],
            "A1.11": [
                6,
                16,
                "w1"
            ],
            "A1.08": [
                26,
                7.5,
                "w2"
            ],
            "A1.13": [
                28,
                19,
                "w2"
            ],
            "A1.14": [
                35,
                19,
                "w3"
            ],
            "A1.07": [
                39,
                7.5,
                "w3"
            ],
            "A1.06": [
                50,
                7.5,
                "w4"
            ],
            "A1.04": [
                63.8,
                16.7,
                "d2"
            ],
            "A1.03": [
                69.1,
                17.5,
                "d2"
            ],
            "A1.02": [
                77,
                21.5,
                "d3"
            ],
            "A1.01": [
                84,
                26.5,
                "d4"
            ],
            "A1.22": [
                72,
                30,
                "d3"
            ],
            "A1.21": [
                67,
                33,
                "d3"
            ],
            "B1.01": [
                92.7,
                51.9,
                "b1"
            ],
            "B1.02": [
                90,
                56,
                "b2"
            ],
            "B1.09": [
                75.2,
                55.4,
                "b2"
            ],
            "B1.03": [
                79.4,
                65.3,
                "b3"
            ],
            "B1.04": [
                75.8,
                67.9,
                "b4"
            ],
            "WC": [
                60.9,
                70,
                "p2"
            ]
        },
        "2": {
            "A2.06": [
                15.7,
                12.7,
                "w2"
            ],
            "A2.05": [
                32.1,
                11,
                "w2"
            ],
            "A2.08": [
                30.4,
                15.9,
                "w2"
            ],
            "A2.04": [
                37.9,
                10.8,
                "w2"
            ],
            "A2.03": [
                63.6,
                16.8,
                "d2"
            ],
            "A2.02": [
                68.9,
                18,
                "d2"
            ],
            "A2.01": [
                75.9,
                23.4,
                "d3"
            ],
            "A2.16": [
                71.7,
                27.1,
                "d3"
            ],
            "B2.01": [
                90.4,
                52.4,
                "b1"
            ],
            "B2.03": [
                86.9,
                58.9,
                "b2"
            ],
            "B2.04": [
                86.7,
                61.5,
                "b2"
            ],
            "B2.05": [
                82.1,
                65.4,
                "b2"
            ],
            "B2.06": [
                72.1,
                69.6,
                "b3"
            ],
            "B2.07": [
                49.3,
                78.9,
                "b5"
            ],
            "B2.08": [
                45,
                80.5,
                "b5"
            ],
            "B2.09": [
                23.4,
                83.7,
                "b6"
            ],
            "WC": [
                59.8,
                69.8,
                "p2"
            ]
        },
        "3": {
            "A3.07": [
                14.6,
                12.6,
                "w2"
            ],
            "A3.06": [
                24.7,
                10.4,
                "w2"
            ],
            "A3.05": [
                30.8,
                10.7,
                "w2"
            ],
            "A3.04": [
                44.4,
                9.3,
                "w4"
            ],
            "A3.02": [
                71.2,
                19.7,
                "d2"
            ],
            "A3.01": [
                73.1,
                20.7,
                "d3"
            ],
            "wc-a": [
                56,
                17,
                "w4",
                "WC (A-vleugel)"
            ],
            "B3.01": [
                86.6,
                53.9,
                "b1"
            ],
            "B3.02": [
                83,
                61.3,
                "b2"
            ],
            "B3.06": [
                42.2,
                82.5,
                "b6"
            ],
            "B3.07": [
                20,
                84,
                "b6"
            ],
            "A3.03": [
                63.7,
                17.1,
                "d2"
            ],
            "B3.03": [
                72.6,
                70.2,
                "b3"
            ],
            "B3.05": [
                46.6,
                80.5,
                "p2"
            ],
            "WC": [
                57.5,
                70.8,
                "b4"
            ]
        },
        "4": {
            "A4.09": [
                15.9,
                12.9,
                "w2"
            ],
            "A4.07": [
                25.6,
                11.1,
                "w2"
            ],
            "A4.06": [
                32,
                10.9,
                "w2"
            ],
            "A4.11": [
                27,
                17.2,
                "w2"
            ],
            "A4.05": [
                46.1,
                11.2,
                "w4"
            ],
            "A4.04": [
                63,
                16.3,
                "d2"
            ],
            "A4.03": [
                70.4,
                18.2,
                "d2"
            ],
            "B4.03": [
                73.8,
                70.6,
                "b3"
            ],
            "A4.16": [
                68.2,
                30.8,
                "d2"
            ],
            "A4.17": [
                70.8,
                29.4,
                "d2"
            ],
            "A4.02": [
                72.3,
                19.8,
                "d2"
            ],
            "WC": [
                59.9,
                71.7,
                "p2"
            ],
            "B4.15": [
                79.3,
                51.1,
                "b2"
            ],
            "B4.01": [
                89.1,
                53.5,
                "b1"
            ],
            "B4.04": [
                47.2,
                81.1,
                "p3"
            ],
            "B4.10 (lerarenkamer)": [
                51.9,
                74.1,
                "p2"
            ]
        },
        "K": {
            "Fietsenstalling": [
                64.8,
                63.8,
                "p2"
            ],
            "Parkeergarage": [
                67.6,
                83.4,
                "p2"
            ],
            "Parkeerplein": [
                41.3,
                43.2,
                "ingang"
            ],
            "Parkeerplein-2": [
                48,
                92,
                "p1"
            ]
        }
    },
    "verbindingen": [
        {
            "id": "lift",
            "naam": "de lift",
            "type": "lift",
            "punt": "lift",
            "verdiepingen": [
                "K",
                "0",
                "1",
                "2",
                "3",
                "4"
            ]
        },
        {
            "id": "hoofdtrap",
            "naam": "de trap naast de lift",
            "type": "trap",
            "punt": "trap",
            "verdiepingen": [
                "K",
                "0",
                "1",
                "2"
            ]
        },
        {
            "id": "middentrap",
            "naam": "de middelste trap",
            "type": "trap",
            "punt": "trapm",
            "verdiepingen": [
                "0",
                "1",
                "2",
                "3",
                "4"
            ]
        },
        {
            "id": "trapA",
            "naam": "de trap in de A-vleugel",
            "type": "trap",
            "punt": "trapA",
            "verdiepingen": [
                "3",
                "4"
            ]
        },
        {
            "id": "trapB",
            "naam": "de trap in de B-vleugel",
            "type": "trap",
            "punt": "trapB",
            "verdiepingen": [
                "3",
                "4"
            ]
        }
    ],
    "gpsKalibratie": [
        {
            "naam": "hoek waar de A-vleugel schuin afbuigt (bij A0.10/A0.08)",
            "lat": 52.0169544,
            "lon": 4.6842488,
            "verdieping": "0",
            "x": 61.8,
            "y": 1.5
        },
        {
            "naam": "hoek rechts naast A0.01",
            "lat": 52.0171875,
            "lon": 4.6841195,
            "verdieping": "0",
            "x": 97.3,
            "y": 29
        },
        {
            "naam": "hoek rechtsonder (bij B0.05)",
            "lat": 52.0174629,
            "lon": 4.6842915,
            "verdieping": "0",
            "x": 97.3,
            "y": 69.8
        },
        {
            "naam": "onderste punt van de kantine",
            "lat": 52.0175184,
            "lon": 4.6848447,
            "verdieping": "0",
            "x": 29.7,
            "y": 98.2
        },
        {
            "naam": "linkerhoek van de kantine",
            "lat": 52.0173851,
            "lon": 4.6848901,
            "verdieping": "0",
            "x": 13.4,
            "y": 81.5
        }
    ],
    "info": {
        "verdiepingen": {
            "0": "Hier kom je binnen. Op deze verdieping zijn de centrale hal, de kantine en de garderobe.",
            "2": "op deze verdieping vindt u het volgende. op de B vleugel, aan de kant van de lift, vindt u de afdeling Gezondheidszorg. deze studenten gaan later in het ziekenhuis werken waarschijnlijk. op dezelfde verdieping, maar dan aan de andere kant vindt u de afdeling Welzijn. deze studenten willen psychiater of pedagoog worden.",
            "K": "Parkeergarage met de fietsstalling en parkeerplaatsen."
        },
        "lokalen": {
            "kantine": "Hier kun je pauze houden en eten.",
            "garderobe": "Hier kun je je jas ophangen."
        }
    }
};

// Aanpassingen uit de bewerkmodus (opgeslagen op dit apparaat) gaan voor.
const GEBOUW = (() => {
    try {
        const opgeslagen = localStorage.getItem('gebouwroute-data');
        if (opgeslagen) return JSON.parse(opgeslagen);
    } catch (e) { /* geen opgeslagen data */ }
    return structuredClone(GEBOUW_STANDAARD);
})();
