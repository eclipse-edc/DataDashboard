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
import { AwsS3DataTypeComponent } from '@eclipse-edc/dashboard-core';

it('should have region, bucket and object path invalid on load', () => {
  mount(AwsS3DataTypeComponent);
  cy.get('input[name="region"]').parent().should('have.class', 'input-error');
  cy.get('input[name="bucketName"]').parent().should('have.class', 'input-error');
  cy.get('input[name="objectName"]').parent().should('have.class', 'input-error');
});

it('should emit the changed region', () => {
  mount(AwsS3DataTypeComponent, {
    componentProperties: {
      changed: createOutputSpy('changed'),
    },
  });
  cy.get('input[name="region"]').type('eu-central-1');
  cy.get('@changed').should('have.been.called');
});

it('should enable multi object fields', () => {
  mount(AwsS3DataTypeComponent);
  cy.get('input[name="folderName"]').should('not.exist');
  cy.get('input[name="objectPrefix"]').should('not.exist');
  cy.get('input[name="objectName"]').parent().should('have.class', 'input-error');

  cy.get('input[name="multi-object-switch"]').check();

  cy.get('input[name="folderName"]').should('exist');
  cy.get('input[name="objectPrefix"]').should('exist');
  cy.get('input[name="objectName"]').parent().should('not.have.class', 'input-error');
});

it('should enable plain credential fields', () => {
  mount(AwsS3DataTypeComponent);
  cy.get('input[name="accessKeyId"]').should('not.exist');
  cy.get('input[name="secretAccessKey"]').should('not.exist');

  cy.get('input[name="plain-credentials-switch"]').check();

  cy.get('input[name="accessKeyId"]').should('exist');
  cy.get('input[name="secretAccessKey"]').should('exist');
});
