import { EdcConfig } from '../../projects/dashboard-core/src/lib/models/edc-config';

describe('catalog view e2e tests', () => {
  const edcConfigs: EdcConfig[] = Cypress.env('edcConfig');
  const edcConfig = edcConfigs[0];

  beforeEach(() => {
    cy.intercept('GET', `${Cypress.config('baseUrl')}/config/edc-connector-config.json`, {
      body: edcConfigs,
      statusCode: 200,
    });

    cy.intercept('POST', `${edcConfig.federatedCatalogUrl}/v1alpha/catalog/query?`, {
      fixture: 'catalog/query-200.json',
      statusCode: 200,
    }).as('dataset');

    cy.intercept('POST', `${edcConfig.managementUrl}/v3/catalog/request?`, {
      fixture: 'catalog/query-200.json',
      statusCode: 200,
    }).as('request');

    cy.intercept('POST', `${edcConfig.managementUrl}/v3/contractnegotiations?`, {
      fixture: 'negotiations/create-200.json',
      statusCode: 200,
    }).as('negotiation');

    cy.intercept('GET', `${edcConfig.managementUrl}/v3/contractnegotiations/*/state?`, {
      fixture: 'negotiations/state-finalized.json',
      statusCode: 200,
    }).as('state');

    cy.visit('/');
    cy.get('ul.menu button').contains('book_ribbon').click();
  });

  it('shows federated catalog dataset', () => {
    cy.get('lib-catalog-request').should('contain', 'Federated Catalog Enabled');
    cy.get('lib-pagination')
      .should('have.length', 1)
      .find('div.join > button')
      .each($btn => {
        cy.wrap($btn).should('be.disabled');
      });

    cy.wait('@dataset').then(() => {
      cy.get('lib-catalog-card').should('have.length.at.least', 1);
    });
  });

  it('can filter datasets', () => {
    cy.get('lib-filter-input input').type('asset1');

    cy.get('lib-catalog-card').should('have.length', 1);
  });

  it('can show details of dataset', () => {
    cy.get('lib-catalog-card').first().contains('i', 'info').click();

    cy.get('lib-jsonld-viewer').should('have.length.at.least', 1);
    cy.get('div.mockup-code').each($div => {
      cy.wrap($div).find('pre').should('exist');
    });
  });

  it('should request catalog successfully', () => {
    cy.get('lib-catalog-request .btn').click();

    cy.get('lib-catalog-request-form .btn').should('be.disabled');
    cy.get('lib-catalog-request-form input[name="counterPartyId"]').type('did:web:test');
    cy.get('lib-catalog-request-form input[name="counterPartyAddress"]').type('http://e2e');
    cy.get('lib-catalog-request-form .btn').should('be.enabled');
    cy.get('lib-catalog-request-form .btn').click();

    cy.wait('@request').then(() => {
      cy.get('lib-catalog-card').should('have.length.at.least', 1);
    });
  });

  it('should fail to request catalog', () => {
    cy.intercept('POST', `${edcConfig.managementUrl}/v3/catalog/request?`, {
      statusCode: 400,
    }).as('request');

    cy.get('lib-catalog-request .btn').click();
    cy.get('lib-catalog-request-form input[name="counterPartyId"]').type('did:web:test');
    cy.get('lib-catalog-request-form input[name="counterPartyAddress"]').type('http://e2e');
    cy.get('lib-catalog-request-form .btn').click();

    cy.wait('@request').then(() => {
      cy.get('lib-alert .alert-error').should('exist');
    });
  });

  it('should negotiate successfully', () => {
    cy.get('lib-catalog-card').contains('Negotiate').click();
    cy.get('lib-catalog-negotiation').should('exist');
    cy.get('lib-catalog-negotiation button[type="submit"]').should('be.disabled');
    cy.get('label').contains('Offer 1').click();
    cy.get('lib-catalog-negotiation button[type="submit"]').should('be.enabled');
    cy.get('lib-catalog-negotiation button[type="submit"]').click();

    cy.wait('@negotiation').then(() => {
      cy.get('lib-negotiation-progress').should('exist');
      cy.wait('@state').then(() => {
        cy.get('.btn').contains('Go to Contracts').should('exist');
      });
    });
  });

  it('should fail to negotiate', () => {
    cy.intercept('POST', `${edcConfig.managementUrl}/v3/contractnegotiations?`, {
      statusCode: 400,
    }).as('negotiation');

    cy.get('lib-catalog-card').contains('Negotiate').click();
    cy.get('label').contains('Offer 1').click();
    cy.get('lib-catalog-negotiation button[type="submit"]').click();

    cy.wait('@negotiation').then(() => {
      cy.get('lib-alert .alert-error').should('exist');
    });
  });
});
