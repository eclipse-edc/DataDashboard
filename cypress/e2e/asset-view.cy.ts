import { EdcConfig } from '../../projects/dashboard-core/src/lib/models/edc-config';

describe('asset view e2e tests', () => {
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
    }).as('testAssets');

    cy.intercept('POST', `${edcConfig.managementUrl}/v3/assets?`, {
      fixture: 'assets/create-200.json',
      statusCode: 200,
    }).as('createAsset');

    cy.intercept('PUT', `${edcConfig.managementUrl}/v3/assets?`, {
      statusCode: 204,
    }).as('updateAsset');

    cy.intercept('DELETE', `${edcConfig.managementUrl}/v3/assets/*`, {
      statusCode: 204,
    }).as('deleteAsset');

    cy.intercept('GET', `${edcConfig.managementUrl}/v3/dataplanes?`, {
      fixture: 'dataplanes/getAll-200.json',
      statusCode: 200,
    }).as('getDataplanes');

    cy.visit('/');
    cy.get('ul.menu button').contains('deployed_code_update').click();
  });

  it('shows view correctly with asset cards', () => {
    cy.get('lib-filter-input').should('have.length', 1);
    cy.get('lib-pagination')
      .should('have.length', 1)
      .find('div.join > button')
      .each($btn => {
        cy.wrap($btn).should('be.disabled');
      });
    cy.contains('button', 'Create').should('have.length', 1);

    cy.wait('@testAssets').then(() => {
      cy.get('lib-asset-card').should('have.length.at.least', 2);
    });
  });

  it('can filter assets', () => {
    cy.get('lib-filter-input input').type('asset1');

    cy.get('lib-asset-card').should('have.length', 1);
  });

  it('can show details of asset', () => {
    cy.get('lib-asset-card').first().contains('i', 'info').click();

    cy.get('lib-jsonld-viewer').should('have.length.at.least', 1);
    cy.get('div.mockup-code').each($div => {
      cy.wrap($div).find('pre').should('exist');
    });
  });

  it('can edit asset', () => {
    cy.get('lib-asset-card').first().contains('i', 'edit').click();
    cy.wait('@getDataplanes').then(() => {
      cy.get('lib-asset-create').contains('button', 'Update Asset').click();
    });

    cy.wait('@updateAsset').then(() => {
      cy.wait('@testAssets').then(() => {
        cy.get('lib-alert .alert-success').should('exist');
      });
    });
  });

  it('can delete asset', () => {
    cy.get('lib-asset-card').first().contains('i', 'delete').click();
    cy.get('lib-delete-confirm').find('lib-asset-card');
    cy.get('lib-delete-confirm').contains('button', 'Delete').click();

    cy.wait('@deleteAsset').then(() => {
      cy.wait('@testAssets').then(() => {
        cy.get('lib-alert .alert-success').should('exist');
      });
    });
  });

  it('can cancel delete asset', () => {
    // arrange
    cy.intercept('DELETE', `${edcConfig.managementUrl}/v3/assets/*`, cy.spy().as('deleteAssetSpy'));

    // act
    cy.get('lib-asset-card').first().contains('i', 'delete').click();
    cy.get('lib-delete-confirm').find('lib-asset-card');
    cy.get('lib-delete-confirm').contains('button', 'Cancel').click();

    // assert
    cy.get('@deleteAssetSpy').should('not.have.been.called');
    cy.get('lib-delete-confirm').should('not.exist');
    cy.get('lib-alert .alert-success').should('not.exist');
  });

  it('can create asset', () => {
    cy.contains('button', 'Create').click();
    cy.wait('@getDataplanes').then(() => {
      const createButton = cy.get('lib-asset-create').contains('button', 'Create Asset');
      cy.get('lib-asset-create select').first().select(0);
      cy.get('lib-asset-create').find('input[name="baseUrl"]').type('http://e2e');
      createButton.click();
    });

    cy.wait('@createAsset').then(() => {
      cy.wait('@testAssets').then(() => {
        cy.get('lib-alert .alert-success').should('exist');
      });
    });
  });

  it('can not create asset without data type', () => {
    cy.contains('button', 'Create').click();
    cy.get('lib-asset-create').contains('button', 'Create Asset').should('be.disabled');
  });

  it('can not create HttpData asset without baseUrl', () => {
    cy.contains('button', 'Create').click();
    cy.get('lib-asset-create select').first().select(0);
    cy.get('lib-asset-create').contains('button', 'Create Asset').should('be.disabled');
  });
});
