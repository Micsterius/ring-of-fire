import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogTestMmodusComponent } from './dialog-test-mmodus.component';

describe('DialogTestMmodusComponent', () => {
  let component: DialogTestMmodusComponent;
  let fixture: ComponentFixture<DialogTestMmodusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogTestMmodusComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogTestMmodusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
