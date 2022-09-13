import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-cards-of-otable',
  templateUrl: './cards-of-otable.component.html',
  styleUrls: ['./cards-of-otable.component.scss']
})
export class CardsOfOtableComponent implements OnInit {
  @Input() cards: string [];
  @Input() showFlop: boolean;

  windowWith: number;
  windowHeight: number;

  constructor() {
   this.windowWith = window.innerWidth;
   this.windowHeight = window.innerHeight;
  }

  ngOnInit(): void {
  }

}
