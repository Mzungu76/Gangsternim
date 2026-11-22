# BALANCE_REPORT — Gangster Nim

Report generato automaticamente da `npm run simulate` il 2026-11-22. Seed base 2026, 1000 partite per ogni confronto (6000 partite totali), 4 gang da 4-6 Scagnozzi, giocatore iniziale a rotazione. I numeri sono quelli effettivamente prodotti dalla simulazione: rieseguendo lo script con lo stesso seed si ottengono gli stessi risultati.

Il bilanciamento NON viene modificato automaticamente: questo report serve solo a individuare possibili squilibri.

## Confronto tra i livelli di difficoltà

| Confronto | % vittorie Facile | % vittorie Medio | % vittorie Difficile | Punti medi (F / M / D) |
|---|---|---|---|---|
| A. Facile contro Difficile (2 giocatori) | 27.2% | — | 72.9% | 27.1 / — / 36.9 |
| B. Medio contro Difficile (2 giocatori) | — | 46.2% | 53.8% | — / 30.7 / 32.1 |
| C. Facile contro Medio (2 giocatori) | 29.4% | 70.6% | — | 27.4 / 36.6 / — |
| D. Facile, Medio e Difficile (3 giocatori) | 18.0% | 46.6% | 35.4% | 14.9 / 20.5 / 19.4 |
| E. Facile, Medio, Difficile e Medio (4 giocatori) | 14.8% | 29.2% | 26.9% | 9.5 / 13.1 / 12.9 |

Le vittorie ex aequo valgono 1/k per ciascuno dei k vincitori. Con 2 giocatori il valore atteso a parità di forza è 50%, con 3 giocatori 33,3%, con 4 giocatori 25%.

## Dettaglio delle simulazioni

### A. Facile contro Difficile (2 giocatori)

- BOT: Facile, Difficile · gang: 4 · Scagnozzi per gang: 4-6
- Partite: 1000 · seed: 2026 · giocatore iniziale a rotazione: sì
- Durata media: 8.92 turni · partite con vittoria ex aequo: 1 · tempo di calcolo: 131.5 s

| Posto | BOT | % vittorie | Punti medi | Boss medi | Malus netto medio | Bonus medi | Punti combo medi | Coppie | Tris | Quartetti |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Facile | 27.2% | 27.14 | 2.01 | 7.68 | 9.73 | 6.65 | 1.60 | 0.45 | 0.14 |
| 2 | Difficile | 72.9% | 36.91 | 1.99 | 7.78 | 15.21 | 9.35 | 1.93 | 0.60 | 0.28 |

Distribuzione dei punteggi (intervalli di 5 punti):

- Posto 1 (Facile): 5…9: 15 · 10…14: 41 · 15…19: 129 · 20…24: 225 · 25…29: 222 · 30…34: 162 · 35…39: 123 · 40…44: 53 · 45…49: 25 · 50…54: 5
- Posto 2 (Difficile): 10…14: 3 · 15…19: 32 · 20…24: 78 · 25…29: 129 · 30…34: 177 · 35…39: 177 · 40…44: 183 · 45…49: 119 · 50…54: 56 · 55…59: 30 · 60…64: 10 · 65…69: 5 · 70…74: 1

### B. Medio contro Difficile (2 giocatori)

- BOT: Medio, Difficile · gang: 4 · Scagnozzi per gang: 4-6
- Partite: 1000 · seed: 2026 · giocatore iniziale a rotazione: sì
- Durata media: 8.62 turni · partite con vittoria ex aequo: 1 · tempo di calcolo: 130.5 s

| Posto | BOT | % vittorie | Punti medi | Boss medi | Malus netto medio | Bonus medi | Punti combo medi | Coppie | Tris | Quartetti |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Medio | 46.2% | 30.68 | 2.00 | 8.01 | 11.75 | 7.45 | 1.78 | 0.52 | 0.14 |
| 2 | Difficile | 53.8% | 32.13 | 2.00 | 7.45 | 12.89 | 7.63 | 1.77 | 0.52 | 0.17 |

Distribuzione dei punteggi (intervalli di 5 punti):

