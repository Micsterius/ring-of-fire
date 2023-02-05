import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { Game } from 'src/models/game';

@Component({
  selector: 'app-dialog-invite-friends',
  templateUrl: './dialog-invite-friends.component.html',
  styleUrls: ['./dialog-invite-friends.component.scss']
})
export class DialogInviteFriendsComponent implements OnInit {

  constructor(
    private firestore: AngularFirestore,
    private router: Router) { }

  ngOnInit(): void {
  }

  startNewGame() {
    //start game
    let game = new Game;
    this.firestore
      .collection('games')
      .add({ ...game.toJson() })
      .then((gameInfo: any) => this.router.navigateByUrl('/game/' + gameInfo.id));
  }
}
