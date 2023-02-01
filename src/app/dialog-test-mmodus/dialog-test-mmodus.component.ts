import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Game } from 'src/models/game';
import { GameServiceService } from '../shares/services/game-service.service';
import { GeneralService } from '../shares/services/general.service';

@Component({
  selector: 'app-dialog-test-mmodus',
  templateUrl: './dialog-test-mmodus.component.html',
  styleUrls: ['./dialog-test-mmodus.component.scss']
})
export class DialogTestMmodusComponent implements OnInit {

  constructor(
    public generalService: GeneralService,
    private firestore: AngularFirestore,
    private router: Router,
    public dialog: MatDialog,
    private gameService: GameServiceService
  ) { }

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

  startNewTestGame() {
    //start game
    let game = new Game;
    this.firestore
      .collection('games')
      .add({ ...game.toJson() })
      .then((gameInfo: any) => this.router.navigateByUrl('/testgame/' + gameInfo.id));
  }

}
