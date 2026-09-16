document.addEventListener('DOMContentLoaded', () => {
const verdiepingSelect = document.getElementById('verdiepingSelect');
const stapVleugel = document.getElementById('stap-vleugel');
const mapImg = document.getElementById('plattegrondImg');
const mapTitel = document.getElementById('plattegrondTitel');
const infoBlock = document.getElementById('vleugelInfo');

let gekozenVerdieping = null;

    // Database met informatie per combinatie van verdieping en vleugel
    const gebouwData = {
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
            titel: "1e Verdieping - A-vleugel",
            info: ""
        },
        "1_B": {
            afbeelding: "Plattegronden/",
            titel: "1e Verdieping - B-vleugel",
            info: ""
        },
        "2_A": {
            afbeelding: "Plattegronden/",
            titel: "2e Verdieping - A-vleugel",
            info: ""
        },
        "2_B": {
            afbeelding: "Plattegronden/",
            titel: "2e Verdieping - B-vleugel",
            info: ""
        },
        "3_A": {
            afbeelding: "Plattegronden/",
            titel: "3e Verdieping - A-vleugel",
            info: ""
        },
        "3_B": {
            afbeelding: "Plattegronden/",
            titel: "3e Verdieping - B-vleugel",
            info: ""
        },
        "4_A": {
            afbeelding: "Plattegronden/",
            titel: "4e Verdieping - A-vleugel",
            info: ""
        },
        "4_B": {
            afbeelding: "Plattegronden/",
            titel: "4e Verdieping - B-vleugel",
            info: ""
        }
    };

    // STAP 1: Verdieping gekozen
    verdiepingSelect.addEventListener('change', (e) => {
        gekozenVerdieping = e.target.value;

        if (gekozenVerdieping !== "") {
            // Toon de keuze voor de vleugel
            stapVleugel.style.display = 'block';
        } else {
            // Verberg vervolgstappen als er niets gekozen is
            stapVleugel.style.display = 'none';
            mapImg.style.display = 'none';
            infoBlock.style.display = 'none';
            mapTitel.innerText = "Selecteer een verdieping en vleugel";
        }
    });

    // STAP 2: Vleugel gekozen (via de knoppen)
    const vleugelButtons = document.querySelectorAll('.vleugel-btn');
    vleugelButtons.forEach(button => {
        button.addEventListener('click', () => {
            const gekozenVleugel = button.getAttribute('data-vleugel');
            const sleutel = `${gekozenVerdieping}_${gekozenVleugel}`;

            if (gebouwData[sleutel]) {
                const data = gebouwData[sleutel];

                // Update plattegrond en tekst
                mapImg.src = data.afbeelding;
                mapImg.style.display = 'block';
                mapTitel.innerText = data.titel;

                // Update informatiekaart
                document.getElementById('vleugelTitel').innerText = data.titel;
                document.getElementById('vleugelBeschrijving').innerText = data.info;
                infoBlock.style.display = 'block';
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