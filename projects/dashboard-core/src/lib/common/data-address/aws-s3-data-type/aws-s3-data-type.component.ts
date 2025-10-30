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
  selector: 'lib-aws-s3-data-type',
  templateUrl: './aws-s3-data-type.component.html',
  imports: [ReactiveFormsModule, NgClass],
})
export class AwsS3DataTypeComponent extends DataTypeInputComponent implements OnChanges, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  s3DataAddress: DataAddress = {
    type: 'AmazonS3',
    bucketName: undefined,
    region: undefined,
    objectName: undefined,
    objectPrefix: undefined,
    endpointOverride: undefined,
    folderName: undefined,
    keyName: undefined,
    accessKeyId: undefined,
    secretAccessKey: undefined,
  };
  viewData: Map<string, ViewData> = new Map<string, ViewData>();
  multiObject = false;
  multiObjectViewData: Map<string, ViewData> = new Map<string, ViewData>();
  plainCredentials = false;
  plainCredentialsViewData: Map<string, ViewData> = new Map<string, ViewData>();

  constructor() {
    super();

    Object.keys(this.s3DataAddress)
      .filter(it => it !== 'type')
      .forEach(key => {
        this.formGroup.addControl(key, new FormControl(undefined));
      });
    this.formGroup.get('region')?.addValidators(Validators.required);
    this.formGroup.get('bucketName')?.addValidators(Validators.required);
    this.formGroup.get('objectName')?.addValidators(Validators.required);
    this.formGroup.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => {
      const changes = Object.fromEntries(
        Object.entries({ ...value, type: 'AmazonS3' }).filter(([key, value]) => {
          if (key == 'accessKeyId' || key == 'secretAccessKey') {
            return this.plainCredentials && value;
          }
          if (key == 'folderName' || key == 'objectPrefix') {
            return this.multiObject && value;
          }
          return value;
        }),
      ) as DataAddress;
      this.changed.emit(changes);
    });

    this.viewData.set('region', {
      displayName: 'Region',
      icon: 'globe_location_pin',
      tooltip: 'In which region is the bucket located? E.g. "eu-central-1" or "us-east-1"',
    });
    this.viewData.set('bucketName', {
      displayName: 'Bucket',
      icon: 'cleaning_bucket',
      tooltip: 'Name of the S3 bucket',
    });
    this.viewData.set('objectName', {
      displayName: 'Object Path',
      icon: 'file_present',
      tooltip: 'Path to the object, e.g. "some/path/object.bin"',
    });
    this.viewData.set('endpointOverride', {
      displayName: 'Endpoint Override',
      icon: 'priority_high',
      tooltip: 'Set a custom endpoint URL',
    });
    this.viewData.set('keyName', {
      displayName: 'Key Name (Vault)',
      icon: 'key',
      tooltip: 'Key for the vault entry containing the secret token/credentials',
    });
    this.multiObjectViewData.set('folderName', {
      displayName: 'Folder Name',
      icon: 'folder',
      tooltip:
        "There are different ways to select objects by specifying a folderName and/or a objectPrefix and/or a objectPath. Objects in an S3 bucket are persisted under the same root directory (the bucket), and a structured organization is achievable by using object key prefixes. There are cases where maintaining the key prefix in the data destination is desirable but other cases where it's not. When using folderName, one can aggregate objects contained within a folder like structure. The folderName part will be removed in the destination.",
    });
    this.multiObjectViewData.set('objectPrefix', {
      displayName: 'Object Prefix',
      icon: 'line_start_circle',
      tooltip:
        'Using objectPrefix, one can aggregate objects whose key is prefixed by the specified string. The property can still be used for folder like aggregation but the prefix part will not be removed in the destination. When used in combination, both properties will be used for object selection through the concatenation of folderName with objectPrefix (folderName + objectPrefix). Similarly, the folderName part will be removed from the object name in the destination.',
    });
    this.plainCredentialsViewData.set('accessKeyId', { displayName: 'Access Key ID', icon: 'key' });
    this.plainCredentialsViewData.set('secretAccessKey', {
      displayName: 'Secret Access Key',
      icon: 'password',
      inputType: 'password',
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
        if (key == 'accessKeyId' || key == 'secretAccessKey') {
          this.plainCredentials = true;
        }
        if (key == 'folderName' || key == 'objectPrefix') {
          this.multiObject = true;
        }
      });
    }
  }

  onMultiDataSwitch() {
    this.multiObject = !this.multiObject;
    const formControl = this.formGroup.get('objectName');
    if (this.multiObject) {
      formControl?.removeValidators(Validators.required);
    } else {
      formControl?.addValidators(Validators.required);
    }
    formControl?.updateValueAndValidity({ emitEvent: true });
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
