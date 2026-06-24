/*
 *  Copyright (c) 2026 Fraunhofer-Gesellschaft zur Förderung der angewandten Forschung e.V.
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

import { Component, Type } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { mount } from 'cypress/angular';
import { AppConfig, DashboardAppComponent } from '@eclipse-edc/dashboard-core';

@Component({
  selector: 'lib-navbar-start-stub',
  standalone: true,
  template: '<span data-cy="start-widget">start-widget</span>',
})
class NavbarStartStubComponent {}

@Component({
  selector: 'lib-navbar-center-stub',
  standalone: true,
  template: '<span data-cy="center-widget">center-widget</span>',
})
class NavbarCenterStubComponent {}

@Component({
  selector: 'lib-navbar-end-stub',
  standalone: true,
  template: '<span data-cy="end-widget">end-widget</span>',
})
class NavbarEndStubComponent {}

const appConfig: AppConfig = {
  appTitle: 'Test Dashboard',
  enableUserConfig: false,
  menuItems: [
    { text: 'Home', materialSymbol: 'home', routerPath: 'home' },
    { text: 'Assets', materialSymbol: 'deployed_code_update', routerPath: 'assets' },
  ],
};

const mountDashboard = (
  navbarStartComponents: Type<unknown>[],
  navbarCenterComponents: Type<unknown>[],
  navbarEndComponents: Type<unknown>[],
) =>
  mount(DashboardAppComponent, {
    autoDetectChanges: true,
    componentProperties: {
      appConfig: Promise.resolve(appConfig),
      themes: ['light'],
      navbarStartComponents,
      navbarCenterComponents,
      navbarEndComponents,
    },
    providers: [provideRouter([]), provideHttpClient()],
  });

describe('DashboardAppComponent navbar extension', () => {
  it('renders injected components in the navbar-start region', () => {
    mountDashboard([NavbarStartStubComponent], [], []);

    cy.get('.navbar-start [data-cy="start-widget"]').should('exist');
  });

  it('renders injected components in the navbar-center region', () => {
    mountDashboard([], [NavbarCenterStubComponent], []);

    cy.get('.navbar-center [data-cy="center-widget"]').should('exist');
  });

  it('renders injected components in the navbar-end region', () => {
    mountDashboard([], [], [NavbarEndStubComponent]);

    cy.get('.navbar-end [data-cy="end-widget"]').should('exist');
  });

  it('preserves the built-in navbar content alongside injected components', () => {
    mountDashboard([NavbarStartStubComponent], [NavbarCenterStubComponent], [NavbarEndStubComponent]);

    // Built-in menu toggle button remains in the start region.
    cy.get('.navbar-start button').should('exist');
    // Built-in app title remains in the center region.
    cy.get('.navbar-center').contains('Test Dashboard').should('exist');
    // Built-in theme switcher dropdown remains in the end region.
    cy.get('.navbar-end .dropdown-end').should('exist');
  });

  it('appends injected start components after the built-in content', () => {
    mountDashboard([NavbarStartStubComponent], [], []);

    cy.get('.navbar-start').find('lib-navbar-start-stub').prevAll('button').should('exist');
  });

  it('appends injected center components after the built-in content', () => {
    mountDashboard([], [NavbarCenterStubComponent], []);

    cy.get('.navbar-center').find('lib-navbar-center-stub').prevAll().contains('Test Dashboard').should('exist');
  });

  it('renders no injected components by default', () => {
    mountDashboard([], [], []);

    cy.get('[data-cy="start-widget"]').should('not.exist');
    cy.get('[data-cy="center-widget"]').should('not.exist');
    cy.get('[data-cy="end-widget"]').should('not.exist');
    // Navbar itself still renders.
    cy.get('.navbar').should('exist');
  });
});
