# TEST_REPORT — Gangster Nim

Risultati effettivi dell'ultima esecuzione completa (2026-11-22, Node v22.23.5, Linux). Nessun risultato è stimato: ogni riga qui sotto proviene dall'output dei comandi indicati.

| Controllo | Comando | Risultato |
|---|---|---|
| ESLint | `npm run lint` | 0 errori, 0 avvisi |
| TypeScript | `npm run typecheck` | 0 errori |
| Test unitari (Vitest 5.1) | `npm test` | **57/57 superati** (8 file) |
| Build Next.js | `npm run build` | completata, 11 route statiche |
| Test E2E (Playwright 1.63) su `next start` | `npm run test:e2e` | **20/20 superati** (10 scenari × desktop 1366×900 e mobile Pixel 7) |
| Build OpenNext per Cloudflare | `npx opennextjs-cloudflare build` | completata (`.open-next/worker.js`) |
| Test E2E sul Worker locale (`wrangler dev`, runtime workerd) | `PW_BASE_URL=http://127.0.0.1:8799 npm run test:e2e` | **20/20 superati** |
| Simulazioni | `npm run simulate` | 6 × 1.000 partite completate, nessuna mossa non valida né blocco (vedi BALANCE_REPORT.md) |
| Deploy Cloudflare | — | **non eseguito**: credenziali non disponibili in questo ambiente |

## Copertura rispetto ai requisiti

| Area | Dove |
|---|---|
| Regole: minimo e massimo di presa, prese non valide, nessun salto, prelievo consecutivo da destra, carte residue sotto il minimo, Boss non prelevabile, mossa non valida che non altera lo stato | `tests/unit/rules.test.ts` |
| Boss: assegnazione, malus registrato a parte, eliminazione della gang, Boss con limiti diversi, fine partita | `tests/unit/bosses.test.ts` |
| Punteggi: base, bonus individuali e condizionati, maggioranza, bonus immediati registrati alla presa, malus e riduzione (mai in bonus, un Avvocato per Boss), assenza di doppi conteggi | `tests/unit/scoring.test.ts` |
| Combo: coppia, tris, quartetto, cinque carte, gruppi multipli, più specializzazioni, jolly, aggiornamento dopo ogni presa | `tests/unit/combos.test.ts` |
| BOT: mosse sempre valide, partite completate (2-4 giocatori, tutte le difficoltà), stato non modificato (congelato), assenza di mosse segnalata, riproducibilità con seed, solo informazioni pubbliche, evita Boss penalizzanti, completa combo e lo spiega, comportamento diverso tra difficoltà, Difficile migliore del Facile su 200 partite, valori di Grundy | `tests/unit/bot.test.ts` |
| Partita: distribuzione senza duplicati, validazione configurazione, turni in senso orario, umani + BOT e soli BOT fino alla classifica, parità (spareggio e ex aequo), salvataggio e ripristino, dati corrotti scartati, storico | `tests/unit/game.test.ts` |
| Catalogo: ≥15 Boss e ≥60 Scagnozzi, validazione dati, distribuzione equilibrata, Boss di esempio, descrizioni generate, ogni tipo di effetto usato | `tests/unit/catalog.test.ts` |
| Scenari della modalità test validi e giocabili | `tests/unit/scenarios.test.ts` |
| Interfaccia: avvio, configurazione, selezione gang, prelievo, aggiornamento punteggi, turni BOT (in Web Worker) con messaggio di attesa e motivazione, fine partita e storico, partita di soli BOT, salvataggio e ripresa dopo ricarica, catalogo (filtro, ricerca, Boss, combo), responsive (nessuno scroll orizzontale di pagina, carte 2:3 ≥ 90 px), simulazione, regolamento e impostazioni persistenti; nessun errore in console | `tests/e2e/app.spec.ts` |

## Test unitari (output verboso)

