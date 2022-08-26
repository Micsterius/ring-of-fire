import { Component, OnInit, VERSION, ViewChild, ElementRef } from '@angular/core';
import { Game } from 'src/models/game';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddPlayerComponent } from '../dialog-add-player/dialog-add-player.component';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  pickCardAnimation = false;
  currentCard: string | any = '';
  lastCard: string | any = '';
  game: Game = new Game;
  nbrOfRotation: number = 0;
  lastCardPuffer:string = '';
  /*name = "Angular " + VERSION.major;
  @ViewChild("cardsOntable") cardsOntable: ElementRef | any;
  getData() {
    let img = `<img src="assets/img/cards/${this.currentCard}.svg" class="played-card-${this.nbrForRotation}" style="width: 180px;">`
    this.cardsOntable.nativeElement.innerHTML += img;
  }*/

  constructor(public dialog: MatDialog) { }

  ngOnInit(): void {
    this.newGame();
  }

  newGame() {
    this.game = new Game();
  }

  takeCard() {
    if (!this.pickCardAnimation && this.game.players.length > 1) {

      if (this.game.playedCards.length > 0) {
        this.lastCardPuffer = this.currentCard
      }
      this.currentCard = this.game.stack.pop();

      this.pickCardAnimation = true;
      console.log(this.game.playedCards)


      setTimeout(() => {
        //   this.getData()
        this.nbrOfRotation++
        this.nbrOfRotation = this.nbrOfRotation % 2;
        this.game.currentPlayer++;
        this.game.currentPlayer = this.game.currentPlayer % this.game.players.length;
        this.game.playedCards.push(this.currentCard);
        this.lastCard = this.lastCardPuffer
        this.pickCardAnimation = false;
      }, 1000);
    }
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogAddPlayerComponent);

    dialogRef.afterClosed().subscribe(name => {
      if (name && name.length > 0) {
        this.game.players.push(name)
      }
    });
  }

}