- Posto 1 (Medio): 10…14: 18 · 15…19: 72 · 20…24: 168 · 25…29: 218 · 30…34: 188 · 35…39: 165 · 40…44: 112 · 45…49: 45 · 50…54: 11 · 55…59: 3
- Posto 2 (Difficile): 5…9: 1 · 10…14: 15 · 15…19: 61 · 20…24: 137 · 25…29: 195 · 30…34: 200 · 35…39: 172 · 40…44: 119 · 45…49: 67 · 50…54: 29 · 55…59: 4

### C. Facile contro Medio (2 giocatori)

- BOT: Facile, Medio · gang: 4 · Scagnozzi per gang: 4-6
- Partite: 1000 · seed: 2026 · giocatore iniziale a rotazione: sì
- Durata media: 8.87 turni · partite con vittoria ex aequo: 2 · tempo di calcolo: 11.4 s

| Posto | BOT | % vittorie | Punti medi | Boss medi | Malus netto medio | Bonus medi | Punti combo medi | Coppie | Tris | Quartetti |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Facile | 29.4% | 27.45 | 2.00 | 7.54 | 10.24 | 6.53 | 1.56 | 0.45 | 0.13 |
| 2 | Medio | 70.6% | 36.55 | 2.00 | 7.92 | 14.87 | 9.27 | 1.94 | 0.62 | 0.25 |

Distribuzione dei punteggi (intervalli di 5 punti):

- Posto 1 (Facile): 0…4: 1 · 5…9: 16 · 10…14: 43 · 15…19: 113 · 20…24: 221 · 25…29: 210 · 30…34: 181 · 35…39: 139 · 40…44: 47 · 45…49: 22 · 50…54: 7
- Posto 2 (Medio): 5…9: 2 · 10…14: 6 · 15…19: 33 · 20…24: 75 · 25…29: 145 · 30…34: 179 · 35…39: 171 · 40…44: 177 · 45…49: 104 · 50…54: 64 · 55…59: 30 · 60…64: 9 · 65…69: 5

### D. Facile, Medio e Difficile (3 giocatori)

- BOT: Facile, Medio, Difficile · gang: 4 · Scagnozzi per gang: 4-6
- Partite: 1000 · seed: 2026 · giocatore iniziale a rotazione: sì
- Durata media: 8.92 turni · partite con vittoria ex aequo: 3 · tempo di calcolo: 82.2 s

| Posto | BOT | % vittorie | Punti medi | Boss medi | Malus netto medio | Bonus medi | Punti combo medi | Coppie | Tris | Quartetti |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Facile | 18.0% | 14.90 | 1.39 | 5.45 | 5.02 | 3.15 | 0.90 | 0.21 | 0.03 |
| 2 | Medio | 46.6% | 20.48 | 1.30 | 5.18 | 7.81 | 4.41 | 1.11 | 0.34 | 0.06 |
| 3 | Difficile | 35.4% | 19.36 | 1.31 | 4.95 | 7.39 | 3.99 | 1.04 | 0.29 | 0.05 |

Distribuzione dei punteggi (intervalli di 5 punti):

- Posto 1 (Facile): -10…-6: 1 · -5…-1: 10 · 0…4: 36 · 5…9: 178 · 10…14: 286 · 15…19: 245 · 20…24: 141 · 25…29: 73 · 30…34: 26 · 35…39: 3 · 40…44: 1
- Posto 2 (Medio): 0…4: 7 · 5…9: 61 · 10…14: 189 · 15…19: 230 · 20…24: 207 · 25…29: 161 · 30…34: 103 · 35…39: 32 · 40…44: 7 · 45…49: 2 · 50…54: 1
- Posto 3 (Difficile): -5…-1: 1 · 0…4: 11 · 5…9: 74 · 10…14: 200 · 15…19: 266 · 20…24: 190 · 25…29: 143 · 30…34: 81 · 35…39: 27 · 40…44: 7

### E. Facile, Medio, Difficile e Medio (4 giocatori)

- BOT: Facile, Medio, Difficile, Medio · gang: 4 · Scagnozzi per gang: 4-6
- Partite: 1000 · seed: 2026 · giocatore iniziale a rotazione: sì
- Durata media: 8.87 turni · partite con vittoria ex aequo: 7 · tempo di calcolo: 61.6 s

