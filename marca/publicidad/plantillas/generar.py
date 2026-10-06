"""Plantillas de publicaciones de MexCodex, editables desde posts.json.

Uso:
    python marca/publicidad/plantillas/generar.py              # todas las publicaciones
    python marca/publicidad/plantillas/generar.py precio-esencial lanzamiento   # solo esas
    python marca/publicidad/plantillas/generar.py --json otro.json              # otro archivo

Salida: plantillas/salida/<id>.png y plantillas/vista-previa.html
"""
import html
import json
import os
import re
import sys
from pathlib import Path

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "src"))

from playwright.sync_api import sync_playwright  # noqa: E402

from comun import C, DATOS, FONTS, browser, icon, load, logo  # noqa: E402

FORMATOS = {"cuadrado": (1080, 1080), "vertical": (1080, 1350), "historia": (1080, 1920)}
TEMAS = {
    #        fondo        texto         acento          suave           logo                    símbolo
    "claro": (C["maiz"], C["obsidiana"], C["jade"], C["selva"], "horizontal-color.svg", "simbolo-negro.svg"),
    "noche": (C["noche"], C["maiz"], C["claro_nt"], "#b9c4b0", "horizontal-noche.svg", "simbolo-blanco.svg"),
    "jade": (C["jade"], "#ffffff", C["maiz"], "#dcebdc", "horizontal-blanco.svg", "simbolo-blanco.svg"),
}
SERV_ICON = {
    "web": '<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 8h18M7 21h10M12 18v3"/>',
    "movil": '<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M10 18h4"/>',
    "medida": '<path d="m8 8-5 4 5 4M16 8l5 4-5 4M14 5l-4 14"/>',
    "integraciones": '<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/>'
                     '<path d="M8.5 6h7M18 8.5v7M7.8 7.8l8.4 8.4"/>',
}


def esc(t):
    """Escapa el texto y convierte *palabra* en la palabra resaltada con el color de acento."""
    return re.sub(r"\*(.+?)\*", r'<span class="hl">\1</span>', html.escape(str(t or "")))


def greca(c1, c2):
    """Escalones de greca en la esquina inferior derecha."""
    w = h = 100
    n = 5

    def stair(off):
        sx, sy = (w - off) / n, (h - off) / n
        pts = [(w, off)]
        for i in range(n):
            x = w - (i + 1) * sx
            pts += [(x, off + i * sy), (x, off + (i + 1) * sy)]
        return " ".join(f"{x:.1f},{y:.1f}" for x, y in pts + [(w, h)])
    return (f'<svg class="greca" viewBox="0 0 {w} {h}"><polygon points="{stair(20)}" fill="{c1}"/>'
            f'<polygon points="{stair(56)}" fill="{c2}"/></svg>')


def lista(items, cls="pts"):
    if not items:
        return ""
    return f'<ul class="{cls}">' + "".join(f"<li><i></i><span>{esc(x)}</span></li>" for x in items) + "</ul>"


def boton(p):
    return f'<div class="btn">{esc(p["boton"])}</div>' if p.get("boton") else ""


def etiqueta(p):
    return f'<div class="kicker">{esc(p["etiqueta"])}</div>' if p.get("etiqueta") else ""


# --- cuerpo de cada plantilla ---------------------------------------------
def t_anuncio(p, t):
    return (f'<div class="mid">{etiqueta(p)}<h1 class="xl">{esc(p.get("titulo"))}</h1>'
            f'<p class="lead">{esc(p.get("texto"))}</p>{boton(p)}</div>')


def t_servicio(p, t):
    ic = SERV_ICON.get(p.get("icono", "web"), SERV_ICON["web"])
    return (f'<div class="mid"><div class="sicon"><svg viewBox="-8 -8 40 40" fill="none" stroke="currentColor" '
            f'stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">'
            f'<polygon points="1,-7 23,-7 31,1 31,23 23,31 1,31 -7,23 -7,1" stroke-width="1.6"/>{ic}</svg></div>'
            f'{etiqueta(p)}'
            f'<h1>{esc(p.get("titulo"))}</h1><p class="lead">{esc(p.get("texto"))}</p>{lista(p.get("puntos"))}'
            f'{boton(p)}</div>')


