# INDICATIV International

[English](README.md) · [Română](README.ro.md) · [Français](README.fr.md) · [Italiano](README.it.md) · **Español** · [Português](README.pt.md) · [Deutsch](README.de.md) · [Magyar](README.hu.md)

Versión: 0.2.1 · Última actualización: 2026-11-22

🌐 https://indicativ-international.chiuta.ro

> Bancos de preguntas del examen de radioaficionado de cada país, en un formato común.

Trade-free: sin rastreo, sin anuncios, sin cuentas, funciona sin conexión.

## Estado

Alfa, utilizable: el único `index.html` es un entrenador y simulador de examen para las preguntas de radioaficionado. Practica con un calendario de repaso en cinco cajas, realiza exámenes de prueba cronometrados con una nota de corte e importa paquetes de preguntas en un formato JSON común. El paquete integrado contiene 50 preguntas de práctica originales escritas para este proyecto; no es un banco de preguntas oficial y todavía no se incluye ningún paquete de país. Todo se queda en tu navegador, sin cuentas, seguimiento ni peticiones de red.

## Qué hace

- «Practicar»: elige un paquete, un tema y qué preguntas practicar (pendientes y nuevas, cualquier pregunta o tus puntos débiles); cada respuesta se comprueba al instante y se explica, con su fuente. Las respuestas correctas vuelven al cabo de 1, 3, 7, 14 y 30 días; las incorrectas vuelven hoy y una vez más al final de la sesión. Las teclas 1–6 o A–F eligen una respuesta, Intro continúa.
- «Examen»: una prueba cronometrada sacada al azar del paquete, con cuenta atrás, mapa de preguntas, «Marcar para revisar» y nota de corte; nada se califica hasta que termines (o se acabe el tiempo). El resultado muestra la puntuación por tema y las preguntas falladas; la misma semilla repite un examen; un examen empezado continúa tras recargar. Las reglas (preguntas, minutos, nota de corte, penalización de las respuestas incorrectas) vienen del paquete junto con su fuente; sin ellas la página usa valores de práctica (20 preguntas, 30 minutos, 75 %).
- «Paquetes»: el paquete de práctica integrado y los paquetes que importes pegando JSON o eligiendo un archivo (como máximo 8 a la vez), cada uno con su fuente, licencia y reglas de examen; progreso por tema; puedes descargar un paquete, reiniciar su progreso o quitarlo; copia de seguridad del progreso en un archivo, que cargas en otro dispositivo. Un paquete con problemas se lista línea por línea y puedes importar solo sus preguntas válidas.
- Formato: fórmulas en las preguntas escritas `f_{o}` o `10^{-6}`; dibujos pequeños como SVG restringido con una alternativa de texto; un programa opcional con `syllabus_ref` en cada pregunta; un archivo JSON por paquete en `data/packs/`, descrito por `schema.json` y `docs/pack-format.md`.
- Herramientas para quien contribuye: `scripts/validate.py` comprueba los paquetes con las mismas reglas que la página; `scripts/import_csv.mjs` convierte una tabla guardada como CSV en un paquete y nombra la línea de cada problema; `scripts/pack_report.mjs` resume un paquete para comprobarlo con el banco oficial. La interfaz está en ocho idiomas y se puede usar con el teclado y con un lector de pantalla.
- Instalable como aplicación y disponible sin conexión tras la primera visita cuando se sirve por HTTPS (un service worker conserva la página; no se guarda ni se envía nada más). Abierta desde un archivo descargado funciona igual, sin instalación.

## Cómo funciona

