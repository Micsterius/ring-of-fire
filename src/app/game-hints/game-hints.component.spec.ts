import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameHintsComponent } from './game-hints.component';

describe('GameHintsComponent', () => {
  let component: GameHintsComponent;
  let fixture: ComponentFixture<GameHintsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GameHintsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameHintsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
