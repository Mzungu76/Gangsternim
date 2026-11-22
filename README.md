# GANGSTER NIM

Gioco strategico di carte per **2-4 giocatori**, umani o BOT, ambientato tra le famiglie criminali americane degli anni '20 e '30. Ispirato al Nim matematico: a turno si portano via gli Scagnozzi dalle file delle gang rivali, si costruiscono combinazioni e si cerca di non restare con il Boss (e il suo malus) in mano.

Progetto autonomo: nessun backend, nessun database, nessun codice o risorsa condivisa con altri progetti.

## Funzionalità

- **Catalogo**: 16 Boss e 60 Scagnozzi originali (10 specializzazioni × 6), 15 tipi di effetto tipizzati e validati, 3 combo configurabili. Dati separati dai componenti (`src/game/data/`).
- **Motore di gioco puro** (TypeScript, indipendente da React): regole di presa, turni, gang, Boss e malus, bonus immediati/condizionati/permanenti, combo con jolly, classifica con gestione delle parità. Le mosse sono validate prima di modificare lo stato; una mossa non valida non altera la partita.
- **BOT** Facile, Medio e Difficile (`src/game/bot/botEngine.ts`), liberamente combinabili con giocatori umani (anche 4 BOT). Il Difficile usa ricerca ad albero max-n, calcolo esatto del finale e un fattore Nim basato sullo XOR dei valori di Grundy. Motivazioni delle mosse generate dai fattori realmente valutati, disattivabili. Velocità Rapida/Normale/Lenta con pausa non bloccante.
- **Interfaccia** responsive (desktop, tablet, smartphone): tavolo con gang scorrevoli, carte 2:3 con cornice avorio e segnaposto grafico (campo `imageUrl` pronto per le illustrazioni), anteprima della presa, animazione leggera, area giocatori con carte conquistate, Boss, combo completate e incomplete, bonus attivi.
- **Schermate**: home, configurazione (con partita rapida 1 umano + 3 BOT), tavolo, fine partita con riepilogo dettagliato, catalogo con filtri e ricerca, regolamento, impostazioni, statistiche/storico, simulazione, modalità test.
- **Simulazione e bilanciamento**: partite tra soli BOT con seed riproducibile, statistiche su vittorie, punteggi, distribuzione, Boss, malus, bonus, combo, durata e frequenza delle carte; disponibile da interfaccia e da CLI (`npm run simulate` → `BALANCE_REPORT.md`).
- **Pannello di debug** nascondibile e **modalità test** con scenari predefiniti e import/export JSON dello stato.
- **Salvataggio** in LocalStorage: autosalvataggio e ripresa della partita, impostazioni, preferenze, storico (cancellabile). Dati versionati e validati: dati corrotti o di versioni diverse vengono scartati senza errori.
- **PWA**: manifest, icone, installabile su Android/iOS/desktop.

## Tecnologie

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Lucide React · Vitest · Playwright · OpenNext per Cloudflare Workers · font Limelight / Oswald / Special Elite (via Fontsource, nessuna richiesta esterna).

## Avvio locale

Requisiti: Node.js 22.

```bash
npm install
npm run dev            # http://localhost:3000
```

Altri comandi:

| Comando | Descrizione |
|---|---|
| `npm run build` / `npm start` | build e server di produzione Next.js |
| `npm test` | test unitari (Vitest) |
| `npm run test:e2e` | test end-to-end (Playwright, desktop + mobile; richiede `npm run build`) |
| `npm run lint` · `npm run typecheck` | ESLint e TypeScript |
| `npm run simulate` | simulazioni di bilanciamento (default 6 × 1.000 partite) → `BALANCE_REPORT.md` |
| `npm run catalog:md` | rigenera `CARDS_CATALOG.md` dai dati |
| `npm run preview` | build OpenNext + anteprima nel runtime Cloudflare (`workerd`) |
| `npm run deploy` | build OpenNext + deploy su Cloudflare Workers (richiede credenziali) |

Per i test E2E con Playwright installato altrove: `npx playwright install chromium`.

## Struttura

```
src/
  game/                 motore puro (nessuna dipendenza da React)
    types.ts            modelli TypeScript
    data/               catalogo Boss, Scagnozzi, specializzazioni, combo
    catalog.ts          accesso e validazione del catalogo
    effects.ts          sistema di effetti tipizzati (descrizione + valutazione)
    combos.ts           calcolo delle combinazioni
    scoring.ts          calcolo del punteggio
    gangs.ts · turns.ts gestione delle gang e dei turni
    engine.ts           creazione partita, validazione e applicazione delle mosse, classifica
    nim.ts              analisi Grundy/XOR
    bot/botEngine.ts    motore dei BOT
    simulation.ts       simulazione e statistiche
    report.ts           report di bilanciamento
    scenarios.ts        scenari della modalità test
  lib/                  salvataggio (storage.ts), store centralizzati, storico
  components/           componenti grafici (carte, tavolo, giocatori, fine partita, debug)
  app/                  pagine (App Router)
tests/unit              test Vitest
tests/e2e               test Playwright
scripts/                simulate.ts, catalog-md.ts
```

## Documentazione

- [GAME_RULES.md](GAME_RULES.md) — regolamento completo
- [CARDS_CATALOG.md](CARDS_CATALOG.md) — tutte le carte
- [BOT_STRATEGY.md](BOT_STRATEGY.md) — i tre livelli dei BOT
- [TEST_REPORT.md](TEST_REPORT.md) — risultati dei test
- [BALANCE_REPORT.md](BALANCE_REPORT.md) — simulazioni e possibili squilibri
- [CLOUDFLARE_DEPLOY.md](CLOUDFLARE_DEPLOY.md) — configurazione e pubblicazione

## Pubblicazione

Cloudflare Workers tramite OpenNext, Worker dedicato `gangster-nim`. Vedi [CLOUDFLARE_DEPLOY.md](CLOUDFLARE_DEPLOY.md).

## Immagini delle carte

La prima versione non contiene illustrazioni: ogni carta ha `imageUrl: null` e mostra un segnaposto (silhouette con fedora su fondo art déco). Per aggiungere un'illustrazione basta valorizzare `imageUrl` nel catalogo: l'immagine occupa l'area centrale senza modificare la struttura della carta.
