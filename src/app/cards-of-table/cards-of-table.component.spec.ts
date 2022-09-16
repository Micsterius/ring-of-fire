import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardsOfTableComponent } from './cards-of-table.component';

describe('CardsOfTableComponent', () => {
  let component: CardsOfTableComponent;
  let fixture: ComponentFixture<CardsOfTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CardsOfTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardsOfTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
