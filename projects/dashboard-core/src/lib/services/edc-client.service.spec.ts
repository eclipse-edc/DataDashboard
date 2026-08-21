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
import { EdcClientService } from './edc-client.service';
import {
  EdcConnectorClient,
  EdcConnectorClientError,
  EdcConnectorClientErrorType,
} from '@think-it-labs/edc-connector-client';
import { EdcConfig } from '../models/edc-config';

class MockEdcConnectorClient {
  observability = {
    checkHealth: jasmine.createSpy('checkHealth').and.returnValue(Promise.resolve({ isSystemHealthy: true })),
  };

  static Builder() {
    return {
      managementUrl: jasmine.createSpy('managementUrl').and.callFake(() => {
        return this;
      }),
      defaultUrl: jasmine.createSpy('defaultUrl').and.callFake(() => {
        return this;
      }),
      protocolUrl: jasmine.createSpy('protocolUrl').and.callFake(() => {
        return this;
      }),
      managementApiVersion: jasmine.createSpy('managementApiVersion').and.callFake(() => {
        return this;
      }),
      protocolVersion: jasmine.createSpy('protocolVersion').and.callFake(() => {
        return this;
      }),
      identityUrl: jasmine.createSpy('identityUrl').and.callFake(() => {
        return this;
      }),
      identityApiVersion: jasmine.createSpy('identityApiVersion').and.callFake(() => {
        return this;
      }),
      presentationUrl: jasmine.createSpy('presentationUrl').and.callFake(() => {
        return this;
      }),
      apiToken: jasmine.createSpy('apiToken').and.callFake(() => {
        return this;
      }),
      authorization: jasmine.createSpy('authorization').and.callFake(() => {
        return this;
      }),
      build: jasmine.createSpy('build').and.returnValue(new MockEdcConnectorClient()),
    };
  }
}

describe('EdcClientService', () => {
  let service: EdcClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EdcClientService, { provide: EdcConnectorClient, useClass: MockEdcConnectorClient }],
    });
    // TestBed.configureTestingModule({});

    service = TestBed.inject(EdcClientService);
  });

  afterEach(() => {
    service.ngOnDestroy();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create an EDC client successfully', () => {
    const config: EdcConfig = {
      connectorName: '',
      managementApiVersion: 'v4',
      managementUrl: 'http://management.url',
      defaultUrl: 'http://default.url',
      protocolUrl: 'http://protocol.url',
    };

    service.setDashboardClient(config);
    expect(service.isHealthy$).toBeTruthy(); //Zustand prüfen
  });

  it('should throw an error if required config properties are missing', () => {
    const config: EdcConfig = {
      connectorName: '',
      managementApiVersion: 'v4',
      managementUrl: '',
      defaultUrl: '',
      protocolUrl: '',
    };

    expect(() => service.setDashboardClient(config)).toThrowError();
  });

  it('should get the client', async () => {
    const config: EdcConfig = {
      connectorName: '',
      managementApiVersion: 'v4',
      managementUrl: 'http://management.url',
      defaultUrl: 'http://default.url',
      protocolUrl: 'http://protocol.url',
    };

    service.setDashboardClient(config);
    const client = await service.getClient();
    expect(client).toBeTruthy();
  });

  it('should handle health check failure', async () => {
    const config: EdcConfig = {
      connectorName: '',
      managementApiVersion: 'v4',
      managementUrl: 'http://management.url',
      defaultUrl: 'http://default.url',
      protocolUrl: 'http://protocol.url',
    };

    service.setDashboardClient(config);
    const mockClient = service['_client'].getValue();

    // @ts-ignore
    spyOn(mockClient.observability, 'checkHealth').and.returnValue(
      Promise.reject(new EdcConnectorClientError(EdcConnectorClientErrorType.Unknown)),
    );

    await service.getClient(); // Sicherstellen, dass der Client initialisiert ist
    //await service.runHealthCheck();

    expect(service['_isHealthy'].getValue()).toBe(false);
  });
});