def t_precio(p, t):
    return (f'<div class="mid">{etiqueta(p)}<h1>{esc(p.get("titulo"))}</h1>'
            f'<div class="price"><small>{esc(p.get("antes"))}</small><b>{esc(p.get("precio"))}</b>'
            f'<small>{esc(p.get("periodo"))}</small></div>{lista(p.get("puntos"))}{boton(p)}</div>')


def t_dato(p, t):
    nota = f'<p class="nota">{esc(p["nota"])}</p>' if p.get("nota") else ""
    return (f'<div class="mid">{etiqueta(p)}<div class="big">{esc(p.get("valor"))}</div>'
            f'<h1>{esc(p.get("titulo"))}</h1><p class="lead">{esc(p.get("texto"))}</p>{nota}{boton(p)}</div>')


def t_frase(p, t):
    autor = f'<div class="autor">— {esc(p["autor"])}</div>' if p.get("autor") else ""
    return (f'<div class="mid quote"><div class="qmark">“</div><h1 class="xl">{esc(p.get("titulo"))}</h1>'
            f'{autor}</div>')


def t_proyecto(p, t):
    img = p.get("imagen")
    if img:
        src = Path(img) if os.path.isabs(img) else Path(HERE) / img
        media = f'<div class="media" style="background-image:url(\'{src.resolve().as_uri()}\')"></div>'
    else:
        media = f'<div class="media empty">{logo(TEMAS["noche"][5])}</div>'
    tags = "".join(f"<em>{esc(x)}</em>" for x in p.get("etiquetas", []))
    return (f'{media}<div class="mid low">{etiqueta(p)}<h1>{esc(p.get("titulo"))}</h1>'
            f'<p class="lead">{esc(p.get("texto"))}</p>{lista(p.get("puntos"))}<div class="tags">{tags}</div></div>')


def t_lista(p, t):
    items = "".join(f'<li><b>{i + 1:02d}</b><span>{esc(x)}</span></li>' for i, x in enumerate(p.get("puntos", [])))
    return (f'<div class="mid">{etiqueta(p)}<h1>{esc(p.get("titulo"))}</h1><ol class="steps">{items}</ol>'
            f'{boton(p)}</div>')


PLANTILLAS = {"anuncio": t_anuncio, "servicio": t_servicio, "precio": t_precio, "dato": t_dato,
              "frase": t_frase, "proyecto": t_proyecto, "lista": t_lista}


