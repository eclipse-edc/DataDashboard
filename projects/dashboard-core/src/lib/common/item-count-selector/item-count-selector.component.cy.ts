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
import { ItemCountSelectorComponent } from '@eclipse-edc/dashboard-core';

describe('ItemCountSelectorComponent', () => {
  it('should display the correct label', () => {
    mount(ItemCountSelectorComponent);

    cy.get('.label').should('have.text', 'Items');
  });

  it('should have the default selected item count', () => {
    const defaultCount = 10;
    mount(ItemCountSelectorComponent, {
      componentProperties: {
        currentItemCount: defaultCount,
      },
    });

    cy.get('select').should('have.value', defaultCount.toString());
  });

  it('should emit itemCountChanged event on selection change', () => {
    const itemCountChangedSpy = createOutputSpy('itemCountChangedSpy');
    mount(ItemCountSelectorComponent, {
      componentProperties: {
        itemCountChanged: itemCountChangedSpy,
      },
    });

    cy.get('select').select('15');
    cy.get('@itemCountChangedSpy').should('have.been.calledWith', 15);
  });

  it('should blur the select element after change', () => {
    mount(ItemCountSelectorComponent);

    cy.get('select').focus().select('20');
    cy.get('select').should('not.be.focused');
  });

  it('should contain all options', () => {
    mount(ItemCountSelectorComponent);

    cy.get('select option').should('have.length', 6);
    cy.get('select option').each((option, index) => {
      const values = ['5', '10', '15', '20', '50', '100'];
      cy.wrap(option).should('have.value', values[index]);
    });
  });
});
