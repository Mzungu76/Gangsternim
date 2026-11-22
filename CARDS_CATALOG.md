# CARDS_CATALOG — Gangster Nim

Generato da `npm run catalog:md` a partire da `src/game/data/`. Totale: **16 Boss** e **60 Scagnozzi** (6 per ciascuna delle 10 specializzazioni). Le condizioni e gli effetti sono generati dagli stessi dati tipizzati interpretati dal motore.

Tutte le carte hanno `imageUrl: null`: l'interfaccia mostra un segnaposto grafico finché non verranno aggiunte le illustrazioni.

## Boss

| ID | Nome | Soprannome | Presa | Malus | Colore | Descrizione |
|---|---|---|---|---|---|---|
| `boss-padrino` | Il Padrino | Don Calogero | 1–4 | -5 | `#5a1a1a` | Non alza mai la voce: gli basta alzare un sopracciglio. Chi gli porta via l'ultimo uomo riceve un'offerta che non può rifiutare. |
| `boss-macellaio` | Il Macellaio | Mannaia Mancuso | 2–3 | -3 | `#7d2020` | Taglia i conti, le bistecche e ogni tanto qualche socio. Le sue prese sono sempre a pezzi regolari. |
| `boss-contabile` | Il Contabile | Ragionier Due-per-Due | esattamente 2 | -4 | `#2f4a3a` | Tutto deve tornare, sempre in coppia. Ha tre registri: quello vero, quello falso e quello per la nonna. |
| `boss-pazzo` | Il Pazzo | Johnny Dinamite | 1–5 | -7 | `#8c3b0e` | Ride quando dovrebbe piangere e spara quando dovrebbe ridere. Conquistarlo è una pessima idea. |
| `boss-professore` | Il Professore | Dottor Quadrato | 1–2 | -2 | `#24476b` | Ha una laurea in filosofia e una in grimaldelli. Procede con calma: una o due mosse alla volta. |
| `boss-colonnello` | Il Colonnello | Sergente Medaglia | 2–4 | -5 | `#3d5a1e` | Non ha mai fatto il militare, ma le medaglie le ha comprate tutte. Esige prese da almeno due uomini. |
| `boss-fantasma` | Il Fantasma | Nessuno Lo Ha Visto | 1–3 | -4 | `#3b3f4a` | Nessuno sa che faccia abbia. Neanche lui, perché ha rotto tutti gli specchi. |
| `boss-vedova` | La Vedova Nera | Donna Assunta | 1–3 | -6 | `#2a1a2e` | Si è sposata cinque volte e indossa il lutto da quattro. Il tè lo offre, ma non bevetelo. |
| `boss-barone` | Il Barone | Sua Eccellenza Spaccatutto | 2–5 | -6 | `#6b4a2b` | Un titolo nobiliare comprato al mercato del pesce. Pretende prese generose, da gran signore. |
| `boss-sarto` | Il Sarto | Forbici Fiorentino | 1–2 | -3 | `#4a1528` | Cuce abiti su misura e cappotti di legno. Lavora di precisione: poche carte alla volta. |
| `boss-cardinale` | Il Cardinale | Monsignor Mazzetta | 3–4 | -6 | `#7a1f3d` | Benedice gli affari e confessa i concorrenti. Con lui si tratta solo all'ingrosso. |
| `boss-pugile` | Il Pugile | Kid Mandibola | 1–3 | -3 | `#8b1e1e` | Ex campione dei pesi massimi, ora pesa massimo anche sul quartiere. Ha perso tutti i denti, non la grinta. |
| `boss-duchessa` | La Duchessa | Lady Perla | 2–3 | -5 | `#1f5f5b` | Gestisce il locale più elegante della città e la bisca più sporca del porto. Stessa porta, due serrature. |
| `boss-mago` | Il Mago | Zio Abracadabra | 1–4 | -4 | `#3a2a5c` | Fa sparire carte, soldi e testimoni. Nessuno ha mai capito dove finiscano i conigli. |
| `boss-notaio` | Il Notaio | Timbro Tremendo | esattamente 3 | -5 | `#2c3e50` | Tre firme, tre timbri, tre copie. Esattamente tre: né una di più, né una di meno. |
| `boss-cuoco` | Il Cuoco | Polpetta Esposito | 1–3 | -2 | `#8a6d1d` | La sua trattoria serve la migliore carbonara della città. Il retrobottega serve tutto il resto. |

