// Gama del dispositivo: decide qué tan pesada puede ser la página en cada equipo.
// Es la misma técnica del proyecto de lealtad (apps/web/lib/experience), adaptada a un
// sitio estático: aquí no hay servidor ni Client Hints, así que todo se mide en el navegador.
//
//   basic  gama baja:  la página clásica, sin animaciones
//   nice   gama media: la página clásica de siempre, con sus animaciones
//   best   gama alta:  el diseño 3D completo, solo si el navegador demuestra tener GPU real
//
// Son compuertas, no puntajes: cualquier motivo de "basic" gana, y "best" exige pasar todas
// las pruebas. La decisión se toma antes del primer pintado con `experienceScript` (va en
// <head>, igual que el script del tema) y queda en <html data-tier="…" data-experience="…">.
// Todo el CSS del diseño 3D cuelga de data-experience="3d" (solo gama alta); sin él la
// página es la clásica. La gama baja apaga las animaciones con data-tier="basic".

export type Tier = "basic" | "nice" | "best";

export const TIER_EVENT = "mexcodex-tier-change";

/** Tras detectar que el 3D completo va lento, el equipo se queda en "nice" hasta ese día. */
const CAP_KEY = "mexcodex-tier-cap";
const CAP_DAYS = 14;

/** Solo en desarrollo: nivel forzado desde el selector de DevTierSwitch. */
export const DEV_TIER_KEY = "mexcodex-tier";

const isDevelopment = process.env.NODE_ENV === "development";

// El selector de desarrollo no existe en producción: ahí nadie puede forzar un nivel.
const devOverride = isDevelopment
  ? `try{var o=localStorage.getItem('${DEV_TIER_KEY}');if(o==='basic'||o==='nice'||o==='best'){t=o;d.setAttribute('data-tier-forced','')}}catch(_){}`
  : "";

// Se escribe en ES5 a propósito: también tiene que correr (y no romper) en navegadores viejos.
//
// basic si: el navegador no soporta el CSS del diseño 3D, o hay ahorro de datos, o la red es
//           2G / menos de 0.5 Mbps, o el equipo informa 2 GB de memoria o menos (y, cuando
//           informa memoria, 2 núcleos o menos).
// best si:  hay WebGL2 sobre una GPU real (no por software), y los datos que el navegador sí
//           informa cumplen: 4 GB o más, 4 núcleos o más, red 4g, y sin "reducir movimiento".
// nice:     todo lo demás.
//
// Solo Chromium informa memoria; WebKit limita y altera el número de núcleos, así que los
// núcleos por sí solos nunca bajan un iPhone a "basic".
export const experienceScript = `(function(){var d=document.documentElement,t='basic';try{var n=navigator,c=n.connection||{},m=n.deviceMemory,k=n.hardwareConcurrency,e=c.effectiveType,w=function(q){return !!(window.matchMedia&&matchMedia(q).matches)};var css=!!(window.CSS&&CSS.supports&&CSS.supports('transform-style','preserve-3d')&&CSS.supports('rotate','x 10deg')&&CSS.supports('aspect-ratio','1'));var low=!css||c.saveData||w('(prefers-reduced-data: reduce)')||e==='slow-2g'||e==='2g'||(typeof c.downlink==='number'&&c.downlink<0.5)||(typeof m==='number'&&(m<=2||(k&&k<=2)));if(!low){t='nice';var best=!(typeof m==='number'&&m<4)&&!(k&&k<4)&&!(e&&e!=='4g')&&!w('(prefers-reduced-motion: reduce)');if(best){try{var cap=+localStorage.getItem('${CAP_KEY}');if(cap&&cap>=Math.floor(Date.now()/864e5))best=false}catch(_){}}if(best){var g=document.createElement('canvas').getContext('webgl2',{failIfMajorPerformanceCaveat:true});if(!g){best=false}else{var x=g.getExtension('WEBGL_debug_renderer_info'),r=String(g.getParameter(x?x.UNMASKED_RENDERER_WEBGL:g.RENDERER)||'');if(/swiftshader|llvmpipe|softpipe|software|basic render|mesa offscreen/i.test(r))best=false;var l=g.getExtension('WEBGL_lose_context');if(l)l.loseContext()}}if(best)t='best'}${devOverride}}catch(x){t='basic'}d.setAttribute('data-tier',t);d.setAttribute('data-experience',t==='best'?'3d':'classic')})()`;

/**
 * Respaldo para páginas donde el script de <head> no llega a ejecutarse. Pasa en /404:
 * Next la exporta como un cascarón que se dibuja por completo en el navegador, y los
 * <script> insertados así no corren. Ejecuta la misma detección una sola vez.
 */
export function ensureTier() {
  if (document.documentElement.dataset.tier) return;
  try {
    new Function(experienceScript)();
  } catch {
    document.documentElement.dataset.tier = "basic";
    document.documentElement.dataset.experience = "classic";
  }
}

export function readTier(): Tier {
  const tier = document.documentElement.dataset.tier;
  return tier === "nice" || tier === "best" ? tier : "basic";
}

/**
 * El vigilante de fluidez midió que el 3D completo va lento en este equipo: baja a "nice"
 * (la página clásica) y lo recuerda 14 días. No aplica a un nivel forzado en desarrollo.
 */
export function capToNice() {
  const root = document.documentElement;
  if (root.dataset.tier !== "best" || (isDevelopment && "tierForced" in root.dataset)) return;
  try {
    localStorage.setItem(CAP_KEY, String(Math.floor(Date.now() / 86_400_000) + CAP_DAYS));
  } catch {
    // Sin almacenamiento el cambio vale solo para esta visita.
  }
  root.dataset.tier = "nice";
  root.dataset.experience = "classic";
  window.dispatchEvent(new Event(TIER_EVENT));
}
