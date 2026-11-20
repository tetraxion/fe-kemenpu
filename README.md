# Irrigation Frontend

Web interface of the *Kondisi Jaringan Irigasi* assignment (part E). It shows the network map, the downstream impact of each structure, the maintenance priority list, the canal length recap and the data-quality findings, all read from the backend API.

Stack: Next.js (App Router), React, TypeScript, Tailwind CSS, shadcn/ui (Base UI), TanStack Query, Leaflet.

## Run

From this folder, with the backend already running (`make up` in `../backend`):

```bash
make up                        # or: docker compose up --build -d
```

The interface is at `http://localhost:8080`. This is its own Compose project, `fe-irrigation`, with two containers: `frontend` (the Next.js server) and `gateway` (nginx). The gateway serves the interface and forwards `/api`, `/swagger` and `/scalar` to the backend project through the port that project publishes on the host (`BACKEND_URL`, default `http://host.docker.internal:8081`). The browser therefore always calls the API with a relative `/api` address.

Without the backend the pages still open, and `/api` answers `503` with a JSON error until it is started. `/api/health` is the exception: it answers `memuat`, since a backend that is still starting counts as loading.

For development:

```bash
make install
make dev                       # http://localhost:3000, /api is proxied to API_PROXY_TARGET
```

No environment variable is required. `.env.example` lists the three that exist.

## Commands

| Command | Does |
| --- | --- |
| `make up` | build the images and start the interface with its gateway |
| `make down` | stop and remove the containers |
| `make logs` | follow the frontend and gateway logs |
| `make install` | `npm ci` |
| `make dev` | development server |
| `make build` | production build (`.next/standalone`) |
| `make lint` | ESLint |
| `make typecheck` | TypeScript, no output |
| `make test` | unit tests (Vitest) |
| `make docker-build` | build the container images |

## Layout

```text
src/app/                   routes: / (map), /prioritas, /rekap-saluran, /kualitas-data
src/components/
  app-shell.tsx            sidebar, header, skip link
  import-gate.tsx          waits for GET /api/health to answer "siap"
  follow-up-import.tsx     dialog around POST /api/impor/susulan (data folder, or an uploaded .xlsx)
  map/                     the Leaflet map, its legend, and the map page
  asset/                   list and detail of a structure
  priority/ canal/ quality/   one folder per page
  states.tsx               loading, empty and error states shared by every view
  ui/                      shadcn/ui components, added with the shadcn CLI
src/lib/                   API client, types, labels, formatting, map styling
tests/                     unit tests (Vitest), mirroring the folders of src/
gateway/                   nginx image: one address for the interface and the API
```

## Design

The visual language follows the SIMRS SPKD dashboard: navy sidebar, teal actions, Inter, 8px radius, tables with a tinted head and alternating rows. Two colours differ from it on purpose, both for contrast: the action teal is `#00747c` instead of `#008d96` (white text reaches 5.5:1 instead of 4.0:1), and muted text is `#566a79` instead of `#647887`.

- **Colour is never the only signal.** Canal condition also changes the dash pattern, canal level the line width, structure type the symbol shape, and every badge carries its wording.
- **Light theme only.** The condition colours are tuned against a light base map.
- **Every data view has a loading, an empty and an error state.**
- **Keyboard.** Structure symbols on the map take focus and open with Enter or Space; the list next to the map reaches the same structures, including those without coordinates.
- **The map is driven through Leaflet directly**, without a React binding: the map is created and removed in one effect and each layer has its own, so a change of selection redraws only what changed.
- **No logo.** None was supplied, so the product name stands in as text.
- **Base map tiles come from OpenStreetMap** and need internet access. Without it the canals, structures, plots and legend still render on a plain background.
