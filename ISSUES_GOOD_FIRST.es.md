# Buenas primeras tareas

[English](ISSUES_GOOD_FIRST.md) · [Română](ISSUES_GOOD_FIRST.ro.md) · [Français](ISSUES_GOOD_FIRST.fr.md) · [Italiano](ISSUES_GOOD_FIRST.it.md) · **Español** · [Português](ISSUES_GOOD_FIRST.pt.md) · [Deutsch](ISSUES_GOOD_FIRST.de.md) · [Magyar](ISSUES_GOOD_FIRST.hu.md)

- [ ] Añadir un paquete para Hungría desde el banco público de preguntas (`scripts/import_csv.mjs`, numeración oficial en `id` y `source`, `source_url`, reglas de examen con su fuente)
- [ ] Añadir un paquete para Italia desde el banco público de preguntas, con el mismo cuidado (edición, dirección de la fuente, numeración, reglas de examen)
- [ ] Añadir un paquete para Alemania (clase E o A) desde el banco público de preguntas, con el mismo cuidado
- [ ] Añadir un paquete para tu propio país desde su banco oficial de preguntas, en cualquier idioma, y contarnos qué has comprobado
- [ ] Escribir un conversor del formato de archivo oficial de un país (PDF, tabla o XML) a las columnas CSV de `scripts/import_csv.mjs`
- [ ] Añadir el programa CEPT HAREC (Recomendación T/R 61-02) como `syllabus` de un paquete y vincular cada pregunta con `syllabus_ref`
- [ ] Pedir a un radioaficionado que revise las 50 preguntas de práctica integradas y que señale cualquier respuesta incorrecta o redacción poco clara
- [ ] Redibujar las figuras de circuitos y antenas de un paquete como SVG restringido, cada una con una alternativa de texto en `figure_alt`
- [ ] Probar el simulador de examen con un lector de pantalla (NVDA, VoiceOver u Orca) y señalar qué resulta difícil de usar
- [ ] Pedir a un hablante nativo que revise los textos de la interfaz de su idioma en `src/i18n.mjs`

Créalas todas en GitHub con `scripts/create_issues.sh` (requiere la CLI `gh`).
