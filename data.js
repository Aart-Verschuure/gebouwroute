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
                20.6,
                13.7
            ],
            "w2": [
                27.4,
                13.9
            ],
            "w4": [
                50,
                17
            ],
            "d1": [
                52.9,
                22.7
            ],
            "d2": [
                65,
                21
            ],
            "d3": [
                76.2,
                26
            ],
            "d4": [
                84.6,
                34.3
            ],
            "ingang": [
                67.3,
                41.2,
                "de ingang"
            ],
            "hal": [
                78.4,
                41.7,
                "de centrale hal"
            ],
            "trap": [
                88.5,
                37.9
            ],
            "trapm": [
                79.6,
                34.8
            ],
            "lift": [
                89.5,
                45.1
            ],
            "b1": [
                79.4,
                48.4
            ],
            "b2": [
                80.4,
                59.3
            ],
            "b3": [
                80.1,
                67.4
            ]
        },
        "1": {
            "w1": [
                23.7,
                14.4
            ],
            "w3": [
                36.9,
                14.2
            ],
            "w4": [
                46.5,
                16.4
            ],
            "d2": [
                66.1,
                22.3
            ],
            "d3": [
                71,
                25
            ],
            "d4": [
                81.3,
                30.2
            ],
            "trapm": [
                74,
                34
            ],
            "trap": [
                86.3,
                33.9
            ],
            "lift": [
                86.8,
                44.9
            ],
            "b0": [
                82.9,
                42.1
            ],
            "b1": [
                83.6,
                52.1
            ],
            "b2": [
                82.3,
                56.6
            ],
            "b3": [
                71.3,
                59.9
            ],
            "b4": [
                60.7,
                62.8
            ],
            "p1": [
                52.2,
                71.1
            ],
            "p2": [
                53.7,
                23.9
            ]
        },
        "2": {
            "w1": [
                21,
                12.9
            ],
            "w2": [
                37.4,
                13.4
            ],
            "d2": [
                65.8,
                21.2
            ],
            "d3": [
                71.5,
                23.6
            ],
            "d4": [
                81.8,
                30.2
            ],
            "trapm": [
                75.8,
                31.5
            ],
            "trap": [
                87,
                34
            ],
            "lift": [
                84.4,
                45.6
            ],
            "b0": [
                82,
                40
            ],
            "b1": [
                82,
                52
            ],
            "b2": [
                81,
                60
            ],
            "b3": [
                63.2,
                62.5
            ],
            "b4": [
                51,
                71.2
            ],
            "b5": [
                43.2,
                75.3
            ],
            "b6": [
                32.7,
                80.9
            ],
            "p1": [
                50.6,
                21.9
            ],
            "p2": [
                47.6,
                14.3
            ]
        },
        "3": {
            "w1": [
                24.9,
                13.3
            ],
            "w2": [
                32.3,
                14.8
            ],
            "w4": [
                47.5,
                15.4
            ],
            "d1": [
                49.2,
                20.6
            ],
            "d2": [
                64.3,
                24
            ],
            "d4": [
                81,
                29.6
            ],
            "trapm": [
                76.1,
                31.6
            ],
            "trapA": [
                36.5,
                18
            ],
            "lift": [
                85.2,
                46.7
            ],
            "b0": [
                82.7,
                42.3
            ],
            "b1": [
                83,
                54
            ],
            "b2": [
                69.7,
                61.2
            ],
            "b6": [
                29,
                81.8
            ],
            "trapB": [
                36.4,
                78
            ],
            "p1": [
                44.2,
                78.2
            ],
            "p2": [
                51.7,
                71.3
            ]
        },
        "4": {
            "w2": [
                30.5,
                13.5
            ],
            "w4": [
                48.7,
                15
            ],
            "d3": [
                66.5,
                21.8
            ],
            "d4": [
                81.5,
                28.9
            ],
            "trapm": [
                77.6,
                31.4
            ],
            "trapA": [
                38.2,
                18.6
            ],
            "lift": [
                86.4,
                45.5
            ],
            "b0": [
                85.6,
                33.5
            ],
            "b1": [
                85.3,
                54.4
            ],
            "b4": [
                55.5,
                66.7
            ],
            "trapB": [
                37.2,
                78.3
            ],
            "p2": [
                55.3,
                74.9
            ],
            "p3": [
                43.5,
                79.3
            ],
            "p4": [
                80.2,
                55.2
            ],
            "p5": [
                68,
                62.2
            ],
            "p1": [
                54.6,
                23.5
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
                80.9,
                57
            ],
            "ingang": [
                36.1,
                62,
                "de ingang van het schoolterrein"
            ],
            "p1": [
                66.8,
                46.2
            ],
            "p2": [
                41.7,
                64.2
            ],
            "p3": [
                44.2,
                83.1
            ],
            "p4": [
                59.6,
                79.1
            ],
            "p5": [
                65.6,
                85.4
            ],
            "p6": [
                80.1,
                77.6
            ],
            "p7": [
                83.7,
                67.8
            ]
        }
    },
    "gangen": {
        "0": [
            "w1-w2",
            "w4-d1",
            "d1-d2",
            "d2-d3",
            "d3-d4",
            "d4-hal",
            "hal-ingang",
            "d4-trapm",
            "hal-trapm",
            "hal-trap",
            "hal-lift",
            "hal-b1",
            "lift-b1",
            "b1-b2",
            "b2-b3",
            "w4-w2"
        ],
        "1": [
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
            "b4-p1",
            "d2-p2",
            "w3-w1",
            "p2-w4",
            "b0-b1"
        ],
        "2": [
            "w1-w2",
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
            "b4-b5",
            "b5-b6",
            "p1-d2",
            "p1-p2",
            "p2-w2"
        ],
        "3": [
            "w1-w2",
            "w4-d1",
            "d1-d2",
            "d4-trapm",
            "d4-b0",
            "b0-lift",
            "lift-b1",
            "b1-b2",
            "b6-trapB",
            "p1-p2",
            "p1-b6",
            "w4-w2",
            "w2-trapA",
            "d4-d2",
            "b2-p2"
        ],
        "4": [
            "d3-d4",
            "d4-trapm",
            "d4-b0",
            "b0-lift",
            "lift-b1",
            "w4-w2",
            "w2-trapA",
            "p2-p3",
            "b4-p2",
            "p3-trapB",
            "b1-p4",
            "p4-p5",
            "p5-b4",
            "d3-p1",
            "p1-w4"
        ],
        "K": [
            "trap-k1",
            "lift-k1",
            "k1-p1",
            "p2-p3",
            "p3-p4",
            "p4-p5",
            "p5-p6",
            "p6-p7",
            "p7-k1",
            "ingang-p2"
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
                26.7,
                9.6,
                "w2"
            ],
            "A0.12": [
                20.8,
                10.3,
                "w1"
            ],
            "A0.10": [
                35.5,
                8.1,
                "w2"
            ],
            "A0.09": [
                60.6,
                10.5,
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
            "A0.01": [
                85,
                27,
                "d3"
            ],
            "A0.21": [
                71.7,
                25.7,
                "d3"
            ],
            "A0.20": [
                65.4,
                30,
                "d2"
            ],
            "wc-a": [
                57,
                17,
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
                75.2,
                18.1,
                "d2",
                "Garderobe"
            ],
            "B0.13": [
                72.4,
                60.3,
                "b2"
            ],
            "B0.01": [
                90.5,
                59.7,
                "b2"
            ],
            "B0.05": [
                88.1,
                66,
                "b3"
            ],
            "kantine": [
                73.3,
                72.7,
                "b3",
                "Kantine"
            ]
        },
        "1": {
            "A1.09": [
                18.1,
                11.2,
                "w1"
            ],
            "A1.11": [
                14.3,
                15,
                "w1"
            ],
            "A1.08": [
                31.1,
                10.7,
                "w3"
            ],
            "A1.13": [
                28.1,
                17.5,
                "w1"
            ],
            "A1.14": [
                37.5,
                18.1,
                "w3"
            ],
            "A1.07": [
                38.3,
                10.8,
                "w3"
            ],
            "A1.06": [
                48.7,
                11.3,
                "w4"
            ],
            "A1.04": [
                63.4,
                17.1,
                "d2"
            ],
            "A1.03": [
                68.9,
                17.7,
                "d2"
            ],
            "A1.02": [
                74.3,
                21.3,
                "d3"
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
            "wc-a": [
                56.6,
                16.9,
                "w4",
                "WC (A-vleugel)"
            ],
            "B1.01": [
                87.6,
                52.2,
                "b1"
            ],
            "B1.02": [
                87.2,
                56.3,
                "b2"
            ],
            "B1.09": [
                74.5,
                56,
                "b2"
            ],
            "B1.03": [
                78.4,
                63.6,
                "b3"
            ],
            "B1.04": [
                73.6,
                65.8,
                "b4"
            ],
            "wc-b": [
                60,
                70.8,
                "p1"
            ]
        },
        "2": {
            "A2.06": [
                7,
                12,
                "w1"
            ],
            "A2.05": [
                23,
                7,
                "w2"
            ],
            "A2.08": [
                29.8,
                16.4,
                "w2"
            ],
            "A2.04": [
                37.6,
                8.2,
                "w2"
            ],
            "A2.03": [
                63,
                16.3,
                "d2"
            ],
            "A2.02": [
                69.2,
                17.4,
                "d2"
            ],
            "A2.01": [
                81,
                23.5,
                "d3"
            ],
            "A2.16": [
                70.9,
                29.2,
                "d3"
            ],
            "B2.01": [
                92,
                52,
                "b1"
            ],
            "B2.03": [
                89,
                58.5,
                "b2"
            ],
            "B2.04": [
                90,
                63,
                "b2"
            ],
            "B2.05": [
                81.4,
                65.6,
                "b2"
            ],
            "B2.06": [
                76,
                73.5,
                "b3"
            ],
            "B2.07": [
                50.5,
                80,
                "b5"
            ],
            "B2.08": [
                45.5,
                81.4,
                "b5"
            ],
            "B2.09": [
                22.3,
                83.9,
                "b6"
            ],
            "WC": [
                58,
                69.8,
                "b4"
            ]
        },
        "3": {
            "A3.07": [
                14,
                12.8,
                "w1"
            ],
            "A3.06": [
                25.3,
                10.3,
                "w1"
            ],
            "A3.05": [
                30.2,
                10.3,
                "w2"
            ],
            "A3.04": [
                44.5,
                10.6,
                "w4"
            ],
            "A3.02": [
                72.6,
                18.6,
                "d2"
            ],
            "A3.01": [
                73.1,
                20.7,
                "d2"
            ],
            "wc-a": [
                56,
                17,
                "w4",
                "WC (A-vleugel)"
            ],
            "B3.01": [
                88.6,
                53.9,
                "b1"
            ],
            "B3.02": [
                82.6,
                60.9,
                "b2"
            ],
            "B3.03": [
                71.9,
                69.9,
                "b2"
            ],
            "B3.04": [
                59,
                76.4,
                "p2"
            ],
            "B3.05": [
                46.2,
                81.4,
                "p1"
            ],
            "B3.06": [
                41.7,
                82.4,
                "b6"
            ],
            "B3.07": [
                20,
                84,
                "b6"
            ],
            "WC": [
                58.2,
                71.2,
                "p2"
            ],
            "A3.03": [
                63.6,
                16.6,
                "d2"
            ]
        },
        "4": {
            "A4.09": [
                15.9,
                13,
                "w2"
            ],
            "A4.07": [
                24.4,
                10.9,
                "w2"
            ],
            "A4.06": [
                32.2,
                10.6,
                "w2"
            ],
            "A4.11": [
                26.9,
                17,
                "w2"
            ],
            "A4.05": [
                46.3,
                10.6,
                "w4"
            ],
            "A4.04": [
                62.9,
                15.8,
                "d3"
            ],
            "A4.03": [
                70.9,
                17.8,
                "d3"
            ],
            "A4.02": [
                72.7,
                19.6,
                "d3"
            ],
            "A4.17": [
                71.1,
                29.6,
                "d3"
            ],
            "A4.16": [
                68.9,
                31.1,
                "d3"
            ],
            "wc-a": [
                56.5,
                17.9,
                "w4",
                "WC (A-vleugel)"
            ],
            "B4.01": [
                89.9,
                53.4,
                "b1"
            ],
            "B4.15": [
                78.2,
                49.3,
                "p4"
            ],
            "B4.03": [
                73.4,
                70.4,
                "p5"
            ],
            "WC": [
                61.4,
                72.5,
                "p2"
            ],
            "B4.10": [
                51.3,
                74,
                "p2"
            ],
            "B4.04": [
                47.1,
                80.9,
                "p3"
            ]
        },
        "K": {
            "fietsstalling": [
                66,
                65,
                "k1",
                "Fietsstalling"
            ],
            "parkeren": [
                52.3,
                42.2,
                "p1",
                "Parkeerplaatsen"
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
            "0": "Hier kom je binnen. Op deze verdieping zijn de centrale hal, de kantine, waar je lekkere broodjes kan kopen en de garderobe.",
            "1": "Op deze verdieping zijn veel sectoren aanwezig, allereerst hebben we op de A-vleugel, dat is aan de kant van de trap, Beveiligen en Bewaken. Deze studenten worden opgeleid om bij de politie of defensie aan de slag te gaan. Met deze opleiding kan je ook ergens anders aan de slag, bijvoorbeeld als iemand die bij een hotel als bewaker staat, of bij een dure winkel. Daarnaast hebben we hier ook nog Bouwkunde, hier worden timmerlieden, metselaars en uitvoerders opgeleid. Deze mensen gaan zeker weten de bouw in. En dan hebben we nog dienstverlening, daar lopen de mensen die op de ambulance willen of bij een zorg-instelling willen gaan helpen. Dit is wat er op de A-vleugel is, maar er is ook hier weer een B-vleugel. Op deze verdieping op de B-vleugel is welzijn. Deze studenten worden opgeleid tot onderwijsassitent, psychiater of pedagoog.",
            "2": "Op deze verdieping vindt u het volgende. Op de B vleugel, aan de kant van de lift, vindt u de afdeling Gezondheidszorg. Deze studenten gaan later waarschijnlijk in het ziekenhuis of andere zorginstelling werken. Op dezelfde verdieping, maar dan aan de andere kant vindt u de afdeling Welzijn. Deze studenten worden opgeleid tot onderwijsassitent, psychiater of pedagoog.",
            "3": "Op deze verdieping aan de kant van de trappen (de A-vleugel) daar vindt u de vakken Economie en een aantal algemene vakken, zoals Engels, Nederlands, Godsdienst en Burgerschap. De studenten van Economie zijn hier om de kleine cijfertjes uit te rekenen. Dat worden bijvoorbeeld, Salarisadministateurs, die berekenen het salaris van de verschillende personen. Op dezelfde verdieping alleen dan aan de andere kant vindt u de sectoren Beveiligen en Bewaken en Gezondheidszorg. En ook hier weer zijn de algemene vakken te vinden.",
            "4": "De 4e verdieping is toch wel de leukste verdieping. De A-vleugel daar zitten de economen, maar op de B-vleugel is toch wel de vleugel waar ik het liefste kom. Dat is namelijk de ICT afdeling. De afdeling waar deze applicatie in elkaar gezet is, maar waar ook andere applicaties gemaakt zijn, worden gemaakt. Nieuwschierig naar wat er nou allemaal gebeurd op de ICT afdeling? Kom dan zeker even kijken op een open dag/avond",
            "K": "Hier vindt u de parkeergarage, maar voor de sportievelingen onder ons. Ook de fietsenstalling is hier te vinden. Je kan je fiets hier ook opladen met de oplaadpunten die er zijn in de parkeergarage"
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
