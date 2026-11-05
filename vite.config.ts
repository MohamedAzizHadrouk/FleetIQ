/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig(async () => {
  const base = {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.join(dirname, 'src'),
      },
    },
  };

  // Only load the Storybook/Vitest test plugins when actually running Vitest.
  // They pull in native dependencies (oxc-resolver) that are not needed for the
  // dev server or the production build, and can fail to load on some machines.
  if (!process.env.VITEST) return base;

  const { storybookTest } = await import('@storybook/addon-vitest/vitest-plugin');
  const { playwright } = await import('@vitest/browser-playwright');

  return {
    ...base,
    test: {
      projects: [
        {
          extends: true,
          plugins: [
            // The plugin will run tests for the stories defined in your Storybook config
            // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
            storybookTest({
              configDir: path.join(dirname, '.storybook'),
            }),
          ],
          test: {
            name: 'storybook',
            browser: {
              enabled: true,
              headless: true,
              provider: playwright({}),
              instances: [{ browser: 'chromium' }],
            },
          },
        },
      ],
    },
  };
});