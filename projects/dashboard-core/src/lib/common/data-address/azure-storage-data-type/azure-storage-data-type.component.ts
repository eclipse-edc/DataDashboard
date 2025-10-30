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
import { DataAddress } from '@think-it-labs/edc-connector-client';
import { NgClass } from '@angular/common';
import { ViewData } from '../../../models/view-data';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'lib-azure-storage-data-type',
  templateUrl: './azure-storage-data-type.component.html',
  imports: [ReactiveFormsModule, NgClass],
})
export class AzureStorageDataTypeComponent extends DataTypeInputComponent implements OnChanges, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  s3DataAddress: DataAddress = {
    type: 'AzureStorage',
    account: undefined,
    container: undefined,
    blobName: undefined,
    blobPrefix: undefined,
    keyName: undefined,
  };
  viewData: Map<string, ViewData> = new Map<string, ViewData>();
  multiObject = false;
  multiObjectViewData: Map<string, ViewData> = new Map<string, ViewData>();

  constructor() {
    super();

    Object.keys(this.s3DataAddress)
      .filter(it => it !== 'type')
      .forEach(key => {
        this.formGroup.addControl(key, new FormControl(undefined));
      });
    this.formGroup.get('account')?.addValidators(Validators.required);
    this.formGroup.get('container')?.addValidators(Validators.required);
    this.formGroup.get('blobName')?.addValidators(Validators.required);
    this.formGroup.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => {
      const changes = Object.fromEntries(
        Object.entries({ ...value, type: 'AzureStorage' }).filter(([key, value]) => {
          if (key == 'blobPrefix') {
            return this.multiObject && value;
          }
          return value;
        }),
      ) as DataAddress;
      this.changed.emit(changes);
    });

    this.viewData.set('account', {
      displayName: 'Account',
      icon: 'globe_location_pin',
      tooltip: 'Name of the azure storage account',
    });
    this.viewData.set('container', {
      displayName: 'Container',
      icon: 'cleaning_bucket',
      tooltip: 'Name of the storage container',
    });
    this.viewData.set('blobName', {
      displayName: 'Blob Path',
      icon: 'file_present',
      tooltip: 'Path to the blob, e.g. "some/path/blob.bin"',
    });
    this.viewData.set('keyName', {
      displayName: 'Key Name (Vault)',
      icon: 'key',
      tooltip:
        'Both, the source and destination keyName should reference a vault entry containing a storage account Access Key. This access key is used by the consumer connector to create temporary access tokens (SAS Tokens) that it passes to the provider connector. The provider connector then uses this token to transfer the data to the consumer.',
    });
    this.multiObjectViewData.set('blobPrefix', {
      displayName: 'Blob Prefix',
      icon: 'line_start_circle',
      tooltip:
        'When blobPrefix is present, transfer all blobs with names that start with the specified prefix. When blobPrefix is not present, transfer only the blob with a name matching the blobPath property. Precedence: blobPrefix takes precedence over blobPath when determining which objects to transfer. It allows for both multiple blobs transfers and fetching a single blob when necessary.',
    });
  }

  override ngOnChanges() {
    super.ngOnChanges();
    if (this.dataAddress) {
      Object.keys(this.dataAddress).forEach(key => {
        const formControl = this.formGroup.get(key);
        if (formControl) {
          formControl.setValue(this.dataAddress![key]);
        }
        if (key == 'blobPrefix') {
          this.multiObject = true;
        }
      });
    }
  }

  onMultiDataSwitch() {
    this.multiObject = !this.multiObject;
    const blobName = this.formGroup.get('blobName');
    const blobPrefix = this.formGroup.get('blobPrefix');
    if (this.multiObject) {
      blobName?.removeValidators(Validators.required);
      blobPrefix?.addValidators(Validators.required);
    } else {
      blobName?.addValidators(Validators.required);
      blobPrefix?.removeValidators(Validators.required);
    }
    blobName?.updateValueAndValidity({ emitEvent: true });
    blobPrefix?.updateValueAndValidity({ emitEvent: true });
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
