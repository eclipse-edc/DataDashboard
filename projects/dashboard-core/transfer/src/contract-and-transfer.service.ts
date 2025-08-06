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
import {
  compact,
  ContractAgreement,
  ContractNegotiation,
  Dataset,
  DatasetRequest,
  IdResponse,
  QuerySpec,
  TransferProcess,
  TransferProcessInput,
  TransferProcessState,
} from '@think-it-labs/edc-connector-client';
import { Observable } from 'rxjs';
import { HttpClient, HttpEvent } from '@angular/common/http';

/**
 * Service that provides functionalities for managing contract negotiations, agreements, and data transfers.
 * This service interacts with the EDC client for managing the lifecycle and retrieval of contracts and data transfer processes.
 */
@Injectable({
  providedIn: 'root',
})
export class ContractAndTransferService {
  /**
   * Constructor to initialize the ContractAgreementService.
   * @param edc - The EDC client service used to interact with the contract agreement management API.
   * @param http - Angular HTTP client
   */
  constructor(
    private readonly edc: EdcClientService,
    private readonly http: HttpClient,
  ) {}

  /**
   * Retrieves all contract negotiations based on the optional query specification.
   *
   * @param {QuerySpec} [querySpec] - Optional query parameters to filter the contract negotiations.
   * @return {Promise<ContractNegotiation[]>} A promise that resolves to an array of contract negotiations.
   */
  public async getAllContractNegotiations(querySpec?: QuerySpec): Promise<ContractNegotiation[]> {
    return (await this.edc.getClient()).management.contractNegotiations.queryAll(querySpec);
  }

  /**
   * Retrieves the contract agreement for a given negotiation ID.
   *
   * @param {string} negotiationId - The unique identifier of the negotiation for which the agreement is to be retrieved.
   * @return {Promise<ContractAgreement>} A promise that resolves to the contract agreement associated with the given negotiation ID.
   */
  public async getAgreementForNegotiation(negotiationId: string): Promise<ContractAgreement> {
    return (await this.edc.getClient()).management.contractNegotiations.getAgreement(negotiationId);
  }

  /**
   * Retrieves all contract agreements based on the provided query specifications.
   *
   * @param {QuerySpec} [querySpec] - Optional query specifications to filter contract agreements.
   * @return {Promise<ContractAgreement[]>} A promise that resolves to an array of contract agreements.
   */
  public async getAllContractAgreements(querySpec?: QuerySpec): Promise<ContractAgreement[]> {
    return (await this.edc.getClient()).management.contractAgreements.queryAll(querySpec);
  }

  /**
   * Retrieves a contract agreement by its unique identifier.
   *
   * @param {string} id - The unique identifier of the contract agreement to retrieve.
   * @return {Promise<ContractAgreement>} A promise that resolves to the contract agreement object.
   */
  public async getContractAgreement(id: string): Promise<ContractAgreement> {
    return (await this.edc.getClient()).management.contractAgreements.get(id);
  }

  /**
   * Retrieves the contract negotiation associated with the given agreement ID.
   *
   * @param {string} agreementId - The unique identifier of the contract agreement.
   * @return {Promise<ContractNegotiation>} A promise that resolves to the contract negotiation details.
   */
  public async getNegotiationByAgreement(agreementId: string): Promise<ContractNegotiation> {
    return (await this.edc.getClient()).management.contractAgreements.getNegotiation(agreementId);
  }

  /**
   * Retrieves the possible transfer types for a given contract agreement and negotiation.
   *
   * @param {ContractAgreement} agreement - The contract agreement containing details relevant to the transfer.
   * @param {ContractNegotiation} negotiation - The contract negotiation containing additional context for the transfer.
   * @return {Promise<string[]>} A promise that resolves to an array of strings representing the possible transfer types.
   */
  public async getPossibleTransferTypes(
    agreement: ContractAgreement,
    negotiation: ContractNegotiation,
  ): Promise<string[]> {
    const dataset = await this.getDataset(agreement, negotiation);
    return Promise.resolve(
      dataset.array('dcat', 'distribution').map(distribution => {
        // ToDo: why 'dct' unsupported?
        // return distribution.nested('dct', 'format').mandatoryValue('edc', 'id');
        // const compacted = await compact(distribution);
        return distribution['http://purl.org/dc/terms/format'][0]['@id'];
      }),
    );
  }

