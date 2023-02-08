import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { CountdownComponent, CountdownConfig } from 'ngx-countdown';
import { DialogFaqComponent } from '../dialog-faq/dialog-faq.component';
import { AudioService } from '../shares/services/audio.service';
import { GameServiceService } from '../shares/services/game-service.service';
import { GeneralService } from '../shares/services/general.service';

@Component({
  selector: 'app-test-game',
  templateUrl: './test-game.component.html',
  styleUrls: ['./test-game.component.scss']
})
export class TestGameComponent implements OnInit {

  config: CountdownConfig = {
    leftTime: 30,
    formatDate: ({ date }) => `${date / 1000}`,
  }

  @ViewChild('cd', { static: false }) private countdown: CountdownComponent;

  constructor(
    private route: ActivatedRoute,
    public gameService: GameServiceService,
    public generalService: GeneralService,
    private router: Router,
    public audioService: AudioService,
    public dialog: MatDialog) {

  }

  ngOnInit(): void {
    this.gameService.newGame();
    //this.gameService.getIPAddress();
    this.route
      .params
      .subscribe((params) => this.gameService.startGame(params['id']));
    this.activateDeveloperMode();
    setTimeout(() => {
      if (this.gameService.game.players.length == 0) {
        this.createThreePlayers();
      }
    }, 1000);
  }

  activateDeveloperMode() {
    this.gameService.game.developerMode = true;
  }

  createThreePlayers() {
    this.gameService.createPlayer('J. Bond');
    this.gameService.createPlayer('Fire');
    this.gameService.createPlayer('Lady B.');
    this.gameService.createPlayer('Skull King');
  }

  goBackToStartScreen(){
    this.router.navigateByUrl('');
  }

  openDialogFAQ() {
    let dialogRef = this.dialog.open(DialogFaqComponent, {})
    this.countdown.pause();

    dialogRef.afterClosed().subscribe(result => {
      this.countdown.resume();
    });
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
