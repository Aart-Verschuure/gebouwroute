document.addEventListener('DOMContentLoaded', () => {
const verdiepingSelect = document.getElementById('verdiepingSelect');
const stapVleugel = document.getElementById('stap-vleugel');
const mapImg = document.getElementById('plattegrondImg');
const mapTitel = document.getElementById('plattegrondTitel');
const infoBlock = document.getElementById('vleugelInfo');

let gekozenVerdieping = null;

    // Database met informatie per combinatie van verdieping en vleugel
    const gebouwData = {
        "0_A": {
            afbeelding: "Plattegronden/alleen_muren_en_lokalen/bg_vleugel_a.png",
            titel: "Begane grond - A-vleugel",
            info: "Hier vind je de receptie, de hoofdingang en het auditorium."
        },
        "0_B": {
            afbeelding: "Plattegronden/alleen_muren_en_lokalen/bg_vleugel_b.png",
            titel: "Begane grond - B-vleugel",
            info: "Hier bevindt zich de centrale kantine en de grote praktijklokalen."
        },
        "1_A": {
            afbeelding: "Plattegronden/alleen_muren_en_lokalen/v1_vleugel_a.png",
            titel: "1e Verdieping - A-vleugel",
            info: "Computerlokalen (A1.01 t/m A1.12) en de IT-servicedesk."
        },
        "1_B": {
            afbeelding: "Plattegronden/alleen_muren_en_lokalen/v1_vleugel_b.png",
            titel: "1e Verdieping - B-vleugel",
            info: "Stilteruimtes, mediatheek en de spreekkamers voor begeleiders."
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