| Posto | BOT | % vittorie | Punti medi | Boss medi | Malus netto medio | Bonus medi | Punti combo medi | Coppie | Tris | Quartetti |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Facile | 14.8% | 9.54 | 1.01 | 3.90 | 3.06 | 1.58 | 0.56 | 0.09 | 0.00 |
| 2 | Medio | 34.5% | 13.81 | 0.98 | 3.88 | 5.15 | 2.61 | 0.77 | 0.18 | 0.02 |
| 3 | Difficile | 26.9% | 12.85 | 1.00 | 3.88 | 4.75 | 2.29 | 0.71 | 0.14 | 0.02 |
| 4 | Medio | 23.8% | 12.41 | 1.00 | 4.06 | 4.24 | 2.11 | 0.70 | 0.13 | 0.01 |

Distribuzione dei punteggi (intervalli di 5 punti):

- Posto 1 (Facile): -10…-6: 2 · -5…-1: 25 · 0…4: 194 · 5…9: 325 · 10…14: 232 · 15…19: 147 · 20…24: 65 · 25…29: 9 · 30…34: 1
- Posto 2 (Medio): -5…-1: 3 · 0…4: 69 · 5…9: 219 · 10…14: 276 · 15…19: 235 · 20…24: 128 · 25…29: 54 · 30…34: 14 · 35…39: 2
- Posto 3 (Difficile): -5…-1: 10 · 0…4: 83 · 5…9: 237 · 10…14: 293 · 15…19: 210 · 20…24: 121 · 25…29: 36 · 30…34: 7 · 35…39: 3
- Posto 4 (Medio): -5…-1: 4 · 0…4: 86 · 5…9: 269 · 10…14: 281 · 15…19: 230 · 20…24: 94 · 25…29: 31 · 30…34: 4 · 35…39: 1

### F. Quattro BOT Medi (4 giocatori, riferimento per carte e Boss)

- BOT: Medio, Medio, Medio, Medio · gang: 4 · Scagnozzi per gang: 4-6
- Partite: 1000 · seed: 2026 · giocatore iniziale a rotazione: sì
- Durata media: 8.64 turni · partite con vittoria ex aequo: 5 · tempo di calcolo: 7.1 s

| Posto | BOT | % vittorie | Punti medi | Boss medi | Malus netto medio | Bonus medi | Punti combo medi | Coppie | Tris | Quartetti |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Medio | 26.9% | 12.06 | 1.01 | 3.92 | 4.31 | 2.04 | 0.66 | 0.13 | 0.01 |
| 2 | Medio | 24.1% | 11.92 | 0.99 | 3.81 | 4.20 | 2.08 | 0.66 | 0.14 | 0.01 |
| 3 | Medio | 25.0% | 12.03 | 1.01 | 3.97 | 4.34 | 1.96 | 0.66 | 0.10 | 0.01 |
| 4 | Medio | 24.1% | 11.99 | 1.00 | 3.96 | 4.10 | 2.10 | 0.68 | 0.13 | 0.01 |

Distribuzione dei punteggi (intervalli di 5 punti):

- Posto 1 (Medio): -5…-1: 7 · 0…4: 111 · 5…9: 273 · 10…14: 267 · 15…19: 203 · 20…24: 107 · 25…29: 29 · 30…34: 3
- Posto 2 (Medio): -5…-1: 6 · 0…4: 108 · 5…9: 272 · 10…14: 287 · 15…19: 197 · 20…24: 101 · 25…29: 25 · 30…34: 4
- Posto 3 (Medio): -5…-1: 8 · 0…4: 100 · 5…9: 283 · 10…14: 278 · 15…19: 191 · 20…24: 108 · 25…29: 28 · 30…34: 3 · 35…39: 1
- Posto 4 (Medio): -5…-1: 4 · 0…4: 114 · 5…9: 264 · 10…14: 277 · 15…19: 206 · 20…24: 103 · 25…29: 27 · 30…34: 4 · 35…39: 1

## Carte (riferimento: 4 BOT Medi)

Tasso di vittoria di chi possiede la carta a fine partita, confrontato con il valore atteso del 25%. Ogni carta è uscita in circa 333 partite. Scarti entro ±4 punti percentuali sono compatibili con il rumore statistico di questo campione.

