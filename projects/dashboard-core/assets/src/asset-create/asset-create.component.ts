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

import { Component, EventEmitter, Input, OnChanges, Output, inject } from '@angular/core';
import {
  Asset,
  AssetInput,
  BaseDataAddress,
  compact,
  DataAddress,
  EdcConnectorClientError,
  IdResponse,
} from '@think-it-labs/edc-connector-client';
import { NgClass } from '@angular/common';
import { AssetService } from '../asset.service';
import {
  AlertComponent,
  DataAddressFormComponent,
  DataTypeInputComponent,
  JsonObjectInputComponent,
  JsonObjectTableComponent,
} from '@eclipse-edc/dashboard-core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { JsonValue } from '@angular-devkit/core';

@Component({
  selector: 'lib-asset-create',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AlertComponent,
    JsonObjectTableComponent,
    NgClass,
    DataTypeInputComponent,
    JsonObjectInputComponent,
    DataAddressFormComponent,
  ],
  templateUrl: './asset-create.component.html',
  styleUrl: './asset-create.component.css',
})
export class AssetCreateComponent implements OnChanges {
  private readonly assetService = inject(AssetService);
  private readonly formBuilder = inject(FormBuilder);

  @Input() asset?: Asset;
  @Output() created = new EventEmitter<IdResponse>();
  @Output() updated = new EventEmitter<void>();
  mode: 'create' | 'update' = 'create';

  errorMsg = '';

  properties: Record<string, JsonValue> = {};
  privateProperties: Record<string, JsonValue> = {};
  dataAddress?: DataAddress;

  assetForm: FormGroup;

  constructor() {
    this.assetForm = this.formBuilder.group({
      id: [''],
      name: [''],
      contenttype: [''],
    });
  }

  async ngOnChanges() {
    if (this.asset) {
      this.mode = 'update';
      await this.updateAssetAndSyncForm();
      this.assetForm.get('id')?.disable();
    }
  }

  private async updateAssetAndSyncForm() {
    this.properties = await compact(this.asset!.properties);
    this.privateProperties = await compact(this.asset!.privateProperties);
    this.dataAddress = (await compact(this.asset!.dataAddress)) as unknown as BaseDataAddress;
    this.assetForm.get('id')?.setValue(this.asset!.id);
    this.assetForm.get('name')?.setValue(this.properties['name']);
    this.assetForm.get('contenttype')?.setValue(this.properties['contenttype']);
  }

  createAsset(): void {
    if (this.assetForm.valid) {
      const assetInput: AssetInput = this.createAssetInput();
      if (this.mode === 'create') {
        this.assetService
          .createAsset(assetInput)
          .then((idResponse: IdResponse) => {
            this.created.emit(idResponse);
          })
          .catch((err: EdcConnectorClientError) => {
            this.errorMsg = err.message;
          });
      } else if (this.mode === 'update') {
        this.assetService
          .updateAsset(assetInput)
          .then(() => this.updated.emit())
          .catch((err: EdcConnectorClientError) => (this.errorMsg = err.message));
      }
    } else {
      console.error('Create asset called with invalid form');
    }
  }

  private createAssetInput(): AssetInput {
    const asset: AssetInput = {
      dataAddress: this.dataAddress!,
      properties: this.properties,
      privateProperties: this.privateProperties,
    };
    if (this.assetForm.value.id) {
      asset['@id'] = this.assetForm.value.id;
    }
    if (this.assetForm.value.name) {
      asset.properties['name'] = this.assetForm.value.name;
    }
    if (this.assetForm.value.contenttype) {
      asset.properties['contenttype'] = this.assetForm.value.contenttype;
    }
    return asset;
  }
}