## Scagnozzi

### Picchiatori

| ID | Nome | Soprannome | Punti | Bonus | Tipo | Condizione | Effetto |
|---|---|---|---|---|---|---|---|
| `h-picchiatore` | Il Picchiatore | — | 3 | — | Nessun bonus | Nessuna | Solo punteggio base. |
| `h-bruno-martello` | Bruno | Il Martello | 2 | +2 | Bonus condizionato | Possiedi almeno un altro Picchiatore. | +2 punti se possiedi almeno un altro Picchiatore. |
| `h-gigi-nocche` | Gigi | Nocche d'Acciaio | 1 | fino a +4 | Bonus condizionato | Possiedi altri Picchiatori. | +1 per ogni altro Picchiatore posseduto, massimo +4. |
| `h-tano-bisonte` | Tano | Il Bisonte | 2 | +2 | Bonus immediato | Conquistato in una presa di almeno 3 carte. | +2 punti, registrati al momento della presa, se prelevato insieme ad almeno 2 altre carte. |
| `h-rocco-zuppa` | Rocco | Zuppa di Pugni | 2 | +3 | Bonus condizionato | Hai più Picchiatori di ogni altro giocatore (parità esclusa). | +3 punti se possiedi strettamente più Picchiatori di ogni avversario. |
| `h-ciccio-frigo` | Ciccio | Il Frigorifero | 3 | +1 | Bonus condizionato | Possiedi almeno un Esattore. | +1 punti se possiedi almeno un Esattore. |

### Scassinatori

| ID | Nome | Soprannome | Punti | Bonus | Tipo | Condizione | Effetto |
|---|---|---|---|---|---|---|---|
| `h-vecchio-scassinatore` | Il Vecchio Scassinatore | — | 2 | +2 | Bonus condizionato | Possiedi almeno un altro Scassinatore. | +2 punti se possiedi almeno un altro Scassinatore. |
| `h-lina-velluto` | Lina | Dita di Velluto | 3 | — | Nessun bonus | Nessuna | Solo punteggio base. |
| `h-nando-grimaldello` | Nando | Grimaldello | 1 | fino a +3 | Bonus condizionato | Possiedi Ladri. | +1 per ogni Ladro posseduto, massimo +3. |
| `h-orecchio-fino` | Settimio | Orecchio Fino | 2 | +2 | Bonus immediato | Conquistato nella prima presa effettuata sulla sua gang. | +2 punti, registrati al momento della presa, se prelevato nella prima presa della gang. |
| `h-mimmo-fiamma` | Mimmo | La Fiamma Ossidrica | 2 | +2 | Bonus condizionato | Possiedi almeno un Autista. | +2 punti se possiedi almeno un Autista. |
| `h-peppe-topo` | Peppe | Il Topo | 1 | +4 | Bonus condizionato | Hai completato almeno un Tris di Scassinatori. | +4 punti se hai completato almeno un Tris (o superiore) di Scassinatori. |

### Autisti

| ID | Nome | Soprannome | Punti | Bonus | Tipo | Condizione | Effetto |
|---|---|---|---|---|---|---|---|
| `h-autista` | L'Autista | — | 2 | +3 | Bonus condizionato | Possiedi almeno un altro Autista. | +3 punti se possiedi almeno un altro Autista. |
| `h-sandro-piombo` | Sandro | Piede di Piombo | 3 | — | Nessun bonus | Nessuna | Solo punteggio base. |
| `h-nina-curva` | Nina | Curva Secca | 2 | +1 | Bonus immediato | Conquistato in una presa di almeno 2 carte. | +1 punti, registrati al momento della presa, se prelevato insieme ad almeno 1 altre carte. |
| `h-toto-fuggiasco` | Totò | Il Fuggiasco | 2 | +3 | Bonus condizionato | Non hai conquistato alcun Boss. | +3 punti se non possiedi alcun Boss. |
| `h-enzo-retro` | Enzo | Marcia Indietro | 1 | +3 | Bonus condizionato | Possiedi almeno un Contrabbandiere. | +3 punti se possiedi almeno un Contrabbandiere. |
| `h-ugo-carburatore` | Ugo | Il Carburatore | 1 | fino a +3 | Bonus condizionato | Ogni 4 Scagnozzi posseduti (questo incluso). | +1 per ogni gruppo di 4 Scagnozzi posseduti, massimo +3. |

