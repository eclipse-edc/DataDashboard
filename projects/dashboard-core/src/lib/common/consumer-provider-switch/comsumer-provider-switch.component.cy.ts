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

import { ConsumerProviderSwitchComponent } from '@eclipse-edc/dashboard-core'; // Adjust the import path if necessary
import { createOutputSpy, mount } from 'cypress/angular';

describe('ConsumerProviderSwitchComponent', () => {
  it('should render both options', () => {
    mount(ConsumerProviderSwitchComponent, {
      componentProperties: {
        initialType: 'CONSUMER',
      },
    });

    cy.get('input[aria-label="Consuming"]').should('exist');
    cy.get('input[aria-label="Providing"]').should('exist');
  });

  it('should check the initial type as CONSUMER', () => {
    mount(ConsumerProviderSwitchComponent, {
      componentProperties: {
        initialType: 'CONSUMER',
      },
    });

    cy.get('input[aria-label="Consuming"]').should('be.checked');
    cy.get('input[aria-label="Providing"]').should('not.be.checked');
  });

  it('should emit event when switching to PROVIDER', () => {
    const changeSpy = createOutputSpy('changeSpy');

    mount(ConsumerProviderSwitchComponent, {
      componentProperties: {
        initialType: 'CONSUMER',
        changed: changeSpy,
      },
    });

    cy.get('input[aria-label="Providing"]').check();
    cy.get('@changeSpy').should('have.been.calledWith', 'PROVIDER');
  });

  it('should emit event when switching to CONSUMER', () => {
    const changeSpy = createOutputSpy('changeSpy');

    mount(ConsumerProviderSwitchComponent, {
      componentProperties: {
        initialType: 'PROVIDER',
        changed: changeSpy,
      },
    });

    cy.get('input[aria-label="Consuming"]').check();
    cy.get('@changeSpy').should('have.been.calledWith', 'CONSUMER');
  });
});
