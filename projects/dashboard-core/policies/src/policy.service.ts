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
import { IdResponse, PolicyDefinition, PolicyDefinitionInput } from '@think-it-labs/edc-connector-client';

/**
 * Service to manage and retrieve assets.
 */
@Injectable({
  providedIn: 'root',
})
export class PolicyService {
  /**
   * Constructor to initialize the PolicyService.
   * @param edc - The EDC client service used to interact with the asset management API.
   */
  constructor(private readonly edc: EdcClientService) {}

  /**
   * Retrieves all assets from the management API.
   * @returns A promise that resolves to an array of assets.
   */
  public async getAllPolicies(): Promise<PolicyDefinition[]> {
    return (await this.edc.getClient()).management.policyDefinitions.queryAll();
  }

  /**
   * Creates a new policy definition by interacting with the management API.
   *
   * @param {PolicyDefinitionInput} policyInput - The policy input data required to create the policy definition.
   * @return {Promise<IdResponse>} A promise that resolves to an IdResponse containing the unique identifier of the created policy definition.
   */
  public async createPolicyDefinition(policyInput: PolicyDefinitionInput): Promise<IdResponse> {
    return (await this.edc.getClient()).management.policyDefinitions.create(policyInput);
  }

  /**
   * Updates an existing policy definition with the specified input.
   *
   * @param {string} policyDefinitionId - The unique identifier of the policy definition to update.
   * @param {PolicyDefinitionInput} policyInput - The input containing the updated properties of the policy definition.
   * @return {Promise<IdResponse>} A promise that resolves to the response containing the identifier of the updated policy definition.
   */
  public async updatePolicy(policyDefinitionId: string, policyInput: PolicyDefinitionInput): Promise<IdResponse> {
    return (await this.edc.getClient()).management.policyDefinitions.update(policyDefinitionId, policyInput);
  }

  /**
   * Deletes a policy by its unique identifier.
   *
   * @param {string} id - The unique identifier of the policy to be deleted.
   * @return {Promise<void>} A Promise that resolves when the policy is successfully deleted.
   */
  public async deletePolicy(id: string): Promise<void> {
    return (await this.edc.getClient()).management.policyDefinitions.delete(id);
  }
}