### Tiratori

| ID | Nome | Soprannome | Punti | Bonus | Tipo | Condizione | Effetto |
|---|---|---|---|---|---|---|---|
| `h-cecchino` | Il Cecchino | — | 4 | — | Nessun bonus | Nessuna | Solo punteggio base. |
| `h-lefty-pistole` | Lefty | Due Pistole | 3 | +1 | Bonus condizionato | Possiedi almeno un altro Tiratore. | +1 punti se possiedi almeno un altro Tiratore. |
| `h-gina-falco` | Gina | Occhio di Falco | 2 | +3 | Bonus immediato | Conquistato come ultimo Scagnozzo della fila (insieme al Boss). | +3 punti, registrati al momento della presa, se è l'ultimo Scagnozzo della sua gang. |
| `h-salvo-tommy` | Salvo | Tommy Gun | 2 | fino a +4 | Bonus condizionato | Hai conquistato almeno un Boss. | +2 per ogni Boss conquistato, massimo +4. |
| `h-dino-silenziatore` | Dino | Il Silenziatore | 2 | +2 | Bonus condizionato | Non possiedi alcun Informatore. | +2 punti se non possiedi alcun Informatore. |
| `h-remo-mira` | Remo | Mira Storta | 1 | +4 | Bonus condizionato | Hai più Tiratori di ogni altro giocatore (parità esclusa). | +4 punti se possiedi strettamente più Tiratori di ogni avversario. |

### Informatori

| ID | Nome | Soprannome | Punti | Bonus | Tipo | Condizione | Effetto |
|---|---|---|---|---|---|---|---|
| `h-informatore` | L'Informatore | — | 1 | fino a +6 | Bonus condizionato | Conta le specializzazioni diverse che possiedi (questa inclusa). | +2 per ogni diversa specializzazione posseduta, massimo +6. |
| `h-pina-lingua` | Pina | Lingua Lunga | 2 | +2 | Bonus immediato | Conquistato nella prima presa effettuata sulla sua gang. | +2 punti, registrati al momento della presa, se prelevato nella prima presa della gang. |
| `h-nello-orecchie` | Nello | Orecchie a Sventola | 1 | fino a +5 | Bonus condizionato | Conta le specializzazioni diverse che possiedi (questa inclusa). | +1 per ogni diversa specializzazione posseduta, massimo +5. |
| `h-zia-carmela` | Zia Carmela | La Portinaia | 2 | +2 | Bonus condizionato | Possiedi almeno un Esattore. | +2 punti se possiedi almeno un Esattore. |
| `h-canarino` | Spiffy | Il Canarino | 4 | -3 | Bonus condizionato | Non possiedi alcun Avvocato. | -3 punti se non possiedi alcun Avvocato. |
| `h-doppiogiochista` | Tonino | Il Doppiogiochista | 1 | Jolly | Bonus combo | Sempre attivo nel calcolo delle combo. | Nelle combo vale come una specializzazione qualsiasi, scelta automaticamente per massimizzare i punti. |

### Avvocati

