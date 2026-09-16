document.addEventListener('DOMContentLoaded', () => {
    const verdiepingSelect = document.getElementById('verdiepingSelect');
    const stapVleugel = document.getElementById('stap-vleugel');
    const mapImg = document.getElementById('plattegrondImg');
    const mapTitel = document.getElementById('plattegrondTitel');
    const infoBlock = document.getElementById('vleugelInfo');
    const vleugelButtons = document.querySelectorAll('.vleugel-btn');

    let gekozenVerdieping = null;

    // Database van locaties
    const gebouwData = {
        // Directe sleutel voor de garage (zonder vleugel A of B)
        "-1_A": {
            afbeelding: "Plattegronden/",
            titel: "Fiets/auto garage - A-vleugel",
            info: "Hier vind je de fietsenstalling en de parkeerplaatsen voor auto's."
        },
        "0_A": {
            afbeelding: "Plattegronden/",
            titel: "Begane grond - A-vleugel",
            info: "Deze vleugel is aan de linkerkant van het gebouw en bevat: een kapstok voor jassen, een kamer van de locatiedirecteur, een keuken voor de docenten, een docentenruimte en een aantal toiletten."
        },
        "0_B": {
            afbeelding: "Plattegronden/",
            titel: "Begane grond - B-vleugel",
            info: "Hier vind je de receptie, de congiërge en de kantine, met een broodjesbar. In de kantine zijn een heel aantal zitplaatsen met tafels, een aantal toiletten en een aantal automaten met drankjes en snacks. Ook is er ruimte voor ontspanning door middel van een tafeltennistafel en een tafelvoetbalspel. Ook is er als je achterin de kantine een trap oploopt een chillzone waar je ook kan zitten en kan tafeltennisen."
        },
        "1_A": {
            afbeelding: "Plattegronden/",
            titel: "Eerste verdieping - A-vleugel",
            info: "Deze vleugel is aan de linkerkant van het gebouw en bevat: een aantal lokalen, een aantal toiletten en een aantal trappen."
        },
        "1_B": {
            afbeelding: "Plattegronden/",
            titel: "Eerste verdieping - B-vleugel",
            info: "Deze vleugel is aan de rechterkant van het gebouw en bevat: een aantal lokalen, een aantal toiletten en een aantal trappen." 
        },
        "2_A": {
            afbeelding: "Plattegronden/",
            titel: "Tweede verdieping - A-vleugel",
            info: "Deze vleugel is aan de linkerkant van het gebouw en bevat: een aantal lokalen, een aantal toiletten en een aantal trappen."
        },
        "2_B": {
            afbeelding: "Plattegronden/",
            titel: "Tweede verdieping - B-vleugel",
            info: "Deze vleugel is aan de rechterkant van het gebouw en bevat: een aantal lokalen, een aantal toiletten en een aantal trappen." 
        },
        "3_A": {
            afbeelding: "Plattegronden/",
            titel: "Derde verdieping - A-vleugel",
            info: "Deze vleugel is aan de linkerkant van het gebouw en bevat: een aantal lokalen, een aantal toiletten en een aantal trappen."
        },
        "3_B": {
            afbeelding: "Plattegronden/",
            titel: "Derde verdieping - B-vleugel",
            info: "Deze vleugel is aan de rechterkant van het gebouw en bevat: een aantal lokalen, een aantal toiletten en een aantal trappen."
        },
        "4_A": {
            afbeelding: "Plattegronden/",
            titel: "Vierde verdieping - A-vleugel",
            info: "Deze vleugel is aan de linkerkant van het gebouw en bevat: een aantal lokalen, een aantal toiletten en een aantal trappen."
        },
        "4_B": {
            afbeelding: "Plattegronden/",
            titel: "Vierde verdieping - B-vleugel",
            info: "Deze vleugel is aan de rechterkant van het gebouw en bevat: een aantal lokalen, een aantal toiletten en een aantal trappen."
        },
    };

    // Functie om de plattegrond en info te tonen op het scherm
    function toonPlattegrond(data) {
        mapImg.src = data.afbeelding;
        mapImg.style.display = 'block';
        mapTitel.innerText = data.titel;

        document.getElementById('vleugelTitel').innerText = data.titel;
        document.getElementById('vleugelBeschrijving').innerText = data.info;
        infoBlock.style.display = 'block';
    }

    // STAP 1: Verdieping selecteren
    verdiepingSelect.addEventListener('change', (e) => {
        gekozenVerdieping = e.target.value;

        // Reset het scherm bij verandering
        mapImg.style.display = 'none';
        infoBlock.style.display = 'none';
        stapVleugel.style.display = 'none';

        if (gekozenVerdieping === "-1") {
            // Garage gekozen: Toon DIRECT de plattegrond, vraag GEEN vleugel
            if (gebouwData["-1"]) {
                toonPlattegrond(gebouwData["-1"]);
            }
        } else if (gekozenVerdieping !== "") {
            // Andere verdieping gekozen: Toon de vleugelkeuze
            stapVleugel.style.display = 'block';
            mapTitel.innerText = "Selecteer de gewenste vleugel";
        } else {
            mapTitel.innerText = "Selecteer een verdieping en vleugel";
        }
    });

    // STAP 2: Vleugel selecteren (voor overige verdiepingen)
    vleugelButtons.forEach(button => {
        button.addEventListener('click', () => {
            const gekozenVleugel = button.getAttribute('data-vleugel');
            const sleutel = `${gekozenVerdieping}_${gekozenVleugel}`;

            if (gebouwData[sleutel]) {
                toonPlattegrond(gebouwData[sleutel]);
            }
        });
    });
});

    // 2. REGISTREER DE SERVICE WORKER (PWA)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
        .then((reg) => console.log('Service Worker succesvol geregistreerd!', reg))
        .catch((err) => console.error('Service Worker registratie mislukt:', err));
}