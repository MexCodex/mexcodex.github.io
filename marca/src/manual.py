"""Manual de marca de MexCodex → marca/manual-de-marca.pdf

Uso: python marca/src/iconos.py && python marca/src/manual.py
"""
import os
import re

from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, ".."))
LOGOS = os.path.join(ROOT, "logos", "svg")
ICONS = os.path.join(ROOT, "iconos")


def logo(name, cls="", folder=LOGOS):
    m = open(os.path.join(folder, name), encoding="utf-8").read()
    m = re.sub(r"<title>.*?</title>", "", m)
    return m.replace("<svg ", f'<svg class="{cls}" ', 1)


def nobg(name, cls=""):
    """El SVG sin su rectángulo de fondo, para ponerlo sobre cualquier superficie."""
    return re.sub(r'<rect width="\d+" height="\d+" fill="[^"]+"/>', "", logo(name, cls), count=1)


def cmyk(h):
    r, g, b = (int(h[i:i + 2], 16) / 255 for i in (1, 3, 5))
    k = 1 - max(r, g, b)
    if k >= 1:
        return "0 · 0 · 0 · 100"
    return " · ".join(str(round(100 * v)) for v in ((1 - r - k) / (1 - k), (1 - g - k) / (1 - k),
                                                   (1 - b - k) / (1 - k), k))


def rgb(h):
    return " · ".join(str(int(h[i:i + 2], 16)) for i in (1, 3, 5))


PRIMARIOS = [
    ("Jade", "#2f7d4b", "Color principal. Rayos, disco del sol y CODEX.", "#eaeadd"),
    ("Obsidiana", "#102c1b", "Volcán y MEX. Texto sobre fondos claros.", "#eaeadd"),
    ("Maíz", "#eaeadd", "Fondo principal y nieve del volcán.", "#102c1b"),
    ("Noche", "#0a1c12", "Fondo oscuro de la marca.", "#eaeadd"),
]
SECUNDARIOS = [
    ("Verde claro", "#66ad72", "Diagonal de la X sobre claro."),
    ("Jade noche", "#5fa870", "Jade sobre el fondo Noche."),
    ("Verde claro noche", "#7cc08a", "Diagonal de la X sobre Noche."),
    ("Piedra", "#d6d9bb", "Bordes y superficies secundarias."),
    ("Musgo", "#5c8f67", "Apoyo en ilustración e interfaz."),
    ("Selva", "#205736", "Texto secundario y estados activos."),
]


def swatch_big(n, h, use, fg):
    return (f'<div class="sw" style="background:{h};color:{fg}"><b>{n}</b>'
            f'<span>HEX {h.upper()}</span><span>RGB {rgb(h)}</span><span>CMYK {cmyk(h)}</span>'
            f'<em>{use}</em></div>')


def swatch_small(n, h, use):
    return (f'<div class="ss"><i style="background:{h}"></i><div><b>{n}</b><span>{h.upper()} · RGB {rgb(h)}</span>'
            f'<span>CMYK {cmyk(h)}</span><em>{use}</em></div></div>')


def page(n, kicker, title, body, cls=""):
    return (f'<section class="pg {cls}"><header><span>{kicker}</span><span>MexCodex · Manual de marca</span></header>'
            f'<h2>{title}</h2>{body}<footer>{n:02d}</footer></section>')


WRONG = [
    ("Deformar o estirar", 'style="transform:scaleX(1.45)"'),
    ("Rotar o inclinar", 'style="transform:rotate(-14deg)"'),
    ("Cambiar los colores", 'style="filter:hue-rotate(150deg) saturate(1.6)"'),
    ("Agregar sombras o efectos", 'style="filter:drop-shadow(6px 8px 4px rgba(0,0,0,.55))"'),
    ("Fondos sin contraste", 'class="lowc"'),
    ("Contornos o trazos añadidos", 'style="filter:drop-shadow(0 0 0 #e4007c) drop-shadow(2px 0 0 #e4007c) '
                                    'drop-shadow(-2px 0 0 #e4007c) drop-shadow(0 2px 0 #e4007c)"'),
]

pages = []

# 1 — portada
pages.append(f'''<section class="pg cover">
  <div class="cover-logo">{nobg("apilado-noche.svg")}</div>
  <div class="cover-txt"><h1>Manual de marca</h1><p>Identidad visual · Versión 1.0 · Octubre 2026</p></div>
</section>''')

