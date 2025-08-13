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
import { FallbackDataTypeComponent } from '@eclipse-edc/dashboard-core';

it('should change the data address', () => {
  mount(FallbackDataTypeComponent, {
    componentProperties: {
      changed: createOutputSpy('changed'),
    },
  }).then(wrapper => {
    wrapper.component.dataAddressChange({ key: 'value' });
    cy.get('@changed').should('have.been.calledOnce');
  });
});
