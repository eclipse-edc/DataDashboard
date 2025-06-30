import { EdcConfig } from '../../projects/dashboard-core/src/lib/models/edc-config';


describe('transfer history view e2e tests', () => {
  const edcConfigs: EdcConfig[] = Cypress.env('edcConfig');
  const edcConfig = edcConfigs[0];

  beforeEach(() => {
    cy.intercept('GET', `${Cypress.config('baseUrl')}/config/edc-connector-config.json`, {
      body: edcConfigs,
      statusCode: 200,
    });
    //What to intercept here?
    cy.intercept('POST', `${edcConfig.federatedCatalogUrl}/v1alpha/transferprocesses/query?`, {
      fixture: 'transfer-history/query-200.json',
      statusCode: 200,
    }).as('dataset');
    //What to intercept here?
    cy.intercept('POST', `${edcConfig.managementUrl}/v3/transferprocesses/request?`, {
      fixture: 'transfer-history/query-200.json',
      statusCode: 200,
    }).as('request');

    cy.intercept('POST', `${edcConfig.managementUrl}/v3/transferprocesses/*/deprovision?`, {
      statusCode: 204,
    }).as('deprovision');

    cy.visit('/');
    cy.get('ul.menu button').contains('schedule_send').click();
  });


  it('shows transfers correctly', () => {
    cy.get('lib-filter-input').should('have.length', 1);
    cy.get('lib-pagination')
      .should('have.length', 1)
      .find('div.join > button')
      .each($btn => {
        cy.wrap($btn).should('be.disabled');
      });
    cy.wait('@request').then(() => {
      cy.get('lib-transfer-history-table tbody tr').eq(0).find('td').eq(0).should('exist')
        .and('contain', '48555095-d63f-498f-92d2-9cdde9fe92db');
    });

    cy.get('lib-transfer-history-table tbody tr').eq(0).find('td').eq(2)
      .should('contain', 'TERMINATED');

    cy.get('lib-transfer-history-table tbody tr').eq(1).find('td').eq(2)
      .should('contain', 'SUCCESSFULL');
  });

  it('can filter transfers', () => {
    cy.get('lib-filter-input input').type('48555095');

    cy.wait('@request').then(() => {
      cy.get('lib-transfer-history-table tbody tr td').first().should('exist')
        .and('contain', '48555095-d63f-498f-92d2-9cdde9fe92db');
      cy.get('lib-transfer-history-table tbody tr').should('have.length', 1);
    });
  });

  it('can show details of transfer', () => {
    cy.get('lib-transfer-history-table').first().contains('i', 'info').click();

    cy.get('lib-json-object-table').should('have.length.at.least', 1);
    cy.get('lib-transfer-history-details').contains('TERMINATED').should('exist');

    cy.contains('legend', 'Properties')
        .parent()
        .within(() => {
          cy.get('lib-json-object-table').should('exist');
          cy.contains('tr', '@id')
              .within(() => {
                cy.contains('td', '48555095-d63f-498f-92d2-9cdde9fe92db').should('exist');
              });
        });

    cy.contains('legend', 'Data Destination')
        .parent()
        .within(() => {
          cy.get('lib-json-object-table').should('exist');
          cy.contains('tr', 'baseUrl')
              .within(() => {
                cy.contains('td', 'http://mockserver:1080/receive-data').should('exist');
              });
        });
  });

  it('can delete transfer', () => {
    cy.get('lib-transfer-history-table').first().contains('i', 'delete').click();
    cy.get('lib-delete-confirm').contains('button', 'Delete').click();

    cy.wait('@deprovision').then(() => {
      cy.wait('@request').then(() => {
        cy.get('lib-alert .alert-success').should('exist');
      });
    });
  });

  it('can cancel deprivision of transfer', () => {
    cy.intercept('DELETE', `$edcConfig.managementUrl}/v3/transferprocesses/*/deprovision`, cy.spy().as('deleteSpy'));
    cy.get('lib-transfer-history-table').first().contains('i', 'delete').click();
    cy.get('lib-delete-confirm').contains('button', 'Cancel').click();

    cy.get('@deleteSpy').should('not.have.been.called');
    cy.get('lib-delete-confirm').should('not.exist');
    cy.get('lib-alert .alert-success').should('not.exist');
  });

});
