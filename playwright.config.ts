import { defineConfig, devices } from '@playwright/test';

const PORT = 3100;
/** Per testare un altro server (es. `wrangler dev` o il deploy) impostare PW_BASE_URL. */
const EXTERNAL = process.env.PW_BASE_URL;

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 90_000,
  fullyParallel: true,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: EXTERNAL ?? `http://localhost:${PORT}`,
    trace: 'off',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: EXTERNAL
    ? undefined
    : {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
    timeout: 120_000,
    env: { NEXT_TELEMETRY_DISABLED: '1' },
  },
});
