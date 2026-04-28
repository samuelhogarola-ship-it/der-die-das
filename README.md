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

## Estructura actual

- `server.js`: entrypoint Node
- `package.json`: scripts de deploy
- `index.html`: frontend servido en produccion
