import { expect, humanTake, noOverflow, setupHumansGame, test } from './fixtures';

test('avvio: schermata iniziale con logo e menu', async ({ page, consoleErrors }) => {
  await page.goto('/');
  await expect(page.getByTestId('logo')).toContainText('GANGSTER');
  for (const label of ['Nuova partita', 'Catalogo', 'Regolamento', 'Impostazioni', 'Statistiche', 'Simulazione', 'Modalità test'])
    await expect(page.getByRole('link', { name: label })).toBeVisible();
  // senza partita salvata "Continua" è disattivato (non decorativo)
  await expect(page.getByTestId('continue-game')).toBeDisabled();
  expect(await noOverflow(page)).toBe(true);
  expect(consoleErrors).toEqual([]);
});

test('configurazione, selezione gang, presa, punteggi e cambio turno', async ({ page, consoleErrors }) => {
  await setupHumansGame(page);
  await expect(page.getByTestId('active-player')).toContainText('Anna');
  await expect(page.getByTestId('turn')).toHaveText('Turno 1');
  const gang = page.locator('[data-testid^=gang-gang-]').first();
  const before = Number(await gang.getAttribute('data-remaining'));
  await page.locator('[data-testid^=select-gang-]').first().click();
  // le quantità consentite vengono mostrate
  await expect(page.getByTestId('take-controls')).toContainText('prese consentite');
  const counts = page.locator('[data-testid^=take-count-]');
  await counts.last().click();
  const n = Number(await counts.last().textContent());
  await expect(gang.locator('.is-target')).toHaveCount(n);
  await page.getByTestId('confirm-take').click();
  await expect(page.getByTestId('turn')).toHaveText('Turno 2');
  await expect(page.getByTestId('active-player')).toContainText('Bruno');
  const after = Number(await page.locator('[data-testid^=gang-gang-]').first().getAttribute('data-remaining'));
  expect(after === before - n || after === 0).toBe(true);
  await expect(page.getByTestId('top-score-p1')).not.toHaveText('0');
  await expect(page.getByTestId('last-move')).toContainText('Anna');
  expect(consoleErrors).toEqual([]);
});

test('partita completa fino alla schermata finale, salvata nello storico', async ({ page, consoleErrors }) => {
  await setupHumansGame(page);
  for (let i = 0; i < 20; i++) {
    if (await page.getByTestId('end-screen').isVisible()) break;
    await humanTake(page, 'max');
    await page.waitForTimeout(400);
  }
  await expect(page.getByTestId('end-screen')).toBeVisible();
  await expect(page.getByTestId('winner')).toContainText(/Vince|Pareggio/);
  await expect(page.getByTestId('rank-1').first()).toBeVisible();
  await expect(page.getByTestId('end-screen')).toContainText('Malus Boss');
  await expect(page.getByTestId('end-screen')).toContainText('Bonus combo');
  await page.goto('/stats');
  await expect(page.getByTestId('stats-table')).toContainText('Anna');
  expect(consoleErrors).toEqual([]);
});

test('turni dei BOT: messaggio di attesa, motivazione e ritorno al giocatore umano', async ({ page, consoleErrors }) => {
  const workers: string[] = [];
  page.on('worker', (w) => workers.push(w.url()));
  await page.goto('/setup');
  await page.getByTestId('quick-start').click();
  await expect(page.getByTestId('active-player')).toContainText('Tu');
  await expect(page.getByTestId('bot-badge').first()).toBeVisible();
  await humanTake(page, 'first');
  await expect(page.getByTestId('bot-thinking')).toContainText('sta decidendo');
  await expect(page.getByTestId('bot-reason')).toBeVisible({ timeout: 15000 });
  // dopo i tre BOT tocca di nuovo all'umano (a meno che la partita sia finita)
  await expect(page.getByTestId('turn')).toHaveText('Turno 5', { timeout: 20000 });
  await expect(page.getByTestId('active-player')).toContainText('Tu');
  // le decisioni dei BOT vengono calcolate in un Web Worker (interfaccia non bloccata)
  expect(workers.length).toBeGreaterThan(0);
  expect(consoleErrors).toEqual([]);
});

