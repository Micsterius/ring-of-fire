import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  moneySound;
  foldSound;
  checkSound;
  cardSound;
  constructor() {
    this.createSounds();
  }

  createSounds() {
    this.moneySound = new Audio();
    this.moneySound.src = "./assets/audio/money.wav";
    this.moneySound.load;

    this.foldSound = new Audio();
    this.foldSound.src = "./assets/audio/fold.wav";
    this.foldSound.load;

    this.checkSound = new Audio();
    this.checkSound.src = "./assets/audio/check.wav";
    this.checkSound.load;
  }

  playMoneySound() {
    this.moneySound.play()
  }

  playFoldSound() {
    this.foldSound.play()
  }

  playCheckSound() {
    this.checkSound.play()
  }
}
