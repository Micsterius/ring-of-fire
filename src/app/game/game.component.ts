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
  pokerGameIsStarted: boolean = false;
  showQuestionForJackpot: boolean = false;
  arrayOfPlayers: any[] = [];;

  constructor(private route: ActivatedRoute, private firestore: AngularFirestore, public dialog: MatDialog) {
  }


  ngOnInit(): void {
    this.newGame();

    this.route.params.subscribe((params) => {
      console.log(params['id'])
      this.gameId = params['id']
      this
        .firestore
        .collection('games')
        .doc(params['id'])
        .valueChanges()
        .subscribe((game: any) => {
          console.log('update game:', game)
          let gamePlayers = game.players
          this.game.currentPlayer = game.currentPlayer;
          this.game.playedCards = game.playedCards;
          this.game.players = this.recreatePlayer(gamePlayers)
          this.game.pickCardAnimation = game.pickCardAnimation;
          this.game.currentCard = game.currentCard;
          this.game.userImages = game.userImages;
        })
    });
  }

  recreatePlayer(gamePlayers) {
    let temporaryArrayOfAllPlayers = [];
    for (let i = 0; i < gamePlayers.length; i++) {
      let name = gamePlayers.shift()
      let playerImage = gamePlayers.shift()
      let playerId = gamePlayers.shift()
      let playerCards = [gamePlayers.shift(), gamePlayers.shift()]
      let playersTurn = gamePlayers.shift()
      let numberOfChips = gamePlayers.shift()
      let folded = gamePlayers.shift()

      let player = new Player(name, playerImage, playerId, playerCards, playersTurn, numberOfChips, folded)
      temporaryArrayOfAllPlayers.push(player)
    }
    /*this.game.players.length = 0;
    for (let i = 0; i < temporaryArrayOfAllPlayers.length; i++) {
      const player = temporaryArrayOfAllPlayers[i];
      this.game.players.push(player)
      console.log(this.game.players)
    }*/
    return temporaryArrayOfAllPlayers;
  }

  startPokerGame() {
    this.giveCardsToPlayers()
    this.giveCardsToPlayers()
    this.pokerGameIsStarted = true;
    this.game.players[this.findPlayerWhoStartsRandomized()].playersTurn = true;
    //this.firestore.collection('games').add({ ... this.game.toJson() });
    this.saveGame();
    this.showQuestionForJackpot = true;
  }

  findPlayerWhoStartsRandomized() {
    let number = Math.floor(Math.random() * this.game.players.length);
    return number;
  }

  playerFolded() {
    this.showQuestionForJackpot = false;
    this.game.players.find((player) => {
      if (player.playersTurn && !player.folded) {

        if (player.playerId < this.game.players.length) {
          let idOfNextPlayer = player.playerId + 1;
          console.log(idOfNextPlayer);
          player.playersTurn = false;
          this.game.players[idOfNextPlayer].playersTurn = true;
        }
        else {
          player.playersTurn = false;
          this.game.players[0].playersTurn = true;
        }
        player.folded = true
      }
    })
    this.showQuestionForJackpot = true;
  }

  playerSetMoney() {
    this.game.players.find((player) => {
      if (player.playersTurn && !player.folded) {
        player.numberOfChips -= 5;
        if (player.playerId < this.game.players.length) {
          let idOfNextPlayer = player.playerId + 1;
          player.playersTurn = false;
          this.game.players[idOfNextPlayer].playersTurn = true;
        }
        else {
          this.game.players[0].playersTurn = true;
        }
      }
    })
  }

  giveCardsToPlayers() {
    for (let i = 0; i < this.game.players.length; i++) {
      let newCard = this.game.stack.pop();
      this.game.players[i].playerCards.push(newCard);
    }
  }

  newGame() {
    this.game = new Game();

  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogAddPlayerComponent);
    console.log(this.game.players)
    dialogRef.afterClosed().subscribe((name: string) => {
      if (name && name.length > 0) {
        let playerId: number = this.game.players.length
        let playerCards: string[] = [];
        let playersTurn: boolean = false;
        let numberOfChips: number = 100;
        let folded: boolean = false;

        let player = new Player(name, this.game.userImages[playerId], playerId, playerCards, playersTurn, numberOfChips, folded);
        this.game.players.push(player);
      }
    });
  }


  saveGame() {
    this
      .firestore
      .collection('games')
      .doc(this.gameId)
      .update({ ... this.game.toJson() });
  }
}


