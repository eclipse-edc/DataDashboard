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

import { TestBed } from '@angular/core/testing';
import { ContractAndTransferService } from './contract-and-transfer.service';
import { EdcClientService } from '@eclipse-edc/dashboard-core';
import { ContractAgreement, ContractNegotiation } from '@think-it-labs/edc-connector-client';

describe('ContractAgreementService', () => {
  let service: ContractAndTransferService;
  let edcClientServiceSpy: jasmine.SpyObj<EdcClientService>;

  beforeEach(() => {
    const edcClientServiceMock = jasmine.createSpyObj('EdcClientService', ['getClient']);
    TestBed.configureTestingModule({
      providers: [ContractAndTransferService, { provide: EdcClientService, useValue: edcClientServiceMock }],
    });

    service = TestBed.inject(ContractAndTransferService);
    edcClientServiceSpy = TestBed.inject(EdcClientService) as jasmine.SpyObj<EdcClientService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve all contract agreements', async () => {
    const mockAgreements: ContractAgreement[] = [{ id: '1' } as ContractAgreement];
    const mockApi = {
      management: {
        contractAgreements: {
          queryAll: jasmine.createSpy().and.returnValue(Promise.resolve(mockAgreements)),
        },
      },
    };
    edcClientServiceSpy.getClient.and.returnValue(Promise.resolve(mockApi as any));

    const result = await service.getAllContractAgreements();
    expect(result).toEqual(mockAgreements);
    expect(mockApi.management.contractAgreements.queryAll).toHaveBeenCalled();
  });

  it('should retrieve a contract agreement by ID', async () => {
    const mockAgreement: ContractAgreement = { id: '1' } as ContractAgreement;
    const mockApi = {
      management: {
        contractAgreements: {
          get: jasmine.createSpy().and.returnValue(Promise.resolve(mockAgreement)),
        },
      },
    };
    edcClientServiceSpy.getClient.and.returnValue(Promise.resolve(mockApi as any));

    const result = await service.getContractAgreement('1');
    expect(result).toEqual(mockAgreement);
    expect(mockApi.management.contractAgreements.get).toHaveBeenCalledWith('1');
  });

  it('should retrieve a contract negotiation by agreement ID', async () => {
    const mockNegotiation: ContractNegotiation = { id: '1' } as ContractNegotiation;
    const mockApi = {
      management: {
        contractAgreements: {
          getNegotiation: jasmine.createSpy().and.returnValue(Promise.resolve(mockNegotiation)),
        },
      },
    };
    edcClientServiceSpy.getClient.and.returnValue(Promise.resolve(mockApi as any));

    const result = await service.getNegotiationByAgreement('1');
    expect(result).toEqual(mockNegotiation);
    expect(mockApi.management.contractAgreements.getNegotiation).toHaveBeenCalledWith('1');
  });
});
