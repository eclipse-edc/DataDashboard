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

import { EdcConfig } from '../../projects/dashboard-core/src/lib/models/edc-config';

describe('contract definition page tests', () => {
  const edcConfigs: EdcConfig[] = Cypress.env('edcConfig');
  const edcConfig = edcConfigs[0];

  beforeEach(() => {
    cy.intercept('GET', `${Cypress.config('baseUrl')}/config/edc-connector-config.json`, {
      body: edcConfigs,
      statusCode: 200,
    });

    cy.intercept('POST', `${edcConfig.managementUrl}/v3/assets/request?`, {
      fixture: 'assets/query-200.json',
      statusCode: 200,
    }).as('exampleAssets');

    cy.intercept('POST', `${edcConfig.managementUrl}/v3/policydefinitions/request?`, {
      fixture: 'policies/query-200.json',
      statusCode: 200,
    }).as('examplePolicies');

    cy.intercept('POST', `${edcConfig.managementUrl}/v3/contractdefinitions/request?`, {
      fixture: 'contract-definitions/query-200.json',
      statusCode: 200,
    }).as('exampleContractDefs');

    cy.visit('/');
    cy.get('ul.menu button').contains('contract_edit').click();
  });

  it('expect create button to be disabled first and enabled after mandatory fields are entered', () => {
    cy.contains('Create').click();
    cy.wait('@exampleAssets').then(() => {
      cy.wait('@examplePolicies').then(() => {
        cy.contains('Create Contract Definition').should('be.disabled');

        cy.get('lib-contract-definition-create select').eq(0).select(1);
        cy.get('lib-contract-definition-create select').eq(1).select(1);

        cy.contains('Create Contract Definition').should('not.be.disabled');
      });
    });
  });

  it('expect the policy popup with no policies in the backend', () => {
    cy.intercept('POST', `${edcConfig.managementUrl}/v3/policydefinitions/request?`, {
      statusCode: 200,
      body: [],
    }).as('emptyPolicies');

    cy.contains('Create').click();
    cy.wait('@exampleAssets').then(() => {
      cy.wait('@emptyPolicies').then(() => {
        cy.get('button').contains('Policy View').should('exist');
        cy.contains('Create Contract Definition').should('be.disabled');
      });
    });
  });

  it('expect error message to be displayed on 400 backend response', () => {
    cy.intercept('POST', `${edcConfig.managementUrl}/v3/contractdefinitions?`, req => {
      req.reply({
        statusCode: 400,
        fixture: 'contract-definitions/create-400.json',
      });
    }).as('badRequestContractDefinitions');

    cy.contains('Create').click();
    cy.wait('@exampleAssets').then(() => {
      cy.wait('@examplePolicies').then(() => {
        cy.get('lib-contract-definition-create select').eq(0).select(1);
        cy.get('lib-contract-definition-create select').eq(1).select(1);

        cy.contains('Create Contract Definition').click();
        cy.wait('@badRequestContractDefinitions').then(() => {
          cy.get('.alert.alert-error').should('exist');
        });
      });
    });
  });

  it('create contract definition and check if properties are displayed correctly', () => {
    cy.intercept('POST', `${edcConfig.managementUrl}/v3/contractdefinitions?`, req => {
      req.reply({
        statusCode: 200,
        fixture: 'contract-definitions/create-200.json',
      });
    }).as('successCreate');

    cy.contains('Create').click();
    cy.wait('@exampleAssets').then(() => {
      cy.wait('@examplePolicies').then(() => {
        cy.get(`input[placeholder="ID"]`).should('have.length', 1);
        cy.get(`input[placeholder="ID"]`).type('abc');

        cy.get('lib-contract-definition-create select').eq(0).select(1);
        cy.get('lib-contract-definition-create select').eq(1).select(1);

        cy.contains('Create Contract Definition').click();

        cy.wait('@successCreate').then(() => {
          cy.wait('@exampleContractDefs').then(() => {
            cy.get('.alert.alert-success').should('exist');
            cy.get('.alert.alert-success').contains("Contract Definition with ID 'create-200'");

            cy.get('div.card-body').eq(0).as('cd_card');
            cy.get('@cd_card').contains('test-policy1');
            cy.get('@cd_card').contains('test-policy2');
          });
        });
      });
    });
  });
});
