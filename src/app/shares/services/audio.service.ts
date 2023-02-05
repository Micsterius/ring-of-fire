import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  moneySound;
  foldSound;
  checkSound;
  cardSound;
  volume: number = 1;
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
    if (this.volume != 0) this.moneySound.play()
  }

  soundOff() {
    this.volume = 0;
  }

  soundOn() {
    this.volume = 1;
  }

  playFoldSound() {
    if (this.volume != 0) this.foldSound.play()
  }

  playCheckSound() {
    if (this.volume != 0) this.checkSound.play()
  }
}
