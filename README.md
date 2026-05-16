# der-die-das

Preparado para despliegue en Hostinger App Node.

## Arranque

Despliega desde la raiz del repositorio con:

```bash
npm install
npm run build
npm start
```

`npm run build` existe solo para compatibilidad con plataformas que esperan fase de compilacion.

## Rutas clave

- `/`
- `/api/health`
- `/api/leaderboard/:mode`

## Coliseo

Modos soportados:

- `survival`
- `timed-60`
- `timed-180`

Persistencia actual:

- `data/competition-leaderboards.json` guarda el Top 10 por clave `modo-pool`, por ejemplo `survival-a1` o `timed-60-all`.
- Es una solucion simple para arrancar rapido sin auth ni base de datos.
- En Render u otros hosts con filesystem efimero, este archivo puede no persistir entre deploys o reinicios.
- En produccion conviene sustituir esta persistencia local por Supabase o un store duradero equivalente.

## Reutilizacion

Archivos reutilizables:

- `src/core/competition/competitionModes.js`: catalogo de modos validos y metadatos neutrales.
- `src/core/competition/competitionPools.js`: catalogo de pools validos por nivel y pool global `all`.
- `src/core/competition/scoreRules.js`: reglas de duracion, fin de partida y calculo de puntuacion.
- `src/core/competition/leaderboardService.js`: validacion, ordenacion Top 10 y persistencia desacoplada de la UI.

Archivos especificos de esta app:

- `index.html`: navegacion, vista `?view=coliseo`, CTAs por nivel, HUD, share y render del Top 10.
- `server.js`: cableado Express y uso del almacenamiento local JSON.

Para moverlo luego a un repo/core comun:

- Mantener `src/core/competition/*` tal cual o con un wrapper ESM/CJS comun.
- Sustituir en `server.js` la persistencia por un adapter de Supabase manteniendo la misma interfaz de `leaderboardService`.
- Reemplazar en `index.html` solo la capa UI y la forma de obtener preguntas, sin tocar reglas de modos ni validacion del ranking.

## Estructura actual

- `server.js`: entrypoint Node
- `package.json`: scripts de deploy
- `index.html`: frontend servido en produccion
