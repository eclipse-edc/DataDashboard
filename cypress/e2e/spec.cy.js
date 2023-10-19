describe('end-to-end', () => {
  it('should be accessible', () => {
    const consumerUrl = Cypress.env('consumerUrl')
    const providerUrl = Cypress.env('providerUrl')

    cy.visit(consumerUrl);

    cy.visit(providerUrl);
  })
})
