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
      federatedCatalogEnabled: false,
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
      federatedCatalogEnabled: false,
      managementUrl: '',
      defaultUrl: '',
      protocolUrl: '',
    };

    expect(() => service.setDashboardClient(config)).toThrowError();
  });

  it('should get the client', async () => {
    const config: EdcConfig = {
      connectorName: '',
      federatedCatalogEnabled: false,
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
      federatedCatalogEnabled: false,
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
