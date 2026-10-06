"""Tarjeta de presentación y hoja membretada de MexCodex.

Uso: python marca/publicidad/src/impresos.py
Los datos de contacto salen de marca/publicidad/datos.json.
"""
import os

from PIL import Image
from playwright.sync_api import sync_playwright

from comun import C, DATOS, FONTS, ICONOS, PUB, browser, check_qr, icon, load, logo, qr

D = DATOS
BLEED = 3            # mm de sangrado para imprenta
CW, CH = 90, 50      # tarjeta estándar en México
SELLO = logo("icono-sello.svg", folder=ICONOS)

# ---------------------------------------------------------------------
# Tarjeta — misma idea que la original (dos caras oscuras, esquinas angulares en verde con
# líneas finas, logo al centro, QR enmarcado), con la paleta y los datos actuales.
# ---------------------------------------------------------------------
CARD_CSS = f"""
@page {{ size: {CW + 2 * BLEED}mm {CH + 2 * BLEED}mm; margin: 0 }}
* {{ box-sizing: border-box; margin: 0; padding: 0 }}
body {{ -webkit-print-color-adjust: exact; print-color-adjust: exact; background: #777 }}
svg {{ display: block }}
.sheet {{ width: {CW + 2 * BLEED}mm; height: {CH + 2 * BLEED}mm; position: relative; overflow: hidden;
          page-break-after: always; background: {C["noche"]} }}
.trim .sheet {{ width: {CW}mm; height: {CH}mm }}
.deco {{ position: absolute; inset: 0; width: 100%; height: 100% }}
.card {{ position: absolute; inset: {BLEED}mm; color: {C["maiz"]} }}
.trim .card {{ inset: 0 }}
.sp {{ font: 500 4.6pt 'Space Grotesk'; letter-spacing: .26em; text-transform: uppercase }}

/* frente */
.front .lg {{ position: absolute; left: 50%; top: 13.8mm; width: 60mm; transform: translateX(-50%) }}
.front .lema {{ position: absolute; left: 0; right: 0; top: 31.2mm; text-align: center; font-size: 5.2pt;
               color: {C["claro_nt"]} }}
.front .bl {{ position: absolute; left: 6.5mm; bottom: 5.6mm; color: #eaeadd; opacity: .8; line-height: 1.75 }}
.front .bl::before, .back .tr::before {{ content: ""; display: block; width: 5mm; height: .35mm;
               background: {C["jade_nt"]}; margin-bottom: 2.2mm }}
.front .br {{ position: absolute; right: 6.5mm; bottom: 5.6mm; text-align: right; color: #eaeadd; opacity: .8;
             line-height: 1.75 }}

/* reverso */
.back .top {{ position: absolute; left: 0; right: 0; top: 5.2mm; text-align: center; color: {C["claro_nt"]} }}
.back .qrbox {{ position: absolute; left: 50%; top: 9.4mm; transform: translateX(-50%); width: 22mm; height: 22mm;
               background: {C["maiz"]}; border-radius: 2.2mm; padding: .9mm;
               box-shadow: 0 0 0 .35mm {C["jade_nt"]}, 0 0 0 1.1mm {C["noche"]}, 0 0 0 1.35mm {C["jade"]}55 }}
.back .qrbox svg {{ width: 100%; height: 100%; border-radius: 1.4mm }}
.back .url {{ position: absolute; left: 0; right: 0; top: 32.8mm; text-align: center;
             font: 500 9.4pt 'Space Grotesk'; letter-spacing: .03em; color: {C["maiz"]} }}
.back .tr {{ position: absolute; right: 6.5mm; top: 5.2mm; text-align: right; color: #eaeadd; opacity: .8;
            line-height: 1.75; display: flex; flex-direction: column; align-items: flex-end }}
.back .row {{ position: absolute; left: 0; right: 0; bottom: 5.4mm; display: flex; justify-content: center;
             align-items: center; gap: 3mm; font: 400 6.2pt 'IBM Plex Sans'; color: #eaeaddd9; white-space: nowrap }}
.back .loc {{ font-size: 4.4pt; color: {C["claro_nt"]}; margin-top: .4mm }}
.back .row span {{ display: flex; align-items: center; gap: 1.1mm }}
.back .row i {{ width: .25mm; height: 2.6mm; background: {C["jade_nt"]} }}
.back .ico {{ width: 2.7mm; height: 2.7mm; flex: none }}
"""


