import { Component, OnInit, VERSION, ViewChild, ElementRef } from '@angular/core';
import { Game } from 'src/models/game';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { DialogAddPlayerComponent } from '../dialog-add-player/dialog-add-player.component';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute } from '@angular/router';
import { Player } from 'src/models/player';
import { CountdownConfig } from 'ngx-countdown';
import { GameServiceService } from '../shares/services/game-service.service';

/**next tasks:
   *  - All in Options with split pot calculation
   *  - allow the player who wins in the case that everyone else folded to show his cards
   *  - if a player is out of money the player folded automatically
   */

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {

  config: CountdownConfig = {
    leftTime: 30,
    formatDate: ({ date }) => `${date / 1000}`,
  }



  constructor(
    private route: ActivatedRoute, 
    public gameService: GameServiceService) {
  }

  ngOnInit(): void {
    this.gameService.newGame();
    //this.gameService.getIPAddress();
    this.route
      .params
      .subscribe((params) => this.gameService.startGame(params['id']));
  }

  findWinningPlayer(){
    let winnningPlayer = [];
    for (let i = 0; i < this.gameService.game.winningPlayersId.length; i++) {
      const playerId = this.gameService.game.winningPlayersId[i];
      let player = this.gameService.game.players[playerId]
      winnningPlayer.push(player)
    }
    return winnningPlayer;
  }
}

