"""
Zet de plattegronden uit plattegrond_images/ om naar kleinere WebP-bestanden
in images/plattegrond/. Die kleine versies gebruikt de app (en de service worker
slaat ze op voor offline gebruik).

Draai dit script opnieuw als je een plattegrond in plattegrond_images/ aanpast.
Controleer daarna of de breedte/hoogte in data.js nog klopt (wordt hieronder geprint).

Witte vlakken worden doorzichtig gemaakt, zodat de achtergrond van de app erdoorheen
schijnt. Bijna-wit vervaagt geleidelijk, dan blijven randen van lijnen netjes.
"""
import os
import numpy as np
from PIL import Image

INVOER_MAP = "plattegrond_images"
UITVOER_MAP = os.path.join("images", "plattegrond")
MAX_BREEDTE = 1800
WIT_VANAF = 230  # pixels waarvan alle kleuren lichter zijn dan dit worden (deels) doorzichtig

# bronbestand -> naam van het uitvoerbestand
BESTANDEN = {
    "DO-090-AO-plattegrond kelder.png": "kelder.webp",
    "0.png": "verdieping_0.webp",
    "1.png": "verdieping_1.webp",
    "2.png": "verdieping_2.webp",
    "3.png": "verdieping_3.webp",
    "4.png": "verdieping_4.webp",
}


def wit_doorzichtig(afbeelding):
    pixels = np.array(afbeelding).astype(np.float32)
    lichtste = pixels[..., :3].min(axis=2)
    # 255 (wit) -> helemaal doorzichtig, WIT_VANAF -> gewoon zichtbaar, daartussen geleidelijk
    factor = np.clip((255 - lichtste) / (255 - WIT_VANAF), 0, 1)
    pixels[..., 3] *= factor
    return Image.fromarray(pixels.round().astype(np.uint8), "RGBA")


os.makedirs(UITVOER_MAP, exist_ok=True)

for bron, doel in BESTANDEN.items():
    afbeelding = wit_doorzichtig(Image.open(os.path.join(INVOER_MAP, bron)).convert("RGBA"))
    if afbeelding.width > MAX_BREEDTE:
        hoogte = round(afbeelding.height * MAX_BREEDTE / afbeelding.width)
        afbeelding = afbeelding.resize((MAX_BREEDTE, hoogte), Image.LANCZOS)

    pad = os.path.join(UITVOER_MAP, doel)
    afbeelding.save(pad, "WEBP", quality=85, method=6)
    print(f"{doel}: {afbeelding.width} x {afbeelding.height}, {os.path.getsize(pad) // 1024} KB")
