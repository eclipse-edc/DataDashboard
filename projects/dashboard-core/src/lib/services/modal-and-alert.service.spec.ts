import { TestBed } from '@angular/core/testing';

import { ModalAndAlertService } from './modal-and-alert.service';

describe('DashboardModalService', () => {
  let service: ModalAndAlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModalAndAlertService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
