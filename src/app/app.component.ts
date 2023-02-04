import { Component, HostListener } from '@angular/core';
import { GeneralService } from './shares/services/general.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ring-of-fire';

  constructor(
    public generalService: GeneralService) { }

  ngOnInit() {
    this.generalService.windowWidth = window.innerWidth;
    this.generalService.windowHeight = window.innerHeight;
  }

  @HostListener('window:resize', ['$event'])

  resizeWindow() {
    this.generalService.windowWidth = window.innerWidth;
    this.generalService.windowHeight = window.innerHeight;
  }
}
