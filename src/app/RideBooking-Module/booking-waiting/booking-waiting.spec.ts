import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingWaiting } from './booking-waiting';

describe('BookingWaiting', () => {
  let component: BookingWaiting;
  let fixture: ComponentFixture<BookingWaiting>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingWaiting]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingWaiting);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
