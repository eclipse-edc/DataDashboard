describe('end-to-end', () => {
  const uuid = () => Cypress._.random(0, 1e6)
  const consumerUrl = Cypress.env('consumerUrl')
  const providerUrl = Cypress.env('providerUrl')

  it('should be accessible', () => {
    cy.visit(consumerUrl);

    cy.visit(providerUrl);
  })

  it('should create an asset and view it on provider side', function() {
    cy.visit(providerUrl);

    const id = uuid()
    const name = `asset-${id}`

    cy.get('[href="/my-assets"]').as('assets-menu-item').click();
    cy.get('#mat-input-0').as('asset-filter')
    cy.get('.container').contains('Create asset').as('open-new-asset-dialog').click();
    cy.get('#mat-input-1').as('asset-id-field').clear();
    cy.get('@asset-id-field').type(id);
    cy.get('#mat-input-2').as('asset-name-field').clear('ra');
    cy.get('@asset-name-field').type(name);
    cy.get('mat-dialog-actions').click().contains('Create').as('confirm-create-asset').click();

    cy.get('@asset-filter').click({force: true}).type(name);

    cy.get('[fxLayout="row wrap"]').as('assets-list').find('mat-card').should('have.length', 1)
  });

})
