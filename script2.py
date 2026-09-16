import os
import cv2
import numpy as np
import easyocr

def verwijder_lengtematen_uit_afbeeldingen(invoer_map, uitvoer_map):
    # Controleer of invoermap bestaat
    if not os.path.exists(invoer_map):
        print(f"Fout: De map '{invoer_map}' bestaat niet.")
        return

    os.makedirs(uitvoer_map, exist_ok=True)

    # Initialiseer de OCR reader (Nederlands / Engels)
    print("OCR model laden...")
    reader = easyocr.Reader(['nl', 'en'], gpu=False)

    # Loop door alle geconverteerde afbeeldingen
    for bestand in os.listdir(invoer_map):
        if bestand.lower().endswith(('.png', '.jpg', '.jpeg')):
            afbeelding_pad = os.path.join(invoer_map, bestand)
            print(f"Verwerken: {bestand}...")

            # Lees afbeelding in met OpenCV
            img = cv2.imread(afbeelding_pad)
            if img is None:
                continue

            # Maak een blanco masker aan (even groot als de afbeelding)
            mask = np.zeros(img.shape[:2], dtype=np.uint8)

            # Detecteer alle tekst en getallen
            results = reader.readtext(afbeelding_pad)

            for (bbox, text, prob) in results:
                # Zet hoekpunten om naar gehele getallen
                pts = np.array(bbox, dtype=np.int32)
                
                # Vul de gedetecteerde tekstzone in op het masker (wit op zwart)
                cv2.fillPoly(mask, [pts], 255)

            # Vergroot de geselecteerde gebieden lichtjes voor betere dekking
            kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
            mask = cv2.dilate(mask, kernel, iterations=1)

            # Vul de ruimtes waar tekst stond op met de achtergrondkleur (inpainting)
            result = cv2.inpaint(img, mask, inpaintRadius=3, flags=cv2.INPAINT_TELEA)

            # Sla de opgeschoonde afbeelding op
            output_bestand = os.path.join(uitvoer_map, f"clean_{bestand}")
            cv2.imwrite(output_bestand, result)
            print(f"-> Opgeslagen als: clean_{bestand}")

# --- INSTELLINGEN ---
INVOER_MAP = r"C:\xampp\htdocs\leerjaar 3\programmeren Frontend\gebouwroute\Plattegronden\geconverteerd"
UITVOER_MAP = r"C:\xampp\htdocs\leerjaar 3\programmeren Frontend\gebouwroute\Plattegronden\zonder_maten"

# Voer de functie uit
verwijder_lengtematen_uit_afbeeldingen(INVOER_MAP, UITVOER_MAP)