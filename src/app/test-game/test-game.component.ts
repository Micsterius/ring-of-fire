import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CountdownConfig } from 'ngx-countdown';
import { GameServiceService } from '../shares/services/game-service.service';

@Component({
  selector: 'app-test-game',
  templateUrl: './test-game.component.html',
  styleUrls: ['./test-game.component.scss']
})
export class TestGameComponent implements OnInit {

  config: CountdownConfig = {
    leftTime: 15,
    formatDate: ({ date }) => `${date / 1000}`,
  }

  constructor(
    private route: ActivatedRoute,
    public gameService: GameServiceService) {

  }

  ngOnInit(): void {
    this.gameService.newGame();
    this.gameService.getIPAddress();
    this.route
      .params
      .subscribe((params) => this.gameService.startGame(params['id']));
  }

  activateDeveloperMode() {
    this.gameService.game.developerMode = true;
  }

}
