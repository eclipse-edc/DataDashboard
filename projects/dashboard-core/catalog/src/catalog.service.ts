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
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

/**
 * Service to manage and retrieve catalogs.
 */
@Injectable({
  providedIn: 'root',
})
export class CatalogService {
  private readonly http = inject(HttpClient);
  private readonly stateService = inject(DashboardStateService);
  private readonly edc = inject(EdcClientService);

  /**
   * Retrieves catalogs from catalog request API.
   * @param catalogRequest - a CatalogRequest containing the counterparty address
   * @returns A promise that resolves to an array of catalog.
   */
  private async getCatalog(catalogRequest: CatalogRequest): Promise<Catalog> {
    // const catalog = await firstValueFrom(
    //   this.http.post<any>(await this.managementEndpoint('/v4/catalog/request'), catalogRequest, await this.options()),
    // );
    // return this.toCatalogEntity(catalog);
    return (await this.edc.getClient()).management.catalog.request(catalogRequest);
  }

  /**
   * Retrieves all catalogs from the federated catalog API using the EDC 0.17 management v4 endpoint.
   * @returns A promise that resolves to an array of catalog.
   */
  private async getAllFederatedCatalogs(): Promise<Catalog[]> {
    const catalogs = await firstValueFrom(
      this.http.post<any[]>(
        await this.managementEndpoint('/v4/catalogs/request'),
        { '@type': 'QuerySpec' },
        await this.options(),
      ),
    );

    return catalogs.map(catalog => this.toCatalogEntity(catalog));
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
    // return firstValueFrom(
    //   this.http.get<ContractNegotiationState>(
    //     await this.managementEndpoint(`/v4/contractnegotiations/${encodeURIComponent(id)}/state`),
    //     await this.options(),
    //   ),
    // );
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

  private toCatalogEntity(rawCatalog: any): Catalog {
    const rawDatasets = this.asArray(
      rawCatalog['dcat:dataset'] ?? rawCatalog['http://www.w3.org/ns/dcat#dataset'],
    );
    const datasets = rawDatasets.filter(Boolean).map(dataset => this.toDatasetEntity(dataset));

    return {
      ...rawCatalog,
      id: rawCatalog['@id'] ?? rawCatalog.id,
      datasets,
      mandatoryValue: (_ns: string, key: string) => {
        if (key === 'originator') {
          return (
            rawCatalog['edc:originator'] ??
            rawCatalog['https://w3id.org/edc/v0.0.1/ns/originator'] ??
            rawCatalog.originator ??
            rawCatalog['@id']
          );
        }
        return this.value(rawCatalog, key);
      },
      optionalValue: (_ns: string, key: string) => this.value(rawCatalog, key),
    } as Catalog;
  }

  private toDatasetEntity(rawDataset: any): Dataset {
    const offers = this.asArray(
      rawDataset['odrl:hasPolicy'] ?? rawDataset['http://www.w3.org/ns/odrl/2/hasPolicy'],
    ).filter(Boolean);

    return {
      ...rawDataset,
      id: rawDataset['@id'] ?? rawDataset.id,
      offers,
      properties: {
        ...rawDataset,
        optionalValue: (_ns: string, key: string) => this.value(rawDataset, key),
        mandatoryValue: (_ns: string, key: string) => this.value(rawDataset, key),
      },
      optionalValue: (_ns: string, key: string) => this.value(rawDataset, key),
      mandatoryValue: (_ns: string, key: string) => this.value(rawDataset, key),
    } as Dataset;
  }

  private value(entity: any, key: string): any {
    const raw =
      entity[`edc:${key}`] ??
      entity[`asset:prop:${key}`] ??
      entity[`https://w3id.org/edc/v0.0.1/ns/${key}`] ??
      entity[key];

    if (Array.isArray(raw) && raw.length === 1) {
      return raw[0]?.['@value'] ?? raw[0]?.['@id'] ?? raw[0];
    }

    return raw?.['@value'] ?? raw?.['@id'] ?? raw;
  }

  private asArray<T>(value: T | T[] | undefined): T[] {
    if (value === undefined || value === null) {
      return [];
    }
    return Array.isArray(value) ? value : [value];
  }

  private async managementEndpoint(path: string): Promise<string> {
    const config = await firstValueFrom(this.stateService.currentEdcConfig$);
    if (!config) {
      throw new Error('No EDC configuration available.');
    }
    return `${config.managementUrl}${path}`;
  }

  private async options() {
    const config = await firstValueFrom(this.stateService.currentEdcConfig$);
    return {
      headers: config?.apiToken ? { 'x-api-key': config.apiToken } : undefined,
    };
  }

  private toIdResponse(response: any): IdResponse {
    return {
      ...response,
      id: response.id ?? response['@id'],
    } as IdResponse;
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
    console.log('[CatalogService] participantId:', participantId);

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
  // private getCatalogParticipantId(catalog: Catalog, defaultValue: string): string {
  //   return catalog?.['https://w3id.org/dspace/2025/1/participantId']?.[0]?.['@id'] ?? defaultValue;
  // }
  private getCatalogParticipantId(catalog: Catalog, defaultValue: string): string {
    return (
      catalog?.['https://w3id.org/dspace/2025/1/participantId']?.['@id'] ??
      defaultValue
    );
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
