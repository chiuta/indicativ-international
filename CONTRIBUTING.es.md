# Cómo contribuir — INDICATIV International

[English](CONTRIBUTING.md) · [Română](CONTRIBUTING.ro.md) · [Français](CONTRIBUTING.fr.md) · [Italiano](CONTRIBUTING.it.md) · **Español** · [Português](CONTRIBUTING.pt.md) · [Deutsch](CONTRIBUTING.de.md) · [Magyar](CONTRIBUTING.hu.md)

Versión: 0.2.1 · Última actualización: 2026-11-20

1. Haz un fork de este repositorio.
2. Copia `data/packs/example.json` en `data/packs/<id-de-tu-paquete>.json` (el nombre del archivo es el id del paquete) y rellénalo, o convierte una tabla en un paquete con `node scripts/import_csv.mjs` (consulta `docs/contributor-guide.md`).
3. Ejecuta `python3 scripts/validate.py` y `npm test`, y después `node scripts/build.mjs` para que el paquete esté en `index.html`.
4. Abre un pull request — las contribuciones de datos no requieren programar.
5. Sin programar: prueba primero el paquete en la página (pestaña «Paquetes», botón «Importar») y envía después el archivo en una issue o un pull request; un responsable lo añade a `data/packs/`.

## Reglas

- Un paquete = un archivo, con el nombre del id del paquete.
- Cita siempre una fuente.
- Aporta solo material que puedas compartir legalmente (sin texto protegido copiado).
- Sé amable: consulta el Código de conducta.

## Añadir un paquete de preguntas

1. Elige primero la fuente. Un paquete de país debe venir del banco público de preguntas de ese país (o de otra fuente que puedas compartir legalmente): anota la edición, la fecha y la dirección web. No copies de un libro, un curso o un sitio web si su licencia no lo permite; si no puedes copiar, escribe preguntas originales y dilo en `source`.
2. Copia `data/packs/example.json` en `data/packs/<id-de-tu-paquete>.json`. El nombre del archivo es el id del paquete: letras minúsculas, cifras y guiones, por ejemplo `hu-ham-a`. Rellena la cabecera: `country`, `licence_class`, `lang`, `source`, `source_url`, `license`, y las reglas `exam` solo si las reglas oficiales están publicadas (con su fuente).
3. Añade las preguntas: a mano en el archivo, o desde una tabla guardada como CSV con `node scripts/import_csv.mjs questions.csv --id <id-paquete> --title … --country … --class … --lang … --source … --license …` (columnas y opciones: `docs/contributor-guide.md`). Conserva la numeración oficial en `id` y `source`.
4. Comprueba el paquete con el banco oficial (`docs/verify-against-official-bank.md`): el texto de cada pregunta, cada respuesta y cada respuesta correcta; pide a una segunda persona que revise una muestra y escribe en el pull request quién comprobó qué y cómo.
5. Ejecuta `python3 scripts/validate.py`, después `node scripts/build.mjs` (pone el paquete en `index.html`) y `npm test`. También puedes probar el paquete antes de enviarlo: abre `index.html`, pestaña «Paquetes», botón «Importar».
6. Abre un pull request o una issue e indica qué edición has usado y en qué condiciones puedes compartirla. Un paquete sin fuente declarada no se acepta.