def deco(side, trim):
    """Esquinas angulares en degradado verde con líneas finas; coordenadas en mm del corte."""
    B = 0 if trim else BLEED
    vb = f"{-B} {-B} {CW + 2 * B} {CH + 2 * B}"
    e = BLEED          # las piezas siempre llegan al sangrado
    jade, jn, cl = C["jade"], C["jade_nt"], C["claro_nt"]
    defs = f"""<defs>
      <radialGradient id="bg{side}" cx="{'38%' if side == 'f' else '50%'}" cy="45%" r="75%">
        <stop offset="0" stop-color="#143823"/><stop offset=".55" stop-color="{C["noche"]}"/>
        <stop offset="1" stop-color="#06120b"/></radialGradient>
      <linearGradient id="gA{side}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{jade}" stop-opacity=".9"/>
        <stop offset="1" stop-color="{jade}" stop-opacity=".15"/></linearGradient>
      <linearGradient id="gB{side}" x1="1" y1="1" x2="0" y2="0"><stop offset="0" stop-color="{jn}" stop-opacity=".95"/>
        <stop offset=".7" stop-color="{jade}" stop-opacity=".25"/><stop offset="1" stop-color="{jade}" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="gC{side}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="{jade}" stop-opacity=".55"/>
        <stop offset="1" stop-color="{jade}" stop-opacity="0"/></linearGradient></defs>"""
    bg = f'<rect x="{-e}" y="{-e}" width="{CW + 2 * e}" height="{CH + 2 * e}" fill="url(#bg{side})"/>'
    ln = f'fill="none" stroke="{cl}" stroke-width=".22" stroke-linejoin="miter"'
    if side == "f":
        shapes = f"""
        <polygon points="{-e},{-e} 33,{-e} 27,3.4 {-e},3.4" fill="url(#gC{side})"/>
        <polyline points="{-e},3.4 27,3.4 33,{-e}" {ln} opacity=".55"/>
        <polygon points="{-e},42 8,{CH + e} {-e},{CH + e}" fill="url(#gA{side})"/>
        <polyline points="{-e},38.5 11.5,{CH + e}" {ln} opacity=".5"/>
        <polygon points="{CW + e},26 {CW + e},{CH + e} 62,{CH + e}" fill="url(#gB{side})"/>
        <polyline points="{CW + e},39 79,{CH + e}" {ln} opacity=".55"/>
        <polyline points="{CW + e},10 {CW - 7},10 {CW - 11},14" {ln} opacity=".35"/>"""
    else:
        shapes = f"""
        <polygon points="{-e},{-e} 13,{-e} 20,7 20,26 13,33 {-e},33" fill="url(#gC{side})" opacity=".55"/>
        <polyline points="13,{-e} 20,7 20,26 13,33 {-e},33" {ln} opacity=".5"/>
        <polygon points="{CW + e},26 {CW + e},{CH + e} 64,{CH + e}" fill="url(#gB{side})"/>
        <polyline points="{CW + e},37 76,{CH + e}" {ln} opacity=".55"/>"""
    return f'<svg class="deco" viewBox="{vb}" preserveAspectRatio="none">{defs}{bg}{shapes}</svg>'


