# AGENTS.md

Protocolo ligero para trabajar en los proyectos de VokabelLab con Claude/Codex.

## Principios

- Entiende el repo antes de tocar nada.
- Reutiliza antes de crear algo nuevo.
- Haz el cambio más pequeño que resuelva el problema.
- Si algo puede romper UX, datos o deploy, para y revisa.
- Deja el trabajo fácil de continuar por otra sesión.

## Flujo

1. Revisa el estado actual.
   Mira rama, diff abierto, PR activa y archivos relacionados.
2. Busca implementaciones existentes.
   Si ya hay un helper, patrón o módulo parecido, extiéndelo.
3. Trabaja en rama dedicada.
   Un objetivo por rama/PR. Evita mezclar arreglos no relacionados.
4. Mantén el diff corto.
   No refactorices por deporte. No cambies nombres, estructura o copy sin motivo.
5. Verifica lo importante.
   Comprueba solo lo que reduce riesgo real: sintaxis, flujo afectado, links, build o smoke test.
6. Cierra con handover claro.
   Resume qué cambiaste, qué probaste y qué queda pendiente.

## Reglas útiles

- Reutiliza antes de duplicar.
- No trabajes directamente en `main` para cambios medianos o grandes.
- Si el cambio toca 3 o más archivos, afecta lógica compartida, routing, SEO, estilos globales o deploy, usa rama dedicada y PR.
- No abras una PR nueva si una existente ya cubre ese objetivo.
- Si el cambio se sale del alcance, anótalo pero no lo mezcles.
- Si encuentras conflicto entre velocidad y seguridad, prioriza seguridad con el menor overhead posible.

## Handover

Cuando pares una sesión, deja siempre:

- rama actual
- objetivo del cambio
- archivos tocados
- pruebas hechas
- riesgo pendiente, si existe