### Le 10 carte più forti

| Carta | Uscita | % vittorie possessore | Scarto (p.p.) |
|---|---|---|---|
| L'Informatore | 331 | 49.4% | +24.4 |
| Il Picchiatore | 324 | 38.6% | +13.6 |
| Nello «Orecchie a Sventola» | 344 | 38.4% | +13.4 |
| Donna Concetta «La Riscossione» | 315 | 37.5% | +12.5 |
| Pina «Lingua Lunga» | 328 | 36.6% | +11.6 |
| Settimio «Orecchio Fino» | 320 | 36.6% | +11.6 |
| Remo «Mira Storta» | 337 | 36.4% | +11.4 |
| Salvo «Tommy Gun» | 345 | 36.2% | +11.2 |
| Nicola «Bottiglia» | 318 | 36.2% | +11.2 |
| Bruno «Il Martello» | 324 | 36.0% | +11.0 |

### Le 10 carte più deboli

| Carta | Uscita | % vittorie possessore | Scarto (p.p.) |
|---|---|---|---|
| Il Collezionista | 320 | 25.0% | 0.0 |
| Peppe «Il Topo» | 327 | 25.2% | 0.2 |
| Fofò «Doppio Fondo» | 327 | 26.6% | 1.6 |
| Zia Carmela «La Portinaia» | 313 | 27.2% | 2.2 |
| Il Vecchio Scassinatore | 322 | 27.3% | 2.3 |
| Gigi «Nocche d'Acciaio» | 357 | 27.6% | 2.6 |
| Gina «Occhio di Falco» | 342 | 27.6% | 2.6 |
| Nina «Curva Secca» | 339 | 27.7% | 2.7 |
| Rum Runner «Nebbia» | 328 | 27.7% | 2.7 |
| Lucetta «Ombra» | 317 | 27.8% | 2.8 |

<details><summary>Tutte le carte</summary>

