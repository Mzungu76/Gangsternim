import { test as base, expect, type Page } from '@playwright/test';

/** Impostazioni iniziali: BOT rapidi per velocizzare i test. */
export const test = base.extend<{ consoleErrors: string[] }>({
  consoleErrors: async ({ page }, use) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text());
    });
    await page.addInitScript(() => {
      if (!sessionStorage.getItem('gn-test-init')) {
        sessionStorage.setItem('gn-test-init', '1');
        localStorage.clear();
        localStorage.setItem(
          'gangster-nim:settings',
          JSON.stringify({ version: 1, savedAt: new Date().toISOString(), data: { botSpeed: 'fast', showBotReasons: true, showDebugPanel: false, animations: true } }),
        );
      }
    });
    await use(errors);
  },
});

export { expect };

/** Configura una partita tra umani (2 gang da 4 carte) tramite la schermata di configurazione. */
export async function setupHumansGame(page: Page, names = ['Anna', 'Bruno'], opts: { gangs?: number } = {}) {
  await page.goto('/setup');
  await page.getByRole('group', { name: 'Numero di giocatori' }).getByRole('button', { name: String(names.length) }).click();
  for (let i = 0; i < names.length; i++) {
    await page.getByLabel(`Nome giocatore ${i + 1}`).fill(names[i]);
    await page.getByRole('group', { name: `Tipo giocatore ${i + 1}` }).getByRole('button', { name: 'Umano' }).click();
  }
  await page.getByRole('group', { name: 'Numero di gang' }).getByRole('button', { name: String(opts.gangs ?? 2), exact: true }).click();
  await page.getByLabel('Scagnozzi max').selectOption('4');
  await page.getByLabel('Scagnozzi min').selectOption('4');
  await page.getByLabel('Seed (opzionale)').fill('12345');
  await page.getByTestId('start-game').click();
  await expect(page.getByTestId('table')).toBeVisible();
}

/** Esegue una presa come umano: prima gang attiva, quantità indicata (o la prima consentita). */
export async function humanTake(page: Page, which: 'first' | 'max' = 'first') {
  const select = page.locator('[data-testid^=select-gang-]').first();
  await select.click();
  const counts = page.locator('[data-testid^=take-count-]');
  await expect(counts.first()).toBeVisible();
  const btn = which === 'first' ? counts.first() : counts.last();
  await btn.click();
  await page.getByTestId('confirm-take').click();
}

export function noOverflow(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
}
