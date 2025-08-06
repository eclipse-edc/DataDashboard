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

import { Component, OnChanges, OnDestroy } from '@angular/core';
import { DataTypeInputComponent } from '../data-type-input/data-type-input.component';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpDataAddress } from '@think-it-labs/edc-connector-client';
import { NgClass } from '@angular/common';
import { ViewData } from '../../../models/view-data';
import { Subject, takeUntil } from 'rxjs';
import { URL_REGEX } from '../../../models/constants';

@Component({
  selector: 'lib-http-data-type',
  templateUrl: './http-data-type.component.html',
  imports: [ReactiveFormsModule, NgClass],
})
export class HttpDataTypeComponent extends DataTypeInputComponent implements OnChanges, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  httpDataAddress: HttpDataAddress = {
    type: 'HttpData',
    method: '',
    baseUrl: '',
    path: undefined,
    authKey: undefined,
    authCode: undefined,
    secretName: undefined,
    proxyBody: undefined,
    proxyPath: undefined,
    proxyQueryParams: undefined,
    proxyMethod: undefined,
  };
  viewData: Map<string, ViewData> = new Map<string, ViewData>();
  proxy = false;
  proxyViewData: Map<string, ViewData> = new Map<string, ViewData>();

  constructor() {
    super();

    Object.keys(this.httpDataAddress)
      .filter(it => it !== 'type')
      .forEach(key => {
        this.formGroup.addControl(key, new FormControl(undefined));
      });
    this.formGroup.get('baseUrl')?.addValidators([Validators.required, Validators.pattern(URL_REGEX)]);
    this.formGroup.get('method')?.setValue('GET');
    this.formGroup.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => {
      const changes = Object.fromEntries(
        Object.entries({ ...value, type: 'HttpData' }).filter(([key, value]) => {
          if (key.includes('proxy')) {
            return this.proxy && value;
          }
          return value;
        }),
      ) as HttpDataAddress;
      this.changed.emit(changes);
    });

    this.viewData.set('path', { displayName: 'Path', icon: 'link' });
    this.viewData.set('authKey', { displayName: 'Auth Key', icon: 'key' });
    this.viewData.set('authCode', { displayName: 'Auth Code', icon: 'password', inputType: 'password' });
    this.viewData.set('secretName', { displayName: 'Secret Name', icon: 'lock' });
    this.proxyViewData.set('proxyMethod', { displayName: 'Proxy Method', icon: 'http' });
    this.proxyViewData.set('proxyPath', { displayName: 'Proxy Path', icon: 'lan' });
    this.proxyViewData.set('proxyBody', { displayName: 'Proxy Body', icon: 'draft' });
    this.proxyViewData.set('proxyQueryParams', { displayName: 'Proxy Query Params', icon: 'data_array' });
  }

  override ngOnChanges() {
    super.ngOnChanges();
    if (this.dataAddress) {
      Object.keys(this.dataAddress).forEach(key => {
        const formControl = this.formGroup.get(key);
        if (formControl) {
          formControl.setValue(this.dataAddress![key]);
        }
        if (key.includes('proxy') && this.dataAddress![key]) {
          this.proxy = true;
        }
      });
    }
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