```
✓ tests/unit/bosses.test.ts > conquista dei Boss > chi prende l'ultimo Scagnozzo riceve il Boss, subisce il malus e la gang viene eliminata
✓ tests/unit/bosses.test.ts > conquista dei Boss > gestisce Boss differenti con limiti differenti
✓ tests/unit/bosses.test.ts > conquista dei Boss > il malus è registrato separatamente dal punteggio degli Scagnozzi
✓ tests/unit/bosses.test.ts > conquista dei Boss > la partita termina quando tutte le gang sono eliminate
✓ tests/unit/bot.test.ts > BOT > analisi Nim: valori di Grundy del gioco delle prese sicure
✓ tests/unit/bot.test.ts > BOT > completa una combo quando conviene e lo spiega
✓ tests/unit/bot.test.ts > BOT > comportamenti diversi tra difficoltà
✓ tests/unit/bot.test.ts > BOT > evita un Boss molto penalizzante quando ha alternative (medio e difficile)
✓ tests/unit/bot.test.ts > BOT > il BOT difficile ottiene risultati migliori del facile su un campione ampio
✓ tests/unit/bot.test.ts > BOT > non modifica lo stato della partita (stato congelato)
✓ tests/unit/bot.test.ts > BOT > produce sempre mosse valide e completa le partite (tutte le difficoltà, 2-4 giocatori)
✓ tests/unit/bot.test.ts > BOT > segnala correttamente l'assenza di mosse (partita finita o turno altrui)
✓ tests/unit/bot.test.ts > BOT > usa solo informazioni pubbliche: decisione identica su una copia ricostruita dello stato visibile
✓ tests/unit/bot.test.ts > BOT > è riproducibile con lo stesso seed
✓ tests/unit/catalog.test.ts > catalogo > contiene i Boss di esempio con i valori richiesti
✓ tests/unit/catalog.test.ts > catalogo > distribuisce gli Scagnozzi in modo equilibrato tra le 10 specializzazioni
✓ tests/unit/catalog.test.ts > catalogo > genera una descrizione per ogni effetto e tutte le immagini sono null (placeholder)
✓ tests/unit/catalog.test.ts > catalogo > ha almeno 15 Boss e 60 Scagnozzi
✓ tests/unit/catalog.test.ts > catalogo > ogni tipo di effetto dichiarato è usato almeno da una carta
✓ tests/unit/catalog.test.ts > catalogo > rileva errori nei dati
✓ tests/unit/catalog.test.ts > catalogo > è valido: ID univoci, campi completi, effetti validi
✓ tests/unit/combos.test.ts > combo > aggiorna le combinazioni dopo ogni presa
✓ tests/unit/combos.test.ts > combo > cinque carte = un quartetto e una carta singola
✓ tests/unit/combos.test.ts > combo > combina più specializzazioni senza doppi conteggi
✓ tests/unit/combos.test.ts > combo > coppia, tris, quartetto
✓ tests/unit/combos.test.ts > combo > gruppi multipli: ogni gruppo completo vale separatamente
✓ tests/unit/combos.test.ts > combo > il jolly viene assegnato alla specializzazione più vantaggiosa
✓ tests/unit/game.test.ts > partita > distribuisce Boss e Scagnozzi senza duplicati, 4-6 per gang
✓ tests/unit/game.test.ts > partita > gestione delle parità: spareggio sul malus, poi vittoria ex aequo
✓ tests/unit/game.test.ts > partita > partite con umani e BOT, e partite con soli BOT, fino alla fine con classifica
✓ tests/unit/game.test.ts > partita > passaggio del turno in senso orario
✓ tests/unit/game.test.ts > partita > salvataggio e ripristino
✓ tests/unit/game.test.ts > partita > scarta dati corrotti o di versione diversa senza errori
✓ tests/unit/game.test.ts > partita > storico: aggiunta e cancellazione
✓ tests/unit/game.test.ts > partita > valida la configurazione
✓ tests/unit/rules.test.ts > regole di presa > con meno carte del minimo bisogna prenderle tutte
✓ tests/unit/rules.test.ts > regole di presa > il Boss non può essere prelevato normalmente
✓ tests/unit/rules.test.ts > regole di presa > non si gioca su gang eliminate né fuori turno
✓ tests/unit/rules.test.ts > regole di presa > preleva consecutivamente dalla destra, senza saltare carte
✓ tests/unit/rules.test.ts > regole di presa > rifiuta prese sotto il minimo e sopra il massimo
✓ tests/unit/rules.test.ts > regole di presa > rispetta minimo e massimo del Boss
✓ tests/unit/rules.test.ts > regole di presa > una mossa non valida non altera lo stato
✓ tests/unit/scenarios.test.ts > scenari della modalità test > Boss obbligato: ogni mossa conquista un Boss e il BOT lo spiega
✓ tests/unit/scenarios.test.ts > scenari della modalità test > Boss obbligato: stato valido e giocabile
✓ tests/unit/scenarios.test.ts > scenari della modalità test > Combo a un passo: stato valido e giocabile
✓ tests/unit/scenarios.test.ts > scenari della modalità test > Finale alla Nim: stato valido e giocabile
✓ tests/unit/scenarios.test.ts > scenari della modalità test > L'Avvocato salva-malus: stato valido e giocabile
✓ tests/unit/scenarios.test.ts > scenari della modalità test > Tavolo di soli BOT: stato valido e giocabile
✓ tests/unit/scoring.test.ts > punteggio > Informatore: +2 per specializzazione diversa, massimo +6
✓ tests/unit/scoring.test.ts > punteggio > bonus condizionato (+2 se possiedi un altro Scassinatore) e coppia
✓ tests/unit/scoring.test.ts > punteggio > bonus immediati registrati alla presa
✓ tests/unit/scoring.test.ts > punteggio > bonus individuali di vario tipo
✓ tests/unit/scoring.test.ts > punteggio > jolly e potenziatore di combo
✓ tests/unit/scoring.test.ts > punteggio > maggioranza: solo se strettamente superiore a ogni avversario
✓ tests/unit/scoring.test.ts > punteggio > malus e riduzione dei malus (mai trasformata in bonus)
✓ tests/unit/scoring.test.ts > punteggio > nessun doppio conteggio: il calcolo è deterministico e idempotente
✓ tests/unit/scoring.test.ts > punteggio > punti base
```

