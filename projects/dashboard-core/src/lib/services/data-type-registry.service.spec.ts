import { TestBed } from '@angular/core/testing';

import { DataTypeRegistryService } from './data-type-registry.service';

describe('DataAddressTypeRegistryService', () => {
  let service: DataTypeRegistryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataTypeRegistryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
