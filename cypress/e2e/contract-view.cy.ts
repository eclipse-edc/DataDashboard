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

function visitContractView(): void {
  cy.visit('/');
  cy.get('ul.menu button').contains('handshake').click();
}

describe('contract view e2e tests', () => {
  const edcConfigs: EdcConfig[] = Cypress.env('edcConfig');
  const edcConfig = edcConfigs[0];

  beforeEach(() => {
    cy.intercept('GET', `${Cypress.config('baseUrl')}/config/edc-connector-config.json`, {
      body: edcConfigs,
      statusCode: 200,
    });

    cy.intercept('POST', `${edcConfig.managementUrl}/v3/contractnegotiations/request?`, {
      fixture: 'contract-view/query-200.json',
      statusCode: 200,
    }).as('request');

    cy.intercept('GET', `${edcConfig.managementUrl}/v3/contractnegotiations/*/agreement?`, {
      fixture: 'contract-view/agreement-200.json',
      statusCode: 200,
    }).as('agreement');

    cy.intercept('POST', `${edcConfig.managementUrl}/v3/catalog/dataset/request?`, {
      fixture: 'contract-view/catalog-request-200.json',
      statusCode: 200,
    }).as('catalog-request');

    cy.intercept('POST', `${edcConfig.managementUrl}/v3/transferprocesses?`, {
      fixture: 'contract-view/transferprocess-200.json',
      statusCode: 200,
    }).as('transferprocess');

    cy.intercept('GET', `${edcConfig.managementUrl}/v3/transferprocesses/*?`, req => {
      if (Cypress.env('transferType') === 'push') {
        req.reply({
          fixture: 'contract-view/pushTransferprocessIdentification-200.json',
          statusCode: 200,
        });
      } else {
        req.reply({
          fixture: 'contract-view/transferprocessIdentification-200.json',
          statusCode: 200,
        });
      }
    }).as('transferprocessIdentification');

    cy.intercept('GET', `${edcConfig.managementUrl}/v3/edrs/*/dataaddress?`, {
      fixture: 'contract-view/download-200.json',
      statusCode: 200,
    }).as('download');

    cy.intercept('GET', `http://test.connector/public`, {
      fixture: 'contract-view/download-file-200.json',
      statusCode: 200,
    }).as('download-file');

    cy.intercept('GET', `${edcConfig.managementUrl}/v3/transferprocesses/*/state?`, req => {
      if (Cypress.env('transferState') === 'success') {
        if (Cypress.env('transferType') === 'push') {
          req.reply({
            fixture: 'contract-view/transferstate-completed-200.json',
            statusCode: 200,
          });
        } else {
          req.reply({
            fixture: 'contract-view/transferstate-started-200.json',
            statusCode: 200,
          });
        }
      } else {
        req.reply({
          fixture: 'contract-view/transferstate-failed-200.json',
          statusCode: 200,
        });
      }
    }).as('transferstate');
  });

  it('shows cards correctly', () => {
    visitContractView();
    cy.get('lib-filter-input').should('have.length', 1);
    cy.get('lib-consumer-provider-switch').should('exist');
    cy.get('lib-pagination')
      .should('have.length', 1)
      .find('div.join > button')
      .each($btn => {
        cy.wrap($btn).should('be.disabled');
      });
    cy.wait('@request').then(() => {
      cy.wait('@agreement').then(() => {
        cy.get('lib-contract-agreement-card').should('have.length.at.least', 1);
      });
    });
  });

  it('can filter contracts', () => {
    visitContractView();
    cy.wait('@request').then(() => {
      cy.wait('@agreement').then(() => {
        cy.get('lib-filter-input input').type('e7e700a0-348d');
        cy.get('lib-contract-agreement-card').should('have.length', 1);
      });
    });
  });

  it('can show details of contract', () => {
    visitContractView();
    cy.wait('@request').then(() => {
      cy.wait('@agreement').then(() => {
        cy.get('lib-contract-agreement-card').first().contains('i', 'info').click();
        cy.get('lib-jsonld-viewer').should('have.length.at.least', 1);
        cy.get('div.mockup-code').each($div => {
          cy.wrap($div).find('pre').should('exist');
        });
      });
    });
  });

  it('Transfer pull works', () => {
    Cypress.env('transferState', 'success');
    Cypress.env('transferType', 'pull');
    visitContractView();
    cy.wait('@request').then(() => {
      cy.wait('@agreement').then(() => {
        cy.get('lib-contract-agreement-card').first().contains('i', 'send').click();
        cy.wait('@catalog-request').then(() => {
          cy.get('select[name="transferType"]').select('HttpData-PULL');
          cy.get('lib-transfer-create').first().contains('i', 'send').click();
          cy.wait('@transferprocess').then(() => {
            cy.wait('@transferprocessIdentification').then(() => {
              cy.wait('@transferstate').then(() => {
                cy.get('lib-transfer-pull-download button').contains('download').click();
                cy.wait('@download').then(() => {
                  cy.wait('@download-file').then(interception => {
                    // @ts-ignore
                    expect(interception.response.statusCode).to.equal(200);
                    // @ts-ignore
                    expect(interception.response.headers['content-type']).to.equal('application/json');
                  });
                });
              });
            });
          });
        });
      });
    });
  });

  it('Transfer pull fail works', () => {
    Cypress.env('transferState', 'failed');
    Cypress.env('transferType', 'pull');
    visitContractView();
    cy.wait('@request').then(() => {
      cy.wait('@agreement').then(() => {
        cy.get('lib-contract-agreement-card').first().contains('i', 'send').click();
        cy.wait('@catalog-request').then(() => {
          cy.get('select[name="transferType"]').select('HttpData-PULL');
          cy.get('lib-transfer-create').first().contains('i', 'send').click();
          cy.wait('@transferprocess').then(() => {
            cy.wait('@transferprocessIdentification').then(() => {
              cy.wait('@transferstate').then(() => {
                cy.get('.alert-error').should('be.visible').and('contain', 'Error');
              });
            });
          });
        });
      });
    });
  });

  it('Transfer push works', () => {
    Cypress.env('transferState', 'success');
    Cypress.env('transferType', 'push');
    visitContractView();
    cy.wait('@request').then(() => {
      cy.wait('@agreement').then(() => {
        cy.get('lib-contract-agreement-card').first().contains('i', 'send').click();
        cy.wait('@catalog-request').then(() => {
          cy.get('select[name="transferType"]').select('HttpData-PUSH');
          cy.get('input[name="baseUrl"]').type('https://test.de');
          cy.get('lib-transfer-create').first().contains('i', 'send').click();
          cy.wait('@transferprocessIdentification').then(() => {
            cy.wait('@transferstate').then(() => {
              cy.get('ul.steps.wider-steps').within(() => {
                cy.get('li.step-success').should('have.length', 5);

                cy.contains('li.step-success', 'INITIAL').should('exist');
                cy.contains('li.step-success', 'PROVISIONED').should('exist');
                cy.contains('li.step-success', 'REQUESTED').should('exist');
                cy.contains('li.step-success', 'STARTED').should('exist');
                cy.contains('li.step-success', 'COMPLETED').should('exist');
              });
              cy.get('div.alert-error').should('not.exist');

              cy.get('span.loading.loading-bars').should('not.exist');
            });
          });
        });
      });
    });
  });

  it('Transfer push fail works', () => {
    Cypress.env('transferState', 'failed');
    Cypress.env('transferType', 'push');
    visitContractView();
    cy.wait('@request').then(() => {
      cy.wait('@agreement').then(() => {
        cy.get('lib-contract-agreement-card').first().contains('i', 'send').click();
        cy.wait('@catalog-request').then(() => {
          cy.get('select[name="transferType"]').select('HttpData-PUSH');
          cy.get('input[name="baseUrl"]').type('https://test.de');
          cy.get('lib-transfer-create').first().contains('i', 'send').click();
          cy.wait('@transferprocessIdentification').then(() => {
            cy.wait('@transferstate').then(() => {
              cy.get('.alert-error').should('be.visible').and('contain', 'Error');
            });
          });
        });
      });
    });
  });
});
