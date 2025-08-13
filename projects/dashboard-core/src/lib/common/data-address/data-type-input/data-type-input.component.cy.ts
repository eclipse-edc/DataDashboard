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

import { mount } from 'cypress/angular';
import { FormGroup } from '@angular/forms';
import { DataTypeInputComponent } from '@eclipse-edc/dashboard-core';

it('should add the form control on ngOnChanges', () => {
  const parentForm = new FormGroup({});
  mount(DataTypeInputComponent, {
    componentProperties: { parentForm },
  });
  expect(parentForm.get('dataTypeForm')).to.exist;
});

it('should remove the form control on ngOnDestroy', () => {
  const parentForm = new FormGroup({});
  mount(DataTypeInputComponent, {
    componentProperties: { parentForm },
  }).then(wrapper => {
    wrapper.component.ngOnDestroy();
    expect(parentForm.get('dataTypeForm')).to.be.null;
  });
});
