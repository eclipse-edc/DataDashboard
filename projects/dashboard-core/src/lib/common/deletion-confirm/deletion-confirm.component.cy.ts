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

import { DeleteConfirmComponent } from '@eclipse-edc/dashboard-core'; // Adjust the import path if necessary
import { createOutputSpy, mount } from 'cypress/angular';

describe('DeleteConfirmComponent', () => {
  it('should render with default text', () => {
    mount(DeleteConfirmComponent);

    cy.get('h1').should('have.text', 'Do you want to delete this item?');
  });

  it('should render with custom text', () => {
    mount(DeleteConfirmComponent, {
      componentProperties: {
        customText: 'Are you sure you want to remove this item?',
      },
    });

    cy.get('h1').should('have.text', 'Are you sure you want to remove this item?');
  });

  it('should emit canceled event when Cancel button is clicked', () => {
    const canceledSpy = createOutputSpy('canceled');

    mount(DeleteConfirmComponent, {
      componentProperties: {
        canceled: canceledSpy,
      },
    });

    cy.get('button.btn').contains('Cancel').click();
    cy.get('@canceled').should('have.been.called'); // Check if the canceled event was emitted
  });

  it('should emit confirm event when Delete button is clicked', () => {
    const confirmSpy = createOutputSpy('confirm');

    mount(DeleteConfirmComponent, {
      componentProperties: {
        confirm: confirmSpy,
      },
    });

    cy.get('button.btn.btn-error').contains('Delete').click();
    cy.get('@confirm').should('have.been.called'); // Check if the confirm event was emitted
  });
});
