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

function visitPolicyView(): void {
  cy.visit('/');
  cy.get('ul.menu button').contains('policy').click();
}

describe('policy definition view e2e tests', () => {
  const edcConfigs: EdcConfig[] = Cypress.env('edcConfig');
  const edcConfig = edcConfigs[0];

  beforeEach(() => {
    cy.intercept('GET', `${Cypress.config('baseUrl')}/config/edc-connector-config.json`, {
      body: edcConfigs,
      statusCode: 200,
    });

    cy.intercept('POST', `${edcConfig.managementUrl}/v3/policydefinitions/request?`, {
      fixture: 'policies/query-200.json',
      statusCode: 200,
    }).as('policies');

    cy.intercept('POST', `${edcConfig.managementUrl}/v3/policydefinitions?`, {
      fixture: 'policies/create-200.json',
      statusCode: 200,
    }).as('create');

    cy.intercept('PUT', `${edcConfig.managementUrl}/v3/policydefinitions/*?`, {
      statusCode: 204,
    }).as('update');

    cy.intercept('DELETE', `${edcConfig.managementUrl}/v3/policydefinitions/*`, {
      statusCode: 204,
    }).as('delete');
  });

  it('should show create policy info', () => {
    cy.intercept('POST', `${edcConfig.managementUrl}/v3/policydefinitions/request?`, {
      body: '[]',
      statusCode: 200,
    }).as('emptyPolicies');
    visitPolicyView();

    cy.get('lib-filter-input').should('have.length', 1);
    cy.get('lib-pagination')
      .should('have.length', 1)
      .find('div.join > button')
      .each($btn => {
        cy.wrap($btn).should('be.disabled');
      });
    cy.contains('button', 'Create').should('have.length', 1);

    cy.wait('@emptyPolicies').then(() => {
      cy.get('lib-policy-view .skeleton').should('exist');
      cy.get('lib-policy-view .skeleton .tooltip').should('exist');
      cy.get('lib-policy-view .skeleton button').should('contain', 'Create');
    });
  });

  it('shows cards correctly', () => {
    visitPolicyView();
    cy.wait('@policies').then(() => {
      cy.get('lib-policy-card').should('have.length.at.least', 2);
    });
  });

  it('can filter policies', () => {
    visitPolicyView();
    cy.get('lib-filter-input input').type('policy1');

    cy.get('lib-policy-card').should('have.length', 1);
  });

  it('can show details of policy', () => {
    visitPolicyView();
    cy.get('lib-policy-card').first().contains('i', 'info').click();

    cy.get('lib-jsonld-viewer').should('have.length.at.least', 1);
    cy.get('div.mockup-code').each($div => {
      cy.wrap($div).find('pre').should('exist');
    });
  });

  it('can edit policy', () => {
    visitPolicyView();
    cy.get('lib-policy-card').first().contains('i', 'edit').click();
    cy.get('lib-policy-create').contains('button', 'Update Policy').click();

    cy.wait('@update').then(() => {
      cy.wait('@policies').then(() => {
        cy.get('lib-alert .alert-success').should('exist');
      });
    });
  });

  it('can delete policy', () => {
    visitPolicyView();
    cy.get('lib-policy-card').first().contains('i', 'delete').click();
    cy.get('lib-delete-confirm').find('lib-policy-card');
    cy.get('lib-delete-confirm').contains('button', 'Delete').click();

    cy.wait('@delete').then(() => {
      cy.wait('@policies').then(() => {
        cy.get('lib-alert .alert-success').should('exist');
      });
    });
  });

  it('can cancel delete policy', () => {
    cy.intercept('DELETE', `${edcConfig.managementUrl}/v3/policydefinitions/*`, cy.spy().as('deleteSpy'));
    visitPolicyView();
    cy.get('lib-policy-card').first().contains('i', 'delete').click();
    cy.get('lib-delete-confirm').find('lib-policy-card');
    cy.get('lib-delete-confirm').contains('button', 'Cancel').click();

    cy.get('@deleteSpy').should('not.have.been.called');
    cy.get('lib-delete-confirm').should('not.exist');
    cy.get('lib-alert .alert-success').should('not.exist');
  });

  it('can create policy', () => {
    visitPolicyView();
    cy.contains('button', 'Create').click();
    cy.get('lib-policy-create').contains('button', 'Create Policy').should('be.disabled');
    cy.get('lib-policy-create select').first().select('Set');
    cy.get('lib-policy-create').contains('button', 'Create Policy').click();

    cy.wait('@create').then(() => {
      cy.wait('@policies').then(() => {
        cy.get('lib-alert .alert-success').should('exist');
      });
    });
  });
});
