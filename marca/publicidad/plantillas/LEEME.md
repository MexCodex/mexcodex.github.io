# Plantillas de publicaciones · MexCodex

Cada publicación es un objeto dentro de `posts.json`. Edita el texto y vuelve a generar:

```bash
python marca/publicidad/plantillas/generar.py                      # todas
python marca/publicidad/plantillas/generar.py precio-esencial      # solo una (por id)
python marca/publicidad/plantillas/generar.py --json campaña.json  # otro archivo con el mismo formato
```

Las imágenes salen en `salida/<id>.png` y `vista-previa.html` las muestra todas juntas.
El teléfono, correo y sitio del pie salen de `marca/publicidad/datos.json`.

Necesita Python con `playwright` y `segno` (`pip install playwright segno` y `playwright install chromium`;
si no está Chromium usa Microsoft Edge). Las fuentes se cargan de Google Fonts, así que requiere internet.

## Campos comunes

| Campo | Valores | Nota |
|---|---|---|
| `id` | texto sin espacios | Nombre del PNG de salida |
| `plantilla` | `anuncio`, `servicio`, `precio`, `dato`, `frase`, `proyecto`, `lista` | |
| `formato` | `cuadrado` (1080×1080), `vertical` (1080×1350), `historia` (1080×1920) | Por defecto `cuadrado` |
| `tema` | `claro`, `noche`, `jade` | Por defecto `claro` |
| `etiqueta` | texto corto | Línea en mayúsculas sobre el título |
| `titulo` | texto | Escribe `*así*` para resaltar palabras con el color de acento |
| `texto` | texto | Párrafo de apoyo |
| `boton` | texto | Opcional; ej. `Cotiza gratis`, el teléfono o el sitio |

## Campos por plantilla

| Plantilla | Campos extra |
|---|---|
| `anuncio` | — |
| `servicio` | `icono` (`web`, `movil`, `medida`, `integraciones`), `puntos` (lista) |
| `precio` | `antes` («A partir de»), `precio` («$349»), `periodo`, `puntos` |
| `dato` | `valor` (la cifra grande, ej. `<24h`, `+5`, `30%`), `nota` (letra chica) |
| `frase` | `autor` |
| `proyecto` | `imagen` (ruta relativa a esta carpeta, ej. `fotos/buap.jpg`; vacío = fondo con el símbolo), `puntos`, `etiquetas` |
| `lista` | `puntos` (se numeran 01, 02, 03…) |

## Recomendaciones

- Títulos de 3 a 8 palabras; en `cuadrado` caben ~4 líneas de título más el texto.
- `historia` deja espacio arriba y abajo para los controles de Instagram/WhatsApp: no pongas nada clave en los
  primeros y últimos 250 px (el logo y el pie quedan en esa zona; son decorativos).
- Para agregar una plantilla nueva, crea una función `t_<nombre>(p, tema)` en `generar.py` y regístrala en
  `PLANTILLAS`.