  /**
   * Retrieves a dataset based on the provided contract agreement and negotiation details.
   *
   * @param {ContractAgreement} agreement - The contract agreement containing the dataset's asset details.
   * @param {ContractNegotiation} negotiation - The contract negotiation containing the counterparty address.
   * @param {boolean} [compacted=false] - Indicates whether the dataset should be returned in a compacted format.
   * @return {Promise<Dataset>} A promise that resolves to the requested dataset. Rejects if no counterparty address is found in the negotiation.
   */
  public async getDataset(
    agreement: ContractAgreement,
    negotiation: ContractNegotiation,
    compacted = false,
  ): Promise<Dataset> {
    // ToDo: Why is counterPartyAddress undefined otherwise?
    if (negotiation.counterPartyAddress) {
      const datasetRequest: DatasetRequest = {
        '@id': agreement.assetId,
        counterPartyAddress: negotiation.counterPartyAddress,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (datasetRequest as any).counterPartyId = agreement.providerId;
      const dataset = (await this.edc.getClient()).management.catalog.requestDataset(datasetRequest);
      if (compacted) {
        return compact(await dataset);
      }
      return dataset;
    } else {
      return Promise.reject(new Error('No counter party address in negotiation found'));
    }
  }

  /**
   * Downloads a dataset based on the provided transfer ID.
   *
   * @param {string} transferId - The unique identifier for the dataset transfer.
   * @return {Promise<Observable<HttpEvent<Blob>>>} - A promise resolving to an Observable that emits HttpEvent objects
   *   for the Blob being downloaded, with progress tracking capabilities.
   * @throws {Error} - Throws an error if no EDR (Endpoint Data Reference) is found for the provided transfer ID.
   */
  public async downloadDataset(transferId: string): Promise<Observable<HttpEvent<Blob>>> {
    const edr = await (await this.edc.getClient()).management.edrs.dataAddress(transferId);
    if (!edr) {
      throw new Error('No EDR found for transfer ID ' + transferId);
    }
    return this.http.get(edr.mandatoryValue<string>('edc', 'endpoint'), {
      headers: {
        Authorization: edr.mandatoryValue<string>('edc', 'authorization'),
      },
      responseType: 'blob',
      reportProgress: true,
      observe: 'events',
    });
  }

  /**
   * Initiates a transfer process using the provided transfer input.
   *
   * @param {TransferProcessInput} transferInput - The input parameters required to initiate the transfer process.
   * @return {Promise<IdResponse>} A promise resolving to an object containing the ID of the initiated transfer process.
   */
  public async initiateTransferProcess(transferInput: TransferProcessInput): Promise<IdResponse> {
    return (await this.edc.getClient()).management.transferProcesses.initiate(transferInput);
  }

  /**
   * Retrieves all transfer processes based on the given query specification.
   *
   * @param {QuerySpec} [querySpec] - An optional parameter to define query specifications for filtering transfer processes.
   * @return {Promise<TransferProcess[]>} A promise that resolves to an array of TransferProcess objects.
   */
  public async getAllTransferProcesses(querySpec?: QuerySpec): Promise<TransferProcess[]> {
    return (await this.edc.getClient()).management.transferProcesses.queryAll(querySpec);
  }

  /**
   * Retrieves the details of a transfer process by its identifier.
   *
   * @param {string} id - The unique identifier of the transfer process to retrieve.
   * @return {Promise<TransferProcess>} A promise that resolves to the transfer process details.
   */
  public async getTransferProcess(id: string): Promise<TransferProcess> {
    return (await this.edc.getClient()).management.transferProcesses.get(id);
  }

  /**
   * Retrieves the state of a transfer process by its unique identifier.
   *
   * @param {string} id - The unique identifier of the transfer process.
   * @return {Promise<TransferProcessState>} A promise resolving to the state of the transfer process.
   */
  public async getTransferProcessState(id: string): Promise<TransferProcessState> {
    return (await this.edc.getClient()).management.transferProcesses.getState(id);
  }

  public async deprovisionTransferProcess(id: string): Promise<void> {
    return (await this.edc.getClient()).management.transferProcesses.deprovision(id);
  }
}
