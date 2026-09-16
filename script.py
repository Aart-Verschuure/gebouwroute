import os
from pdf2image import convert_from_path

def converteer_map_naar_afbeeldingen(invoer_map, poppler_bin_pad):
    # Controleer of de invoermap bestaat
    if not os.path.exists(invoer_map):
        print(f"Fout: De map '{invoer_map}' bestaat niet.")
        return

    # Maak een map aan voor de uitvoer als deze nog niet bestaat
    uitvoer_map = os.path.join(invoer_map, "geconverteerd")
    os.makedirs(uitvoer_map, exist_ok=True)

    # Loop door alle bestanden in de invoermap
    for bestand in os.listdir(invoer_map):
        if bestand.lower().endswith(".pdf"):
            pdf_pad = os.path.join(invoer_map, bestand)
            bestandsnaam_zonder_extensie = os.path.splitext(bestand)[0]
            
            print(f"Bezig met converteren: {bestand}...")

            try:
                # Zet de PDF om naar afbeeldingen
                images = convert_from_path(pdf_pad, poppler_path=poppler_bin_pad)

                # Sla elke pagina op als een afzonderlijke afbeelding
                for i, image in enumerate(images):
                    output_bestand = os.path.join(
                        uitvoer_map, 
                        f"{bestandsnaam_zonder_extensie}_pagina_{i + 1}.png"
                    )
                    image.save(output_bestand, "PNG")

                print(f"-> Succesvol omgezet ({len(images)} pagina('s))")

            except Exception as e:
                print(f"-> Fout bij omzetten van {bestand}: {e}")

# --- INSTELLINGEN ---
# 1. Vul hier het pad in naar de map waar jouw PDF's staan:
INPUT_MAP = r"C:\xampp\htdocs\leerjaar 3\programmeren Frontend\gebouwroute\Plattegronden"

# 2. Vul hier het pad in naar de 'bin' map van de uitgepakte Poppler Release:
POPPLER_PAD = r"C:\Program Files\poppler\Library\bin"

# Voer de functie uit
converteer_map_naar_afbeeldingen(INPUT_MAP, POPPLER_PAD)