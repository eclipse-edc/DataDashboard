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
import { ConnectorConfigFormComponent, EdcConfig } from '@eclipse-edc/dashboard-core';

describe('Test ConnectorConfigFormComponent', () => {
  context('Toggling extra controls', () => {
    it('toggles federated catalog control', () => {
      mount(ConnectorConfigFormComponent);
      cy.get('input[formControlName="federatedCatalogUrl"]').should('not.exist');
      cy.get('.toggle[formControlName="federatedCatalogEnabled"]').click();
      cy.get('input[formControlName="federatedCatalogUrl"]').should('exist');
    });

    it('toggles identity hub control', () => {
      mount(ConnectorConfigFormComponent);
      cy.get('input[formControlName="did"]').should('not.exist');
      cy.get('.toggle[formControlName="identityHubEnabled"]').click();
      cy.get('input[formControlName="did"]').should('exist');
    });
  });

  context('Form validation', () => {
    it('should validate input fields', () => {
      mount(ConnectorConfigFormComponent).then(wrapper => {
        const url = 'http://test';

        expect(wrapper.component.connectorForm.valid).to.be.false;
        cy.get('input[formControlName="connectorName"]').type('test');
        cy.get('input[formControlName="managementUrl"]').type(url);
        cy.get('input[formControlName="defaultUrl"]').type(url);
        cy.get('input[formControlName="protocolUrl"]').type(url);
        cy.then(() => {
          expect(wrapper.component.connectorForm.valid).to.be.true;
        });

        cy.get('.toggle[formControlName="federatedCatalogEnabled"]').click();
        cy.then(() => {
          expect(wrapper.component.connectorForm.valid).to.be.false;
        });
        cy.get('input[formControlName="federatedCatalogUrl"]').type(url);
        cy.then(() => {
          expect(wrapper.component.connectorForm.valid).to.be.true;
        });

        cy.get('.toggle[formControlName="identityHubEnabled"]').click();
        cy.then(() => {
          expect(wrapper.component.connectorForm.valid).to.be.false;
        });
        cy.get('input[formControlName="did"]').type('did:web:test');
        cy.then(() => {
          expect(wrapper.component.connectorForm.valid).to.be.true;
        });
      });
    });
  });

  context('Form submission', () => {
    const edcConfig: EdcConfig = {
      connectorName: 'Test Connector',
      managementUrl: 'https://management.test',
      defaultUrl: 'https://default.test',
      protocolUrl: 'https://protocol.test',
      federatedCatalogEnabled: false,
    };

    const mockHealthCheck = (component: any, resolve: boolean, success: boolean) => {
      cy.stub(component.edc, 'createEdcConnectorClient').callsFake(_ => {
        return {
          observability: {
            checkHealth: () => {
              if (resolve) {
                if (success) {
                  return Promise.resolve({ isSystemHealthy: true });
                }
                return Promise.resolve({ isSystemHealthy: false });
              }
              return Promise.reject();
            },
          },
        };
      });
      cy.stub(component.stateService, 'addLocalStorageEdcConfig')
        .callsFake(() => {})
        .as('addConfig');
    };

    it('submits successfully when connector is healthy', () => {
      mount(ConnectorConfigFormComponent, {
        componentProperties: {
          created: createOutputSpy('created'),
        },
      }).then(wrapper => {
        const component = wrapper.component as any;
        mockHealthCheck(component, true, true);

        cy.then(() => {
          component.connectorForm.patchValue(edcConfig);
        });
        cy.get('button[type="submit"]').click();
        cy.get('@created').should('have.been.calledOnce');
        cy.get('@addConfig').should('have.been.calledOnce');
      });
    });

    it('shows error when connector is unhealthy', () => {
      mount(ConnectorConfigFormComponent, {
        componentProperties: {
          created: createOutputSpy('created'),
        },
      }).then(wrapper => {
        const component = wrapper.component as any;
        mockHealthCheck(component, true, false);

        cy.then(() => {
          component.connectorForm.patchValue(edcConfig);
        });
        cy.get('button[type="submit"]').click();
        cy.get('@created').should('not.have.been.called');
        cy.get('@addConfig').should('not.have.been.called');
        cy.get('lib-alert').contains('connector is unhealthy').should('exist');
      });
    });

    it('shows error when a network error occurs', () => {
      mount(ConnectorConfigFormComponent, {
        componentProperties: {
          created: createOutputSpy('created'),
        },
      }).then(wrapper => {
        const component = wrapper.component as any;
        mockHealthCheck(component, false, false);

        cy.then(() => {
          component.connectorForm.patchValue(edcConfig);
        });
        cy.get('button[type="submit"]').click();
        cy.get('@created').should('not.have.been.called');
        cy.get('@addConfig').should('not.have.been.called');
        cy.get('lib-alert').contains('reach the default API').should('exist');
      });
    });
  });
});
