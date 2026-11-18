"""Fotos de perfil de Google con la marca MexCodex y la inicial de cada persona.

Uso:
    python marca/publicidad/perfil-google/generar.py           # F y A
    python marca/publicidad/perfil-google/generar.py F A M     # las iniciales que quieras

Salida: perfil-google/<inicial>-<tema>-<tamaño>.png (1080 y 400 px, cuadradas; Google las recorta en círculo).
"""
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "src"))

from playwright.sync_api import sync_playwright  # noqa: E402

from comun import C, FONTS, ICONOS, browser, load  # noqa: E402

TAMANOS = (1080, 400)
TEMAS = {
    #        fondo       marco        círculo      letra
    "claro": (C["maiz"], C["jade"], C["jade"], C["maiz"]),
    "noche": (C["noche"], C["jade_nt"], C["maiz"], C["obsidiana"]),
}

# Marco de chevrones y esquinas del avatar de redes (primer trazo del SVG).
_avatar = open(os.path.join(ICONOS, "avatar-redes.svg"), encoding="utf-8").read()
MARCO = re.search(r'<path d="([^"]+)"', _avatar).group(1)


def pagina(letra, tema):
    fondo, marco, circulo, tinta = TEMAS[tema]
    return f"""<!doctype html><html><head><meta charset="utf-8">{FONTS}<style>
* {{ margin: 0; padding: 0 }}
body {{ width: 1080px; height: 1080px; background: {fondo}; overflow: hidden }}
svg {{ display: block; width: 1080px; height: 1080px }}
text {{ font: 700 74px 'Space Grotesk'; letter-spacing: 0 }}
</style></head><body>
<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
  <rect width="256" height="256" fill="{fondo}"/>
  <g transform="translate(28.16 28.16) scale(0.7800)"><path d="{MARCO}" fill="{marco}" fill-rule="evenodd"/></g>
  <circle cx="128" cy="128" r="50" fill="{circulo}"/>
  <text x="128" y="128" fill="{tinta}" text-anchor="middle" dominant-baseline="central">{letra}</text>
</svg></body></html>"""


def main():
    letras = [a.upper() for a in sys.argv[1:]] or ["F", "A"]
    tmp = os.path.join(HERE, ".tmp.html")
    with sync_playwright() as p:
        b = browser(p)
        for size in TAMANOS:
            page = b.new_page(viewport={"width": 1080, "height": 1080}, device_scale_factor=size / 1080)
            for letra in letras:
                for tema in TEMAS:
                    open(tmp, "w", encoding="utf-8").write(pagina(letra, tema))
                    load(page, tmp)
                    out = os.path.join(HERE, f"{letra.lower()}-{tema}-{size}.png")
                    page.screenshot(path=out)
                    print(out)
            page.close()
        b.close()
    os.remove(tmp)


if __name__ == "__main__":
    main()
