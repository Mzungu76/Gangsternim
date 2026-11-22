// Configurazione OpenNext per Cloudflare Workers.
// Nessuna cache incrementale su R2: tutte le pagine sono statiche e il gioco
// funziona interamente nel browser (LocalStorage), quindi non servono
// risorse aggiuntive a pagamento.
import { defineCloudflareConfig } from '@opennextjs/cloudflare';

export default defineCloudflareConfig({});