| Carta | Uscita | % vittorie possessore | Scarto (p.p.) |
|---|---|---|---|
| L'Informatore | 331 | 49.4% | 24.4 |
| Il Picchiatore | 324 | 38.6% | 13.6 |
| Nello «Orecchie a Sventola» | 344 | 38.4% | 13.4 |
| Donna Concetta «La Riscossione» | 315 | 37.5% | 12.5 |
| Pina «Lingua Lunga» | 328 | 36.6% | 11.6 |
| Settimio «Orecchio Fino» | 320 | 36.6% | 11.6 |
| Remo «Mira Storta» | 337 | 36.4% | 11.4 |
| Salvo «Tommy Gun» | 345 | 36.2% | 11.2 |
| Nicola «Bottiglia» | 318 | 36.2% | 11.2 |
| Bruno «Il Martello» | 324 | 36.0% | 11.0 |
| L'Avvocato | 349 | 35.8% | 10.8 |
| Tano «Il Bisonte» | 317 | 35.3% | 10.3 |
| Avv. Ferrante «Il Principe del Foro» | 314 | 35.0% | 10.0 |
| L'Esattore | 340 | 34.7% | 9.7 |
| Il Cecchino | 334 | 34.4% | 9.4 |
| Totò «Il Fuggiasco» | 310 | 34.4% | 9.4 |
| Mimmo «La Fiamma Ossidrica» | 341 | 34.2% | 9.2 |
| Armando «Il Baciamano» | 344 | 34.2% | 9.2 |
| Avv. Proroga «Il Rinvio» | 339 | 33.9% | 8.9 |
| Lola «Tre Carte» | 360 | 33.8% | 8.8 |
| Il Venditore di Ponti | 357 | 33.5% | 8.5 |
| Ninì «Il Pizzo» | 344 | 33.4% | 8.4 |
| Lefty «Due Pistole» | 326 | 33.1% | 8.1 |
| Mano Lesta | 358 | 33.1% | 8.1 |
| Avv. Cavilli «Il Cavillo» | 317 | 32.6% | 7.6 |
| Il Trasformista | 313 | 31.8% | 6.8 |
| Spiffy «Il Canarino» | 324 | 31.3% | 6.3 |
| Il Tassametro | 293 | 31.2% | 6.2 |
| Fagottino | 340 | 31.2% | 6.2 |
| Ugo «Il Carburatore» | 339 | 31.1% | 6.1 |
| Ciccio «Il Frigorifero» | 349 | 31.1% | 6.1 |
| Bilancino | 313 | 31.0% | 6.0 |
| Il Borseggiatore | 342 | 30.8% | 5.8 |
| Tonino «Il Doppiogiochista» | 338 | 30.8% | 5.8 |
| Enzo «Marcia Indietro» | 330 | 30.8% | 5.8 |
| Il Conte Fasullo | 312 | 30.4% | 5.4 |
| Molly «Distilleria Clandestina» | 337 | 30.3% | 5.3 |
| Ragionier Strozzi | 319 | 30.3% | 5.3 |
| Rocco «Zuppa di Pugni» | 325 | 30.2% | 5.2 |
| Lina «Dita di Velluto» | 325 | 29.8% | 4.8 |
| L'Autista | 320 | 29.7% | 4.7 |
| Mister Specchio | 377 | 29.6% | 4.6 |
| Gatto Nero | 335 | 29.6% | 4.6 |
| Dino «Il Silenziatore» | 357 | 29.3% | 4.3 |
| Nando «Grimaldello» | 347 | 29.1% | 4.1 |
| Avv. Lusinghi «Lingua d'Argento» | 328 | 28.8% | 3.8 |
| Avv. Sbarra «Libertà Vigilata» | 349 | 28.8% | 3.8 |
| Sandro «Piede di Piombo» | 333 | 28.5% | 3.5 |
| Il Contrabbandiere «Barile» | 332 | 28.3% | 3.3 |
| Il Capitano «Bonaccia» | 346 | 28.0% | 3.0 |
| Lucetta «Ombra» | 317 | 27.8% | 2.8 |
| Rum Runner «Nebbia» | 328 | 27.7% | 2.7 |
| Nina «Curva Secca» | 339 | 27.7% | 2.7 |
| Gina «Occhio di Falco» | 342 | 27.6% | 2.6 |
| Gigi «Nocche d'Acciaio» | 357 | 27.6% | 2.6 |
| Il Vecchio Scassinatore | 322 | 27.3% | 2.3 |
| Zia Carmela «La Portinaia» | 313 | 27.2% | 2.2 |
| Fofò «Doppio Fondo» | 327 | 26.6% | 1.6 |
| Peppe «Il Topo» | 327 | 25.2% | 0.2 |
| Il Collezionista | 320 | 25.0% | 0.0 |

</details>

## Boss (riferimento: 4 BOT Medi)

| Boss | Malus | Uscito | % vittorie di chi lo conquista | Scarto (p.p.) |
|---|---|---|---|---|
| Il Colonnello | -5 | 257 | 15.2% | -9.8 |
| Il Cardinale | -6 | 205 | 15.6% | -9.4 |
| Il Barone | -6 | 251 | 17.9% | -7.1 |
| Il Pazzo | -7 | 257 | 21.8% | -3.2 |
| Il Padrino | -5 | 248 | 22.4% | -2.6 |
| La Duchessa | -5 | 250 | 24.0% | -1.0 |
| Il Contabile | -4 | 272 | 24.3% | -0.7 |
| La Vedova Nera | -6 | 234 | 24.4% | -0.6 |
| Il Fantasma | -4 | 238 | 24.8% | -0.2 |
| Il Mago | -4 | 256 | 26.6% | 1.6 |
| Il Notaio | -5 | 259 | 26.8% | 1.8 |
| Il Professore | -2 | 255 | 27.8% | 2.8 |
| Il Sarto | -3 | 252 | 29.8% | 4.8 |
| Il Pugile | -3 | 250 | 32.0% | 7.0 |
| Il Macellaio | -3 | 246 | 32.5% | 7.5 |
| Il Cuoco | -2 | 270 | 34.4% | 9.4 |

## Analisi e possibili squilibri

### Livelli di difficoltà