# 2 — índice y esencia
pages.append(page(2, "00 · Introducción", "Herencia prehispánica, tecnología moderna", f'''
<div class="cols">
  <div class="lead">
    <p>MexCodex une la raíz mexicana con el oficio digital. El nombre junta <b>MEX</b> —origen, territorio,
    identidad— con <b>CODEX</b>: los códices fueron los primeros libros de conocimiento de Mesoamérica, y el código es
    el lenguaje con el que hoy construimos.</p>
    <p>Este manual explica cómo está construida la identidad y cómo usarla para que se vea igual en una pantalla,
    en una tarjeta o en un sello de una sola tinta.</p>
  </div>
  <ol class="toc">
    <li><span>01</span>Concepto del símbolo</li><li><span>02</span>Logotipo</li>
    <li><span>03</span>Versiones del logo</li><li><span>04</span>Área de protección y tamaños</li>
    <li><span>05</span>Color</li><li><span>06</span>Versiones por fondo</li>
    <li><span>07</span>Tipografía</li><li><span>08</span>Iconos</li><li><span>09</span>Usos incorrectos</li>
    <li><span>10</span>Archivos</li>
  </ol>
</div>'''))

# 3 — concepto del símbolo
pages.append(page(3, "01 · Concepto", "Un sol que guarda un volcán", f'''
<div class="cols">
  <div class="fig big-sym">{logo("simbolo-color.svg")}</div>
  <div class="notes">
    <div class="note"><b>Sol de ocho rayos</b><p>Ocho puntas alternadas —cuñas y escuadras— inspiradas en la
    geometría escalonada de la greca. También se leen como los signos <code>&lt; &gt;</code> del código.</p></div>
    <div class="note"><b>El disco</b><p>Un sello circular que enmarca el paisaje, como el glifo de un códice.</p></div>
    <div class="note"><b>El Popocatépetl</b><p>El volcán vigilante del Valle de México, en Obsidiana, con su cráter
    en la cima.</p></div>
    <div class="note"><b>La M en la nieve</b><p>El casquete nevado dibuja una <b>M</b> de MexCodex; el cráter forma
    su muesca superior.</p></div>
  </div>
</div>'''))

# 4 — logotipo
pages.append(page(4, "02 · Logotipo", "MEXCODEX, letra por letra", f'''
<div class="fig word">{logo("wordmark-color.svg")}</div>
<div class="cols3">
  <div class="note"><b>Alfabeto chaflanado</b><p>Letras de trazo grueso con esquinas cortadas a 45°, como bloques
  tallados en piedra o píxeles de una pantalla.</p></div>
  <div class="note"><b>La X de MEX</b><p>La diagonal <code>\\</code> va completa; la <code>/</code>, en Verde claro,
  queda partida por ella. Dos barritas verticales cierran el cruce.</p></div>
  <div class="note"><b>La O con rombo</b><p>Un rombo al centro de la O, guiño al jade y a los motivos de las grecas.</p></div>
</div>
<p class="small">MEX va en Obsidiana y CODEX en Jade. El logotipo es un dibujo: no se reescribe con ninguna fuente.</p>'''))

# 5 — versiones
pages.append(page(5, "03 · Versiones", "Cuatro formas del logo", f'''
<div class="grid-v">
  <div class="v main"><div class="vb">{nobg("horizontal-color.svg")}</div><b>Horizontal · principal</b>
    <p>La versión por defecto: web, encabezados, documentos y firmas.</p></div>
  <div class="v"><div class="vb">{nobg("apilado-color.svg")}</div><b>Apilado</b>
    <p>Formatos cuadrados o verticales: portadas, carteles, playeras.</p></div>
  <div class="v"><div class="vb">{nobg("simbolo-color.svg")}</div><b>Símbolo</b>
    <p>Avatar, icono de app, sellos. Cuando la marca ya está presente.</p></div>
  <div class="v"><div class="vb">{nobg("wordmark-color.svg")}</div><b>Logotipo</b>
    <p>Espacios muy horizontales donde el símbolo no cabe.</p></div>
</div>'''))

