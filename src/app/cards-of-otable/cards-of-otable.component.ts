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

  constructor() {
   this.windowWith = window.innerWidth;
  }

  ngOnInit(): void {
  }

}
