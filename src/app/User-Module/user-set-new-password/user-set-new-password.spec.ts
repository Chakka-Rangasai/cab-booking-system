import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserSetNewPassword } from './user-set-new-password';

describe('UserSetNewPassword', () => {
  let component: UserSetNewPassword;
  let fixture: ComponentFixture<UserSetNewPassword>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserSetNewPassword]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserSetNewPassword);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
