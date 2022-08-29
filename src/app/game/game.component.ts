import { Component, OnInit, VERSION, ViewChild, ElementRef } from '@angular/core';
import { Game } from 'src/models/game';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddPlayerComponent } from '../dialog-add-player/dialog-add-player.component';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute } from '@angular/router';
import { Player } from 'src/models/player';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {

  lastCard: string | any = '';
  game: Game;
  nbrOfRotation: number = 0;
  lastCardPuffer: string = '';
  gameId: string;
  cardsForPlayers: string[] = [];

  /*name = "Angular " + VERSION.major;
  @ViewChild("cardsOntable") cardsOntable: ElementRef | any;
  getData() {
    let img = `<img src="assets/img/cards/${this.currentCard}.svg" class="played-card-${this.nbrForRotation}" style="width: 180px;">`
    this.cardsOntable.nativeElement.innerHTML += img;
  }*/

  constructor(private route: ActivatedRoute, private firestore: AngularFirestore, public dialog: MatDialog) {

  }

  ngOnInit(): void {
    this.newGame();

    /* this.firestore.collection('games').valueChanges().subscribe((game)=>{
       console.log('Game update', game)
     })*/

    this.route.params.subscribe((params) => {
      console.log(params['id'])
      this.gameId = params['id']
      this
        .firestore
        .collection('games')
        .doc(params['id'])
        .valueChanges()
        .subscribe((game: any) => {
          console.log('Game update', game)
          this.game.currentPlayer = game.currentPlayer;
          this.game.playedCards = game.playedCards;
          this.game.players = game.players;
          this.game.pickCardAnimation = game.pickCardAnimation;
          this.game.currentCard = game.currentCard;
        })
    });
  }

  startPokerGame() {
    this.giveCardsToPlayers()
  }

  giveCardsToPlayers() {
    for (let i = 0; i < this.game.players.length * 2; i++) {
      const card = this.game.stack[i];
      this.cardsForPlayers.push(card)
    }
  }

  newGame() {
    this.game = new Game();
    // this.firestore.collection('games').add( {... this.game.toJson()});
  }

  takeCard() {
    if (!this.game.pickCardAnimation && this.game.players.length > 1) {

      if (this.game.playedCards.length > 0) {
        this.lastCardPuffer = this.game.currentCard
      }
      this.game.currentCard = this.game.stack.pop();

      this.game.pickCardAnimation = true;
      this.saveGame();
      let cardWithPosition = {
        'card': this.game.currentCard,
        'position': this.nbrOfRotation
      }

      setTimeout(() => {
        //   this.getData()
        this.nbrOfRotation++
        this.nbrOfRotation = this.nbrOfRotation % 3;
        this.game.currentPlayer++;
        this.game.currentPlayer = this.game.currentPlayer % this.game.players.length;
        this.game.playedCards.push(cardWithPosition);
        this.lastCard = this.lastCardPuffer
        this.game.pickCardAnimation = false;
        this.saveGame()
      }, 1000);
    }
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogAddPlayerComponent);
    console.log(this.game.players)
    dialogRef.afterClosed().subscribe((name: string) => {
      if (name && name.length > 0) {
        let player = new Player(name, this.game.userImages[1]);
        this.game.players.push(player);
        this.saveGame();
      }
    });
  }


  saveGame() {
    this
      .firestore
      .collection('games')
      .doc(this.gameId)
      .update({ ... this.game.toJson() })
  }

}


