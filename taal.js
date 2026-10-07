/*
 * TAAL
 * De route-instructies (wat de stem zegt en de stap-tekst op het scherm) in de taal
 * van de gekozen stem. Knoppen en menu's blijven Nederlands.
 *
 * Elke taal heeft dezelfde zinnen als functies. Plekken (lift, trap, kantine...)
 * worden vertaald via NAMEN; staat een naam daar niet in, dan blijft hij Nederlands.
 * Veel talen hebben naamvallen of lidwoorden die afhangen van het voorzetsel, daarom
 * heeft elke vertaalde naam twee vormen: [kaal, met lidwoord].
 */
const Taal = (() => {
    // Plekken uit data.js. Sleutel = Nederlandse naam in kleine letters, zonder "de ".
    const NAMEN = {
        'ingang': {
            en: ['entrance', 'the entrance'], de: ['Eingang', 'den Eingang'], fr: ["l'entrée", "l'entrée"],
            es: ['la entrada', 'la entrada'], tr: ['giriş', 'giriş'], ar: ['المدخل', 'المدخل'], ro: ['intrare', 'intrarea'],
        },
        'centrale hal': {
            en: ['central hall', 'the central hall'], de: ['Zentralhalle', 'die Zentralhalle'], fr: ['le hall central', 'le hall central'],
            es: ['el vestíbulo central', 'el vestíbulo central'], tr: ['merkez hol', 'merkez hol'], ar: ['القاعة المركزية', 'القاعة المركزية'], ro: ['holul central', 'holul central'],
        },
        'ingang van het schoolterrein': {
            en: ['school grounds entrance', 'the entrance to the school grounds'], de: ['Eingang zum Schulgelände', 'den Eingang zum Schulgelände'],
            fr: ["l'entrée de l'enceinte scolaire", "l'entrée de l'enceinte scolaire"], es: ['la entrada del recinto escolar', 'la entrada del recinto escolar'],
            tr: ['okul bahçesinin girişi', 'okul bahçesinin girişi'], ar: ['مدخل ساحة المدرسة', 'مدخل ساحة المدرسة'], ro: ['intrarea în curtea școlii', 'intrarea în curtea școlii'],
        },
        'wc (a-vleugel)': {
            en: ['toilets (A wing)', 'the toilets in the A wing'], de: ['Toiletten (A-Flügel)', 'die Toiletten im A-Flügel'],
            fr: ["les toilettes de l'aile A", "les toilettes de l'aile A"], es: ['los aseos del ala A', 'los aseos del ala A'],
            tr: ['tuvaletler (A kanadı)', 'tuvaletler (A kanadı)'], ar: ['دورات المياه في الجناح A', 'دورات المياه في الجناح A'], ro: ['toaletele din aripa A', 'toaletele din aripa A'],
        },
        'wc (bij de hal)': {
            en: ['toilets (by the hall)', 'the toilets by the hall'], de: ['Toiletten (bei der Halle)', 'die Toiletten bei der Halle'],
            fr: ['les toilettes près du hall', 'les toilettes près du hall'], es: ['los aseos junto al vestíbulo', 'los aseos junto al vestíbulo'],
            tr: ['tuvaletler (holün yanında)', 'tuvaletler (holün yanında)'], ar: ['دورات المياه بجانب القاعة', 'دورات المياه بجانب القاعة'], ro: ['toaletele de lângă hol', 'toaletele de lângă hol'],
        },
        'garderobe': {
            en: ['cloakroom', 'the cloakroom'], de: ['Garderobe', 'die Garderobe'], fr: ['le vestiaire', 'le vestiaire'],
            es: ['el guardarropa', 'el guardarropa'], tr: ['vestiyer', 'vestiyer'], ar: ['غرفة المعاطف', 'غرفة المعاطف'], ro: ['garderobă', 'garderoba'],
        },
        'kantine': {
            en: ['canteen', 'the canteen'], de: ['Kantine', 'die Kantine'], fr: ['la cantine', 'la cantine'],
            es: ['la cafetería', 'la cafetería'], tr: ['kantin', 'kantin'], ar: ['المقصف', 'المقصف'], ro: ['cantină', 'cantina'],
        },
        'fietsstalling': {
            en: ['bicycle shed', 'the bicycle shed'], de: ['Fahrradstellplatz', 'den Fahrradstellplatz'], fr: ['le parking à vélos', 'le parking à vélos'],
            es: ['el aparcamiento de bicicletas', 'el aparcamiento de bicicletas'], tr: ['bisiklet parkı', 'bisiklet parkı'], ar: ['موقف الدراجات', 'موقف الدراجات'], ro: ['parcarea de biciclete', 'parcarea de biciclete'],
        },
        'parkeerplaatsen': {
            en: ['parking spaces', 'the parking spaces'], de: ['Parkplätze', 'die Parkplätze'], fr: ['les places de parking', 'les places de parking'],
            es: ['las plazas de aparcamiento', 'las plazas de aparcamiento'], tr: ['otopark', 'otopark'], ar: ['مواقف السيارات', 'مواقف السيارات'], ro: ['locurile de parcare', 'locurile de parcare'],
        },
        'lift': {
            en: ['lift', 'the lift'], de: ['Aufzug', 'den Aufzug'], fr: ["l'ascenseur", "l'ascenseur"],
            es: ['el ascensor', 'el ascensor'], tr: ['asansör', 'asansör'], ar: ['المصعد', 'المصعد'], ro: ['lift', 'liftul'],
        },
        'trap naast de lift': {
            en: ['stairs next to the lift', 'the stairs next to the lift'], de: ['Treppe neben dem Aufzug', 'die Treppe neben dem Aufzug'],
            fr: ["l'escalier à côté de l'ascenseur", "l'escalier à côté de l'ascenseur"], es: ['la escalera junto al ascensor', 'la escalera junto al ascensor'],
            tr: ['asansörün yanındaki merdiven', 'asansörün yanındaki merdiven'], ar: ['الدرج بجانب المصعد', 'الدرج بجانب المصعد'], ro: ['scara de lângă lift', 'scara de lângă lift'],
        },
        'middelste trap': {
            en: ['middle stairs', 'the middle stairs'], de: ['mittlere Treppe', 'die mittlere Treppe'], fr: ["l'escalier du milieu", "l'escalier du milieu"],
            es: ['la escalera central', 'la escalera central'], tr: ['ortadaki merdiven', 'ortadaki merdiven'], ar: ['الدرج الأوسط', 'الدرج الأوسط'], ro: ['scara din mijloc', 'scara din mijloc'],
        },
    };
    // De trappen in de A- en B-vleugel
    for (const vleugel of ['A', 'B']) {
        NAMEN[`trap in de ${vleugel.toLowerCase()}-vleugel`] = {
            en: [`stairs in the ${vleugel} wing`, `the stairs in the ${vleugel} wing`], de: [`Treppe im ${vleugel}-Flügel`, `die Treppe im ${vleugel}-Flügel`],
            fr: [`l'escalier de l'aile ${vleugel}`, `l'escalier de l'aile ${vleugel}`], es: [`la escalera del ala ${vleugel}`, `la escalera del ala ${vleugel}`],
            tr: [`${vleugel} kanadındaki merdiven`, `${vleugel} kanadındaki merdiven`], ar: [`الدرج في الجناح ${vleugel}`, `الدرج في الجناح ${vleugel}`],
            ro: [`scara din aripa ${vleugel}`, `scara din aripa ${vleugel}`],
        };
    }

    // Met de taal erbij, want in het Turks wordt i een İ
    const hoofdletter = (s) => s.charAt(0).toLocaleUpperCase(code) + s.slice(1);
    const verdieping = (id) => Route.verdieping(id);
    // 'kelder', 'begane grond' of het nummer van de verdieping
    const soortVerdieping = (id) => {
        const v = verdieping(id);
        return v.id === 'K' || v.niveau < 0 ? 'kelder' : v.niveau === 0 ? 'begane grond' : v.niveau;
    };

    // Elke taal: dezelfde zinnen. N(ding) = naam met lidwoord, K(ding) = kale naam.
    // soort bij draai: 'rechtdoor', 'houd', 'sla' of 'keer'. kant bij bijna: 'voor', 'rechts', 'links', 'achter' of null.
    const TALEN = {
        nl: {
            naam: 'Nederlands', stemTaal: 'nl-NL',
            cijfers: ['nul', 'één', 'twee', 'drie', 'vier', 'vijf', 'zes', 'zeven', 'acht', 'negen'],
            meters: (n) => `${n} meter`,
            draai: (soort, rechts) => {
                const kant = rechts ? 'rechts' : 'links';
                return { rechtdoor: 'Loop rechtdoor', houd: `Houd ${kant} aan`, sla: `Sla ${kant}af`, keer: 'Keer om' }[soort];
            },
            neemLift: (N, K, v, naar) => `Neem ${N(v)} naar ${Route.verdiepingNaam(naar)}.`,
            neemTrap: (N, K, v, naar, omhoog) => `Neem ${N(v)} naar ${omhoog ? 'boven' : 'beneden'}, naar ${Route.verdiepingNaam(naar)}.`,
            verlaat: (N, K, begin) => `Verlaat ${N(begin)} en ga de gang in.`,
            loopVanaf: (N, K, begin, m, doel) => `Loop vanaf ${begin ? N(begin) : 'je startpunt'} ongeveer ${m}${doel ? ` richting ${N(doel)}` : ''}.`,
            stapUit: (N, K, v, m, doel) => `Stap uit ${N(v)} en loop ongeveer ${m}${doel ? ` richting ${N(doel)}` : ''}.`,
            loop: (N, K, m, doel) => `Loop ongeveer ${m}${doel ? ` richting ${N(doel)}` : ''}.`,
            draaiEnLoop: (N, K, draai, m, tot) => `${draai} en loop ongeveer ${m}${tot ? ` tot bij ${N(tot)}` : ''}.`,
            bijna: (N, K, lokaal, kant) => `Je bent er bijna! ${hoofdletter(N(lokaal))} is${{ voor: ' recht voor je', rechts: ' aan je rechterhand', links: ' aan je linkerhand', achter: ' achter je' }[kant] || ' hier'}.`,
            aangekomen: (N, K, eind) => `Gelukt, je bent aangekomen bij ${N(eind)}. Fijne dag!`,
            nuOp: (id) => `Je bent nu ${soortVerdieping(id) === 'kelder' ? 'in' : 'op'} ${Route.verdiepingNaam(id)}.`,
            start: 'Daar gaan we!',
            hallo: 'Hoi! Ik help je graag de weg te vinden.',
            proef: 'Hoi! Zo klink ik. Ik vertel je onderweg welke kant je op moet.',
        },

        en: {
            naam: 'English', stemTaal: 'en-GB',
            cijfers: ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'],
            lokaal: (s) => [`room ${s}`, `room ${s}`],
            meters: (n) => `${n} metres`,
            verdieping: (id) => {
                const s = soortVerdieping(id);
                return s === 'kelder' ? 'basement' : s === 'begane grond' ? 'ground floor'
                    : `${['first', 'second', 'third', 'fourth', 'fifth', 'sixth'][s - 1] || `${s}th`} floor`;
            },
            draai(soort, rechts) {
                const kant = rechts ? 'right' : 'left';
                return { rechtdoor: 'Go straight ahead', houd: `Keep ${kant}`, sla: `Turn ${kant}`, keer: 'Turn around' }[soort];
            },
            neemLift(N, K, v, naar) { return `Take ${N(v)} to the ${this.verdieping(naar)}.`; },
            neemTrap(N, K, v, naar, omhoog) { return `Take ${N(v)} ${omhoog ? 'up' : 'down'} to the ${this.verdieping(naar)}.`; },
            verlaat: (N, K, begin) => `Leave ${N(begin)} and go into the corridor.`,
            loopVanaf: (N, K, begin, m, doel) => `From ${begin ? N(begin) : 'your starting point'}, walk about ${m}${doel ? ` towards ${N(doel)}` : ''}.`,
            stapUit: (N, K, v, m, doel) => `From ${N(v)}, walk about ${m}${doel ? ` towards ${N(doel)}` : ''}.`,
            loop: (N, K, m, doel) => `Walk about ${m}${doel ? ` towards ${N(doel)}` : ''}.`,
            draaiEnLoop: (N, K, draai, m, tot) => `${draai} and walk about ${m}${tot ? ` to ${N(tot)}` : ''}.`,
            bijna: (N, K, lokaal, kant) => `Almost there! You'll find ${N(lokaal)} ${{ voor: 'right in front of you', rechts: 'on your right', links: 'on your left', achter: 'behind you' }[kant] || 'right here'}.`,
            aangekomen: (N, K, eind) => `Well done, you have arrived at ${N(eind)}. Have a nice day!`,
            nuOp(id) { return `You are now ${soortVerdieping(id) === 'kelder' ? 'in' : 'on'} the ${this.verdieping(id)}.`; },
            start: 'Here we go!',
            hallo: "Hi! I'm happy to help you find your way.",
            proef: "Hi! This is how I sound. Along the way I'll tell you which way to go.",
        },

        de: {
            naam: 'Deutsch', stemTaal: 'de-DE',
            cijfers: ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun'],
            lokaal: (s) => [`Raum ${s}`, `den Raum ${s}`],
            meters: (n) => `${n} Meter`,
            // naar: "in den ersten Stock", op: "im ersten Stock"
            verdieping(id, op) {
                const s = soortVerdieping(id);
                if (s === 'kelder') return op ? 'im Keller' : 'in den Keller';
                if (s === 'begane grond') return op ? 'im Erdgeschoss' : 'ins Erdgeschoss';
                const rang = ['ersten', 'zweiten', 'dritten', 'vierten', 'fünften', 'sechsten'][s - 1] || `${s}.`;
                return `${op ? 'im' : 'in den'} ${rang} Stock`;
            },
            draai(soort, rechts) {
                const kant = rechts ? 'rechts' : 'links';
                return { rechtdoor: 'Geh geradeaus', houd: `Halte dich ${kant}`, sla: `Bieg ${kant} ab`, keer: 'Dreh um' }[soort];
            },
            neemLift(N, K, v, naar) { return `Nimm ${N(v)} ${this.verdieping(naar)}.`; },
            neemTrap(N, K, v, naar, omhoog) { return `Nimm ${N(v)} nach ${omhoog ? 'oben' : 'unten'}, ${this.verdieping(naar)}.`; },
            verlaat: (N, K, begin) => `Verlass ${N(begin)} und geh in den Flur.`,
            loopVanaf: (N, K, begin, m, doel) => `${begin ? `Start: ${K(begin)}. ` : ''}Geh etwa ${m}${doel ? ` Richtung ${K(doel)}` : ''}.`,
            stapUit: (N, K, v, m, doel) => `Geh dann etwa ${m}${doel ? ` Richtung ${K(doel)}` : ''}.`,
            loop: (N, K, m, doel) => `Geh etwa ${m}${doel ? ` Richtung ${K(doel)}` : ''}.`,
            draaiEnLoop: (N, K, draai, m, tot) => `${draai} und geh etwa ${m}${tot ? ` Richtung ${K(tot)}` : ''}.`,
            bijna: (N, K, lokaal, kant) => `Fast geschafft! ${hoofdletter(K(lokaal))} findest du ${{ voor: 'direkt vor dir', rechts: 'rechts von dir', links: 'links von dir', achter: 'hinter dir' }[kant] || 'genau hier'}.`,
            aangekomen: (N, K, eind) => `Geschafft, du bist angekommen: ${K(eind)}. Einen schönen Tag noch!`,
            nuOp(id) { return `Du bist jetzt ${this.verdieping(id, true)}.`; },
            start: "Los geht's!",
            hallo: 'Hallo! Ich helfe dir gern, den Weg zu finden.',
            proef: 'Hallo! So klinge ich. Unterwegs sage ich dir, wohin du gehen musst.',
        },

        fr: {
            naam: 'Français', stemTaal: 'fr-FR',
            cijfers: ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'],
            lokaal: (s) => [`la salle ${s}`, `la salle ${s}`],
            meters: (n) => `${n} mètres`,
            verdieping: (id) => {
                const s = soortVerdieping(id);
                if (s === 'kelder') return 'au sous-sol';
                if (s === 'begane grond') return 'au rez-de-chaussée';
                return `au ${['premier', 'deuxième', 'troisième', 'quatrième', 'cinquième', 'sixième'][s - 1] || `${s}e`} étage`;
            },
            draai(soort, rechts) {
                const kant = rechts ? 'droite' : 'gauche';
                return { rechtdoor: 'Continue tout droit', houd: `Garde ta ${kant}`, sla: `Tourne à ${kant}`, keer: 'Fais demi-tour' }[soort];
            },
            neemLift(N, K, v, naar) { return `Prends ${N(v)} pour aller ${this.verdieping(naar)}.`; },
            neemTrap(N, K, v, naar, omhoog) { return `Prends ${N(v)} pour ${omhoog ? 'monter' : 'descendre'} ${this.verdieping(naar)}.`; },
            verlaat: (N, K, begin) => `Quitte ${N(begin)} et va dans le couloir.`,
            loopVanaf: (N, K, begin, m, doel) => `Depuis ${begin ? N(begin) : 'ton point de départ'}, marche environ ${m}${doel ? ` vers ${N(doel)}` : ''}.`,
            stapUit: (N, K, v, m, doel) => `Depuis ${N(v)}, marche environ ${m}${doel ? ` vers ${N(doel)}` : ''}.`,
            loop: (N, K, m, doel) => `Marche environ ${m}${doel ? ` vers ${N(doel)}` : ''}.`,
            draaiEnLoop: (N, K, draai, m, tot) => `${draai} et marche environ ${m}${tot ? ` jusqu'à atteindre ${N(tot)}` : ''}.`,
            bijna: (N, K, lokaal, kant) => `Tu y es presque ! Tu trouveras ${N(lokaal)} ${{ voor: 'juste devant toi', rechts: 'sur ta droite', links: 'sur ta gauche', achter: 'derrière toi' }[kant] || 'ici'}.`,
            aangekomen: (N, K, eind) => `Bravo, tu es arrivé à destination : ${N(eind)}. Bonne journée !`,
            nuOp(id) { return `Tu es maintenant ${this.verdieping(id)}.`; },
            start: "C'est parti !",
            hallo: "Salut ! Je vais t'aider à trouver ton chemin.",
            proef: 'Salut ! Voici ma voix. Pendant le trajet, je te dirai où aller.',
        },

        es: {
            naam: 'Español', stemTaal: 'es-ES',
            cijfers: ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'],
            lokaal: (s) => [`el aula ${s}`, `el aula ${s}`],
            meters: (n) => `${n} metros`,
            // naar: "a la primera planta", op: "en la primera planta"
            verdieping(id, op) {
                const s = soortVerdieping(id);
                if (s === 'kelder') return op ? 'en el sótano' : 'al sótano';
                const plek = s === 'begane grond' ? 'planta baja'
                    : `${['primera', 'segunda', 'tercera', 'cuarta', 'quinta', 'sexta'][s - 1] || `${s}.ª`} planta`;
                return `${op ? 'en' : 'a'} la ${plek}`;
            },
            // "de el" -> "del" en "a el" -> "al"
            de: (naam) => (naam.startsWith('el ') ? `del ${naam.slice(3)}` : `de ${naam}`),
            a: (naam) => (naam.startsWith('el ') ? `al ${naam.slice(3)}` : `a ${naam}`),
            draai(soort, rechts) {
                const kant = rechts ? 'derecha' : 'izquierda';
                return { rechtdoor: 'Sigue recto', houd: `Mantente a la ${kant}`, sla: `Gira a la ${kant}`, keer: 'Da la vuelta' }[soort];
            },
            neemLift(N, K, v, naar) { return `Toma ${N(v)} ${this.verdieping(naar)}.`; },
            neemTrap(N, K, v, naar, omhoog) { return `Toma ${N(v)} y ${omhoog ? 'sube' : 'baja'} ${this.verdieping(naar)}.`; },
            verlaat(N, K, begin) { return `Sal ${this.de(N(begin))} y entra en el pasillo.`; },
            loopVanaf: (N, K, begin, m, doel) => `Desde ${begin ? N(begin) : 'tu punto de partida'}, camina unos ${m}${doel ? ` hacia ${N(doel)}` : ''}.`,
            stapUit: (N, K, v, m, doel) => `Desde ${N(v)}, camina unos ${m}${doel ? ` hacia ${N(doel)}` : ''}.`,
            loop: (N, K, m, doel) => `Camina unos ${m}${doel ? ` hacia ${N(doel)}` : ''}.`,
            draaiEnLoop: (N, K, draai, m, tot) => `${draai} y camina unos ${m}${tot ? ` hasta ${N(tot)}` : ''}.`,
            bijna: (N, K, lokaal, kant) => `¡Ya casi llegas! Encontrarás ${N(lokaal)} ${{ voor: 'justo delante de ti', rechts: 'a tu derecha', links: 'a tu izquierda', achter: 'detrás de ti' }[kant] || 'aquí mismo'}.`,
            aangekomen(N, K, eind) { return `¡Muy bien, has llegado ${this.a(N(eind))}! Que tengas un buen día.`; },
            nuOp(id) { return `Ahora estás ${this.verdieping(id, true)}.`; },
            start: '¡Vamos allá!',
            hallo: '¡Hola! Te ayudo a encontrar el camino.',
            proef: '¡Hola! Así sueno yo. Durante el recorrido te diré por dónde ir.',
        },

        tr: {
            naam: 'Türkçe', stemTaal: 'tr-TR',
            cijfers: ['sıfır', 'bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz'],
            lokaal: (s) => [`${s} numaralı sınıf`, `${s} numaralı sınıf`],
            meters: (n) => `${n} metre`,
            // naar: "1. kata", op: "1. kattasın"
            verdieping(id, op) {
                const s = soortVerdieping(id);
                const kat = s === 'kelder' ? 'bodrum kat' : s === 'begane grond' ? 'zemin kat' : `${s}. kat`;
                return op ? `${kat}tasın` : `${kat}a`;
            },
            draai(soort, rechts) {
                return {
                    rechtdoor: 'Düz devam et', houd: rechts ? 'Hafifçe sağa yönel' : 'Hafifçe sola yönel',
                    sla: rechts ? 'Sağa dön' : 'Sola dön', keer: 'Geri dön',
                }[soort];
            },
            neemLift(N, K, v, naar) { return `${hoofdletter(N(v))} ile ${this.verdieping(naar)} git.`; },
            neemTrap(N, K, v, naar, omhoog) { return `${hoofdletter(N(v))} ile ${this.verdieping(naar)} ${omhoog ? 'çık' : 'in'}.`; },
            verlaat: () => 'Önce koridora çık.',
            loopVanaf: (N, K, begin, m, doel) => `${begin ? `Başlangıç: ${N(begin)}. ` : ''}${doel ? `${hoofdletter(N(doel))} yönünde yaklaşık` : 'Yaklaşık'} ${m} yürü.`,
            stapUit: (N, K, v, m, doel) => `Sonra ${doel ? `${N(doel)} yönünde ` : ''}yaklaşık ${m} yürü.`,
            loop: (N, K, m, doel) => `${doel ? `${hoofdletter(N(doel))} yönünde yaklaşık` : 'Yaklaşık'} ${m} yürü.`,
            draaiEnLoop: (N, K, draai, m, tot) => `${draai} ve ${tot ? `${N(tot)} yönünde ` : ''}yaklaşık ${m} yürü.`,
            bijna: (N, K, lokaal, kant) => `Neredeyse vardın! ${hoofdletter(N(lokaal))} ${{ voor: 'tam önünde', rechts: 'sağında', links: 'solunda', achter: 'arkanda' }[kant] || 'burada'}.`,
            aangekomen: (N, K, eind) => `Tebrikler, hedefine ulaştın: ${N(eind)}. İyi günler!`,
            nuOp(id) { return `Şu an ${this.verdieping(id, true)}.`; },
            start: 'Haydi başlayalım!',
            hallo: 'Merhaba! Yolunu bulmana yardım edeceğim.',
            proef: 'Merhaba! Sesim böyle. Yol boyunca nereye gideceğini söyleyeceğim.',
        },

        ar: {
            naam: 'العربية', stemTaal: 'ar-SA', rtl: true,
            cijfers: ['صفر', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'],
            lokaal: (s) => [`القاعة ${s}`, `القاعة ${s}`],
            // 2 = مترين, 3-10 = أمتار, 11 en meer = مترًا
            meters: (n) => (n === 2 ? 'مترين' : n <= 10 ? `${n} أمتار` : `${n} مترًا`),
            verdieping(id, op) {
                const s = soortVerdieping(id);
                const plek = s === 'kelder' ? 'الطابق السفلي' : s === 'begane grond' ? 'الطابق الأرضي'
                    : `الطابق ${['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس'][s - 1] || s}`;
                return `${op ? 'في' : 'إلى'} ${plek}`;
            },
            draai(soort, rechts) {
                return {
                    rechtdoor: 'امشِ مستقيمًا', houd: `ابقَ على ${rechts ? 'اليمين' : 'اليسار'}`,
                    sla: `انعطف ${rechts ? 'يمينًا' : 'يسارًا'}`, keer: 'استدر للخلف',
                }[soort];
            },
            neemLift(N, K, v, naar) { return `خذ ${N(v)} ${this.verdieping(naar)}.`; },
            neemTrap(N, K, v, naar, omhoog) { return `خذ ${N(v)} ${omhoog ? 'صعودًا' : 'نزولًا'} ${this.verdieping(naar)}.`; },
            verlaat: (N, K, begin) => `اخرج من ${N(begin)} وادخل الممر.`,
            loopVanaf: (N, K, begin, m, doel) => `من ${begin ? N(begin) : 'نقطة البداية'}، امشِ حوالي ${m}${doel ? ` باتجاه ${N(doel)}` : ''}.`,
            stapUit: (N, K, v, m, doel) => `من ${N(v)}، امشِ حوالي ${m}${doel ? ` باتجاه ${N(doel)}` : ''}.`,
            loop: (N, K, m, doel) => `امشِ حوالي ${m}${doel ? ` باتجاه ${N(doel)}` : ''}.`,
            draaiEnLoop: (N, K, draai, m, tot) => `${draai} وامشِ حوالي ${m}${tot ? ` حتى ${N(tot)}` : ''}.`,
            bijna: (N, K, lokaal, kant) => `اقتربت! ستجد ${N(lokaal)} ${{ voor: 'أمامك مباشرة', rechts: 'على يمينك', links: 'على يسارك', achter: 'خلفك' }[kant] || 'هنا'}.`,
            aangekomen: (N, K, eind) => `أحسنت، لقد وصلت إلى ${N(eind)}. يومًا سعيدًا!`,
            nuOp(id) { return `أنت الآن ${this.verdieping(id, true)}.`; },
            start: 'هيا بنا!',
            hallo: 'مرحبًا! يسعدني أن أساعدك في إيجاد طريقك.',
            proef: 'مرحبًا! هكذا يبدو صوتي. سأخبرك في الطريق إلى أين تذهب.',
        },

        ro: {
            naam: 'Română', stemTaal: 'ro-RO',
            cijfers: ['zero', 'unu', 'doi', 'trei', 'patru', 'cinci', 'șase', 'șapte', 'opt', 'nouă'],
            lokaal: (s) => [`sala ${s}`, `sala ${s}`],
            // Vanaf 20: "20 de metri"
            meters: (n) => (n < 20 ? `${n} metri` : `${n} de metri`),
            verdieping: (id) => {
                const s = soortVerdieping(id);
                return s === 'kelder' ? 'la subsol' : s === 'begane grond' ? 'la parter' : `la etajul ${s}`;
            },
            draai(soort, rechts) {
                const kant = rechts ? 'dreapta' : 'stânga';
                return { rechtdoor: 'Mergi drept înainte', houd: `Ține-te pe ${kant}`, sla: `Fă la ${kant}`, keer: 'Întoarce-te' }[soort];
            },
            neemLift(N, K, v, naar) { return `Ia ${N(v)} până ${this.verdieping(naar)}.`; },
            neemTrap(N, K, v, naar, omhoog) { return `Ia ${N(v)} și ${omhoog ? 'urcă' : 'coboară'} ${this.verdieping(naar)}.`; },
            verlaat: (N, K, begin) => `Ieși din ${K(begin)} și intră pe hol.`,
            loopVanaf: (N, K, begin, m, doel) => `De ${begin ? `la ${K(begin)}` : 'la punctul de plecare'}, mergi aproximativ ${m}${doel ? ` spre ${K(doel)}` : ''}.`,
            stapUit: (N, K, v, m, doel) => `De la ${K(v)}, mergi aproximativ ${m}${doel ? ` spre ${K(doel)}` : ''}.`,
            loop: (N, K, m, doel) => `Mergi aproximativ ${m}${doel ? ` spre ${K(doel)}` : ''}.`,
            draaiEnLoop: (N, K, draai, m, tot) => `${draai} și mergi aproximativ ${m}${tot ? ` până la ${K(tot)}` : ''}.`,
            bijna: (N, K, lokaal, kant) => `Aproape ai ajuns! Vei găsi ${N(lokaal)} ${{ voor: 'chiar în fața ta', rechts: 'pe dreapta', links: 'pe stânga', achter: 'în spatele tău' }[kant] || 'chiar aici'}.`,
            aangekomen: (N, K, eind) => `Bravo, ai ajuns la ${K(eind)}. O zi bună!`,
            nuOp(id) { return `Acum ești ${this.verdieping(id)}.`; },
            start: 'Hai să mergem!',
            hallo: 'Bună! Te ajut cu drag să găsești drumul.',
            proef: 'Bună! Așa sună vocea mea. Pe drum îți spun încotro să mergi.',
        },
    };

    let code = 'nl';

    // Naam van een plek in de huidige taal. ding = knoop (gangpunt of lokaal) of trap/lift.
    function naam(ding, kaal = false) {
        if (code === 'nl') return ding.naam;
        const taal = TALEN[code];
        if (ding.lokaal && !ding.weergave) return taal.lokaal(ding.sleutel)[kaal ? 0 : 1];
        const nl = ding.weergave || ding.naam || '';
        const vertaling = NAMEN[nl.toLowerCase().replace(/^de /, '')];
        if (vertaling && vertaling[code]) return vertaling[code][kaal ? 0 : 1];
        return nl.replace(/^de /, ''); // onbekend: Nederlandse naam
    }
    const N = (ding) => naam(ding);
    const K = (ding) => naam(ding, true);

    // Bij welke taal hoort een stem? 'nl-BE' -> 'nl', 'en-US' -> 'en'. null = niet ondersteund.
    function vanStem(lang) {
        const basis = (lang || '').toLowerCase().split(/[-_]/)[0];
        return TALEN[basis] ? basis : null;
    }

    return {
        N, K, vanStem,
        zet(nieuw) { code = TALEN[nieuw] ? nieuw : 'nl'; },
        get code() { return code; },
        get t() { return TALEN[code]; },
        naamVan: (c) => (TALEN[c] ? TALEN[c].naam : c),
    };
})();
