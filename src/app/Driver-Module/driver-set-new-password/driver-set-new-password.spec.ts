import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverSetNewPassword } from './driver-set-new-password';

describe('DriverSetNewPassword', () => {
  let component: DriverSetNewPassword;
  let fixture: ComponentFixture<DriverSetNewPassword>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DriverSetNewPassword]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DriverSetNewPassword);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