| ID | Nome | Soprannome | Punti | Bonus | Tipo | Condizione | Effetto |
|---|---|---|---|---|---|---|---|
| `h-avvocato` | L'Avvocato | — | 2 | -2 malus | Bonus permanente | Hai conquistato almeno un Boss. | Riduce di 2 il malus di un Boss conquistato (mai oltre lo zero). |
| `h-principe-foro` | Avv. Ferrante | Il Principe del Foro | 1 | -4 malus | Bonus permanente | Hai conquistato almeno un Boss. | Riduce di 4 il malus di un Boss conquistato (mai oltre lo zero). |
| `h-avv-cavilli` | Avv. Cavilli | Il Cavillo | 2 | +2 | Bonus condizionato | Possiedi almeno un Informatore. | +2 punti se possiedi almeno un Informatore. |
| `h-avv-sbarra` | Avv. Sbarra | Libertà Vigilata | 3 | — | Nessun bonus | Nessuna | Solo punteggio base. |
| `h-avv-lusinghi` | Avv. Lusinghi | Lingua d'Argento | 1 | fino a +3 | Bonus condizionato | Ogni 3 Scagnozzi posseduti (questo incluso). | +1 per ogni gruppo di 3 Scagnozzi posseduti, massimo +3. |
| `h-avv-proroga` | Avv. Proroga | Il Rinvio | 2 | +4 | Bonus immediato | Conquistato come ultimo Scagnozzo della fila (insieme al Boss). | +4 punti, registrati al momento della presa, se è l'ultimo Scagnozzo della sua gang. |

### Truffatori

| ID | Nome | Soprannome | Punti | Bonus | Tipo | Condizione | Effetto |
|---|---|---|---|---|---|---|---|
| `h-trasformista` | Il Trasformista | — | 1 | Jolly | Bonus combo | Sempre attivo nel calcolo delle combo. | Nelle combo vale come una specializzazione qualsiasi, scelta automaticamente per massimizzare i punti. |
| `h-lola-tre-carte` | Lola | Tre Carte | 2 | +2 | Bonus condizionato | Possiedi almeno un altro Truffatore. | +2 punti se possiedi almeno un altro Truffatore. |
| `h-conte-fasullo` | Il Conte Fasullo | — | 3 | — | Nessun bonus | Nessuna | Solo punteggio base. |
| `h-gigolo` | Armando | Il Baciamano | 2 | +3 | Bonus condizionato | Hai più Truffatori di ogni altro giocatore (parità esclusa). | +3 punti se possiedi strettamente più Truffatori di ogni avversario. |
| `h-venditore-ponti` | Il Venditore di Ponti | — | 1 | +4 | Bonus immediato | Conquistato in una presa di almeno 4 carte. | +4 punti, registrati al momento della presa, se prelevato insieme ad almeno 3 altre carte. |
| `h-mister-specchio` | Mister Specchio | — | 2 | +2 | Bonus condizionato | Possiedi almeno un Ladro. | +2 punti se possiedi almeno un Ladro. |

### Contrabbandieri

| ID | Nome | Soprannome | Punti | Bonus | Tipo | Condizione | Effetto |
|---|---|---|---|---|---|---|---|
| `h-contrabbandiere` | Il Contrabbandiere | Barile | 3 | — | Nessun bonus | Nessuna | Solo punteggio base. |
| `h-rum-runner` | Rum Runner | Nebbia | 2 | +2 | Bonus condizionato | Possiedi almeno un Autista. | +2 punti se possiedi almeno un Autista. |
| `h-doppio-fondo` | Fofò | Doppio Fondo | 1 | fino a +4 | Bonus condizionato | Possiedi altri Contrabbandieri. | +1 per ogni altro Contrabbandiere posseduto, massimo +4. |
| `h-moonshine-molly` | Molly | Distilleria Clandestina | 2 | +2 | Bonus condizionato | Hai completato almeno una Coppia di Contrabbandieri. | +2 punti se hai completato almeno una Coppia (o superiore) di Contrabbandieri. |
| `h-capitano` | Il Capitano | Bonaccia | 2 | +4 | Bonus condizionato | Possiedi almeno 2 altri Contrabbandieri. | +4 punti se possiedi almeno 2 altri Contrabbandieri. |
| `h-bottiglia` | Nicola | Bottiglia | 1 | fino a +4 | Bonus condizionato | Ogni 3 Scagnozzi posseduti (questo incluso). | +1 per ogni gruppo di 3 Scagnozzi posseduti, massimo +4. |

