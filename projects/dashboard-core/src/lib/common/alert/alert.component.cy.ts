import { AlertComponent } from '@eclipse-edc/dashboard-core';
import { createOutputSpy, mount } from 'cypress/angular';

it('alert displayed', () => {
  mount(AlertComponent);

  cy.get('div.alert').should('exist');
});

it('hide button displayed', () => {
  mount(AlertComponent);

  cy.get('button.btn').should('exist');
});

it('hide button emits event', () => {
  mount(AlertComponent, {
    componentProperties: {
      closeEvent: createOutputSpy('closeSpy'),
    },
  });

  cy.get('button.btn').click();
  cy.get('@closeSpy').should('have.been.calledOnce');
});

it('title and msg shown', () => {
  const msg = 'Test message';
  const title = 'Test title';
  mount(AlertComponent, {
    componentProperties: {
      msg: msg,
      title: title,
    },
  });

  cy.get('h3').should('have.text', title);
  cy.contains('span', msg).should('exist');
});

it('alert type set correctly', () => {
  mount(AlertComponent, {
    componentProperties: {
      type: 'error',
    },
  });

  cy.get('div.alert-error').should('exist');
  cy.contains('span', 'error_outline').should('exist');
});
