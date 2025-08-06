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

import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output } from '@angular/core';
import { DataAddress } from '@think-it-labs/edc-connector-client';
import { FormGroup } from '@angular/forms';

@Component({
  template: '',
})
export class DataTypeInputComponent implements OnChanges, OnDestroy {
  @Input() type?: string;
  @Input() dataAddress?: DataAddress;
  @Input() parentForm?: FormGroup;
  @Output() changed = new EventEmitter<DataAddress>();

  private readonly FORM_GROUP_NAME = 'dataTypeForm';

  formGroup: FormGroup;
  constructor() {
    this.formGroup = new FormGroup({});
  }

  ngOnChanges() {
    this.parentForm?.addControl(this.FORM_GROUP_NAME, this.formGroup);
  }

  ngOnDestroy() {
    this.parentForm?.removeControl(this.FORM_GROUP_NAME);
  }
}
