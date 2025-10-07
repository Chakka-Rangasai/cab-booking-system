import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverEnterOtp } from './driver-enter-otp';

describe('DriverEnterOtp', () => {
  let component: DriverEnterOtp;
  let fixture: ComponentFixture<DriverEnterOtp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DriverEnterOtp]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DriverEnterOtp);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
