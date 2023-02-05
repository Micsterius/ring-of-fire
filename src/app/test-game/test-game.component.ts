import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CountdownConfig } from 'ngx-countdown';
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

  constructor(
    private route: ActivatedRoute,
    public gameService: GameServiceService,
    public generalService: GeneralService) {

  }

  ngOnInit(): void {
    this.gameService.newGame();
    this.gameService.getIPAddress();
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

}
