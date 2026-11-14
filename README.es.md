# INDICATIV International

[English](README.md) · [Română](README.ro.md) · [Français](README.fr.md) · [Italiano](README.it.md) · **Español** · [Português](README.pt.md) · [Deutsch](README.de.md) · [Magyar](README.hu.md)

Versión: 0.1.0 · Última actualización: 2026-11-14

🌐 https://indicativ-international.chiuta.ro

> Bancos de preguntas del examen de radioaficionado de cada país, en un formato común.

Trade-free: sin rastreo, sin anuncios, sin cuentas, funciona sin conexión.

## Estado

Alfa: el repositorio contiene la estructura, el esquema de datos o los primeros ejemplos y las guías de contribución. El alcance de abajo es el plan, no lo que funciona hoy.

## Alcance previsto

- Un formato JSON común para los bancos de preguntas del examen de radioaficionado, validado por un script (por ejemplo, que `correct` esté dentro del rango de `answers`).
- El programa CEPT HAREC como `syllabus.json`, con un campo `syllabus_ref` que vincula cada pregunta con un punto del programa.
- Paquetes por país a partir de bancos de preguntas públicos, empezando por Hungría, Italia y Alemania (Klasse E), cada uno con enlace a la fuente.
- Un entrenador de repetición espaciada y un simulador de examen con temporizador y nota de aprobado por país.
- Soporte de fórmulas y diagramas (SVG) en las preguntas y una guía para verificar una pregunta con el banco oficial.

Nada de esto está implementado todavía: cada punto es una tarea preparada en `ISSUES_GOOD_FIRST.md`.

## Contribuye en 5 minutos

1. Haz un fork de este repositorio.
2. Copia `data/questions/example.json` en `data/questions/` y edítalo.
3. Ejecuta `python scripts/validate.py`.
4. Abre un pull request: para los datos no hace falta programar.

## Buenas primeras tareas

Consulta `ISSUES_GOOD_FIRST.md` para tareas ya preparadas.

## Licencia

Código: MIT. Datos aportados: indica la fuente; se publican con la misma licencia salvo que el archivo diga otra cosa.

## Apoyo

Si el proyecto te resulta útil, puedes [invitarme a un café](https://buymeacoffee.com/echo.of.the.strings).
