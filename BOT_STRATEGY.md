# BOT_STRATEGY — Gli avversari artificiali di Gangster Nim

Il motore decisionale è il modulo indipendente [`src/game/bot/botEngine.ts`](src/game/bot/botEngine.ts).

## Contratto del motore

```ts
decideMove(state: GameState, playerId: string, difficulty: 'easy' | 'medium' | 'hard', options?: { seed?: number; searchDepth?: number }): BotDecision
```

**Riceve** lo stato corrente della partita (giocatore attivo, carte possedute da tutti, gang disponibili e relativi Boss con le regole di presa, da cui il motore ricava punteggi e combo) e il livello di difficoltà.

**Restituisce** `{ move: { gangId, count } | null, reason, factors, evaluated, ranking }`:

- `move`: gang selezionata e numero di carte; `null` solo se non esistono mosse (partita finita o non è il turno di quel BOT), con `reason` che lo segnala;
- `reason`: motivazione **costruita dai fattori realmente calcolati** per la mossa scelta (non scritta dopo la mossa);
- `ranking`: valore assegnato a ogni mossa candidata (visibile nel pannello di debug).

**Garanzie** (verificate dai test in `tests/unit/bot.test.ts`):

- usa `listLegalMoves`, `applyMove` e `validateMove`, cioè **le stesse funzioni di validazione dei giocatori umani**; la mossa scelta viene ricontrollata con `validateMove` prima di essere restituita;
- **non modifica lo stato**: tutte le simulazioni avvengono su copie prodotte dal motore puro (test con stato congelato in profondità);
- **non accede a informazioni nascoste**: nel gioco tutte le carte sono scoperte e il BOT legge solo lo stato pubblico (test: decisione identica su una copia serializzata dello stato);
- **riproducibile**: la componente casuale usa un generatore con seed derivato da seed della partita, turno e giocatore (o `options.seed`);
- produce sempre una mossa valida quando esiste.

Nell'interfaccia il BOT gioca dopo una pausa visiva configurabile (**Rapida 0,5 s, Normale 1,5 s, Lenta 3 s**) gestita con un timer: la pagina resta reattiva e mostra «*Nome* sta decidendo...». La motivazione si può mostrare o nascondere (pulsante nella barra superiore o Impostazioni).

## Fattori analizzati per ogni mossa

Per ciascuna mossa legale il motore simula la presa e calcola:

| Fattore | Significato |
|---|---|
| `gain` | variazione del punteggio totale del BOT (base, bonus, combo, malus e riduzioni inclusi) |
| `simpleGain` | variazione considerando solo punti base, bonus immediati e malus |
| `capturesBoss`, `bossMalus` | se la mossa fa conquistare il Boss e con quale malus |
| `combosCompleted` | combo nuove completate (es. «un Tris di Scassinatori») |
| `nextPlayerBestGain` | miglior guadagno immediato che la mossa lascia al giocatore successivo |
| `blockedCombos` | combo che un avversario avrebbe potuto completare con le carte sottratte |
| `nimXorAfter` | XOR del gioco delle "prese sicure" dopo la mossa (solo Difficile) |

## BOT Facile — il principiante

