import { Component, Input, OnInit } from '@angular/core';
import { Game } from 'src/models/game';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {
  @Input() name: any;
  @Input() nbrOfPlayers: number | any;
  @Input() playerActive: boolean = false;

  
  imagePlayer: string = '';

  userImages = ['user-img-1.jpg', 'user-img-4.svg', 'user-img-3.svg', 'user-img-5.svg', 'user-img-2.svg', 'user-img-6.svg']
 

  constructor() {
    console.log(this.nbrOfPlayers)
    console.log(this.name)
    
   }

  ngOnInit(): void {
  }

}
