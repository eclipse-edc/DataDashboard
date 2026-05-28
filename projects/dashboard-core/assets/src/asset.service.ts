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

import { Injectable, inject } from '@angular/core';
import { DashboardStateService, EdcClientService } from '@eclipse-edc/dashboard-core';
import { Asset, AssetInput, IdResponse } from '@think-it-labs/edc-connector-client';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

/**
 * Service to manage and retrieve assets.
 */
@Injectable({
  providedIn: 'root',
})
export class AssetService {
  private readonly http = inject(HttpClient);
  private readonly stateService = inject(DashboardStateService);
  private readonly edc = inject(EdcClientService);

  /**
   * Retrieves all assets from the management API.
   * @returns A promise that resolves to an array of assets.
   */
  // public async getAllAssets(): Promise<Asset[]> {
  //   const assets = await firstValueFrom(
  //     this.http.post<any[]>(await this.assetEndpoint('/request'), { '@type': 'QuerySpec' }, await this.options()),
  //   );
  //   return assets.map(asset => this.toAssetEntity(asset));
  // }

  public async getAllAssets(): Promise<Asset[]> {
    const client = await this.edc.getClient();
    return client.management.assets.queryAll();
  }

  // /**
  //  * Creates a new asset using the provided asset input.
  //  * @param assetInput - The input data required to create a new asset.
  //  * @returns A promise that resolves to the ID response of the created asset.
  //  */
  // public async createAsset(assetInput: AssetInput): Promise<IdResponse> {
  //   const response = await firstValueFrom(this.http.post<any>(await this.assetEndpoint(), assetInput, await this.options()));
  //   return this.toIdResponse(response);
  // }

  // /**
  //  * Updates an existing asset with the provided asset input.
  //  * @param assetInput - The input data required to update the asset.
  //  * @returns A promise that resolves when the asset is successfully updated.
  //  */
  // public async updateAsset(assetInput: AssetInput): Promise<void> {
  //   await firstValueFrom(this.http.put<void>(await this.assetEndpoint(), assetInput, await this.options()));
  // }

  // /**
  //  * Deletes an asset based on the provided ID.
  //  * @param id - The unique identifier of the asset to be deleted.
  //  * @returns A promise that resolves when the asset is successfully deleted.
  //  */
  // public async deleteAsset(id: string): Promise<void> {
  //   await firstValueFrom(this.http.delete<void>(await this.assetEndpoint(`/${encodeURIComponent(id)}`), await this.options()));
  // }

  // private toAssetEntity(rawAsset: any): Asset {
  //   const properties = rawAsset.properties ?? {};
  //   const privateProperties = rawAsset.privateProperties ?? {};

  //   return {
  //     ...rawAsset,
  //     id: rawAsset['@id'] ?? rawAsset.id,
  //     properties: this.withValueAccessors(properties),
  //     privateProperties: this.withValueAccessors(privateProperties),
  //   } as Asset;
  // }

  // private withValueAccessors(values: Record<string, any>) {
  //   return {
  //     ...values,
  //     optionalValue: <T = any>(_ns: string, key: string): T | undefined => this.value(values, key),
  //     mandatoryValue: <T = any>(_ns: string, key: string): T => this.value(values, key),
  //   };
  // }

  // private value(entity: Record<string, any>, key: string): any {
  //   const raw =
  //     entity[`edc:${key}`] ??
  //     entity[`asset:prop:${key}`] ??
  //     entity[`https://w3id.org/edc/v0.0.1/ns/${key}`] ??
  //     entity[key];

  //   if (Array.isArray(raw) && raw.length === 1) {
  //     return raw[0]?.['@value'] ?? raw[0]?.['@id'] ?? raw[0];
  //   }

  //   return raw?.['@value'] ?? raw?.['@id'] ?? raw;
  // }

  // private toIdResponse(response: any): IdResponse {
  //   return {
  //     ...response,
  //     id: response.id ?? response['@id'],
  //   } as IdResponse;
  // }

  // private async assetEndpoint(path = ''): Promise<string> {
  //   const config = await firstValueFrom(this.stateService.currentEdcConfig$);
  //   if (!config) {
  //     throw new Error('No EDC configuration available.');
  //   }
  //   return `${config.managementUrl}/v4/assets${path}`;
  // }

  // private async options() {
  //   const config = await firstValueFrom(this.stateService.currentEdcConfig$);
  //   return {
  //     headers: config?.apiToken ? { 'x-api-key': config.apiToken } : undefined,
  //   };
  // }

  public async createAsset(assetInput: AssetInput): Promise<IdResponse> {
  //  return (await this.edc.getClient()).management.assets.create(assetInput);
    const { url, options } = await this.assetEndpoint();
    return firstValueFrom(this.http.post<IdResponse>(url, assetInput, options));
  }
 
  public async updateAsset(assetInput: AssetInput): Promise<void> {
    //return (await this.edc.getClient()).management.assets.update(assetInput);
    const { url, options } = await this.assetEndpoint();
    return (await firstValueFrom(this.http.put<void>(url, assetInput, options)));
  }
  
  public async deleteAsset(id: string): Promise<void> {
    return (await this.edc.getClient()).management.assets.delete(id);
  
  }

  private async assetEndpoint() {
    const config = await firstValueFrom(this.stateService.currentEdcConfig$);
    if (!config) {
      throw new Error('No EDC configuration available.');
    }

    return {
      url: `${config.managementUrl}/v4/assets`,
      options: {
        headers: config.apiToken ? { 'x-api-key': config.apiToken } : undefined,
      },
    };
  }

}
