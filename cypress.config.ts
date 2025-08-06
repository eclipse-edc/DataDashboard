/*
 *  Copyright (c) 2025 Fraunhofer-Gesellschaft zur Förderung der angewandten Forschung e.V.
 *
 *  This program and the accompanying materials are made available under the
 *  terms of the Apache License, Version 2.0 which is available at
 *  https://www.apache.org/licenses/LICENSE-2.0
 *
 *  SPDX-License-Identifier: Apache-2.0
 *
 *  Contributors:
 *       Fraunhofer-Gesellschaft zur Förderung der angewandten Forschung e.V. - initial API and implementation
 *
 */

import { defineConfig } from 'cypress';

export default defineConfig({
  projectId: '5bofid',
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
        federatedCatalogEnabled: true,
        federatedCatalogUrl: 'http://fc.connector/catalog',
        did: 'http://ih.connector/',
      },
    ],
  },
});
