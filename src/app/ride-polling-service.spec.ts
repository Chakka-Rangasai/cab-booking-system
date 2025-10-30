import { TestBed } from '@angular/core/testing';

import { RidePollingService } from './ride-polling-service';

describe('RidePollingService', () => {
  let service: RidePollingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RidePollingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