test('partita di soli BOT dalla modalità test fino alla fine', async ({ page, consoleErrors }) => {
  await page.goto('/debug');
  await page.getByTestId('scenario-solo-bot').click();
  await expect(page.getByTestId('debug-panel')).toBeVisible();
  await expect(page.getByTestId('end-screen')).toBeVisible({ timeout: 60000 });
  expect(consoleErrors).toEqual([]);
});

test('salvataggio automatico e ripresa della partita', async ({ page, consoleErrors }) => {
  await setupHumansGame(page, ['Carla', 'Dario'], { gangs: 3 });
  await humanTake(page, 'first');
  await expect(page.getByTestId('turn')).toHaveText('Turno 2');
  await page.reload();
  await expect(page.getByTestId('turn')).toHaveText('Turno 2');
  await expect(page.getByTestId('active-player')).toContainText('Dario');
  await page.goto('/');
  await expect(page.getByTestId('continue-game')).toContainText('turno 2');
  await page.getByTestId('continue-game').click();
  await expect(page.getByTestId('active-player')).toContainText('Dario');
  expect(consoleErrors).toEqual([]);
});

test('catalogo: Boss, Scagnozzi, filtro, ricerca e combo', async ({ page, consoleErrors }) => {
  await page.goto('/catalog');
  await expect(page.getByTestId('catalog-item')).toHaveCount(60);
  await page.getByTestId('filter-avvocato').click();
  await expect(page.getByTestId('catalog-item')).toHaveCount(6);
  await page.getByTestId('catalog-search').fill('principe');
  await expect(page.getByTestId('catalog-item')).toHaveCount(1);
  await expect(page.getByTestId('catalog-item')).toContainText('Riduce di 4 il malus');
  await page.getByTestId('tab-bosses').click();
  await page.getByTestId('catalog-search').fill('');
  await expect(page.getByTestId('catalog-boss')).toHaveCount(16);
  await page.getByTestId('tab-combos').click();
  await expect(page.getByText('Quartetto').first()).toBeVisible();
  expect(await noOverflow(page)).toBe(true);
  expect(consoleErrors).toEqual([]);
});

test('responsive: tavolo senza scroll orizzontale di pagina e carte in proporzione 2:3', async ({ page, consoleErrors }) => {
  await page.goto('/setup');
  await page.getByTestId('quick-start').click();
  await expect(page.getByTestId('table')).toBeVisible();
  expect(await noOverflow(page)).toBe(true);
  const boxes = await page.locator('.gn-card').evaluateAll((els) => els.slice(0, 6).map((e) => e.getBoundingClientRect()).map((r) => r.height / r.width));
  for (const ratio of boxes) expect(Math.abs(ratio - 1.5)).toBeLessThan(0.02);
  const w = await page.locator('.gn-card').first().evaluate((e) => e.getBoundingClientRect().width);
  expect(w).toBeGreaterThanOrEqual(90);
  expect(consoleErrors).toEqual([]);
});

test('simulazione: esecuzione di un piccolo lotto di partite', async ({ page, consoleErrors }) => {
  await page.goto('/simulation');
  await page.getByTestId('sim-games').fill('20');
  await page.getByTestId('sim-run').click();
  await expect(page.getByTestId('sim-result')).toBeVisible({ timeout: 60000 });
  await expect(page.getByTestId('sim-win-0')).toContainText('%');
  expect(consoleErrors).toEqual([]);
});

test('regolamento e impostazioni', async ({ page, consoleErrors }) => {
  await page.goto('/rules');
  await expect(page.getByRole('heading', { name: 'Conquista del Boss' })).toBeVisible();
  await page.goto('/settings');
  await page.getByTestId('setting-showDebugPanel').check();
  await page.reload();
  await expect(page.getByTestId('setting-showDebugPanel')).toBeChecked();
  expect(consoleErrors).toEqual([]);
});
