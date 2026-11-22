# CLOUDFLARE_DEPLOY — Pubblicazione su Cloudflare Workers

Gangster Nim è pubblicato come **Cloudflare Worker indipendente** chiamato `gangster-nim`, tramite l'adapter **OpenNext** (`@opennextjs/cloudflare`). Nessun Vercel, nessun database, nessun servizio a pagamento: tutte le pagine sono statiche e il gioco gira nel browser con LocalStorage.

## Versioni verificate

| Pacchetto | Versione | Note |
|---|---|---|
| `next` | 16.4.6 | App Router |
| `@opennextjs/cloudflare` | 1.20.18 | peer dependency `next >=16.4.5` → compatibile |
| `wrangler` | 4.166.x | peer dependency di OpenNext `^4.148.0` |
| Node.js | 22 | build e CI |

Verifiche effettuate in questo ambiente:

- `npx opennextjs-cloudflare build` → completato (`.open-next/worker.js` generato);
- `npx wrangler dev` → il Worker gira in locale nel runtime `workerd`; tutte le pagine rispondono 200, le pagine inesistenti 404;
- la suite Playwright completa (20 test, desktop + mobile) è stata eseguita **contro il Worker locale** (`PW_BASE_URL=http://127.0.0.1:8799 npm run test:e2e`) ed è passata.

Il deploy reale **non è stato eseguito**: in questo ambiente non sono disponibili credenziali Cloudflare (nessun `CLOUDFLARE_API_TOKEN`). Non esiste quindi ancora un URL pubblico verificato.

## File di configurazione

- `wrangler.jsonc` — nome Worker `gangster-nim`, `nodejs_compat`, asset statici da `.open-next/assets`, self-reference richiesto da OpenNext. Nessun binding R2/KV/D1.
- `open-next.config.ts` — configurazione OpenNext minima, **senza** cache incrementale R2 (non serve: tutte le route sono statiche).
- `next.config.ts` — abilita i binding Cloudflare solo in `next dev`.
- `.github/workflows/ci.yml` — lint, typecheck, test unitari, build, test E2E; poi deploy su `main` se i secret sono configurati.

Nessuna credenziale è presente nel repository.

## Opzione A — Deploy automatico con Cloudflare Workers Builds (consigliata)

1. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Import a repository**.
2. Collegare l'account GitHub e scegliere il repository di questo progetto.
3. Impostazioni di build:
   - **Project name**: `gangster-nim` (deve coincidere con `name` in `wrangler.jsonc`)
   - **Build command**: `npx opennextjs-cloudflare build`
   - **Deploy command**: `npx opennextjs-cloudflare deploy`
   - **Root directory**: `/`
   - Variabile d'ambiente (facoltativa): `NEXT_TELEMETRY_DISABLED=1`
4. Salvare: ogni push sul branch di produzione (es. `main`) genera build e deploy; le pull request ottengono versioni di anteprima.

## Opzione B — GitHub Actions

Il workflow `.github/workflows/ci.yml` contiene già il job `deploy`, eseguito solo su `main`:

1. Creare un API token Cloudflare (My Profile → API Tokens → modello **Edit Cloudflare Workers**).
2. In GitHub → Settings → Secrets and variables → Actions aggiungere:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
3. Fare merge su `main`. Senza secret il job registra «deploy saltato» invece di fallire.

Usare **una sola** delle due opzioni per evitare deploy doppi.

## Opzione C — Deploy manuale da terminale

```bash
npm ci
npx wrangler login          # oppure export CLOUDFLARE_API_TOKEN=...
npm run deploy              # = opennextjs-cloudflare build && opennextjs-cloudflare deploy
```

## Anteprima locale nel runtime Cloudflare

```bash
npm run preview             # build OpenNext + server locale workerd
# oppure, dopo la build:
npx wrangler dev --port 8799
PW_BASE_URL=http://127.0.0.1:8799 npm run test:e2e
```

## Verifica dopo il deploy

Il deploy non va considerato completato finché non è stato verificato:

1. Aprire `https://gangster-nim.<sottodominio>.workers.dev` e controllare home, catalogo e una partita completa.
2. Eseguire i test E2E sull'URL pubblicato: `PW_BASE_URL=https://gangster-nim.<sottodominio>.workers.dev npm run test:e2e`.
3. Controllare i log in Dashboard → Workers → gangster-nim → Logs (observability abilitata in `wrangler.jsonc`).

## Indipendenza

Il Worker, il repository e la configurazione sono dedicati esclusivamente a Gangster Nim: nessuna risorsa, binding, dominio o configurazione condivisa con altri progetti (in particolare con *Giù dalla Torre*).