## Test end-to-end (next start)

```
✓   1 [desktop] › tests/e2e/app.spec.ts:3:5 › avvio: schermata iniziale con logo e menu (465ms)
✓   2 [desktop] › tests/e2e/app.spec.ts:14:5 › configurazione, selezione gang, presa, punteggi e cambio turno (1.3s)
✓   3 [desktop] › tests/e2e/app.spec.ts:37:5 › partita completa fino alla schermata finale, salvata nello storico (3.1s)
✓   4 [desktop] › tests/e2e/app.spec.ts:54:5 › turni dei BOT: messaggio di attesa, motivazione e ritorno al giocatore umano (3.7s)
✓   6 [desktop] › tests/e2e/app.spec.ts:80:5 › salvataggio automatico e ripresa della partita (1.4s)
✓   7 [desktop] › tests/e2e/app.spec.ts:94:5 › catalogo: Boss, Scagnozzi, filtro, ricerca e combo (665ms)
✓   8 [desktop] › tests/e2e/app.spec.ts:111:5 › responsive: tavolo senza scroll orizzontale di pagina e carte in proporzione 2:3 (404ms)
✓   5 [desktop] › tests/e2e/app.spec.ts:72:5 › partita di soli BOT dalla modalità test fino alla fine (5.8s)
✓   9 [desktop] › tests/e2e/app.spec.ts:123:5 › simulazione: esecuzione di un piccolo lotto di partite (2.1s)
✓  10 [desktop] › tests/e2e/app.spec.ts:132:5 › regolamento e impostazioni (506ms)
✓  11 [mobile] › tests/e2e/app.spec.ts:3:5 › avvio: schermata iniziale con logo e menu (346ms)
✓  12 [mobile] › tests/e2e/app.spec.ts:14:5 › configurazione, selezione gang, presa, punteggi e cambio turno (1.8s)
✓  13 [mobile] › tests/e2e/app.spec.ts:37:5 › partita completa fino alla schermata finale, salvata nello storico (3.1s)
✓  14 [mobile] › tests/e2e/app.spec.ts:54:5 › turni dei BOT: messaggio di attesa, motivazione e ritorno al giocatore umano (3.5s)
✓  16 [mobile] › tests/e2e/app.spec.ts:80:5 › salvataggio automatico e ripresa della partita (1.8s)
✓  17 [mobile] › tests/e2e/app.spec.ts:94:5 › catalogo: Boss, Scagnozzi, filtro, ricerca e combo (625ms)
✓  18 [mobile] › tests/e2e/app.spec.ts:111:5 › responsive: tavolo senza scroll orizzontale di pagina e carte in proporzione 2:3 (387ms)
✓  15 [mobile] › tests/e2e/app.spec.ts:72:5 › partita di soli BOT dalla modalità test fino alla fine (5.9s)
✓  20 [mobile] › tests/e2e/app.spec.ts:132:5 › regolamento e impostazioni (573ms)
✓  19 [mobile] › tests/e2e/app.spec.ts:123:5 › simulazione: esecuzione di un piccolo lotto di partite (2.1s)
20 passed (22.3s)
```

## Prestazioni misurate

- BOT Difficile, 1.127 decisioni su tavoli 6 gang × 6 carte (caso peggiore): media 50 ms, massimo 1,47 s (finali calcolati esattamente). Le decisioni vengono eseguite in un Web Worker: l'interfaccia non si blocca.
- Simulazione: circa 7 ms a partita tra BOT Medi, circa 130 ms a partita quando è presente il BOT Difficile.

## Problemi noti

- Il BOT Difficile non è superiore al Medio con 3-4 giocatori (dettagli in BALANCE_REPORT.md).
- Deploy su Cloudflare non verificato (mancano le credenziali): verificato solo il Worker in locale con workerd.
- Test manuali su dispositivi iOS/Android reali non eseguiti: il responsive è verificato con l'emulazione Playwright (Pixel 7) e con screenshot a 390 px di larghezza.
