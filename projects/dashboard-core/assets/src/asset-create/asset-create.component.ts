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
import { Asset, compact, EdcConnectorClientError, IdResponse } from '@think-it-labs/edc-connector-client';
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

type DataplaneMetadataFormValue = {
  type?: string;
  method?: string;
  baseUrl?: string;
  ttl?: number | string;
  username?: string;
  password?: string;
};

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
    this.assetForm.get('id')?.setValue(this.asset!.id);
    this.assetForm.get('name')?.setValue(this.propertyValue('name'));
    this.assetForm.get('contenttype')?.setValue(this.propertyValue('contenttype'));

    setTimeout(async () => {
      const dpm = await this.compactDataplaneMetadata();

      if (dpm) {
        this.assetForm.patchValue({
          dataplaneMetadata: {
            type: dpm['type'] || 'HttpData',
            method: dpm['method'] || 'GET',
            baseUrl: dpm['baseUrl'] || dpm['url'] || '',
            ttl: dpm['ttl'] || 600,
            username: dpm['auth.username'] || dpm['auth']?.['username'] || '',
            password: dpm['auth.password'] || dpm['auth']?.['password'] || '',
          },
        });
      }
    });
  }

  createAsset(): void {
    if (this.assetForm.valid) {
      const assetInput = this.createAssetInput();
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

  private propertyValue(key: string): JsonValue | undefined {
    const properties = this.properties as any;
    const raw =
      properties[key] ??
      properties[`edc:${key}`] ??
      properties[`asset:prop:${key}`] ??
      properties[`https://w3id.org/edc/v0.0.1/ns/${key}`];

    if (Array.isArray(raw) && raw.length === 1) {
      return raw[0]?.['@value'] ?? raw[0]?.['@id'] ?? raw[0];
    }

    return raw?.['@value'] ?? raw?.['@id'] ?? raw;
  }

  private createAssetInput(): any {
    const formValue = this.assetForm.getRawValue();
    const dataplaneMetadata = this.createDataplaneMetadataProperties(
      this.assetForm.get('dataplaneMetadata')?.value as DataplaneMetadataFormValue,
    );

    const asset: any = {
      '@context': ['https://w3id.org/edc/connector/management/v2'],
      '@type': 'Asset',
      properties: {
        ...this.properties,
      },
      privateProperties: {
        ...this.privateProperties,
      },
      dataplaneMetadata: {
        '@type': 'DataplaneMetadata',
        properties: dataplaneMetadata,
      },
    };

    if (formValue.id) {
      asset['@id'] = formValue.id;
    }
    if (formValue.name) {
      asset.properties['name'] = formValue.name;
    }
    if (formValue.contenttype) {
      asset.properties['contenttype'] = formValue.contenttype;
    }

    return asset;
  }

  private createDataplaneMetadataProperties(dpm?: DataplaneMetadataFormValue): Record<string, JsonValue> {
    const url = String(dpm?.baseUrl ?? '').trim();
    const properties: Record<string, JsonValue> = {
      type: dpm?.type || 'HttpData',
      method: dpm?.method || 'GET',
      url,
      ttl: Number(dpm?.ttl ?? 600),
    };

    if (dpm?.username && dpm.password) {
      properties['auth.type'] = 'basic';
      properties['auth.username'] = dpm.username;
      properties['auth.password'] = dpm.password;
    }

    return properties;
  }

  private async compactDataplaneMetadata(): Promise<any | undefined> {
    const raw = (this.asset as any)?.dataplaneMetadata ?? (this.properties as any)?.dataplaneMetadata;
    if (!raw) {
      return undefined;
    }

    const compacted = await compact(raw);
    return compacted?.properties?.['@value'] ?? compacted?.properties ?? raw?.properties?.['@value'] ?? raw?.properties;
  }

}