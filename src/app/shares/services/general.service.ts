import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GeneralService {
  testModus: boolean = true;
  windowWidth: any;
  windowHeight: any;
  constructor() { }
}
