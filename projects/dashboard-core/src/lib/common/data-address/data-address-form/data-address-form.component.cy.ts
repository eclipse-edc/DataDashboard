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
import { FormGroup } from '@angular/forms';
import { DataAddressFormComponent, FallbackDataTypeComponent, HttpDataTypeComponent } from '@eclipse-edc/dashboard-core';

const mountComponent = () => {
  const parentForm = new FormGroup({});
  return mount(DataAddressFormComponent, {
    componentProperties: {
      parentForm: parentForm,
      dataAddressChange: createOutputSpy('dataAddressChange'),
    },
  }).then(wrapper => {
    cy.stub((wrapper.component as any).dataTypeService, 'getAllowedSourceTypes').callsFake(() =>
      Promise.resolve(new Set(['HttpData'])),
    );
  });
};

it('should initialize form', () => {
  mountComponent().then(wrapper => {
    expect(wrapper.component.dataTypeForm.get('dataType')).to.exist;
    expect(wrapper.component.parentForm!.get('dataAddress')).to.exist;
    expect(wrapper.component.parentForm!.valid).to.be.false;
    cy.get('p.text-error').contains('Mandatory').should('exist');
  });
});

it('should load http data form', () => {
  mountComponent().then(wrapper => {
    cy.stub((wrapper.component as any).dataTypeService, 'getComponent').callsFake(() => HttpDataTypeComponent);
    cy.get('select[name="dataType"]').select(0);

    cy.get('lib-http-data-type').should('exist');
    cy.get('p.text-error').contains('Mandatory').should('not.exist');

    cy.get('input[name="baseUrl"]').type('test');
    cy.get('@dataAddressChange').should('have.been.called');
  });
});

it('should load fallback data form', () => {
  mountComponent().then(wrapper => {
    cy.stub((wrapper.component as any).dataTypeService, 'getComponent').callsFake(() => FallbackDataTypeComponent);
    cy.get('select[name="dataType"]').select(0);

    cy.get('lib-fallback-data-type').should('exist');
    cy.get('p.text-error').should('not.exist');
  });
});

it('should remove from parent form on destroy', () => {
  mountComponent().then(wrapper => {
    expect(wrapper.component.parentForm!.get('dataAddress')).to.exist;
    wrapper.component.ngOnDestroy();
    expect(wrapper.component.parentForm!.get('dataAddress')).to.not.exist;
  });
});
