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
import { PaginationComponent } from '@eclipse-edc/dashboard-core';

describe('PaginationComponent', () => {
  const testItems = Array.from({ length: 25 }, (_, i) => `Item ${i + 1}`);

  it('should calculate total pages correctly on initialization', () => {
    mount(PaginationComponent, {
      componentProperties: {
        items: testItems,
        pageItemCount: 10,
      },
    });

    cy.get('button').contains('Page 1 of 3').should('exist');
  });

  it('should emit the correct items for the current page', () => {
    const pageItemsSpy = createOutputSpy('pageItemsSpy');
    mount(PaginationComponent, {
      componentProperties: {
        items: testItems,
        pageItemCount: 10,
        pageItems: pageItemsSpy,
      },
    });

    cy.get('@pageItemsSpy').should('have.been.calledWith', testItems.slice(0, 10)); // First page items
  });

  it('should go to the next page and emit items', () => {
    const pageItemsSpy = createOutputSpy('pageItemsSpy');
    mount(PaginationComponent, {
      componentProperties: {
        items: testItems,
        pageItemCount: 10,
        pageItems: pageItemsSpy,
      },
    });

    cy.get('button').contains('»').click(); // Click next button
    cy.get('@pageItemsSpy').should('have.been.calledWith', testItems.slice(10, 20)); // Second page items
  });

  it('should go back to the previous page and emit items', () => {
    const pageItemsSpy = createOutputSpy('pageItemsSpy');
    mount(PaginationComponent, {
      componentProperties: {
        items: testItems,
        pageItemCount: 10,
        pageItems: pageItemsSpy,
      },
    });

    cy.get('button').contains('»').click(); // Click next button to go to second page
    cy.get('button').contains('«').click(); // Click back button
    cy.get('@pageItemsSpy').should('have.been.calledWith', testItems.slice(0, 10)); // First page items
  });

  it('should jump to a specific page and emit items', () => {
    const pageItemsSpy = createOutputSpy('pageItemsSpy');
    mount(PaginationComponent, {
      componentProperties: {
        items: testItems,
        pageItemCount: 10,
        pageItems: pageItemsSpy,
      },
    });

    cy.get('button').contains('Page 1 of 3').click(); // Click to open dropdown
    cy.get('li').contains('Page 2').click(); // Jump to page 2
    cy.get('@pageItemsSpy').should('have.been.calledWith', testItems.slice(10, 20)); // Second page items
  });

  it('should disable the buttons appropriately', () => {
    mount(PaginationComponent, {
      componentProperties: {
        items: testItems,
        pageItemCount: 10,
      },
    });

    cy.get('button').contains('«').should('be.disabled'); // First page, back button should be disabled
    cy.get('button').contains('»').should('not.be.disabled'); // Next button should not be disabled

    cy.get('button').contains('»').click(); // Go to second page
    cy.get('button').contains('»').should('not.be.disabled'); // Next button should still be active
    cy.get('button').contains('«').should('not.be.disabled'); // Back button should now be active

    cy.get('button').contains('»').click(); // Go to last page
    cy.get('button').contains('»').should('be.disabled'); // Next button should be disabled on the last page
  });
});
