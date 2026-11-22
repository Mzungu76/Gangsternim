# GAME_RULES — Regolamento di Gangster Nim

Regolamento completo, coerente con le regole effettivamente implementate in `src/game/` (motore indipendente da React).

## 1. Partecipanti e materiale

- Da **2 a 4 giocatori**, ognuno umano o BOT (Facile, Medio, Difficile), in qualsiasi combinazione (anche 4 BOT).
- Catalogo: **16 Boss** e **60 Scagnozzi** (6 per ciascuna delle 10 specializzazioni: Picchiatori, Scassinatori, Autisti, Tiratori, Informatori, Avvocati, Truffatori, Contrabbandieri, Ladri, Esattori). Elenco completo in [CARDS_CATALOG.md](CARDS_CATALOG.md).

## 2. Preparazione

- Si formano **4 gang** (configurabile da 2 a 6).
- Ogni gang è una fila: **Boss a sinistra**, poi da **4 a 6 Scagnozzi** (minimo e massimo configurabili tra 4 e 6; la dimensione di ogni gang è estratta a caso in quell'intervallo).
- In una partita i Boss sono tutti diversi e gli Scagnozzi sono tutti diversi. La distribuzione dipende dal *seed*: stesso seed = stesso tavolo.
- Tutte le carte sono scoperte: non esistono informazioni nascoste.
- Inizia il giocatore 1 (nella rivincita e nelle simulazioni il giocatore iniziale ruota).

## 3. Il Boss

Ogni Boss stabilisce, in modo **permanente** per tutta la partita:

- **minimo** e **massimo** di carte prelevabili per turno dalla sua gang;
- **malus** subito da chi lo conquista.

In questa versione i Boss non hanno altri poteri.

## 4. Il turno

I giocatori agiscono in senso orario (indice 1 → 2 → … → N → 1). Ogni turno il giocatore attivo:

1. sceglie una gang ancora attiva;
2. vede minimo e massimo di presa del Boss;
3. sceglie il numero di carte;
4. conferma la mossa;
5. riceve le carte e i relativi punteggi.

Regole di presa:

- le carte si prelevano **consecutivamente dall'estremità destra** della fila; non si possono saltare carte né scegliere carte isolate (la mossa è definita solo da *gang* e *quantità*);
- la quantità deve essere compresa tra minimo e massimo del Boss (e non superiore alle carte rimaste);
- se restano **meno carte del minimo**, il giocatore che sceglie quella gang **deve prenderle tutte**;
- il Boss **non può essere prelevato** direttamente.

Una mossa non valida viene rifiutata e non modifica in alcun modo la partita. È obbligatorio muovere: se esiste almeno una gang attiva esiste sempre almeno una mossa legale.

## 5. Conquista del Boss

Quando un giocatore preleva l'**ultimo Scagnozzo** di una fila:

- riceve automaticamente anche il **Boss**;
- subisce il suo **malus**, registrato separatamente dal punteggio degli Scagnozzi;
- la gang viene **eliminata**.

La partita termina quando **tutte le gang sono eliminate**.

## 6. Punteggio

Il punteggio è ricalcolato interamente dallo stato della partita a ogni presa, in modo deterministico: **nessun effetto viene mai contato due volte**.

```
Totale = Base + Bonus immediati + Bonus condizionati + Bonus combo − (Malus Boss − Riduzioni)
```

| Componente | Quando si applica |
|---|---|
| **Base** | Somma dei punti stampati sugli Scagnozzi posseduti. |
| **Bonus immediati** | Calcolati **al momento della presa** e registrati sulla carta conquistata; non cambiano più. Tipi: presa di almeno N carte (`captureSize`), ultimo Scagnozzo della fila (`lastHenchman`), prima presa sulla gang (`firstTake`). |
| **Bonus condizionati** | Ricalcolati dalla collezione corrente (e, per la maggioranza, dal confronto con gli avversari): altro Scagnozzo di una specializzazione (`withSpec`), per ogni carta di una specializzazione (`perSpecCard`), per specializzazione diversa (`perDistinctSpec`), assenza di una specializzazione (`withoutSpec`, anche negativo), per Boss posseduto (`perBoss`), nessun Boss (`noBoss`), maggioranza stretta (`majority`), dimensione della collezione (`collectionSize`), combo completata (`comboBooster`). |
| **Bonus permanenti** | Riduzione dei malus (`malusReduction`, Avvocati): ogni carta riduce il malus di **un** Boss diverso; abbinamento deterministico "riduzione più alta → malus più alto"; il malus non scende mai sotto zero (non diventa bonus). |
| **Bonus combo** | Ricalcolati a ogni cambiamento della collezione (vedi §7). |
| **Malus Boss** | Somma dei malus dei Boss conquistati. |

Note:

- "Un altro" / "altri" significa escludendo la carta stessa; "specializzazioni diverse" include la specializzazione della carta.
- La **maggioranza** richiede strettamente più carte di ogni singolo avversario (la parità non basta).
- I bonus condizionati usano la specializzazione **stampata**; i jolly cambiano specializzazione solo nel calcolo delle combo.

## 7. Combo

| Combo | Carte della stessa specializzazione | Punti complessivi |
|---|---|---|
| Coppia | 2 | +2 |
| Tris | 3 | +5 |
| Quartetto | 4 | +9 |

- Una combinazione superiore **sostituisce** quella inferiore (un Tris non vale anche come Coppia).
- Le carte si raggruppano partendo dalla combinazione più grande, e il valore si applica separatamente a ogni gruppo completo: 5 carte = Quartetto + 1 singola (9); 6 = Quartetto + Coppia (11); 7 = Quartetto + Tris (14); 8 = due Quartetti (18).
- Ogni carta appartiene al massimo a un gruppo.
- **Jolly** (Il Trasformista, Il Doppiogiochista): nelle combo contano come una specializzazione qualsiasi; il motore prova tutte le assegnazioni e sceglie quella che dà più punti (a parità, la prima nell'ordine delle specializzazioni).
- Le combo sono definite in `src/game/data/combos.ts`: aggiungere una combo non richiede modifiche al motore.
- La schermata del giocatore mostra le combo completate e quelle incomplete ("mancano N per …").

## 8. Fine partita, classifica e parità

- Classifica per punteggio totale decrescente.
- **Parità**: prevale chi ha il **malus netto più basso**; se la parità persiste, la posizione è condivisa e la vittoria è **ex aequo**.
- La schermata finale mostra, per ogni giocatore, punteggio base, bonus individuali (immediati e condizionati), bonus combo, malus Boss, riduzioni e totale, con riepilogo dettagliato. Il risultato viene salvato nello storico locale.

## 9. Scelte di progetto sulle ambiguità del testo originale

| Ambiguità | Soluzione adottata (semplice, documentata) |
|---|---|
| Restano meno carte del minimo | Obbligo di prenderle tutte (quindi conquistare il Boss) se si sceglie quella gang; si può però scegliere un'altra gang. |
| Più Avvocati e più Boss | Un Avvocato per Boss, abbinamento ordinato; nessuna riduzione oltre lo zero. |
| Gruppi di combo oltre il Quartetto | Raggruppamento dal più grande (greedy), ogni gruppo completo conta separatamente. |
| Parità finale | Spareggio sul malus netto, poi vittoria condivisa. |
| Giocatore iniziale | Giocatore 1; ruota nella rivincita e nelle simulazioni. |
| Numero di gang | Default 4, configurabile da 2 a 6 (limite dato dai 60 Scagnozzi: 6 × 6 = 36). |
