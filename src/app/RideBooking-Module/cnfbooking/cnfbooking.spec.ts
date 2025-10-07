import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cnfbooking } from './cnfbooking';

describe('Cnfbooking', () => {
  let component: Cnfbooking;
  let fixture: ComponentFixture<Cnfbooking>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cnfbooking]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Cnfbooking);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
