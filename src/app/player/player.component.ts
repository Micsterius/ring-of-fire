import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {
  @Input() players: any [];
  

  //game.userImages = ['user-img-1.jpg', 'user-img-4.svg', 'user-img-3.svg', 'user-img-5.svg', 'user-img-2.svg', 'user-img-6.svg']


  constructor() { }

  ngOnInit(): void {
  }

}
