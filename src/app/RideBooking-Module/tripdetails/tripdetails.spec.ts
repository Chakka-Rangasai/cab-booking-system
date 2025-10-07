import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tripdetails } from './tripdetails';

describe('Tripdetails', () => {
  let component: Tripdetails;
  let fixture: ComponentFixture<Tripdetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tripdetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tripdetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
