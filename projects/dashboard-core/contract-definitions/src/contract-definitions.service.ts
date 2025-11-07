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
import { EdcClientService } from '@eclipse-edc/dashboard-core';
import {
  ContractDefinition,
  ContractDefinitionInput,
  IdResponse,
  PolicyDefinition,
} from '@think-it-labs/edc-connector-client';

@Injectable({
  providedIn: 'root',
})
export class ContractDefinitionsService {
  private readonly edc = inject(EdcClientService);

  /**
   * Retrieves all contract definitions from the management API.
   * @returns A promise that resolves to an array of contract definitions.
   */
  public async getAllContractDefinitions(): Promise<ContractDefinition[]> {
    return (await this.edc.getClient()).management.contractDefinitions.queryAll();
  }

  /**
   * Creates a new contract definition using the provided contract definition input.
   * @param contractDefinitionInput - The input data required to create a new contract definition.
   * @returns A promise that resolves to the ID response of the created contract definition.
   */
  public async createContractDefinition(contractDefinitionInput: ContractDefinitionInput): Promise<IdResponse> {
    return (await this.edc.getClient()).management.contractDefinitions.create(contractDefinitionInput);
  }

  /**
   * Updates an existing contract definition with the provided contract definition input.
   * @param contractDefinitionInput - The input data required to update the contract definition.
   * @returns A promise that resolves when the contract definition is successfully updated.
   */
  public async updateContractDefinition(contractDefinitionInput: ContractDefinitionInput): Promise<void> {
    return (await this.edc.getClient()).management.contractDefinitions.update(contractDefinitionInput);
  }

  /**
   * Deletes a contract definition based on the provided ID.
   * @param contractDefinition - The unique identifier of the contract definition to be deleted.
   * @returns A promise that resolves when the contract definition is successfully deleted.
   */
  public async deleteContractDefinition(contractDefinition: ContractDefinition): Promise<void> {
    return (await this.edc.getClient()).management.contractDefinitions.delete(contractDefinition.id);
  }

  // TODO: to be moved to policy service
  /**
   * Retrieves all policy definitions from the management API.
   * @returns A promise that resolves to an array of policy definitions.
   */
  public async getAllPolicies(): Promise<PolicyDefinition[]> {
    return (await this.edc.getClient()).management.policyDefinitions.queryAll();
  }
}
