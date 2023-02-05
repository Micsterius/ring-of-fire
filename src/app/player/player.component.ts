import { Component, Input, OnInit } from '@angular/core';
import { GameServiceService } from '../shares/services/game-service.service';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {
  @Input() players: any[];


  //game.userImages = ['user-img-1.jpg', 'user-img-4.svg', 'user-img-3.svg', 'user-img-5.svg', 'user-img-2.svg', 'user-img-6.svg']


  constructor(
    public gameService:GameServiceService
  ) { }

  ngOnInit(): void {
  }

  checkPlayersNumberOfChips(numberOfChips) {
    if (numberOfChips >= 400) return 400;
    if (numberOfChips >= 380 && numberOfChips < 400) return 380;
    if (numberOfChips >= 360 && numberOfChips < 380) return 360;
    if (numberOfChips >= 340 && numberOfChips < 360) return 340;
    if (numberOfChips >= 320 && numberOfChips < 340) return 320;
    if (numberOfChips >= 300 && numberOfChips < 320) return 300;
    if (numberOfChips >= 280 && numberOfChips < 300) return 280;
    if (numberOfChips >= 260 && numberOfChips < 280) return 260;
    if (numberOfChips >= 240 && numberOfChips < 260) return 240;
    if (numberOfChips >= 220 && numberOfChips < 240) return 220;
    if (numberOfChips >= 200 && numberOfChips < 220) return 200;
    if (numberOfChips >= 180 && numberOfChips < 200) return 180;
    if (numberOfChips >= 160 && numberOfChips < 180) return 160;
    if (numberOfChips >= 140 && numberOfChips < 160) return 140;
    if (numberOfChips >= 120 && numberOfChips < 140) return 120;
    if (numberOfChips >= 100 && numberOfChips < 120) return 100;
    if (numberOfChips >= 80 && numberOfChips < 100) return 80;
    if (numberOfChips >= 60 && numberOfChips < 80) return 60;
    if (numberOfChips >= 40 && numberOfChips < 60) return 40;
    else return 20
  }

}
