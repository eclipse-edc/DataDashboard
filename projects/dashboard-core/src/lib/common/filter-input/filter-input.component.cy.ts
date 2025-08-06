/*
 *  Copyright (c) 2025 Fraunhofer-Gesellschaft zur Förderung der angewandten Forschung e.V.
 *
 *  This program and the accompanying materials are made available under the
 *  terms of the Apache License, Version 2.0 which is available at
 *  https://www.apache.org/licenses/LICENSE-2.0
 *
 *  SPDX-License-Identifier: Apache-2.0
 *
 *  Contributors:
 *       Fraunhofer-Gesellschaft zur Förderung der angewandten Forschung e.V. - initial API and implementation
 *
 */

import { createOutputSpy, mount } from 'cypress/angular';
import { FilterInputComponent } from '@eclipse-edc/dashboard-core';

describe('FilterInputComponent', () => {
  it('should display the input field with the correct placeholder', () => {
    const placeholder = 'Search...';
    mount(FilterInputComponent, {
      componentProperties: {
        placeholder: placeholder,
      },
    });

    cy.get('input').should('exist').and('have.attr', 'placeholder', placeholder);
  });

  it('should emit inputChange event on input change', () => {
    const inputChangeSpy = createOutputSpy('inputChangeSpy');
    mount(FilterInputComponent, {
      componentProperties: {
        inputChange: inputChangeSpy,
      },
    });

    cy.get('input').type('Test input');
    cy.get('@inputChangeSpy').should('have.been.calledWith', 'Test input');
  });

  it('should display the correct number of keyboard shortcuts', () => {
    const shortcuts = ['Ctrl', 'Shift', 'A'];
    mount(FilterInputComponent, {
      componentProperties: {
        focusShortcut: shortcuts,
      },
    });

    cy.get('.kbd').should('have.length', shortcuts.length);
  });

  it('should focus the input when the shortcut keys are pressed', () => {
    const shortcuts = ['Control', 'Shift'];
    mount(FilterInputComponent, {
      componentProperties: {
        focusShortcut: shortcuts,
      },
    });

    cy.get('input').should('not.be.focused');
    cy.window().trigger('keydown', { key: 'Control' });
    cy.window().trigger('keydown', { key: 'Shift' });
    cy.get('input').should('be.focused');
  });

  it('should not focus the input if not all shortcut keys are pressed', () => {
    const shortcuts = ['Control', 'Shift'];
    mount(FilterInputComponent, {
      componentProperties: {
        focusShortcut: shortcuts,
      },
    });

    cy.get('input').should('not.be.focused');
    cy.window().trigger('keydown', { key: 'Control' });
    cy.get('input').should('not.be.focused');
  });
});
