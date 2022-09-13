import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardsOfOtableComponent } from './cards-of-otable.component';

describe('CardsOfOtableComponent', () => {
  let component: CardsOfOtableComponent;
  let fixture: ComponentFixture<CardsOfOtableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CardsOfOtableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardsOfOtableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
