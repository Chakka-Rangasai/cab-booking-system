import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Driverlogin } from './driverlogin';

describe('Driverlogin', () => {
  let component: Driverlogin;
  let fixture: ComponentFixture<Driverlogin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Driverlogin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Driverlogin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
