import Link from 'next/link';
import { PageShell } from '@/components/PageShell';
import { COMBOS } from '@/game/catalog';

export const metadata = { title: 'Regolamento — Gangster Nim' };

export default function RulesPage() {
  return (
    <PageShell title="Regolamento">
      <article className="gn-prose max-w-3xl">
        <p>
          <b>Gangster Nim</b> è un gioco di carte per 2-4 giocatori, umani o BOT. Sul tavolo ci sono alcune famiglie criminali (gang):
          a turno si portano via gli Scagnozzi, cercando di fare più punti possibile… senza restare con il Boss in mano.
        </p>

        <h2>Il tavolo</h2>
        <ul>
          <li>Di base ci sono 4 gang (configurabili da 2 a 6). Ogni gang è una fila con il <b>Boss a sinistra</b> e da 4 a 6 <b>Scagnozzi</b> alla sua destra.</li>
          <li>Boss e Scagnozzi sono tutti diversi in ogni partita. Tutte le carte sono scoperte.</li>
          <li>Ogni Boss stabilisce, per tutta la partita, quante carte si possono prendere per turno dalla sua gang (minimo e massimo) e il malus di chi lo conquista.</li>
        </ul>

        <h2>Il turno</h2>
        <ol>
          <li>I giocatori agiscono in senso orario, una presa per turno.</li>
          <li>Scegli una gang ancora attiva: vedrai il minimo e il massimo di presa consentiti dal suo Boss.</li>
          <li>Scegli quante carte prendere e conferma.</li>
          <li>Le carte si prendono <b>consecutivamente dall&apos;estremità destra</b> della fila: non si possono saltare carte né sceglierne di isolate.</li>
          <li>Se nella fila restano meno carte del minimo consentito, devi prenderle tutte.</li>
        </ol>

        <h2>Conquista del Boss</h2>
        <p>
          Il Boss non si può prendere direttamente. Chi preleva <b>l&apos;ultimo Scagnozzo</b> di una fila riceve automaticamente anche il Boss,
          subisce il suo <b>malus</b> e la gang viene eliminata. Il malus è registrato a parte rispetto ai punti degli Scagnozzi.
          La partita termina quando tutte le gang sono eliminate.
        </p>

        <h2>Punteggio</h2>
        <h3>Punteggio base</h3>
        <p>Ogni Scagnozzo vale i punti indicati nel cerchio dorato.</p>
        <h3>Bonus immediati</h3>
        <p>Vengono registrati nel momento della presa e non cambiano più: per esempio «se preso in una presa di almeno 3 carte», «se è l&apos;ultimo Scagnozzo della fila», «se preso nella prima presa della gang».</p>
        <h3>Bonus condizionati</h3>
        <p>Dipendono dalla tua collezione (o dal confronto con gli avversari) e vengono ricalcolati ogni volta che cambia: «se possiedi un altro Autista», «+1 per ogni Ladro», «se hai più Picchiatori di tutti», «se non possiedi Boss»… Alcuni possono anche essere negativi (Il Canarino senza Avvocato).</p>
        <h3>Bonus permanenti: riduzione dei malus</h3>
        <p>Gli Avvocati riducono il malus di un Boss conquistato. Ogni Avvocato si applica a un Boss diverso (il più forte al malus più alto); il malus non può mai diventare un bonus.</p>
        <h3>Combo</h3>
        <ul>
          {COMBOS.map((c) => (
            <li key={c.id}>
              <b>{c.name}</b>: {c.size} carte della stessa specializzazione = +{c.points} punti complessivi.
            </li>
          ))}
          <li>Una combo superiore sostituisce quella inferiore. I gruppi si formano partendo dal più grande: 5 Picchiatori = un Quartetto e una carta singola; per gruppi ulteriori il valore si applica separatamente a ogni gruppo completo.</li>
          <li>I jolly contano nelle combo come la specializzazione che rende di più (scelta automatica). Per gli altri effetti valgono per la specializzazione stampata.</li>
        </ul>
        <h3>Totale</h3>
        <p>Totale = base + bonus immediati + bonus condizionati + combo − (malus dei Boss − riduzioni). Nessun effetto viene mai contato due volte: il punteggio viene ricalcolato interamente dallo stato della partita.</p>

        <h2>Vittoria e parità</h2>
        <p>Vince chi ha più punti. In caso di parità prevale chi ha il malus netto più basso; se la parità resta, la vittoria è condivisa (ex aequo).</p>

        <h2>Un po&apos; di strategia</h2>
        <ul>
          <li>Lasciare una fila con poche carte può costringere qualcuno a prendersi il Boss… o regalargli carte preziose.</li>
          <li>Quando nessuno vuole toccare l&apos;ultima carta, conta chi resta senza prese «sicure»: è un problema alla Nim.</li>
          <li>Togliere una carta a un avversario a un passo dalla combo vale spesso più dei punti che porta.</li>
        </ul>

        <p className="mt-8">
          <Link href="/catalog" className="gn-btn gn-btn--ghost">Consulta il catalogo delle carte</Link>
        </p>
      </article>
    </PageShell>
  );
}
