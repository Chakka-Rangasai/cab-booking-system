import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DrivermainNav } from './drivermain-nav';

describe('DrivermainNav', () => {
  let component: DrivermainNav;
  let fixture: ComponentFixture<DrivermainNav>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrivermainNav]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DrivermainNav);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