# 6 — área de protección y tamaños mínimos
pages.append(page(6, "04 · Área de protección", "Espacio para respirar", f'''
<div class="cols">
  <div>
    <div class="clear"><div class="clear-in">{nobg("horizontal-color.svg")}</div>
      <span class="xm t">x</span><span class="xm l">x</span><span class="xm r">x</span><span class="xm b">x</span></div>
    <p class="small"><b>x</b> = la altura de las letras del logotipo. Ningún texto, imagen o borde entra en esta
    zona.</p>
  </div>
  <div>
    <table class="min">
      <tr><th>Versión</th><th>Pantalla</th><th>Impreso</th></tr>
      <tr><td>Horizontal</td><td>120 px de ancho</td><td>30 mm</td></tr>
      <tr><td>Apilado</td><td>72 px de ancho</td><td>20 mm</td></tr>
      <tr><td>Logotipo</td><td>96 px de ancho</td><td>25 mm</td></tr>
      <tr><td>Símbolo</td><td>40 px</td><td>10 mm</td></tr>
      <tr><td>Sello (sin rayos)</td><td>16 px</td><td>5 mm</td></tr>
    </table>
    <div class="minrow">
      <div style="width:120px">{nobg("horizontal-color.svg")}</div>
      <div style="width:40px">{nobg("simbolo-color.svg")}</div>
      <div style="width:16px">{logo("icono-sello.svg", folder=os.path.join(ICONS, "svg"))}</div>
    </div>
    <p class="small">Por debajo de 32 px los rayos se vuelven ruido: usa el sello (disco con el volcán).</p>
  </div>
</div>'''))

# 7 — color
pages.append(page(7, "05 · Color", "Paleta", f'''
<div class="sws">{"".join(swatch_big(*c) for c in PRIMARIOS)}</div>
<h3>Secundarios</h3>
<div class="sss">{"".join(swatch_small(*c) for c in SECUNDARIOS)}</div>
<p class="small">Los valores CMYK son una conversión directa; pide prueba de color a imprenta antes de un tiraje.</p>'''))

# 8 — versiones por fondo
pages.append(page(8, "06 · Fondos", "Una versión para cada superficie", f'''
<div class="grid-bg">
  <div class="bgc" style="background:#eaeadd">{nobg("horizontal-color.svg")}<span>Color · sobre Maíz o claros</span></div>
  <div class="bgc" style="background:#0a1c12;color:#eaeadd">{nobg("horizontal-noche.svg")}<span>Noche · sobre fondos oscuros</span></div>
  <div class="bgc" style="background:#ffffff;outline:1px solid #d6d9bb">{nobg("horizontal-negro.svg")}<span>Una tinta negra · sellos, fax, grabado, documentos B/N</span></div>
  <div class="bgc" style="background:#2f7d4b;color:#fff">{nobg("horizontal-blanco.svg")}<span>Una tinta blanca · sobre Jade, fotos oscuras</span></div>
</div>
<div class="mono">
  <div class="mono-sym">{nobg("simbolo-negro.svg")}</div>
  <div><b>Construcción a una tinta</b><p>Sin colores no hay contraste entre cielo, volcán y nieve, así que la versión
  a una tinta cambia: el disco se vuelve un <b>anillo</b>, separado del volcán por un <b>espacio en blanco</b>, y el
  volcán lleva un <b>contorno</b> para que la M de nieve se distinga del cielo. Usa siempre estos archivos
  (<code>-negro</code> / <code>-blanco</code>); no pintes de un solo color la versión a color.</p></div>
</div>'''))

# 9 — tipografía
pages.append(page(9, "07 · Tipografía", "Familias de apoyo", '''
<div class="types">
  <div class="ty"><span class="tag">Títulos</span><div class="spec" style="font-family:'Antic Slab'">Antic Slab</div>
    <p style="font-family:'Antic Slab';font-size:22px">Código con raíz mexicana.</p>
    <p class="small">Serif de remate cuadrado, con aire de inscripción. Títulos y frases destacadas.</p></div>
  <div class="ty"><span class="tag">Texto</span><div class="spec" style="font-family:'IBM Plex Sans'">IBM Plex Sans</div>
    <p style="font-family:'IBM Plex Sans';font-size:15px">Diseñamos y desarrollamos sitios, sistemas y aplicaciones
    a la medida. Párrafos, interfaz y documentos.</p>
    <p class="small">Regular 400 para texto, SemiBold 600 para énfasis.</p></div>
  <div class="ty"><span class="tag">Cifras y datos</span><div class="spec" style="font-family:'Space Grotesk'">Space Grotesk</div>
    <p style="font-family:'Space Grotesk';font-size:28px;font-weight:600">0123456789 · 24/7 · $1,250</p>
    <p class="small">Precios, estadísticas, etiquetas técnicas.</p></div>
</div>
<p class="small">Las tres son gratuitas en Google Fonts y son las mismas que usa el sitio web.</p>'''))