def css(w, h, tema):
    bg, fg, ac, soft, _, _ = TEMAS[tema]
    k = {"cuadrado": 1.0, "vertical": 1.06, "historia": 1.18}[next(f for f, s in FORMATOS.items() if s == (w, h))]
    pad = 88 if h < 1900 else 100
    return f"""
* {{ box-sizing: border-box; margin: 0; padding: 0 }}
body {{ background: transparent }}
svg {{ display: block }}
.post {{ width: {w}px; height: {h}px; background: {bg}; color: {fg}; position: relative; overflow: hidden;
        display: flex; flex-direction: column; padding: {pad}px {pad}px {pad - 14}px; font-family: 'IBM Plex Sans' }}
.water {{ position: absolute; right: -170px; top: {h * 0.5 - 300:.0f}px; width: 640px; opacity: {.04 if tema == "claro" else .07} }}
.greca {{ position: absolute; right: 0; bottom: 0; width: {170 * k:.0f}px; height: {170 * k:.0f}px }}
.top {{ display: flex; justify-content: space-between; align-items: center; position: relative }}
.top .lg {{ width: {300 * k:.0f}px }}
.top .site {{ font: 600 {22 * k:.0f}px 'Space Grotesk'; letter-spacing: .08em; color: {soft} }}
.mid {{ flex: 1; display: flex; flex-direction: column; justify-content: center; position: relative; max-width: 860px; padding-bottom: 36px }}
.mid.low {{ justify-content: center }}
.kicker {{ font: 600 {24 * k:.0f}px 'Space Grotesk'; letter-spacing: .2em; text-transform: uppercase; color: {ac};
          margin-bottom: {26 * k:.0f}px; display: flex; align-items: center; gap: 18px }}
.kicker::before {{ content: ""; width: 54px; height: 5px; background: {ac} }}
h1 {{ font: 400 {78 * k:.0f}px/1.08 'Antic Slab'; letter-spacing: -.01em }}
h1.xl {{ font-size: {98 * k:.0f}px }}
.hl {{ color: {ac} }}
.lead {{ font-size: {32 * k:.0f}px; line-height: 1.45; color: {soft}; margin-top: {30 * k:.0f}px; max-width: 800px }}
.btn {{ align-self: flex-start; margin-top: {44 * k:.0f}px; font: 600 {28 * k:.0f}px 'Space Grotesk'; letter-spacing: .02em;
       background: {ac}; color: {bg}; padding: {20 * k:.0f}px {38 * k:.0f}px;
       clip-path: polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px) }}
.pts {{ list-style: none; margin-top: {30 * k:.0f}px; display: grid; gap: {16 * k:.0f}px }}
.pts li {{ display: flex; gap: 20px; align-items: baseline; font-size: {29 * k:.0f}px; line-height: 1.35 }}
.pts i {{ flex: none; width: 16px; height: 16px; background: {ac}; transform: rotate(45deg) translateY(-3px) }}
.sicon {{ width: {120 * k:.0f}px; height: {120 * k:.0f}px; color: {ac}; margin-bottom: {40 * k:.0f}px }}
.sicon svg {{ width: 100%; height: 100% }}
.price {{ display: flex; flex-direction: column; margin: {34 * k:.0f}px 0 {6 * k:.0f}px }}
.price b {{ font: 700 {200 * k:.0f}px/0.95 'Space Grotesk'; color: {ac}; letter-spacing: -.03em }}
.price small {{ font: 500 {28 * k:.0f}px 'Space Grotesk'; color: {soft}; letter-spacing: .04em }}
.big {{ font: 700 {270 * k:.0f}px/0.9 'Space Grotesk'; color: {ac}; letter-spacing: -.04em; margin-bottom: {24 * k:.0f}px }}
.nota {{ font-size: {20 * k:.0f}px; color: {soft}; margin-top: 26px; opacity: .85 }}
.quote .qmark {{ font: 400 {260 * k:.0f}px/0.6 'Antic Slab'; color: {ac}; height: {130 * k:.0f}px }}
.autor {{ font: 600 {26 * k:.0f}px 'Space Grotesk'; letter-spacing: .12em; text-transform: uppercase; color: {soft};
         margin-top: {40 * k:.0f}px }}
.media {{ position: relative; margin: 44px -{pad}px 0; height: {h * 0.26:.0f}px; background: center/cover no-repeat;
         clip-path: polygon(0 0, 100% 0, 100% 100%, 90px 100%, 0 calc(100% - 90px)) }}
.media.empty {{ background: linear-gradient(160deg, {C["obsidiana"]} 0%, #1e3957 100%); display: flex;
               align-items: center; justify-content: center }}
.media.empty svg {{ width: 34%; opacity: .9 }}
.tags {{ display: flex; gap: 14px; margin-top: 30px; flex-wrap: wrap }}
.tags em {{ font: 600 {22 * k:.0f}px 'Space Grotesk'; font-style: normal; border: 2px solid {ac}; color: {ac};
           padding: 8px 18px; letter-spacing: .04em }}
.steps {{ list-style: none; margin-top: {50 * k:.0f}px; display: grid; gap: {34 * k:.0f}px }}
.steps li {{ display: flex; gap: 30px; align-items: center; font-size: {34 * k:.0f}px; line-height: 1.3;
            border-top: 2px solid {ac}55; padding-top: {30 * k:.0f}px }}
.steps b {{ font: 700 {64 * k:.0f}px 'Space Grotesk'; color: {ac}; min-width: {100 * k:.0f}px }}
.foot {{ display: flex; gap: 36px; position: relative; font: 500 {22 * k:.0f}px 'Space Grotesk'; color: {soft};
        letter-spacing: .03em; padding-right: {170 * k:.0f}px }}
.foot span {{ white-space: nowrap; display: flex; align-items: center; gap: 10px }}
.foot .ico {{ width: {26 * k:.0f}px; height: {26 * k:.0f}px }}
"""


