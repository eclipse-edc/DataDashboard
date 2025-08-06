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

import { Injectable } from '@angular/core';
import { EdcClientService } from '@eclipse-edc/dashboard-core';
import { Asset, AssetInput, IdResponse } from '@think-it-labs/edc-connector-client';

/**
 * Service to manage and retrieve assets.
 */
@Injectable({
  providedIn: 'root',
})
export class AssetService {
  /**
   * Constructor to initialize the AssetService.
   * @param edc - The EDC client service used to interact with the asset management API.
   */
  constructor(private readonly edc: EdcClientService) {}

  /**
   * Retrieves all assets from the management API.
   * @returns A promise that resolves to an array of assets.
   */
  public async getAllAssets(): Promise<Asset[]> {
    return (await this.edc.getClient()).management.assets.queryAll();
  }

  /**
   * Creates a new asset using the provided asset input.
   * @param assetInput - The input data required to create a new asset.
   * @returns A promise that resolves to the ID response of the created asset.
   */
  public async createAsset(assetInput: AssetInput): Promise<IdResponse> {
    return (await this.edc.getClient()).management.assets.create(assetInput);
  }

  /**
   * Updates an existing asset with the provided asset input.
   * @param assetInput - The input data required to update the asset.
   * @returns A promise that resolves when the asset is successfully updated.
   */
  public async updateAsset(assetInput: AssetInput): Promise<void> {
    return (await this.edc.getClient()).management.assets.update(assetInput);
  }

  /**
   * Deletes an asset based on the provided ID.
   * @param id - The unique identifier of the asset to be deleted.
   * @returns A promise that resolves when the asset is successfully deleted.
   */
  public async deleteAsset(id: string): Promise<void> {
    return (await this.edc.getClient()).management.assets.delete(id);
  }
}
