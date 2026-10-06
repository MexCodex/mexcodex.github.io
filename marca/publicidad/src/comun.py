"""Piezas compartidas por la tarjeta, el membrete y las plantillas: datos, logos, QR, iconos y render."""
import json
import os
import re

import segno

HERE = os.path.dirname(os.path.abspath(__file__))
PUB = os.path.normpath(os.path.join(HERE, ".."))
MARCA = os.path.normpath(os.path.join(PUB, ".."))
LOGOS = os.path.join(MARCA, "logos", "svg")
ICONOS = os.path.join(MARCA, "iconos", "svg")

DATOS = json.load(open(os.path.join(PUB, "datos.json"), encoding="utf-8"))

C = {
    "jade": "#2f7d4b", "obsidiana": "#102c1b", "maiz": "#eaeadd", "noche": "#0a1c12", "claro": "#66ad72",
    "jade_nt": "#5fa870", "claro_nt": "#7cc08a", "piedra": "#d6d9bb", "musgo": "#5c8f67", "selva": "#205736",
    "papel": "#f4f4ec",
}

FONTS = ('<link href="https://fonts.googleapis.com/css2?family=Antic+Slab&family=IBM+Plex+Sans:ital,wght@0,400;'
         '0,500;0,600;1,400&family=Space+Grotesk:wght@400;500;600;700&display=block" rel="stylesheet">')


def logo(name, cls="", folder=LOGOS, fondo=False):
    """SVG de la marca listo para incrustar; sin su rectángulo de fondo salvo que se pida."""
    m = open(os.path.join(folder, name), encoding="utf-8").read()
    m = re.sub(r"<title>.*?</title>", "", m)
    if not fondo:
        m = re.sub(r'<rect width="\d+" height="\d+"( rx="\d+")? fill="[^"]+"/>', "", m, count=1)
    return m.replace("<svg ", f'<svg class="{cls}" ', 1)


def qr(url, fg, bg, cls="", logo_svg=None):
    """QR como SVG con un hueco al centro para el sello (corrección H aguanta el ~30 %)."""
    q = segno.make(url, error="h", boost_error=False)
    mtx = [list(r) for r in q.matrix]
    n = len(mtx)
    hole = round(n * 0.26) | 1                       # impar, para que quede centrado
    a = (n - hole) // 2
    d = []
    for y, row in enumerate(mtx):
        for x, v in enumerate(row):
            if v and not (a - 1 <= x <= a + hole and a - 1 <= y <= a + hole):
                d.append(f"M{x} {y}h1v1h-1z")
    q4 = 4                                           # zona de silencio
    center = ""
    if logo_svg:
        k = (hole + 1) / 256
        center = (f'<g transform="translate({a - 0.5} {a - 0.5}) scale({k:.5f})">'
                  + re.sub(r"</?svg[^>]*>", "", logo_svg) + "</g>")
    return (f'<svg class="{cls}" xmlns="http://www.w3.org/2000/svg" viewBox="{-q4} {-q4} {n + 2 * q4} {n + 2 * q4}" '
            f'shape-rendering="crispEdges"><rect x="{-q4}" y="{-q4}" width="{n + 2 * q4}" height="{n + 2 * q4}" '
            f'fill="{bg}"/><path d="{"".join(d)}" fill="{fg}"/><g shape-rendering="geometricPrecision">{center}</g></svg>')


_ICON = {
    "telefono": '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
    "correo": '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    "ubicacion": '<path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
    "web": '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    "whatsapp": '<path d="M4 20l1.3-4A8 8 0 1 1 8 18.7z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 1a4 4 0 0 1-2-2l1-1-1-2z"/>',
}


def icon(name, color, cls="ico"):
    return (f'<svg class="{cls}" viewBox="0 0 24 24" fill="none" stroke="{color}" stroke-width="2" '
            f'stroke-linecap="round" stroke-linejoin="round">{_ICON[name]}</svg>')


def browser(p):
    try:
        return p.chromium.launch()
    except Exception:
        return p.chromium.launch(channel="msedge")


def load(page, path):
    page.goto("file:///" + path.replace("\\", "/"), wait_until="networkidle")
    page.evaluate("document.fonts.ready")


def check_qr(png_path, expected):
    """Lee el QR del PNG con OpenCV para asegurar que escanea."""
    import cv2
    img = cv2.imread(png_path)
    val, _, _ = cv2.QRCodeDetector().detectAndDecode(img)
    if val != expected:
        raise SystemExit(f"El QR de {png_path} no se leyó bien: {val!r}")
    return val
