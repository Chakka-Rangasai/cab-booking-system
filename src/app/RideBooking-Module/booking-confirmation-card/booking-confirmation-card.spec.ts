import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingConfirmationCard } from './booking-confirmation-card';

describe('BookingConfirmationCard', () => {
  let component: BookingConfirmationCard;
  let fixture: ComponentFixture<BookingConfirmationCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingConfirmationCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingConfirmationCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
