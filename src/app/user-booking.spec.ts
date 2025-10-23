import { TestBed } from '@angular/core/testing';

import { UserBooking } from './user-booking';

describe('UserBooking', () => {
  let service: UserBooking;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserBooking);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
