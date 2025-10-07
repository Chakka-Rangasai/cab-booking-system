import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverResetPassword } from './driver-reset-password';

describe('DriverResetPassword', () => {
  let component: DriverResetPassword;
  let fixture: ComponentFixture<DriverResetPassword>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DriverResetPassword]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DriverResetPassword);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
