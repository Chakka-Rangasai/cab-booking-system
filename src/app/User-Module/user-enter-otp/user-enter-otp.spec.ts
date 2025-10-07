import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserEnterOtp } from './user-enter-otp';

describe('UserEnterOtp', () => {
  let component: UserEnterOtp;
  let fixture: ComponentFixture<UserEnterOtp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserEnterOtp]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserEnterOtp);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
