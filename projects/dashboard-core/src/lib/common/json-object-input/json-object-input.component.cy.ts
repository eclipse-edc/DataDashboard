import { createOutputSpy, mount } from 'cypress/angular';
import { JsonObjectInputComponent } from '@eclipse-edc/dashboard-core';

describe('JsonObjectInputComponent', () => {
  it('should display the json object table if object is provided', () => {
    const testObject = { key1: 'value1', key2: 2 };
    mount(JsonObjectInputComponent, {
      componentProperties: {
        object: testObject,
      },
    });

    cy.get('lib-json-object-table').should('exist');
  });

  it('should not display the json object table if no object is provided', () => {
    mount(JsonObjectInputComponent);

    cy.get('lib-json-object-table').should('not.exist');
  });

  it('should emit objectChange event with new property when valid input is added', () => {
    const objectChangeSpy = createOutputSpy('objectChangeSpy');
    mount(JsonObjectInputComponent, {
      componentProperties: {
        object: {},
        objectChange: objectChangeSpy,
      },
    });

    cy.get('input[formControlName="key"]').type('newKey');
    cy.get('input[formControlName="value"]').type('newValue');
    cy.get('button').click();

    cy.get('@objectChangeSpy').should('have.been.calledWith', { newKey: 'newValue' });
  });

  it('should not emit objectChange event when input is invalid', () => {
    const objectChangeSpy = createOutputSpy('objectChangeSpy');
    mount(JsonObjectInputComponent, {
      componentProperties: {
        object: {},
        objectChange: objectChangeSpy,
      },
    });

    cy.get('button').click(); // No input provided

    cy.get('@objectChangeSpy').should('not.have.been.called');
  });

  //TODO: Maybe extend this function so that the other parseJson functions are being tested aswell
  it('should handle JSON string input correctly', () => {
    const objectChangeSpy = createOutputSpy('objectChangeSpy');
    mount(JsonObjectInputComponent, {
      componentProperties: {
        object: {},
        objectChange: objectChangeSpy,
      },
    });

    // Input a key
    cy.get('input[formControlName="key"]').type('jsonKey');
    // Input a JSON string, escaping curly braces
    cy.get('input[formControlName="value"]').type('jsonValue');

    // Click the button to submit the input
    cy.get('button').click();

    // Assert that the objectChange event is emitted with the correct structure
    cy.get('@objectChangeSpy').should('have.been.calledWith', { jsonKey: 'jsonValue' });
  });

  it('should delete property and emit objectChange event', () => {
    const initialObject = { key1: 'value1', key2: 'value2' };
    const objectChangeSpy = createOutputSpy('objectChangeSpy');
    mount(JsonObjectInputComponent, {
      componentProperties: {
        object: initialObject,
        objectChange: objectChangeSpy,
      },
    });

    cy.get('lib-json-object-table').find('button').first().click(); // Assuming delete button is the first one

    cy.get('@objectChangeSpy').should('have.been.calledWith', { key2: 'value2' });
  });
});
