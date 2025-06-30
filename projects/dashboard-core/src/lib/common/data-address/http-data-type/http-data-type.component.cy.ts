import { createOutputSpy, mount } from 'cypress/angular';
import { HttpDataTypeComponent } from '@eclipse-edc/dashboard-core';

it('should show enter valid url label', () => {
  mount(HttpDataTypeComponent);
  cy.get('p.text-error').contains('Enter a valid URL').should('exist');
});

it('should emit the changed base url', () => {
  mount(HttpDataTypeComponent, {
    componentProperties: {
      changed: createOutputSpy('changed'),
    },
  });
  cy.get('input[formControlName="baseUrl"]').type('http://test');
  cy.get('@changed').should('have.been.called');
  cy.get('p.text-error').should('not.exist');
});

it('should enable proxy fields', () => {
  mount(HttpDataTypeComponent);
  cy.get('input[name="proxyPath"]').should('not.exist');
  cy.get('input[type="checkbox"]').check();
  cy.get('input[name="proxyPath"]').should('exist');
});
