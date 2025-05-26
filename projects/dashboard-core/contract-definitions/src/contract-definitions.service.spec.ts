import { TestBed } from '@angular/core/testing';

import { ContractDefinitionsService } from './contract-definitions.service';

describe('ContractDefinitionsService', () => {
  let service: ContractDefinitionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContractDefinitionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
