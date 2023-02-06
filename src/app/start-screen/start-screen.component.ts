import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Game } from 'src/models/game';
import { DialogFaqComponent } from '../dialog-faq/dialog-faq.component';
import { DialogInviteFriendsComponent } from '../dialog-invite-friends/dialog-invite-friends.component';
import { DialogTestMmodusComponent } from '../dialog-test-mmodus/dialog-test-mmodus.component';
import { GeneralService } from '../shares/services/general.service';

@Component({
  selector: 'app-start-screen',
  templateUrl: './start-screen.component.html',
  styleUrls: ['./start-screen.component.scss']
})
export class StartScreenComponent implements OnInit {

  constructor(private firestore: AngularFirestore,
    private router: Router,
    public dialog: MatDialog,
    private generalService: GeneralService) { }

  ngOnInit(): void {
  }

  openDialogFriends() {
    let dialogRef = this.dialog.open(DialogInviteFriendsComponent, {})
  }

  openDialogFAQ() {
    let dialogRef = this.dialog.open(DialogFaqComponent, {})
  }

  startNewTestGame() {
    //start game
    let game = new Game;
    this.firestore
      .collection('games')
      .add({ ...game.toJson() })
      .then((gameInfo: any) => this.router.navigateByUrl('/testgame/' + gameInfo.id));
    this.generalService.testModus = true;
  }
}
