import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-game-hints',
  templateUrl: './game-hints.component.html',
  styleUrls: ['./game-hints.component.scss']
})
export class GameHintsComponent implements OnInit {

  @Input() numberOfPlayers: number;
  @Input() mouseIsOverDeveloperModeBtn: boolean;
  @Input() hideHintForDeveloperMode: boolean;
  @Input() sameIpAddress: boolean;
  
  
  constructor() { }

  ngOnInit(): void {
  }

}