def card_html(trim=False):
    q = qr(D["url"], C["obsidiana"], C["maiz"], logo_svg=SELLO)
    serv = ["Web", "Apps", "Software a medida"]
    front = f'''<div class="sheet front">{deco("f", trim)}<div class="card">
      <div class="lg">{logo("horizontal-noche.svg")}</div>
      <div class="lema sp">{D["lema"]}</div>
      <div class="bl sp">Software accesible<br>para tu negocio</div>
      <div class="br sp">{"<br>".join(serv)}</div></div></div>'''
    row = (f'<span>{icon("whatsapp", C["claro_nt"])}{D["telefono"]}</span><i></i>'
           f'<span>{icon("correo", C["claro_nt"])}{D["correo"]}</span>')
    back = f'''<div class="sheet back">{deco("b", trim)}<div class="card">
      <div class="top sp">Visita nuestro sitio</div>
      <div class="qrbox">{q}</div>
      <div class="url">{D["sitio"]}<div class="sp loc">{D["ubicacion"]}</div></div>
      <div class="tr sp">Respuesta<br>en menos<br>de 24 h</div>
      <div class="row">{row}</div></div></div>'''
    return (f'<!doctype html><html lang="es"><head><meta charset="utf-8">{FONTS}<style>{CARD_CSS}</style></head>'
            f'<body class="{"trim" if trim else ""}">{front}{back}</body></html>')