### Ladri

| ID | Nome | Soprannome | Punti | Bonus | Tipo | Condizione | Effetto |
|---|---|---|---|---|---|---|---|
| `h-borseggiatore` | Il Borseggiatore | — | 2 | +2 | Bonus condizionato | Possiedi almeno un altro Ladro. | +2 punti se possiedi almeno un altro Ladro. |
| `h-gatto-nero` | Gatto Nero | — | 3 | — | Nessun bonus | Nessuna | Solo punteggio base. |
| `h-mano-lesta` | Mano Lesta | — | 1 | +3 | Bonus immediato | Conquistato in una presa di almeno 3 carte. | +3 punti, registrati al momento della presa, se prelevato insieme ad almeno 2 altre carte. |
| `h-collezionista` | Il Collezionista | — | 1 | fino a +3 | Bonus condizionato | Possiedi Scassinatori. | +1 per ogni Scassinatore posseduto, massimo +3. |
| `h-ombra` | Lucetta | Ombra | 2 | +2 | Bonus immediato | Conquistato come ultimo Scagnozzo della fila (insieme al Boss). | +2 punti, registrati al momento della presa, se è l'ultimo Scagnozzo della sua gang. |
| `h-fagottino` | Fagottino | — | 2 | +3 | Bonus condizionato | Non hai conquistato alcun Boss. | +3 punti se non possiedi alcun Boss. |

### Esattori

| ID | Nome | Soprannome | Punti | Bonus | Tipo | Condizione | Effetto |
|---|---|---|---|---|---|---|---|
| `h-esattore` | L'Esattore | — | 3 | — | Nessun bonus | Nessuna | Solo punteggio base. |
| `h-pizzo` | Ninì | Il Pizzo | 2 | fino a +6 | Bonus condizionato | Hai conquistato almeno un Boss. | +2 per ogni Boss conquistato, massimo +6. |
| `h-bilancino` | Bilancino | — | 1 | fino a +4 | Bonus condizionato | Ogni 4 Scagnozzi posseduti (questo incluso). | +2 per ogni gruppo di 4 Scagnozzi posseduti, massimo +4. |
| `h-rag-strozzi` | Ragionier Strozzi | — | 2 | +2 | Bonus condizionato | Possiedi almeno un Avvocato. | +2 punti se possiedi almeno un Avvocato. |
| `h-riscossione` | Donna Concetta | La Riscossione | 2 | +3 | Bonus condizionato | Hai più Esattori di ogni altro giocatore (parità esclusa). | +3 punti se possiedi strettamente più Esattori di ogni avversario. |
| `h-tassametro` | Il Tassametro | — | 2 | +2 | Bonus condizionato | Possiedi almeno un altro Esattore. | +2 punti se possiedi almeno un altro Esattore. |

## Combo

| ID | Nome | Carte della stessa specializzazione | Punti |
|---|---|---|---|
| `coppia` | Coppia | 2 | +2 |
| `tris` | Tris | 3 | +5 |
| `quartetto` | Quartetto | 4 | +9 |

Raggruppamento dal più grande: 5 = Quartetto + 1 singola, 6 = Quartetto + Coppia, 7 = Quartetto + Tris, 8 = due Quartetti. I jolly (`comboWildcard`) vengono assegnati alla specializzazione che massimizza i punti combo.

## Come aggiungere carte

1. Aggiungere la voce in `src/game/data/bosses.ts` o `src/game/data/henchmen.ts` (ID univoco, `imageUrl` opzionale).
2. Usare uno dei tipi di effetto definiti in `src/game/types.ts` (`HenchmanEffect`). Per un effetto nuovo: aggiungere il tipo, la descrizione in `describeEffect`, la valutazione in `evaluateImmediate`/`evaluateConditional` e la validazione in `catalog.ts`.
3. Eseguire `npm test` (la validazione del catalogo controlla ID, campi e parametri) e `npm run catalog:md`.
