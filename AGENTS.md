# AGENTS.md

Guía corta para trabajar en `der-die-das`.

## Principios

- Trata `der-die-das` como app activa de práctica de artículos alemanes.
- Reutiliza `core` antes de duplicar lógica.
- Mantén el cambio más pequeño que resuelva el problema real.

## Reglas útiles

- No toques branding, mascota, iconos o colores principales sin instrucción explícita.
- Preserva las URLs compartibles por nivel.
- Cuida la experiencia responsive en desktop y mobile.
- No mezcles cambios visuales con cambios funcionales en la misma PR.
- Cambios en ejercicios, progreso, `localStorage` o scoring requieren PR dedicada.

## Handover

Al cerrar una sesión, deja claro:

- rama actual
- objetivo
- archivos tocados
- pruebas hechas
- riesgo pendiente, si existe
