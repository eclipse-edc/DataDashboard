import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
  },

  component: {
    devServer: {
      framework: 'angular',
      bundler: 'webpack',
    },
    specPattern: '**/*.cy.ts',
  },

  env: {
    edcConfig: [
      {
        connectorName: 'cypress',
        managementUrl: 'http://test.connector/management',
        defaultUrl: 'http://test.connector/api',
        protocolUrl: 'http://test.connector/protocol',
        federatedCatalogEnabled: false,
      },
    ],
  },
});
