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
  allChipsInPot: number = 0;
  gameStarted: boolean = false;
  playerInGame: any[] = [];
  arrayOfPlayerWhoChecked: any[] = [];
  arrayOfPlayerWhoCalled: any[] = [];
  checkIsPossible: boolean = true;
  showFlop: boolean = false;
  showTurn: boolean = false;
  showRiver: boolean = false;
  flop: string[] = [];


  constructor(private route: ActivatedRoute, private firestore: AngularFirestore, public dialog: MatDialog) {
  }


  ngOnInit(): void {
    this.newGame();

    this.route.params.subscribe((params) => {
      this.gameId = params['id']
      this
        .firestore
        .collection('games')
        .doc(params['id'])
        .valueChanges()
        .subscribe((game: any) => {
          let gamePlayers = game.players
          this.game.currentPlayerId = game.currentPlayerId;
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
      let name = gamePlayers.shift();
      let playerImage = gamePlayers.shift();
      let playerId = gamePlayers.shift();
      let playerCards = [gamePlayers.shift(), gamePlayers.shift()];
      let playersTurn = gamePlayers.shift();
      let numberOfChips = gamePlayers.shift();
      let folded = gamePlayers.shift();
      let setMoney = gamePlayers.shift();

      let player = new Player(name, playerImage, playerId, playerCards, playersTurn, numberOfChips, folded, setMoney)
      temporaryArrayOfAllPlayers.push(player)
    }

    return temporaryArrayOfAllPlayers;
  }

  startPokerGame() {
    this.giveCardsToPlayers()
    this.pokerGameIsStarted = true;
    this.setAllPlayerTurnFalse();
    this.game.currentPlayerId = this.findPlayerWhoStartsRandomized();
    this.game.players[this.game.currentPlayerId].playersTurn = true;
    //this.firestore.collection('games').add({ ... this.game.toJson() });
    this.saveGame();
    this.loadAllPlayersInGameArray();
    this.fillFlop();
    this.showQuestionForJackpot = true;
    this.gameStarted = true;
  }

  fillFlop() {
    for (let i = 0; i < 3; i++) {
      const card = this.game.stack.pop()
      this.flop.push(card)
    }
  }

  loadAllPlayersInGameArray() {
    for (let i = 0; i < this.game.players.length; i++) {
      const player = this.game.players[i];
      this.playerInGame.push(player)
    }
  }

  setAllPlayerTurnFalse() {
    for (let i = 0; i < this.game.players.length; i++) {
      const player = this.game.players[i];
      player.playersTurn = false;
    }
  }

  findPlayerWhoStartsRandomized() {
    let number = Math.floor(Math.random() * this.game.players.length);
    return number;
  }

  playerChecks() {
    this.game.players[this.game.currentPlayerId].playersTurn = false;
    this.arrayOfPlayerWhoChecked.push(this.game.players[this.game.currentPlayerId]);
    this.goToNextPlayer();
  }

  playerCalled() {
    this.showQuestionForJackpot = false;
    this.game.players[this.game.currentPlayerId].numberOfChips -= 5;
    this.allChipsInPot += 5;
    this.game.players[this.game.currentPlayerId].setMoney += 5;//row for raise
    this.game.players[this.game.currentPlayerId].playersTurn = false;
    this.arrayOfPlayerWhoCalled.push(this.game.players[this.game.currentPlayerId])
    this.goToNextPlayer();
    this.checkTheJackpotOfTheNextPlayer();
    this.showQuestionForJackpot = true;
  }

  playerFolded() {
    this.showQuestionForJackpot = false;
    this.game.players[this.game.currentPlayerId].folded = true;
    this.game.players[this.game.currentPlayerId].playersTurn = false;
    this.playerInGame.splice(this.playerInGame.indexOf(this.game.players[this.game.currentPlayerId]), 2)
    this.checkNumberOfFoldedPlayers();
  }

  checkNumberOfFoldedPlayers() {
    let allFoldedPlayers: any = this.game.players.filter(player => !player.folded)
    if (allFoldedPlayers.length == 1) {
      let player = allFoldedPlayers[0]
      alert('look in console')
      console.log('Es gewinnt:', player)
    }
    else {
      this.goToNextPlayer();
    }
  }

  goToNextPlayer() {
    this.game.currentPlayerId++
    this.game.currentPlayerId = this.game.currentPlayerId % this.game.players.length
    this.checkIfPlayerIsOnTheTable();
  }

  checkIfAllPlayersChecked() {
    if (this.playerInGame.length == this.arrayOfPlayerWhoChecked.length) {
      if (this.showTurn && this.showRiver) {
        this.checkWinConditions();
      }
      if (this.showTurn && !this.showRiver) {
        this.showRiver = true;
        this.flop.push(this.game.stack.pop())
      }
      if (this.showFlop && !this.showTurn) {
        this.showTurn = true;
        this.flop.push(this.game.stack.pop())
      }
      this.showFlop = true
      this.arrayOfPlayerWhoChecked.length = 0;
      this.arrayOfPlayerWhoCalled.length = 0;
    }
  }

  checkWinConditions() {
    let cardsOfPlayers = '';
    for (let i = 0; i < this.arrayOfPlayerWhoCalled.length; i++) {
      const player = this.arrayOfPlayerWhoCalled[i];
      cardsOfPlayers += `&pc[]=${player.playerCards[0]},${player.playerCards[1]}`
    }

    //API from https://www.pokerapi.dev/ ### by Gareth Fuller
    let url = `https://api.pokerapi.dev/v1/winner/texas_holdem?cc=${this.flop[0]},${this.flop[1]},${this.flop[2]},${this.flop[3]},${this.flop[4]}${cardsOfPlayers}`

    fetch(url)
      .then(response => response.json())
      .then(price => console.log(price))
  }

  checkIfAllPlayersCalled() {
    if (this.playerInGame.length == this.arrayOfPlayerWhoCalled.length) {
      if (this.showTurn && this.showRiver) {
        this.checkWinConditions();
      }
      if (this.showTurn && !this.showRiver) {
        this.showRiver = true;
        this.flop.push(this.game.stack.pop())
      }
      if (this.showFlop && !this.showTurn) {
        this.showTurn = true;
        this.flop.push(this.game.stack.pop())
      }
      this.showFlop = true
      this.arrayOfPlayerWhoChecked.length = 0;
      this.arrayOfPlayerWhoCalled.length = 0;
    }
  }

  checkIfPlayerIsOnTheTable() {
    if (this.game.players[this.game.currentPlayerId].folded) {
      this.goToNextPlayer();
    }
    else {
      this.game.players[this.game.currentPlayerId].playersTurn = true;
      this.checkIsPossible = this.proofIfMoveCheckIsPossibile();
      this.checkIfAllPlayersChecked();
      this.checkIfAllPlayersCalled();
    }
    this.showQuestionForJackpot = true;
  }

  proofIfMoveCheckIsPossibile() {
    let moneyFromCurrentPlayer = this.game.players[this.game.currentPlayerId].setMoney;
    let highestJackpotFormAllPlayers = this.checkTheJackpotOfTheNextPlayer();
    if (moneyFromCurrentPlayer >= highestJackpotFormAllPlayers) {
      return true
    }
    else { return false }
  }

  checkTheJackpotOfTheNextPlayer() {
    let allPlayersJackpots = this.game.players.map((player) => player.setMoney)
    let temporary = -1;
    allPlayersJackpots.forEach((setMoney) => {
      if (temporary < setMoney) {
        temporary = setMoney;
      }
    })
    return temporary
  }

  giveCardsToPlayers() {
      for (let i = 0; i < this.game.players.length; i++) {
        const player = this.game.players[i];
        player.playerCards.length = 0;
        let newCard1 = this.game.stack.pop();
        let newCard2 = this.game.stack.pop();
        this.game.players[i].playerCards.push(newCard1);
        this.game.players[i].playerCards.push(newCard2);
      }
  }

  newGame() {
    this.game = new Game();
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogAddPlayerComponent);
    dialogRef.afterClosed().subscribe((name: string) => {
      if (name && name.length > 0) {
        let playerId: number = this.game.players.length
        let playerCards: string[] = [];
        let playersTurn: boolean = false;
        let numberOfChips: number = 100;
        let folded: boolean = false;
        let setMoney: number = 0;

        let player = new Player(name, this.game.userImages[playerId], playerId, playerCards, playersTurn, numberOfChips, folded, setMoney);
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


