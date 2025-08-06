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
import { JsonObjectTableComponent } from '@eclipse-edc/dashboard-core';

describe('JsonObjectTableComponent', () => {
  it('should display the table when there are keys in the object', () => {
    const testObject = { key1: 'value1', key2: 'value2' };
    mount(JsonObjectTableComponent, {
      componentProperties: {
        object: testObject,
      },
    });

    cy.get('table').should('exist');
    cy.get('tbody tr').should('have.length', 2);
  });

  it('should not display the table when there are no keys', () => {
    mount(JsonObjectTableComponent, {
      componentProperties: {
        object: {},
      },
    });

    cy.get('table').should('not.exist');
  });

  it('should display the correct keys and values', () => {
    const testObject = { key1: 'value1', key2: 'value2' };
    mount(JsonObjectTableComponent, {
      componentProperties: {
        object: testObject,
      },
    });

    cy.get('tbody tr').eq(0).find('td').eq(0).should('have.text', 'key1');
    cy.get('tbody tr').eq(0).find('td').eq(1).should('have.text', '"value1"');
    cy.get('tbody tr').eq(1).find('td').eq(0).should('have.text', 'key2');
    cy.get('tbody tr').eq(1).find('td').eq(1).should('have.text', '"value2"');
  });

  it('should exclude specified keys', () => {
    const testObject = { key1: 'value1', key2: 'value2', key3: 'value3' };
    mount(JsonObjectTableComponent, {
      componentProperties: {
        object: testObject,
        excludeKeys: ['key2'],
      },
    });

    cy.get('tbody tr').should('have.length', 2);
    cy.get('tbody tr').eq(0).find('td').eq(0).should('have.text', 'key1');
    cy.get('tbody tr').eq(1).find('td').eq(0).should('have.text', 'key3');
  });

  it('should display delete button when deleteButton is true', () => {
    const testObject = { key1: 'value1' };
    mount(JsonObjectTableComponent, {
      componentProperties: {
        object: testObject,
        deleteButton: true,
      },
    });

    cy.get('tbody tr').find('button').should('exist');
  });

  it('should emit delete event with correct key when delete button is clicked', () => {
    const testObject = { key1: 'value1', key2: 'value2' };
    const deleteSpy = createOutputSpy('deleteSpy');
    mount(JsonObjectTableComponent, {
      componentProperties: {
        object: testObject,
        deleteButton: true,
        delete: deleteSpy,
      },
    });

    cy.get('tbody tr').first().find('button').click();
    cy.get('@deleteSpy').should('have.been.calledWith', 'key1');
  });
});
