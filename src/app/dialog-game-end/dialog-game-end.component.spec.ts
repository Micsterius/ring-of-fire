import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogGameEndComponent } from './dialog-game-end.component';

describe('DialogGameEndComponent', () => {
  let component: DialogGameEndComponent;
  let fixture: ComponentFixture<DialogGameEndComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogGameEndComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogGameEndComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
