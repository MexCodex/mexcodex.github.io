"""Logos e iconos de MexCodex a partir de logo-propuestas/logofinal.

Uso: python marca/src/iconos.py
"""
import io
import os
import re
import shutil
import subprocess
import sys

from PIL import Image
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, ".."))
FINAL = os.path.normpath(os.path.join(ROOT, "..", "logo-propuestas", "logofinal"))

CREAM, INK, JADE, NIGHT = "#eaeadd", "#102c1b", "#2f7d4b", "#0a1c12"

subprocess.run([sys.executable, os.path.join(FINAL, "src", "build.py")], check=True)


def out(*p):
    path = os.path.join(ROOT, *p)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    return path


def read(name):
    return open(os.path.join(FINAL, name), encoding="utf-8").read()


def paths(name):
    return re.findall(r"<path [^>]*/>", read(name))


def svg(body, size=256, bg=None, rx=0):
    b = f'<rect width="{size}" height="{size}" rx="{rx}" fill="{bg}"/>' if bg else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}"><title>MexCodex</title>'
            f"{b}{body}</svg>")


def fit(parts, k):
    """Escala el símbolo (256x256, centro 128) por k alrededor del centro."""
    t = 128 * (1 - k)
    return f'<g transform="translate({t:.2f} {t:.2f}) scale({k:.4f})">' + "".join(parts) + "</g>"


# --- logos: copia de los SVG finales -----------------------------------
LOGOS = [f for f in sorted(os.listdir(FINAL)) if f.endswith(".svg") and not f.startswith("comparativa")]
for f in LOGOS:
    shutil.copy(os.path.join(FINAL, f), out("logos", "svg", f))

# --- iconos -------------------------------------------------------------
full = paths("simbolo-color.svg")          # rayos, disco, volcán, nieve
seal = full[1:]                            # sin rayos: para 16 y 32 px
noche = paths("simbolo-noche.svg")
negro = paths("simbolo-negro.svg")

ICONS = {
    # nombre: (svg, tamaños png)
    "icono-color": (svg(fit(full, 1.0)), [48, 64, 128, 256, 512, 1024]),
    "icono-sello": (svg(fit(seal, 2.2)), [16, 32]),
    "app-icon": (svg(fit(full, 0.92), bg=CREAM), [180, 192, 512, 1024]),
    "app-icon-noche": (svg(fit(noche, 0.92), bg=NIGHT), [192, 512, 1024]),
    "maskable": (svg(fit(full, 0.72), bg=CREAM), [192, 512]),
    "icono-negro": (svg(fit(negro, 1.0)), [512]),
    "icono-blanco": (svg(fit(paths("simbolo-blanco.svg"), 1.0)), [512]),
    "avatar-redes": (svg(fit(full, 0.78), bg=CREAM), [400, 1080]),
}
# favicon.svg: sello a color con fondo crema circular, se lee en pestañas claras y oscuras
FAVICON_SVG = svg(f'<circle cx="128" cy="128" r="128" fill="{CREAM}"/>' + fit(seal, 2.2))


def render(page, markup, size):
    page.set_viewport_size({"width": size, "height": size})
    page.set_content('<html><body style="margin:0;background:transparent">'
                     + markup.replace("<svg ", f'<svg width="{size}" height="{size}" style="display:block" ', 1)
                     + "</body></html>")
    return Image.open(io.BytesIO(page.locator("svg").screenshot(omit_background=True))).convert("RGBA")


def png_logo(page, name, width):
    m = read(name)
    vw, vh = map(float, re.search(r'viewBox="0 0 ([\d.]+) ([\d.]+)"', m).groups())
    h = round(width * vh / vw)
    page.set_viewport_size({"width": width, "height": h})
    page.set_content('<html><body style="margin:0;background:transparent">'
                     + m.replace("<svg ", f'<svg width="{width}" height="{h}" style="display:block" ', 1)
                     + "</body></html>")
    page.locator("svg").screenshot(path=out("logos", "png", name.replace(".svg", ".png")), omit_background=True)


with sync_playwright() as p:
    try:
        browser = p.chromium.launch()
    except Exception:
        browser = p.chromium.launch(channel="msedge")
    page = browser.new_page()

    for name, (markup, sizes) in ICONS.items():
        open(out("iconos", "svg", f"{name}.svg"), "w", encoding="utf-8").write(markup)
        for s in sizes:
            render(page, markup, s).save(out("iconos", "png", f"{name}-{s}.png"))
    open(out("iconos", "favicon.svg"), "w", encoding="utf-8").write(FAVICON_SVG)

    # favicon.ico con 16, 32 (sello) y 48 (símbolo completo)
    ico = [render(page, FAVICON_SVG, 16), render(page, FAVICON_SVG, 32), render(page, svg(fit(full, 1.0)), 48)]
    ico[2].save(out("iconos", "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48)],
                append_images=ico[:2])

    # archivos con los nombres que esperan los navegadores / Next.js
    render(page, ICONS["app-icon"][0], 180).save(out("iconos", "web", "apple-touch-icon.png"))
    render(page, ICONS["app-icon"][0], 192).save(out("iconos", "web", "web-app-manifest-192x192.png"))
    render(page, ICONS["app-icon"][0], 512).save(out("iconos", "web", "web-app-manifest-512x512.png"))
    render(page, ICONS["maskable"][0], 512).save(out("iconos", "web", "maskable-512x512.png"))
    shutil.copy(out("iconos", "favicon.ico"), out("iconos", "web", "favicon.ico"))
    shutil.copy(out("iconos", "favicon.svg"), out("iconos", "web", "icon.svg"))

    for f in LOGOS:
        png_logo(page, f, 2048 if not f.startswith("simbolo") else 1024)
    browser.close()

open(out("iconos", "web", "site.webmanifest"), "w", encoding="utf-8").write("""{
  "name": "MexCodex",
  "short_name": "MexCodex",
  "icons": [
    { "src": "/web-app-manifest-192x192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "/web-app-manifest-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
    { "src": "/maskable-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "theme_color": "#2f7d4b",
  "background_color": "#eaeadd",
  "display": "standalone"
}
""")
print("ok")
