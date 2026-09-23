"""
Zet de plattegronden uit plattegrond_images/ om naar kleinere WebP-bestanden
in images/plattegrond/. Die kleine versies gebruikt de app (en de service worker
slaat ze op voor offline gebruik).

Draai dit script opnieuw als je een plattegrond in plattegrond_images/ aanpast.
Controleer daarna of de breedte/hoogte in data.js nog klopt (wordt hieronder geprint).
"""
import os
from PIL import Image

INVOER_MAP = "plattegrond_images"
UITVOER_MAP = os.path.join("images", "plattegrond")
MAX_BREEDTE = 1800

# bronbestand -> naam van het uitvoerbestand
BESTANDEN = {
    "DO-090-AO-plattegrond kelder.png": "kelder.webp",
    "0.png": "verdieping_0.webp",
    "1.png": "verdieping_1.webp",
    "2.png": "verdieping_2.webp",
    "3.png": "verdieping_3.webp",
    "4.png": "verdieping_4.webp",
}

os.makedirs(UITVOER_MAP, exist_ok=True)

for bron, doel in BESTANDEN.items():
    afbeelding = Image.open(os.path.join(INVOER_MAP, bron)).convert("RGBA")
    if afbeelding.width > MAX_BREEDTE:
        hoogte = round(afbeelding.height * MAX_BREEDTE / afbeelding.width)
        afbeelding = afbeelding.resize((MAX_BREEDTE, hoogte), Image.LANCZOS)

    pad = os.path.join(UITVOER_MAP, doel)
    afbeelding.save(pad, "WEBP", quality=85, method=6)
    print(f"{doel}: {afbeelding.width} x {afbeelding.height}, {os.path.getsize(pad) // 1024} KB")