# 10 — iconos
isvg = os.path.join(ICONS, "svg")
pages.append(page(10, "08 · Iconos", "Favicon, app y redes", f'''
<div class="icons">
  <div class="ic"><div class="ib r">{logo("app-icon.svg", folder=isvg)}</div><b>App · claro</b><span>180 · 192 · 512 · 1024 px</span></div>
  <div class="ic"><div class="ib r">{logo("app-icon-noche.svg", folder=isvg)}</div><b>App · noche</b><span>192 · 512 · 1024 px</span></div>
  <div class="ic"><div class="ib c">{logo("maskable.svg", folder=isvg)}</div><b>Maskable (Android)</b><span>El símbolo queda dentro de la zona segura</span></div>
  <div class="ic"><div class="ib c">{logo("avatar-redes.svg", folder=isvg)}</div><b>Avatar de redes</b><span>400 · 1080 px, recorte circular</span></div>
</div>
<div class="fav">
  <div class="tab"><span class="fi">{logo("favicon.svg", folder=ICONS)}</span>MexCodex — Desarrollo de software</div>
  <div class="tab dk"><span class="fi">{logo("favicon.svg", folder=ICONS)}</span>MexCodex — Desarrollo de software</div>
  <p class="small">El favicon usa el sello (sin rayos) sobre un círculo Maíz, para que se lea en pestañas claras y oscuras.
  <code>favicon.ico</code> incluye 16, 32 y 48 px.</p>
</div>'''))

# 11 — usos incorrectos
cells = "".join(f'<div class="wr"><div class="wb"><div class="wl" {st}>{nobg("horizontal-color.svg")}</div>'
                f'<i></i></div><span>{t}</span></div>' for t, st in WRONG)
pages.append(page(11, "09 · Usos incorrectos", "Lo que no se hace", f'''
<div class="wrong">{cells}</div>
<p class="small">Tampoco: separar el símbolo del logotipo a otra distancia, cambiar la fuente del logotipo, ni
reacomodar las piezas del sol.</p>'''))

# 12 — archivos
pages.append(page(12, "10 · Archivos", "Qué archivo usar", '''
<table class="files">
  <tr><th>Carpeta</th><th>Contenido</th><th>Úsalo para</th></tr>
  <tr><td><code>logos/svg</code></td><td>Horizontal, apilado, símbolo y logotipo en color, noche, negro y blanco</td>
    <td>Web, imprenta, diseño. Siempre que se pueda, SVG.</td></tr>
  <tr><td><code>logos/png</code></td><td>Las mismas versiones en PNG transparente de alta resolución</td>
    <td>Office, presentaciones, redes.</td></tr>
  <tr><td><code>iconos/web</code></td><td>favicon.ico, icon.svg, apple-touch-icon, iconos del manifest y site.webmanifest</td>
    <td>Copiar directo a <code>app/</code> o <code>public/</code> del sitio.</td></tr>
  <tr><td><code>iconos/png</code> · <code>iconos/svg</code></td><td>Icono de app claro y noche, maskable, avatar, sello, una tinta</td>
    <td>Tiendas de apps, perfiles, stickers.</td></tr>
  <tr><td><code>src</code></td><td>Scripts que regeneran iconos y este manual</td><td>Actualizar la identidad.</td></tr>
</table>
<div class="end">''' + nobg("horizontal-color.svg") + '''</div>'''))