- **Difficile > Facile**: risultato netto e stabile (72,9% contro 27,2% a due giocatori, +9,8 punti medi). Il Difficile ottiene anche più bonus e più quartetti. Il requisito "il BOT difficile ha generalmente prestazioni superiori al facile" è soddisfatto (verificato anche da un test automatico su 200 partite).
- **Medio > Facile**: altrettanto netto (70,6%).
- **Difficile e Medio sono vicini.** A due giocatori il Difficile vince il 53,8% (vantaggio piccolo ma oltre il rumore statistico di ±3 p.p.). Con più giocatori il vantaggio sparisce:
  - nel confronto D (3 giocatori) il Medio vince il 46,6% e il Difficile il 35,4%: entrambi oltre il 33,3% atteso, ma il Medio sfrutta meglio gli errori del Facile;
  - nel confronto E (4 giocatori) conta molto la posizione al tavolo: il Medio che gioca subito dopo il Facile vince il 34,5%, l'altro Medio il 23,8%, il Difficile il 26,9%;
  - in prove aggiuntive (300 partite, Difficile contro due Medi) il Difficile si ferma intorno al 34%, in linea con l'atteso 33,3%. Cambiare i pesi (fattore Nim, tempo, peso del leader, profondità, finale esatto) non ha cambiato il risultato in modo significativo.
- Interpretazione: con più di due giocatori il Difficile ragiona "contro il leader" (massimizza il vantaggio sul miglior avversario), mentre il Medio è più "goloso" e approfitta direttamente delle carte lasciate dal giocatore precedente. Inoltre la distribuzione iniziale delle carte pesa molto: partite brevi (~9 turni) lasciano poco spazio alla pianificazione. **Il Difficile quindi non è il più forte in tutte le configurazioni.** Un possibile miglioramento futuro è una ricerca Monte Carlo con rollout fino a fine partita.

### Carte

Il tasso di vittoria del possessore è in media 31,9% (non 25%), perché chi vince tende ad avere più carte: per giudicare una carta va confrontato con questa media. Con circa 320 apparizioni per carta, scarti entro ±5 p.p. dalla media sono compatibili con il rumore statistico.

- **L'Informatore** (49,4%, cioè 17 p.p. sopra la media) è nettamente la carta più forte: +2 per ogni specializzazione diversa raggiunge facilmente il massimo di +6, e unito al punto base vale fino a 7 punti senza requisiti difficili. **Candidato a un ridimensionamento** (es. +1 per specializzazione, massimo +5, come Nello «Orecchie a Sventola», che comunque risulta anch'esso sopra la media con 38,4%).
- Sopra la media anche **Il Picchiatore** (3 punti senza condizioni) e le carte di maggioranza (**Donna Concetta**, **Remo «Mira Storta»**): la maggioranza con 4 giocatori si ottiene spesso con una sola carta della specializzazione.
- Le più deboli (25-28%) sono carte con condizioni difficili da soddisfare in partite brevi: **Il Collezionista** (servono Scassinatori), **Peppe «Il Topo»** (serve un Tris), **Fofò «Doppio Fondo»**. Candidate a un piccolo aumento del punteggio base o a condizioni più facili.

### Boss

- I Boss con presa minima **2 o 3** e malus alto (**Il Colonnello**, **Il Cardinale**, **Il Barone**) sono i più penalizzanti: chi li conquista vince solo il 15-18% delle volte. Il minimo di presa alto rende più facile restare "intrappolati" con carte residue inferiori al minimo.
- I Boss con malus basso (**Il Cuoco**, **Il Macellaio**, **Il Pugile**) favoriscono chi li prende (32-34%): spesso conviene conquistarli volontariamente insieme a buone carte. È un comportamento voluto (scelta strategica), ma la differenza di quasi 20 p.p. tra gli estremi suggerisce di valutare un malus -4 per Il Cuoco e/o -5 per Il Cardinale.

### Altri dati

- Durata media: 8,6-9,3 turni (4 gang da 4-6 Scagnozzi). Le combo più frequenti sono le Coppie; i Quartetti sono rari (0,01-0,28 a partita).
- Vittorie ex aequo: rare (5 su 1.000 nel confronto F).
- Nessuna modifica di bilanciamento è stata applicata automaticamente: le proposte qui sopra sono da valutare.