def post_html(p):
    fmt = p.get("formato", "cuadrado")
    tema = p.get("tema", "claro")
    if fmt not in FORMATOS or tema not in TEMAS or p.get("plantilla") not in PLANTILLAS:
        raise SystemExit(f"Post {p.get('id')!r}: revisa plantilla/formato/tema "
                         f"({', '.join(PLANTILLAS)} / {', '.join(FORMATOS)} / {', '.join(TEMAS)})")
    w, h = FORMATOS[fmt]
    bg, fg, ac, soft, lg, sym = TEMAS[tema]
    c2 = C["obsidiana"] if tema != "noche" else C["jade"]
    body = PLANTILLAS[p["plantilla"]](p, tema)
    foot = (f'<div class="foot"><span>{icon("whatsapp", ac)}{DATOS["telefono"]}</span>'
            f'<span>{icon("correo", ac)}{DATOS["correo"]}</span></div>')
    water = "" if p["plantilla"] == "proyecto" else f'<div class="water">{logo(sym)}</div>'
    return (f'<!doctype html><html lang="es"><head><meta charset="utf-8">{FONTS}<style>{css(w, h, tema)}</style>'
            f'</head><body><div class="post">{water}{greca(ac, c2)}'
            f'<div class="top"><div class="lg">{logo(lg)}</div><div class="site">{DATOS["sitio"]}</div></div>'
            f'{body}{foot}</div></body></html>')


def main():
    args = sys.argv[1:]
    src = os.path.join(HERE, "posts.json")
    if "--json" in args:
        i = args.index("--json")
        src = os.path.abspath(args[i + 1])
        args = args[:i] + args[i + 2:]
    posts = json.load(open(src, encoding="utf-8"))["posts"]
    if args:
        posts = [p for p in posts if p["id"] in args]
    out = os.path.join(HERE, "salida")
    tmp = os.path.join(HERE, "salida", ".html")
    os.makedirs(tmp, exist_ok=True)

    with sync_playwright() as pw:
        b = browser(pw)
        pg = b.new_page()
        for p in posts:
            w, h = FORMATOS[p.get("formato", "cuadrado")]
            f = os.path.join(tmp, f'{p["id"]}.html')
            open(f, "w", encoding="utf-8").write(post_html(p))
            pg.set_viewport_size({"width": w, "height": h})
            load(pg, f)
            pg.locator(".post").screenshot(path=os.path.join(out, f'{p["id"]}.png'))
            print(f'  {p["id"]}.png  ({p["plantilla"]}, {p.get("formato", "cuadrado")}, {p.get("tema", "claro")})')
        b.close()

    cards = "".join(f'<figure><img src="salida/{p["id"]}.png"><figcaption><b>{p["id"]}</b> · {p["plantilla"]} · '
                    f'{p.get("formato", "cuadrado")} · {p.get("tema", "claro")}</figcaption></figure>' for p in posts)
    open(os.path.join(HERE, "vista-previa.html"), "w", encoding="utf-8").write(
        f'<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Plantillas · MexCodex</title>{FONTS}'
        '<style>body{margin:0;padding:32px;background:#eaeadd;font-family:"IBM Plex Sans";color:#102c1b}'
        'h1{font:400 32px "Antic Slab";margin-bottom:24px}main{display:flex;flex-wrap:wrap;gap:24px;align-items:flex-start}'
        'figure{width:300px}img{width:100%;display:block;box-shadow:0 2px 12px #0002}figcaption{font-size:12px;margin-top:8px}'
        f'</style></head><body><h1>Plantillas de publicaciones</h1><main>{cards}</main></body></html>')
    print("ok:", out)


if __name__ == "__main__":
    main()
