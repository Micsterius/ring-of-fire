import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogInviteFriendsComponent } from './dialog-invite-friends.component';

describe('DialogInviteFriendsComponent', () => {
  let component: DialogInviteFriendsComponent;
  let fixture: ComponentFixture<DialogInviteFriendsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogInviteFriendsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogInviteFriendsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
