# Registro de cambios

[English](CHANGELOG.md) · [Română](CHANGELOG.ro.md) · [Français](CHANGELOG.fr.md) · [Italiano](CHANGELOG.it.md) · **Español** · [Português](CHANGELOG.pt.md) · [Deutsch](CHANGELOG.de.md) · [Magyar](CHANGELOG.hu.md)

Formato: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) · [SemVer](https://semver.org/).

## [Sin publicar]

## [0.2.0] - 2026-11-17

### Añadido
- El motor de `src/engine.mjs`: validación de paquetes y figuras, calendario de repaso en cinco cajas, colas de preguntas, exámenes sacados de una semilla, calificación y archivos de progreso.
- La página: pestañas «Practicar», «Examen», «Paquetes» y «Guía» en ocho idiomas; atajos de teclado, avisos para lectores de pantalla, un cronómetro de examen que sobrevive a una recarga; importación, descarga, reinicio y eliminación de paquetes; una copia de seguridad del progreso.
- Un paquete de práctica integrado de 50 preguntas originales (con explicaciones, fórmulas y dos figuras), escrito para este proyecto con un asistente de IA y comprobado mediante cálculo; no es un banco de preguntas oficial.
- El formato común de paquete: `schema.json`, la plantilla `data/packs/example.json` y `docs/pack-format.md` (en inglés y en rumano).
- `scripts/validate.py` aplica las mismas reglas que la página; las pruebas lo comparan con el motor con los mismos casos.
- `scripts/import_csv.mjs`: una tabla guardada como CSV se convierte en un paquete, y cada problema nombra su línea en el archivo.
- `scripts/pack_report.mjs`: un resumen de un paquete (recuentos, números oficiales que faltan, posiciones de las respuestas correctas, un listado de texto, una muestra aleatoria) para comprobarlo con el banco oficial.
- `docs/contributor-guide.md` y `docs/verify-against-official-bank.md` (en inglés y en rumano).
- Pruebas: `npm test` y pruebas de navegador en el hub.
- `src/` y `scripts/build.mjs`: el único `index.html` se construye ahora desde las fuentes, con los paquetes incorporados, y `--check` lo verifica.
- ISSUES_GOOD_FIRST y CODE_OF_CONDUCT traducidos a los ocho idiomas.
- README en inglés, rumano, francés, italiano, español, portugués, alemán y húngaro: secciones de estado y de alcance previsto (derivadas de `ISSUES_GOOD_FIRST.md`).
- Instalable (PWA): `manifest.webmanifest`, `sw.js` y los iconos los genera el kit común (`fff-kit/pwa`); la página funciona sin conexión tras la primera visita por HTTPS.

### Cambiado
- El workflow se ejecuta en Ubuntu 26.04 con Node.js 26 y ejecuta también las pruebas, la comprobación de la compilación y la validación.
- Los datos son ahora paquetes: `data/packs/example.json` sustituye a `data/questions/example.json`, y un paquete es un archivo que se llama como su id; `scripts/validate.py`, los pasos del README y las plantillas cambiaron en consecuencia.
- La lista de good first issues contiene ahora lo que queda por hacer (paquetes de país, programa, revisiones); el entrenador, el simulador de examen, las figuras y la comprobación de `correct` que enumeraba ya existen.

## [0.1.0] - 2026-11-13

### Añadido
- Esqueleto inicial: estructura, esquema de datos o primeros ejemplos, guías de contribución en ocho idiomas.
