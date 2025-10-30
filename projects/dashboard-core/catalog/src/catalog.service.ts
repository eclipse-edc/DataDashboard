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
  Catalog,
  ContractNegotiationState,
  Dataset,
  EdcConnectorClientError,
  EdcConnectorClientErrorType,
  IdResponse,
  PolicyBuilder,
  PolicyInput,
} from '@think-it-labs/edc-connector-client';
import { Policy } from '@think-it-labs/edc-connector-client/dist/src/entities/policy';
import { ContractNegotiationRequest } from '@think-it-labs/edc-connector-client/dist/src/entities';
import { PolicyType } from '@think-it-labs/edc-connector-client/dist/src/entities/policy/policy';
import { CatalogDataset } from './catalog-dataset';
import { CatalogRequest } from '@think-it-labs/edc-connector-client/dist/src/entities/catalog';

/**
 * Service to manage and retrieve catalogs.
 */
@Injectable({
  providedIn: 'root',
})
export class CatalogService {
  private readonly edc = inject(EdcClientService);

  /**
   * Retrieves catalogs from catalog request API.
   * @param catalogRequest - a CatalogRequest containing the counterparty address
   * @returns A promise that resolves to an array of catalog.
   */
  private async getCatalog(catalogRequest: CatalogRequest): Promise<Catalog> {
    return (await this.edc.getClient()).management.catalog.request(catalogRequest);
  }

  /**
   * Retrieves all catalogs from the federated catalog API.
   * @returns A promise that resolves to an array of catalog.
   */
  private async getAllFederatedCatalogs(): Promise<Catalog[]> {
    return (await this.edc.getClient()).federatedCatalog.queryAll();
  }

  /**
   * Initiates a contract negotiation for the given negotiation request
   * @param negotiationRequest - A ContractNegotiationRequest with counterparty address and policy
   * @returns A promise of IdResponse
   */
  public async initiateNegotiation(negotiationRequest: ContractNegotiationRequest): Promise<IdResponse> {
    return (await this.edc.getClient()).management.contractNegotiations.initiate(negotiationRequest);
  }

  /**
   * Retrieves the negotiation state for a given contract negotiation ID.
   *
   * @param {string} id - The unique identifier of the contract negotiation.
   * @return {Promise<ContractNegotiationState>} A promise resolving to the current state of the contract negotiation.
   */
  public async getNegotiationState(id: string): Promise<ContractNegotiationState> {
    return (await this.edc.getClient()).management.contractNegotiations.getState(id);
  }

  /**
   * Retrieves catalog for the given request with counterparty address
   * @param catalogRequest - A CatalogRequest with counterparty address and optional QuerySpec
   * @returns A promise that resolves to an array of CatalogDataset.
   */
  public async getCatalogDataset(catalogRequest: CatalogRequest): Promise<CatalogDataset[]> {
    try {
      const catalog: Catalog = await this.getCatalog(catalogRequest);

      return catalog.datasets.map(dataset => {
        return this.generateCatalogDataset(catalog, dataset, catalogRequest.counterPartyAddress);
      });
    } catch (error) {
      if (error instanceof EdcConnectorClientError) {
        if (error.type === EdcConnectorClientErrorType.BadRequest) {
          throw new Error('Invalid counter party address. Please check your input and try again.');
        }
      }
      throw new Error(`Failed to request catalog from '${catalogRequest.counterPartyAddress}'`);
    }
  }

  /**
   * Retrieves all federated catalogs
   * @returns A promise that resolves to an array of CatalogDataset.
   */
  public async getAllCatalogDatasets(): Promise<CatalogDataset[]> {
    const catalogs: Catalog[] = await this.getAllFederatedCatalogs();

    return catalogs.flatMap(catalog => {
      return catalog.datasets.map(dataset => {
        return this.generateCatalogDataset(catalog, dataset, catalog.mandatoryValue('edc', 'originator'));
      });
    });
  }

  /**
   * Converts the catalog and its dataset into a CatalogDataset
   * @param catalog - The catalog
   * @param dataset - The dataset included in the catalog
   * @param originator - The provider address
   * @returns a CatalogDataset instance
   */
  private generateCatalogDataset(catalog: Catalog, dataset: Dataset, originator: string): CatalogDataset {
    const participantId: string = this.getCatalogParticipantId(catalog, originator);
    const offers = this.getOfferMap(participantId, dataset);

    return {
      id: catalog.id,
      participantId: participantId,
      assetId: dataset.id,
      dataset: dataset,
      offers: offers,
      originator: originator,
    };
  }

  /**
   * Extracts the participant id of the catalog
   * @param catalog - The catalog
   * @param defaultValue - A default value to return in case of participantId is undefined
   * @returns the participant id. If undefined then returns the default value
   */
  private getCatalogParticipantId(catalog: Catalog, defaultValue: string): string {
    return catalog?.['https://w3id.org/dspace/v0.8/participantId']?.[0]?.['@value'] ?? defaultValue;
  }

  /**
   * Converts the offers associated with a dataset to a map of policies
   * @param participantId - The provider or participant's id
   * @param dataset - The dataset included in the catalog
   * @returns -  A map of policies
   */
  private getOfferMap(participantId: string, dataset: Dataset) {
    const offerMap = new Map<string, Policy>();
    const policyType: PolicyType = 'Offer';

    dataset.offers.forEach((offer, index) => {
      const policyInput: PolicyInput = {
        '@type': policyType,
        assigner: participantId,
        target: dataset.id,
      };
      const policy: Policy = new PolicyBuilder().raw(policyInput).raw(offer).build();
      offerMap.set(String(index + 1), policy);
    });
    return offerMap;
  }
}
