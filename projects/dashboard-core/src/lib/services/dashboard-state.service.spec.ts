import { TestBed } from '@angular/core/testing';
import { DashboardStateService } from './dashboard-state.service';
import { EdcClientService } from './edc-client.service';
import { EdcConfig } from '../models/edc-config';
import { take } from 'rxjs';

class MockEdcClientService {
  createClient(config: EdcConfig) {}
  setDashboardClient(config: EdcConfig) {}
}

describe('DashboardStateService', () => {
  let service: DashboardStateService;
  let edcClientService: EdcClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DashboardStateService, { provide: EdcClientService, useClass: MockEdcClientService }],
    });

    service = TestBed.inject(DashboardStateService);
    edcClientService = TestBed.inject(EdcClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set menu open state', () => {
    service.setMenuOpen(false);
    service.isMenuOpen$.subscribe(isOpen => {
      expect(isOpen).toBe(false);
    });
  });

  it('should toggle menu open state', () => {
    service.setMenuOpen(false);
    service.toggleMenuOpen();
    service.isMenuOpen$.pipe(take(1)).subscribe(isOpen => {
      expect(isOpen).toBe(true);
    });
    service.toggleMenuOpen();
    service.isMenuOpen$.pipe(take(1)).subscribe(isOpen => {
      expect(isOpen).toBe(false);
    });
  });

  it('should set federated catalog enabled state', () => {
    service.setFederatedCatalogEnabled(true);
    service.isFederatedCatalogEnabled$.subscribe(isEnabled => {
      expect(isEnabled).toBe(true);
    });
  });

  it('should update EDC configurations', () => {
    const configs: EdcConfig[] = [
      {
        federatedCatalogUrl: 'http://example.com',
        federatedCatalogEnabled: true,
        connectorName: '',
        managementUrl: '',
        defaultUrl: '',
        protocolUrl: '',
      },
    ];
    service.setEdcConfigs(configs);
    service.edcConfigs$.subscribe(updatedConfigs => {
      expect(updatedConfigs).toEqual(configs);
    });
  });

  it('should set current EDC configuration and update client', () => {
    const config: EdcConfig = {
      connectorName: '',
      defaultUrl: '',
      managementUrl: '',
      protocolUrl: '',
      federatedCatalogUrl: 'http://example.com',
      federatedCatalogEnabled: true,
    };
    spyOn(edcClientService, 'setDashboardClient');
    service.setCurrentEdcConfig(config);

    service.currentEdcConfig$.subscribe(currentConfig => {
      expect(currentConfig).toBe(config);
    });
    expect(edcClientService.setDashboardClient).toHaveBeenCalledWith(config);
  });

  afterEach(() => {
    service.ngOnDestroy();
  });
});
