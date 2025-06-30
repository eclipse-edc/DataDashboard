import { createOutputSpy, mount } from 'cypress/angular';
import { MultiselectWithSearchComponent } from '@eclipse-edc/dashboard-core';

describe('MultiselectWithSearchComponent', () => {
  const testItems = ['Option 1', 'Option 2', 'Option 3'];

  it('should initialize with given items', () => {
    mount(MultiselectWithSearchComponent, {
      componentProperties: {
        items: testItems,
      },
    });

    cy.get('input[type="text"]').click();

    cy.get('ul label').should('have.length', testItems.length);
    cy.get('ul label').first().should('contain.text', 'Option 1');
  });

  it('should filter options based on search input', () => {
    mount(MultiselectWithSearchComponent, {
      componentProperties: {
        items: testItems,
      },
    });

    cy.get('input[type="text"]').type('Option 1');
    cy.get('ul label').should('have.length', 1);
    cy.get('ul label').should('contain.text', 'Option 1');
  });

  it('should show all options when search input is cleared', () => {
    mount(MultiselectWithSearchComponent, {
      componentProperties: {
        items: testItems,
      },
    });

    cy.get('input[type="text"]').type('Option 1');
    cy.get('ul label').should('have.length', 1);

    cy.get('input[type="text"]').clear();
    cy.get('ul label').should('have.length', testItems.length);
  });

  it('should select and unselect options on checkbox click', () => {
    mount(MultiselectWithSearchComponent, {
      componentProperties: {
        items: testItems,
        selectedItemsChange: createOutputSpy('change'),
      },
    });

    // Ensure the dropdown is open or the checkboxes are visible
    cy.get('input[type="text"]').click();

    // Check the first checkbox
    cy.get('input[type="checkbox"]').first().check({ force: true }); // Using force to bypass visibility check
    cy.get('input[type="checkbox"]').first().should('be.checked');
    cy.get('@change').should('have.been.calledOnceWithExactly', ['Option 1']);

    // Uncheck the first checkbox
    cy.get('input[type="checkbox"]').first().uncheck({ force: true });
    cy.get('input[type="checkbox"]').first().should('not.be.checked');
    cy.get('@change').should('have.been.calledWithExactly', []);
  });

  it('should handle pre selected items', () => {
    mount(MultiselectWithSearchComponent, {
      componentProperties: {
        items: testItems,
        preSelectedItems: testItems.slice(0, 2),
        selectedItemsChange: createOutputSpy('changed'),
      },
    });
    // Ensure the dropdown is open or the checkboxes are visible
    cy.get('input[type="text"]').click();

    cy.get('ul label').each((element, index) => {
      if (index < 2) {
        cy.wrap(element).find('input').should('be.checked');
      } else {
        cy.wrap(element).find('input').should('not.be.checked');
      }
    });

    cy.get('@changed').should('not.have.been.called');
  });
});
