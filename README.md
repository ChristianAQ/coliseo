# Coliseo — Frontend

Prototipo frontend de **Coliseo**, la app para crear torneos en pocos pasos.
Construido con **React + TypeScript + Vite + TailwindCSS**. Funciona 100% en
el navegador con datos en memoria (sin backend todavía).

## Estado actual

Los 4 formatos están implementados de principio a fin:

- ✅ **Eliminación simple**: cuadro con seeding, BYEs automáticos, orden manual
  o aleatorio, partido opcional por el 3er puesto.
- ✅ **Eliminación doble**: cuadro de ganadores + cuadro de perdedores + Gran
  Final con partido decisivo ("bracket reset") si quien viene del cuadro de
  perdedores gana el primer partido. El 3er puesto sale solo (quien pierde la
  final del cuadro de perdedores), sin partido aparte.
- ✅ **Todos contra todos (Round Robin)**: calendario generado por el método
  del círculo, clasificación en vivo (puntos, empates, diferencia).
- ✅ **Liga**: fase de todos contra todos + clasificación, y un botón para
  generar la fase eliminatoria con los N mejores en cuanto termina la liga.

### Reglas de participantes

- **Eliminación simple / doble**: el número de participantes está limitado a
  **2, 4, 8, 16 o 32**, porque el cuadro necesita un número exacto de plazas.
- **Todos contra todos / Liga**: número libre (3 a 24), pensado para grupos
  con un número indeterminado de jugadores.
- **Liga**: además se elige cuántos clasifican a playoffs (2, 4, 8 o 16, según
  el número de participantes). Por defecto se proponen los 4 mejores.

### Bug corregido: partido por el 3er puesto

Antes, si una semifinal se decidía por BYE (muy típico con 3-4 participantes,
donde alguien pasa de ronda sin jugar), ese "hueco" nunca llegaba al partido
por el 3er puesto y el partido se quedaba con una plaza vacía para siempre
("Por determinar" permanente). Ahora el BYE se propaga correctamente: si el
otro semifinalista sí jugó y perdió, gana el 3er puesto automáticamente por
ausencia de rival, igual que ocurre en cualquier cuadro real.

## Cómo ejecutarlo

```bash
npm install
npm run dev -- --host   # --host para poder abrirlo desde el móvil en tu red
```

## Estructura

```
src/
  types.ts                    Tipos de dominio
  lib/
    bracket.ts                 Motor de eliminación simple y doble
    roundRobin.ts               Motor de liga / todos contra todos
    tournament.ts                Orquestación: completado, campeón, playoffs
    genericBracketLayout.ts      Layout genérico para el cuadro de perdedores
  components/
    Wizard/                    Los 4 pasos del asistente
    Bracket/                   BracketView, DoubleEliminationView, MatchCard
    Tournament/                 TournamentPage, StandingsTable, GroupFixtures
```

## Publicar en GitHub Pages

Ya viene preparado:

1. Sube el proyecto a un repo de GitHub (por ejemplo `coliseo`).
2. Si el nombre del repo **no** es `coliseo`, edita `vite.config.ts` y cambia
   `base: '/coliseo/'` por `'/<tu-repo>/'`. Si vas a publicar en la raíz de
   `<usuario>.github.io` o con dominio propio, pon `base: '/'`.
3. En GitHub: **Settings → Pages → Source → GitHub Actions**.
4. Haz push a `master`. El workflow `.github/workflows/deploy.yml` compila y
   publica automáticamente en cada push.
5. Al cabo de un minuto tendrás la app en `https://<usuario>.github.io/coliseo/`.

## Próximos pasos sugeridos

1. Backend Spring Boot + PostgreSQL: entidades Tournament/Participant/Match,
   endpoints REST, persistencia real (ahora mismo todo vive en memoria y se
   pierde al recargar la página).
2. Suizo real, si sigue interesando además de la Liga.
3. Autenticación de usuarios, torneos públicos y exportación de resultados.
