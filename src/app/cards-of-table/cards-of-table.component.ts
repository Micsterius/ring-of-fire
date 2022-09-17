import { Component, OnInit, Input, HostListener  } from '@angular/core';

@Component({
  selector: 'app-cards-of-table',
  templateUrl: './cards-of-table.component.html',
  styleUrls: ['./cards-of-table.component.scss']
})
export class CardsOfTableComponent implements OnInit {
  @Input() cards: string [];
  @Input() showFlop: boolean;

  windowWidth: number;
  windowHeight: number;

  constructor() {}

  ngOnInit(): void {
    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;
  }

  @HostListener('window:resize', ['$event'])

  resizeWindow() {
    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;
  }
}
