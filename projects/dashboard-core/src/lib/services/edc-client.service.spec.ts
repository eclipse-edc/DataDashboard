import { TestBed } from '@angular/core/testing';

import { EdcClientService } from './edc-client.service';

describe('EdcClientService', () => {
  let service: EdcClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EdcClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