def mockup(front_png, back_png, out):
    """Presentación como la referencia: las dos caras con esquinas redondeadas sobre fondo oscuro."""
    from PIL import ImageDraw, ImageFilter
    f, b = Image.open(front_png).convert("RGBA"), Image.open(back_png).convert("RGBA")
    w, h = f.size
    gap, m = int(w * .08), int(w * .14)
    W, H = 2 * w + gap + 2 * m, h + 2 * m
    bg = Image.new("RGBA", (W, H), "#121513")
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(glow).ellipse((W * .15, -H * .5, W * .85, H * .55), fill=(40, 60, 48, 90))
    bg = Image.alpha_composite(bg, glow.filter(ImageFilter.GaussianBlur(W * .08)))
    r = int(w * 4 / 90)
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, w - 1, h - 1), r, fill=255)
    for i, im in enumerate((f, b)):
        x, y = m + i * (w + gap), m
        sh = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        sh.paste((0, 0, 0, 200), (x + int(w * .01), y + int(h * .04)), mask)
        bg = Image.alpha_composite(bg, sh.filter(ImageFilter.GaussianBlur(w * .03)))
        rim = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        ImageDraw.Draw(rim).rounded_rectangle((0, 0, w - 1, h - 1), r, outline=(95, 168, 112, 120),
                                              width=max(2, w // 400))
        bg.paste(Image.alpha_composite(im, rim), (x, y), mask)
    bg.convert("RGB").save(out, quality=95)


# ---------------------------------------------------------------------
# Hoja membretada (carta)
# ---------------------------------------------------------------------
LW, LH = 215.9, 279.4
LETTER_CSS = f"""
@page {{ size: {LW}mm {LH}mm; margin: 0 }}
* {{ box-sizing: border-box; margin: 0; padding: 0 }}
body {{ -webkit-print-color-adjust: exact; print-color-adjust: exact; font-family: 'IBM Plex Sans', sans-serif;
       color: {C["obsidiana"]} }}
svg {{ display: block }}
.hoja {{ width: {LW}mm; height: {LH}mm; position: relative; overflow: hidden; background: #fff; page-break-after: always }}
.top {{ position: absolute; left: 0; right: 0; top: 0; height: 4mm; background: {C["jade"]} }}
.top::after {{ content: ""; position: absolute; right: 0; top: 0; width: 62mm; height: 4mm; background: {C["obsidiana"]};
              clip-path: polygon(4mm 0, 100% 0, 100% 100%, 0 100%) }}
.head {{ position: absolute; left: 22mm; right: 22mm; top: 14mm; display: flex; justify-content: space-between;
        align-items: center; padding-bottom: 6mm; border-bottom: .35mm solid {C["piedra"]} }}
.head .lg {{ width: 62mm }}
.head .ct {{ text-align: right; font: 500 8pt 'IBM Plex Sans'; line-height: 1.75; color: {C["selva"]} }}
.head .ct div {{ display: flex; align-items: center; justify-content: flex-end; gap: 2mm }}
.ico {{ width: 3.2mm; height: 3.2mm }}
.marca-agua {{ position: absolute; right: -38mm; bottom: 8mm; width: 150mm; opacity: .035 }}
.body {{ position: absolute; left: 25mm; right: 25mm; top: 52mm; bottom: 34mm; font-size: 10.5pt; line-height: 1.6 }}
.body p {{ margin-bottom: 4mm }}
.body .fecha {{ text-align: right; color: {C["selva"]}; margin-bottom: 9mm }}
.body .para b {{ font-weight: 600 }}
.body h3 {{ font: 400 14pt 'Antic Slab'; margin-bottom: 5mm }}
.body .firma {{ margin-top: 14mm }}
.body .firma .ln {{ width: 60mm; border-top: .3mm solid {C["obsidiana"]}; margin-bottom: 2mm }}
.foot {{ position: absolute; left: 0; right: 0; bottom: 0; height: 20mm }}
.foot .band {{ position: absolute; left: 0; right: 0; bottom: 0; height: 9mm; background: {C["noche"]} }}
.foot .band::before {{ content: ""; position: absolute; left: 0; top: -2.2mm; width: 92mm; height: 2.2mm;
                      background: {C["jade"]}; clip-path: polygon(0 0, calc(100% - 2.2mm) 0, 100% 100%, 0 100%) }}
.foot .band span {{ position: absolute; top: 3.1mm; font: 600 7pt 'Space Grotesk'; letter-spacing: .16em;
                   text-transform: uppercase; color: {C["maiz"]} }}
.foot .l {{ left: 22mm }} .foot .r {{ right: 22mm; color: {C["claro_nt"]} !important }}
[contenteditable]:focus {{ outline: 1px dashed {C["musgo"]}; outline-offset: 2mm }}
@media screen {{ body {{ background: #8a8f86; padding: 10mm 0 }} .hoja {{ margin: 0 auto 10mm; box-shadow: 0 4px 24px #0004 }}
  .ayuda {{ max-width: {LW}mm; margin: 0 auto 6mm; font: 13px 'IBM Plex Sans'; color: #fff }} }}
@media print {{ .ayuda {{ display: none }} }}
"""

EJEMPLO = f'''<div class="fecha">Puebla, Pue., a 2 de octubre de 2026</div>
<p class="para"><b>Nombre del destinatario</b><br>Cargo · Empresa</p>
<h3>Asunto de la carta</h3>
<p>Estimado cliente:</p>
<p>MexCodex es una empresa mexicana creada con el propósito de desarrollar software de alto nivel a un precio
razonable para el negocio promedio del país. Este espacio es para el cuerpo de la carta: propuestas, cotizaciones,
constancias o cualquier comunicado oficial.</p>
<p>El texto usa IBM Plex Sans a 10.5 pt con interlineado de 1.6, y los márgenes laterales son de 25 mm. Los títulos
van en Antic Slab.</p>
<p>Quedamos atentos a cualquier duda por correo o WhatsApp; respondemos en menos de 24 horas.</p>
<div class="firma"><div class="ln"></div><b>Nombre de quien firma</b><br>Cargo · MexCodex</div>'''


def letter_html(contenido="", editable=False):
    rows = [("whatsapp", D["telefono"]), ("correo", D["correo"]), ("web", D["sitio"]), ("ubicacion", D["ubicacion"])]
    ct = "".join(f'<div><span>{t}</span>{icon(i, C["jade"])}</div>' for i, t in rows)
    ed = ' contenteditable="true" spellcheck="true"' if editable else ""
    ayuda = ('<div class="ayuda">Haz clic en el texto para escribir tu carta y luego imprime (Ctrl+P → Guardar como '
             'PDF, tamaño Carta, márgenes: ninguno, con gráficos de fondo).</div>') if editable else ""
    return f'''<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Hoja membretada · MexCodex</title>
{FONTS}<style>{LETTER_CSS}</style></head><body>{ayuda}<div class="hoja">
<div class="top"></div><div class="marca-agua">{logo("simbolo-negro.svg")}</div>
<div class="head"><div class="lg">{logo("horizontal-color.svg")}</div><div class="ct">{ct}</div></div>
<div class="body"{ed}>{contenido}</div>
<div class="foot"><div class="band"><span class="l">{" · ".join(D["servicios"])}</span>
<span class="r">{D["lema"]}</span></div></div></div></body></html>'''


def write(path, html):
    open(path, "w", encoding="utf-8").write(html)
    return path


if __name__ == "__main__":
    T, M = os.path.join(PUB, "tarjeta"), os.path.join(PUB, "membrete")
    src = os.path.join(PUB, "src", "build")
    os.makedirs(src, exist_ok=True)

    with sync_playwright() as p:
        b = browser(p)
        pg = b.new_page(device_scale_factor=4)

        # tarjeta para imprenta (con 3 mm de sangrado) y vistas recortadas
        load(pg, write(os.path.join(src, "tarjeta.html"), card_html()))
        pg.pdf(path=os.path.join(T, "tarjeta-imprenta-90x50mm-sangrado3mm.pdf"), width=f"{CW + 2 * BLEED}mm",
               height=f"{CH + 2 * BLEED}mm", print_background=True)
        load(pg, write(os.path.join(src, "tarjeta-recorte.html"), card_html(trim=True)))
        pg.pdf(path=os.path.join(T, "tarjeta-90x50mm.pdf"), width=f"{CW}mm", height=f"{CH}mm", print_background=True)
        pg.set_viewport_size({"width": 1200, "height": 900})
        pg.add_style_tag(content=".sheet{margin:0 0 12mm} body{padding:6mm}")
        s = pg.locator(".sheet")
        for i, n in enumerate(("frente", "reverso")):
            f = os.path.join(T, f"tarjeta-{n}.png")
            s.nth(i).screenshot(path=f, scale="device")
            im = Image.open(f)                       # quita el filo de 1 px del fondo de la página
            im.crop((4, 4, im.width - 4, im.height - 4)).save(f)

        # membrete: en blanco, con ejemplo y editable en el navegador
        load(pg, write(os.path.join(M, "membrete-editable.html"), letter_html(EJEMPLO, editable=True)))
        load(pg, write(os.path.join(src, "membrete-blanco.html"), letter_html()))
        pg.pdf(path=os.path.join(M, "membrete-carta.pdf"), width=f"{LW}mm", height=f"{LH}mm", print_background=True)
        pg.set_viewport_size({"width": 816, "height": 1056})
        pg.locator(".hoja").screenshot(path=os.path.join(M, "membrete-carta.png"))
        load(pg, write(os.path.join(src, "membrete-ejemplo.html"), letter_html(EJEMPLO)))
        pg.pdf(path=os.path.join(M, "membrete-ejemplo.pdf"), width=f"{LW}mm", height=f"{LH}mm", print_background=True)
        pg.locator(".hoja").screenshot(path=os.path.join(M, "membrete-ejemplo.png"))
        b.close()

    # tarjetas grandes para revisar el QR
    with sync_playwright() as p:
        b = browser(p)
        pg = b.new_page(device_scale_factor=4)
        load(pg, os.path.join(src, "tarjeta-recorte.html"))
        out = os.path.join(src, "reverso-qr-check.png")
        pg.locator(".sheet").nth(1).screenshot(path=out)
        b.close()
    print("QR:", check_qr(out, D["url"]))
    mockup(os.path.join(T, "tarjeta-frente.png"), os.path.join(T, "tarjeta-reverso.png"),
           os.path.join(T, "tarjeta-presentacion.png"))
    print("ok")
