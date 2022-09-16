import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-cards-of-table',
  templateUrl: './cards-of-table.component.html',
  styleUrls: ['./cards-of-table.component.scss']
})
export class CardsOfTableComponent implements OnInit {
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
