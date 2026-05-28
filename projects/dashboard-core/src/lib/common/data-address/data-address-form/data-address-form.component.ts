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

import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataAddress } from '@think-it-labs/edc-connector-client';
import { URL_REGEX } from '../../../models/constants';

@Component({
  selector: 'lib-data-address-form',
  templateUrl: './data-address-form.component.html',
  imports: [ReactiveFormsModule, NgClass],
})
export class DataAddressFormComponent implements OnChanges, OnDestroy {
  private readonly formBuilder = inject(FormBuilder);

  private readonly destroy$ = new Subject<void>();

  @Input() showDivider = true;
  @Input() parentForm?: FormGroup;
  @Output() dataAddressChange = new EventEmitter<DataAddress>();

  private readonly FORM_GROUP_NAME = 'dataplaneMetadata';
  dataplaneMetadataForm: FormGroup;

  constructor() {
    this.dataplaneMetadataForm = this.formBuilder.group({
      type: ['HttpData', Validators.required],
      method: ['GET'],
      baseUrl: ['', [Validators.required, Validators.pattern(URL_REGEX)]],
      ttl: [600],
      username: [''],
      password: [''],
    });

    this.dataplaneMetadataForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => {
      const dataAddress = {
        type: value.type || 'HttpData',
        method: value.method || 'GET',
        baseUrl: value.baseUrl,
      } as DataAddress;
      this.dataAddressChange.emit(dataAddress);
    });
  }

  ngOnChanges() {
    this.parentForm?.setControl(this.FORM_GROUP_NAME, this.dataplaneMetadataForm);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.parentForm?.removeControl(this.FORM_GROUP_NAME);
  }
}
