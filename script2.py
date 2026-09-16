import fitz  # PyMuPDF
import os
import re

def schon_pdf_plattegrond_op(invoer_map, uitvoer_map):
    if not os.path.exists(invoer_map):
        print(f"Fout: Map '{invoer_map}' bestaat niet.")
        return

    os.makedirs(uitvoer_map, exist_ok=True)

    # Regex patroon om maataanduidingen te herkennen (bijv. 1200, +2500, 3.50, 100mm)
    maat_patroon = re.compile(r'^(\+|-)?\d+([\.,]\d+)?\s*(mm|m|cm)?$', re.IGNORECASE)

    for bestand in os.listdir(invoer_map):
        if bestand.lower().endswith('.pdf'):
            pdf_pad = os.path.join(invoer_map, bestand)
            print(f"Verwerken: {bestand}...")

            doc = fitz.open(pdf_pad)
            
            for pagina_num in range(len(doc)):
                page = doc[pagina_num]
                rect = page.rect
                
                # --- 1. RECHTERKANT (LEGENDA) EN RANDEN SLOPEN ---
                # Definieer de zone van de legenda (rechter 25% van de pagina)
                legenda_zone = fitz.Rect(rect.width * 0.75, 0, rect.width, rect.height)
                page.add_redact_annot(legenda_zone, fill=(1, 1, 1))

                # --- 2. TEKST FILTEREN (ALLEEN LOKAALNUMMERS BEHOUDEN) ---
                # Haal alle tekstblokken/woorden op uit de PDF
                text_instances = page.get_text("words")  # [x0, y0, x1, y1, word, ...]
                
                for item in text_instances:
                    x0, y0, x1, y1, woord = item[:5]
                    woord_clean = woord.strip()

                    # Controleer of het een maatvoering is
                    is_maat = bool(maat_patroon.match(woord_clean))
                    
                    # Controleer of het tekst op de rand/buiten het gebouw is (stramiennummers/assen)
                    is_rand_tekst = x0 < rect.width * 0.10 or y0 < rect.height * 0.08 or y0 > rect.height * 0.92

                    if is_maat or is_rand_tekst:
                        # Gum deze tekst digitaal uit de vector
                        word_rect = fitz.Rect(x0, y0, x1, y1)
                        page.add_redact_annot(word_rect, fill=(1, 1, 1))

                # Voer de verwijdering van geselecteerde objecten/tekst uit
                page.apply_redactions()

                # --- 3. CONVERTEER NAAR HOGE KWALITEIT AFBEELDING ---
                # Zoom-factor 2x voor scherpe weergave van muren en lokaalnummers
                zoom = 2  
                mat = fitz.Matrix(zoom, zoom)
                pix = page.get_pixmap(matrix=mat)

                bestandsnaam = os.path.splitext(bestand)[0]
                output_pad = os.path.join(uitvoer_map, f"{bestandsnaam}_strak_p{pagina_num + 1}.png")
                pix.save(output_pad)
                print(f"-> Opgeslagen: {output_pad}")

# --- INSTELLINGEN ---
INVOER_MAP = r"C:\xampp\htdocs\leerjaar 3\programmeren Frontend\gebouwroute\Plattegronden"
UITVOER_MAP = r"C:\xampp\htdocs\leerjaar 3\programmeren Frontend\gebouwroute\Plattegronden\alleen_muren_en_lokalen"

schon_pdf_plattegrond_op(INVOER_MAP, UITVOER_MAP)