- Valuta soprattutto il **punteggio immediato**: `simpleGain + 0,5 × (gain − simpleGain)` (i bonus complessi contano a metà).
- Cerca le carte di valore alto e considera i bonus semplici.
- **Evita i Boss molto penalizzanti** (malus ≥ 5), ma sottovaluta quelli leggeri: un errore tipico da principiante.
- **Componente casuale controllata**: nel 15% dei turni sceglie una mossa a caso («Ho seguito l'istinto…»); negli altri usa una scelta *softmax* (temperatura 1,5) che preferisce le mosse migliori ma può sbagliare.

## BOT Medio — il giocatore competitivo

Valore di una mossa:

```
gain
+ 0,5 per ogni specializzazione a una carta dal completamento della combo successiva
− 0,6 × nextPlayerBestGain          (valore lasciato sul tavolo al prossimo)
+ 0,8 × combo sottratte agli avversari
+ 0,3 se lascia una gang con meno carte del minimo (gang "avvelenata")
```

Considera quindi le combo possedute e da completare, le carte utili agli avversari, il rischio Boss (già incluso in `gain`), le dimensioni delle gang e il valore delle carte lasciate. Sceglie la mossa migliore (rumore minimo solo per spareggiare).

## BOT Difficile — ricerca ad albero

Il Difficile non massimizza i punti immediati ma il **vantaggio relativo e la probabilità di vittoria**:

1. **Analisi di tutte le mosse legali** del turno.
2. **Ricerca max-n a profondità configurabile** (`searchDepth`, 1-4; di default 2 con 2 giocatori, N−1 con N giocatori, +1 quando restano ≤ 8 carte): dopo ogni mossa candidata simula le **risposte degli avversari** (ciascuno modellato come un giocatore che massimizza il proprio vantaggio immediato) e, nei propri turni successivi, esplora le 6 mosse più promettenti (*beam*).
3. **Valutazione delle foglie**:
   - vantaggio relativo: `mio punteggio − (0,65 × miglior avversario + 0,35 × media avversari)`, includendo il potenziale delle combo a una carta dal completamento;
   - **tempo**: il giocatore di turno alla foglia incasserà circa il suo miglior guadagno immediato (peso 0,7);
   - **fattore Nim** (vedi sotto).
4. **Finale esatto**: quando restano ≤ 10 Scagnozzi sul tavolo calcola il finale fino all'ultima carta con una ricerca max-n completa (ogni giocatore massimizza la propria utilità: vittoria, poi margine), entro un budget di 30.000 nodi; se il budget non basta torna alla ricerca euristica. Le partite finite valgono +1000 (vittoria), +400 (pareggio), −1000 (sconfitta) più il margine: conta **vincere**, non il punteggio assoluto.

I pesi sono raccolti in `HARD_TUNING` per esperimenti di bilanciamento.

### Il fattore Nim (strategia XOR)

Chiamiamo **presa sicura** una presa che non svuota la gang (quindi non fa conquistare il Boss). Su una gang con `n` Scagnozzi e limiti `[min, max]` le prese sicure sono i `k` con `min ≤ k ≤ max` e `k < n`. Chi resta senza prese sicure su tutte le gang è costretto a conquistare un Boss.

Questo è un gioco di sottrazione in forma normale: ogni gang ha un valore di Grundy `g(n) = mex{ g(n−k) }` e il tavolo si valuta con lo **XOR** dei valori (`src/game/nim.ts`). Con XOR = 0, in una partita a due, il giocatore di turno non può evitare — contro un avversario perfetto — di essere il primo costretto a prendere un Boss. Il BOT Difficile aggiunge alla valutazione un termine proporzionale al malus medio dei Boss rimasti (peso pieno a 2 giocatori, ridotto con 3-4) e, quando lascia l'avversario in posizione XOR = 0, lo dichiara nella motivazione.

**Il BOT non è matematicamente perfetto.** Il modello Nim ignora i punti delle carte, i bonus e la possibilità di prendere volontariamente un Boss conveniente; con più di due giocatori la teoria dello XOR non garantisce nulla; la ricerca è limitata in profondità e modella gli avversari in modo semplificato. Il fattore Nim è quindi uno dei criteri di valutazione, non una strategia assoluta.

## Motivazioni

La motivazione è composta solo a partire dai fattori della mossa scelta e delle alternative effettivamente valutate, ad esempio:

- «Ho preso 2 carte dalla gang di Il Sarto (+6 punti). Ho scelto questa gang per completare una Coppia di Scassinatori.»
- «Ho evitato Il Pazzo perché il suo malus (-7) è troppo elevato.»
- «Ho sottratto queste carte per impedire a Mamma Rosa di completare un Tris di Ladri.»
- «Non avevo alternative: ogni mossa disponibile mi faceva conquistare un Boss, ho scelto Il Cuoco (malus -2).»
- «Lascio il tavolo in posizione Nim sfavorevole (XOR delle prese sicure = 0) per chi gioca dopo.»
- «Ho calcolato il finale fino all'ultima carta…» / «Ho analizzato 9 mosse con una ricerca a 2 livelli.»

## Prestazioni misurate

Risultati delle simulazioni (≥ 1.000 partite per confronto) in [BALANCE_REPORT.md](BALANCE_REPORT.md). In sintesi: il Difficile batte nettamente il Facile (72,9% a due giocatori). Contro il Medio vince di poco a due giocatori (53,8%), mentre con 3-4 giocatori **non è superiore al Medio** (nel tavolo Facile/Medio/Difficile il Medio vince il 46,6% contro il 35,4%): il Medio sfrutta meglio gli errori del giocatore precedente, e la distribuzione iniziale delle carte pesa molto. È un limite noto di questa versione.

Tempi di decisione tipici del Difficile: pochi millisecondi a metà partita, fino a qualche centinaio di millisecondi nei finali calcolati esattamente.
