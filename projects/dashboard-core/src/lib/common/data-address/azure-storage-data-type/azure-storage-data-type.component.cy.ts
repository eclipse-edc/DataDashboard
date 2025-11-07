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
import { AzureStorageDataTypeComponent } from '@eclipse-edc/dashboard-core';

it('should have account, container and blob path invalid on load', () => {
  mount(AzureStorageDataTypeComponent);
  cy.get('input[name="account"]').parent().should('have.class', 'input-error');
  cy.get('input[name="container"]').parent().should('have.class', 'input-error');
  cy.get('input[name="blobName"]').parent().should('have.class', 'input-error');
});

it('should emit the changed account', () => {
  mount(AzureStorageDataTypeComponent, {
    componentProperties: {
      changed: createOutputSpy('changed'),
    },
  });
  cy.get('input[name="account"]').type('storage-test');
  cy.get('@changed').should('have.been.called');
});

it('should enable multi object fields', () => {
  mount(AzureStorageDataTypeComponent);
  cy.get('input[name="blobPrefix"]').should('not.exist');
  cy.get('input[name="blobName"]').parent().should('have.class', 'input-error');

  cy.get('input[name="multi-object-switch"]').check();

  cy.get('input[name="blobPrefix"]').should('exist');
  cy.get('input[name="blobName"]').parent().should('not.have.class', 'input-error');
  cy.get('input[name="blobPrefix"]').parent().should('have.class', 'input-error');
});