CSS = """
@page { size: 297mm 210mm; margin: 0 }
* { box-sizing: border-box; margin: 0; padding: 0 }
body { font-family: 'IBM Plex Sans', sans-serif; color: #102c1b; -webkit-print-color-adjust: exact; print-color-adjust: exact }
svg { display: block; width: 100%; height: auto }
.pg { width: 297mm; height: 210mm; padding: 16mm 20mm 14mm; position: relative; overflow: hidden;
      page-break-after: always; background: #f4f4ec; display: flex; flex-direction: column }
.pg header { display: flex; justify-content: space-between; font: 600 10px 'Space Grotesk'; letter-spacing: .12em;
             text-transform: uppercase; color: #2f7d4b; border-bottom: 1px solid #d6d9bb; padding-bottom: 8px }
.pg footer { position: absolute; bottom: 10mm; right: 20mm; font: 600 11px 'Space Grotesk'; color: #5c8f67 }
h2 { font: 400 38px 'Antic Slab'; margin: 14px 0 22px; letter-spacing: -.01em }
h3 { font: 600 12px 'Space Grotesk'; letter-spacing: .1em; text-transform: uppercase; margin: 22px 0 10px; color: #205736 }
p { font-size: 13px; line-height: 1.55 }
.small { font-size: 11px; color: #205736; margin-top: 14px; line-height: 1.5 }
code { font: 500 .92em 'Space Grotesk'; background: #e0e2cc; padding: 1px 5px; border-radius: 3px }
.cols { display: grid; grid-template-columns: 1fr 1fr; gap: 16mm; align-items: center; flex: 1 }
.cols3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10mm; margin-top: 14px }
.note > b { font: 600 14px 'Space Grotesk'; display: block; margin-bottom: 4px }
.note p { font-size: 12.5px }
.notes { display: grid; gap: 16px }

.cover { background: #0a1c12; color: #eaeadd; justify-content: center; align-items: center; gap: 12mm }
.cover-logo { width: 120mm }
.cover-txt { text-align: center }
.cover h1 { font: 400 30px 'Antic Slab'; letter-spacing: .02em }
.cover p { font: 500 11px 'Space Grotesk'; letter-spacing: .18em; text-transform: uppercase; color: #7cc08a; margin-top: 8px }

.lead p { font-size: 15px; margin-bottom: 14px }
.toc { list-style: none; columns: 1; font: 400 17px 'Antic Slab' }
.toc li { padding: 7px 0; border-bottom: 1px solid #d6d9bb }
.toc span { font: 600 11px 'Space Grotesk'; color: #2f7d4b; display: inline-block; width: 34px }

.big-sym { width: 100mm; justify-self: center; border-radius: 6px; overflow: hidden }
.fig.word { width: 200mm; margin: 6mm auto 10mm }

.grid-v { display: grid; grid-template-columns: 1.6fr 1fr 1fr; grid-template-rows: auto auto; gap: 8mm; flex: 1 }
.v { background: #eaeadd; border-radius: 8px; padding: 18px; display: flex; flex-direction: column }
.v .vb { flex: 1; display: flex; align-items: center; justify-content: center; min-height: 40mm }
.v .vb svg { max-height: 48mm; width: auto; max-width: 100% }
.v.main { grid-row: span 2 } .v.main .vb svg { width: 100%; max-height: none }
.v b { font: 600 13px 'Space Grotesk'; margin-top: 10px } .v p { font-size: 11.5px; color: #205736 }
.grid-v .v:nth-child(4) { grid-column: span 2 } .grid-v .v:nth-child(4) .vb svg { width: 70%; height: auto }

.clear { position: relative; border: 1.5px dashed #2f7d4b; padding: 27px; background: #eaeadd }
.clear-in { outline: 1px solid rgba(47,125,75,.35) }
.xm { position: absolute; font: italic 600 13px 'Space Grotesk'; color: #2f7d4b }
.xm.t { top: 5px; left: 50% } .xm.b { bottom: 5px; left: 50% } .xm.l { left: 9px; top: 45% } .xm.r { right: 9px; top: 45% }
table { border-collapse: collapse; width: 100%; font-size: 12.5px }
th { text-align: left; font: 600 10px 'Space Grotesk'; letter-spacing: .1em; text-transform: uppercase; color: #2f7d4b;
     border-bottom: 1.5px solid #2f7d4b; padding: 6px 8px }
td { border-bottom: 1px solid #d6d9bb; padding: 8px; vertical-align: top }
.minrow { display: flex; align-items: flex-end; gap: 22px; margin-top: 18px; padding: 14px; background: #eaeadd; border-radius: 6px }
.minrow svg { width: 100% }

.sws { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6mm }
.sw { height: 62mm; border-radius: 8px; padding: 16px; display: flex; flex-direction: column; justify-content: flex-end;
      font: 500 11px 'Space Grotesk'; gap: 3px; box-shadow: inset 0 0 0 1px rgba(16,44,27,.12) }
.sw b { font: 400 22px 'Antic Slab'; margin-bottom: 6px } .sw em { font: italic 400 11px 'IBM Plex Sans'; margin-top: 8px; opacity: .85 }
.sss { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px 6mm }
.ss { display: flex; gap: 10px; align-items: center; font: 500 10px 'Space Grotesk' }
.ss i { width: 38px; height: 38px; border-radius: 6px; flex: none; box-shadow: inset 0 0 0 1px rgba(16,44,27,.12) }
.ss b { display: block; font-size: 12px } .ss span { display: block; color: #205736 } .ss em { display: block; font: italic 10px 'IBM Plex Sans' }

.grid-bg { display: grid; grid-template-columns: 1fr 1fr; gap: 5mm }
.bgc { border-radius: 8px; padding: 12px 24px 10px; display: flex; flex-direction: column; align-items: center }
.bgc svg { width: 78% } .bgc span { font: 500 10px 'Space Grotesk'; letter-spacing: .04em; align-self: flex-start; margin-top: 2px }
.mono { display: grid; grid-template-columns: 34mm 1fr; gap: 8mm; align-items: center; margin-top: 7mm }
.mono > div > b { font: 600 14px 'Space Grotesk' } .mono p { font-size: 12px; margin-top: 4px }
.mono-sym { background: #fff; border-radius: 8px; outline: 1px solid #d6d9bb }

.types { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10mm; flex: 1 }
.ty { border-top: 2px solid #2f7d4b; padding-top: 12px }
.tag { font: 600 10px 'Space Grotesk'; letter-spacing: .12em; text-transform: uppercase; color: #2f7d4b }
.spec { font-size: 34px; margin: 10px 0 14px }

.icons { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8mm }
.ic b { font: 600 13px 'Space Grotesk'; display: block; margin-top: 10px } .ic span { font-size: 11px; color: #205736 }
.ib { width: 44mm; overflow: hidden; box-shadow: 0 1px 0 rgba(0,0,0,.05) }
.ib.r { border-radius: 22.5% } .ib.c { border-radius: 50% }
.fav { margin-top: 10mm; display: flex; gap: 6mm; flex-wrap: wrap; align-items: center }
.tab { display: flex; align-items: center; gap: 8px; font-size: 12px; background: #fff; padding: 8px 14px;
       border-radius: 8px 8px 0 0; width: 76mm; box-shadow: 0 0 0 1px #d6d9bb }
.tab.dk { background: #2b2d31; color: #e8e8e8; box-shadow: none }
.fi { width: 16px; height: 16px; flex: none }
.fav .small { width: 100%; margin-top: 4px }

.wrong { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6mm }
.wr span { font: 500 12px 'Space Grotesk'; display: block; margin-top: 6px }
.wb { position: relative; height: 40mm; background: #eaeadd; border-radius: 8px; display: flex; align-items: center;
      justify-content: center; overflow: hidden }
.wl { width: 62% } .wl.lowc { background: #5c8f67; padding: 6px; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center }
.wl.lowc svg { width: 62% }
.wb i { position: absolute; inset: 0; background: linear-gradient(to top right, transparent calc(50% - 1.5px), #c0392b calc(50% - 1.5px),
        #c0392b calc(50% + 1.5px), transparent calc(50% + 1.5px)) }
.files td:first-child { white-space: nowrap }
.end { width: 80mm; margin: auto auto 0 }
"""

html = (
    '<!doctype html><html lang="es"><head><meta charset="utf-8"><title>MexCodex · Manual de marca</title>'
    '<link href="https://fonts.googleapis.com/css2?family=Antic+Slab&family=IBM+Plex+Sans:ital,wght@0,400;0,600;1,400'
    '&family=Space+Grotesk:wght@400;500;600&display=block" rel="stylesheet">'
    f"<style>{CSS}</style></head><body>" + "".join(pages) + "</body></html>"
)
open(os.path.join(HERE, "manual.html"), "w", encoding="utf-8").write(html)

with sync_playwright() as p:
    try:
        browser = p.chromium.launch()
    except Exception:
        browser = p.chromium.launch(channel="msedge")
    pg = browser.new_page()
    pg.goto("file:///" + os.path.join(HERE, "manual.html").replace("\\", "/"), wait_until="networkidle")
    pg.evaluate("document.fonts.ready")
    pg.pdf(path=os.path.join(ROOT, "manual-de-marca.pdf"), width="297mm", height="210mm", print_background=True)
    browser.close()
print("ok")