- `schema.json` describe un paquete; `scripts/validate.py` comprueba cada archivo de `data/packs/` con él y con las reglas que un esquema no sabe expresar: el archivo se llama como el id del paquete, los id y las preguntas son únicos dentro de un paquete, `syllabus_ref` existe en el programa, las figuras usan solo los elementos permitidos y las reglas de examen caben en el paquete.
- `src/engine.mjs` es el motor (sin pantalla, sin red): validación, calendario en cinco cajas, colas de preguntas, exámenes sacados de una semilla, calificación y archivos de progreso. `scripts/validate.py` y `scripts/import_csv.mjs` aplican las mismas reglas; las pruebas comparan las implementaciones con los mismos casos.
- `src/ui.js`, `src/i18n.mjs` y `src/app.css` son la interfaz; `scripts/build.mjs` construye el único `index.html` desde `src/` e incorpora los paquetes de `data/packs/` (todos menos `example.json`); `node scripts/build.mjs --check` falla cuando la página no está al día.
- El navegador guarda tres entradas (paquetes importados, progreso, un examen en curso); cada una se vuelve a comprobar al cargar la página, de modo que un estado guardado dañado u hostil se ignora, no se cree. No se envía nada a ninguna parte.
- Pruebas: `npm test` (motor, paridad del validador, importación CSV, textos de la interfaz, datos, documentación, compilación) y pruebas de navegador en el hub (ocho idiomas, accesibilidad, estado guardado hostil, importación, cronometraje del examen) El desarrollo necesita Node.js 24 o posterior y Python 3 con `jsonschema`; la página en sí solo necesita un navegador que conozca ES2017.
- `manifest.webmanifest`, `sw.js` y los iconos los produce `node scripts/build.mjs` mediante el kit común (sección `pwa` de `src/app.json`); `--check` también los verifica, y `npm test` comprueba que el manifiesto, la versión del service worker y la CSP coincidan con la página.

## Límites honestos

- El paquete incorporado es un pequeño conjunto de preguntas de práctica escritas con un asistente de IA y comprobadas con cálculos o con datos de manual. No es un banco oficial de preguntas y ningún examinador lo ha revisado.
- No se incluye ningún paquete de país: los bancos públicos de preguntas de Hungría, Italia, Alemania y otros no se pudieron descargar ni comprobar aquí, así que son tareas para colaboradores. Compara cada paquete con el banco oficial antes de fiarte.
- Las reglas de los exámenes reales (número de preguntas, tiempo, nota de aprobado) no están incorporadas. Un paquete puede declararlas con su fuente; sin ella el simulador usa valores de práctica, y aprobar aquí no demuestra nada sobre un examen real.
- El esquema de repetición es sencillo, de cinco cajas con intervalos fijos, no un algoritmo ajustado. El progreso se queda en este navegador; borrar los datos del sitio lo elimina salvo que hayas descargado una copia.
- La asociación con el temario vale lo que vale el paquete: la página comprueba que «syllabus_ref» exista en el paquete, pero no puede saber si la asociación es correcta. El temario CEPT HAREC no se incluye.
- Las traducciones de la interfaz las escribió una máquina y no las han revisado hablantes nativos; las preguntas se muestran en el idioma del paquete.

## Contribuye en 5 minutos

1. Haz un fork de este repositorio.
2. Copia `data/packs/example.json` en `data/packs/<id-de-tu-paquete>.json` (el nombre del archivo es el id del paquete) y rellénalo, o convierte una tabla en un paquete con `node scripts/import_csv.mjs` (consulta `docs/contributor-guide.md`).
3. Ejecuta `python3 scripts/validate.py` y `npm test`, y después `node scripts/build.mjs` para que el paquete esté en `index.html`.
4. Abre un pull request — las contribuciones de datos no requieren programar.
5. Sin programar: prueba primero el paquete en la página (pestaña «Paquetes», botón «Importar») y envía después el archivo en una issue o un pull request; un responsable lo añade a `data/packs/`.

## Buenas primeras tareas

Consulta `ISSUES_GOOD_FIRST.md` para tareas ya preparadas.

## Licencia

Código: MIT. Datos aportados: indica la fuente; se publican con la misma licencia salvo que el archivo diga otra cosa.

## Apoyo

Si el proyecto te resulta útil, puedes [invitarme a un café](https://buymeacoffee.com/echo.of.the.strings).
