import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserhomeNav } from './userhome-nav';

describe('UserhomeNav', () => {
  let component: UserhomeNav;
  let fixture: ComponentFixture<UserhomeNav>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserhomeNav]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserhomeNav);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
