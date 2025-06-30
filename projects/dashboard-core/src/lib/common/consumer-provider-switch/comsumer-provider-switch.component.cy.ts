import { ConsumerProviderSwitchComponent } from '@eclipse-edc/dashboard-core'; // Adjust the import path if necessary
import { createOutputSpy, mount } from 'cypress/angular';

describe('ConsumerProviderSwitchComponent', () => {
  it('should render both options', () => {
    mount(ConsumerProviderSwitchComponent, {
      componentProperties: {
        initialType: 'CONSUMER',
      },
    });

    cy.get('input[aria-label="Consuming"]').should('exist');
    cy.get('input[aria-label="Providing"]').should('exist');
  });

  it('should check the initial type as CONSUMER', () => {
    mount(ConsumerProviderSwitchComponent, {
      componentProperties: {
        initialType: 'CONSUMER',
      },
    });

    cy.get('input[aria-label="Consuming"]').should('be.checked');
    cy.get('input[aria-label="Providing"]').should('not.be.checked');
  });

  it('should emit event when switching to PROVIDER', () => {
    const changeSpy = createOutputSpy('changeSpy');

    mount(ConsumerProviderSwitchComponent, {
      componentProperties: {
        initialType: 'CONSUMER',
        changed: changeSpy,
      },
    });

    cy.get('input[aria-label="Providing"]').check();
    cy.get('@changeSpy').should('have.been.calledWith', 'PROVIDER');
  });

  it('should emit event when switching to CONSUMER', () => {
    const changeSpy = createOutputSpy('changeSpy');

    mount(ConsumerProviderSwitchComponent, {
      componentProperties: {
        initialType: 'PROVIDER',
        changed: changeSpy,
      },
    });

    cy.get('input[aria-label="Consuming"]').check();
    cy.get('@changeSpy').should('have.been.calledWith', 'CONSUMER');
  });
});
