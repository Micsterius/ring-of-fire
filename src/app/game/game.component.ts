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
  game: Game;
  nbrOfRotation: number = 0;
  gameId: string;
  coinsWhichGetWinner: number = 0;
  playerCreated: string = '';

  /**next tasks:
   *  - winning player has to be saved as a json only with the id. No Objects
   *  - All in Options.
   *  - instead of Call show  'give 10' when it is the first player turn or the big blind player can check in the first round or Raise
   *  - show field with winner and winning card combination
   */

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
          this.game.currentPlayerId = game.currentPlayerId;
          this.game.playedCards = game.playedCards;
          this.game.players = this.recreatePlayer(game.players)
          this.game.stack = game.stack;
          this.game.pickCardAnimation = game.pickCardAnimation;
          this.game.userImages = game.userImages;
          this.game.pokerGameIsStarted = game.pokerGameIsStarted;
          this.game.playerInGame = game.playerInGame;
          this.game.allChipsInPot = game.allChipsInPot;
          this.game.bigBlindPlayerCheckedInTheFirstRound = game.bigBlindPlayerCheckedInTheFirstRound;
          this.game.arrayForFirstRound = game.arrayForFirstRound;
          this.game.arrayOfPlayerWhoChecked = game.arrayOfPlayerWhoChecked;
          this.game.arrayOfPlayerWhoCalled = game.arrayOfPlayerWhoCalled;
          this.game.showFlop = game.showFlop;
          this.game.showTurn = game.showTurn;
          this.game.showRiver = game.showRiver;
          this.game.flop = game.flop;
          this.game.playerWithBigBlindId = game.playerWithBigBlindId;
          this.game.roundEnds = game.roundEnds;
          this.game.winningPlayersName = game.winningPlayersName;
          this.game.checkIsPossible = game.checkIsPossible;
          this.game.raiseIsPossible = game.raiseIsPossible;
          this.game.winningPlayersResult = game.winningPlayersResult;
          this.game.winningPlayersId = game.winningPlayersId;
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

  currentPlayer() {
    return this.game.players[this.game.currentPlayerId]
  }

  startPokerGame() {
    this.giveCardsToPlayers();
    this.game.pokerGameIsStarted = true;
    this.setAllPlayerTurnFalse();
    this.game.currentPlayerId = this.findPlayerWhoStartsRandomized();
    this.currentPlayer().playersTurn = true;
    //this.firestore.collection('games').add({ ... this.game.toJson() });

    this.loadAllPlayersInGameArray();
    this.fillFlop();
    this.setBlinds();
    this.saveGame();
  }

  setBlinds() {
    this.setSmallBlind();
    this.setBigBlind();
  }

  setSmallBlind() {
    let a = this.game.currentPlayerId
    for (let i = 0; i < this.game.players.length - 2; i++) {
      a++
      a = a % this.game.players.length
    }
    this.game.players[a].setMoney += 5;
    this.game.players[a].numberOfChips -= 5;
    this.game.allChipsInPot += 5;
  }

  setBigBlind() {
    let a = this.game.currentPlayerId
    for (let i = 0; i < this.game.players.length - 1; i++) {
      a++
      a = a % this.game.players.length
    }
    this.game.players[a].setMoney += 10;
    this.game.players[a].numberOfChips -= 10;
    this.game.allChipsInPot += 10;
    this.game.playerWithBigBlindId = a;
  }

  fillFlop() {
    for (let i = 0; i < 3; i++) {
      const card = this.game.stack.pop()
      this.game.flop.push(card)
    }
    this.saveGame();
  }

  loadAllPlayersInGameArray() {
    for (let i = 0; i < this.game.players.length; i++) {
      const player = this.game.players[i];
      this.game.playerInGame.push(player.playerId)
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
    this.currentPlayer().playersTurn = false;
    this.game.arrayOfPlayerWhoChecked.push(this.currentPlayer().playerId);
    if (this.game.arrayForFirstRound.length == this.game.players.length - 1 && !this.game.showFlop) {
      this.game.bigBlindPlayerCheckedInTheFirstRound = true;
      this.checkIfAllPlayersCheckedOrCalled();
      this.goToNextPlayer();
    } else { this.goToNextPlayer() }
  }

  playerCalled() {
    this.game.arrayForFirstRound.push(this.currentPlayer().playerId) // only necessary for the first round
    if (this.getHighestJackpot() == 0) {
      this.currentPlayer().setMoney += 10;
      this.currentPlayer().numberOfChips -= 10;
      this.game.allChipsInPot += 10;
    }
    else {
      this.currentPlayer().numberOfChips -= this.getHighestJackpot() - this.currentPlayer().setMoney;
      this.game.allChipsInPot += this.getHighestJackpot() - this.currentPlayer().setMoney;
      this.currentPlayer().setMoney += this.getHighestJackpot() - this.currentPlayer().setMoney;
    }
    this.game.raiseIsPossible = true;
    this.currentPlayer().playersTurn = false;
    this.game.arrayOfPlayerWhoCalled.push(this.currentPlayer().playerId)
    this.saveGame();
    this.goToNextPlayer();
  }

  playerRaise() {
    let currentHighestJackpot = this.getHighestJackpot();
    this.currentPlayer().numberOfChips -= currentHighestJackpot * 2;
    this.game.allChipsInPot += currentHighestJackpot * 2;
    this.game.raiseIsPossible = true;
    this.currentPlayer().setMoney += currentHighestJackpot * 2;
    this.currentPlayer().playersTurn = false;
    this.game.arrayOfPlayerWhoCalled.length = 0;
    this.game.arrayOfPlayerWhoCalled.push(this.currentPlayer().playerId)
    this.goToNextPlayer();
  }

  playerFolded() {
    this.game.arrayForFirstRound.push(this.currentPlayer().playerId);
    this.currentPlayer().folded = true;
    this.currentPlayer().playersTurn = false;
    this.game.playerInGame.splice(this.game.playerInGame.indexOf(this.currentPlayer().playerId), 2)
    this.checkNumberOfFoldedPlayers();
  }

  checkNumberOfFoldedPlayers() {
    let allUnFoldedPlayers: any = this.game.players.filter(player => !player.folded)
    if (allUnFoldedPlayers.length == 1) {
      let player = allUnFoldedPlayers[0]
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
    if (this.game.bigBlindPlayerCheckedInTheFirstRound) {
      this.game.bigBlindPlayerCheckedInTheFirstRound = false;
    }
    this.checkIfPlayerIsOnTheTable();
  }

  checkIfAllPlayersCheckedOrCalled() {
    if (this.allPlayersChecked() || this.allPlayersCalled() || this.game.bigBlindPlayerCheckedInTheFirstRound) {
      if (this.game.showTurn && this.game.showRiver) {
        this.checkWinConditions();
        this.clearAllPlayersSetMoney();
      }
      if (this.game.showTurn && !this.game.showRiver) {
        this.game.showRiver = true;
        this.showNextCard()
        this.clearAllPlayersSetMoney();
      }
      if (this.game.showFlop && !this.game.showTurn) {
        this.game.showTurn = true;
        this.showNextCard()
        this.clearAllPlayersSetMoney();
      }
      this.game.showFlop = true
      this.game.raiseIsPossible = false;
      this.clearAllPlayersSetMoney();
      this.game.checkIsPossible = true;
      this.game.arrayOfPlayerWhoChecked.length = 0;
      this.game.arrayOfPlayerWhoCalled.length = 0;
      this.saveGame();
    }
  }

  clearAllPlayersSetMoney() {
    for (let i = 0; i < this.game.players.length; i++) {
      const player = this.game.players[i];
      player.setMoney = 0
    }
  }

  showNextCard() {
    this.game.flop.push(this.game.stack.pop())
    this.game.raiseIsPossible = false;
    this.game.checkIsPossible = true;
    this.saveGame();
  }

  allPlayersChecked() {
    return this.game.playerInGame.length == this.game.arrayOfPlayerWhoChecked.length
  }

  allPlayersCalled() {
    return this.game.playerInGame.length == this.game.arrayOfPlayerWhoCalled.length
  }

  async checkWinConditions() {
    let cardsOfPlayers = '';
    for (let i = 0; i < this.game.playerInGame.length; i++) {
      const playerId = this.game.playerInGame[i];
      cardsOfPlayers += `&pc[]=${this.game.players[playerId].playerCards[0]},${this.game.players[playerId].playerCards[1]}`
    }

    //API from https://www.pokerapi.dev/ ### by Gareth Fuller
    let url = `https://api.pokerapi.dev/v1/winner/texas_holdem?cc=${this.game.flop[0]},${this.game.flop[1]},${this.game.flop[2]},${this.game.flop[3]},${this.game.flop[4]}${cardsOfPlayers}`

    let response = await fetch(url);
    let a = await response.json();
    console.log('3', a);
    this.findPlayersWithTheseCards(a.winners)

    this.game.roundEnds = true;
    setTimeout(() => {
      this.startNextRound();
    }, 10000);
  }

  findPlayersWithTheseCards(winners) {
    let winningCards = [];

    for (let i = 0; i < winners.length; i++) {
      const cards = winners[i].cards;
      let cardsArray = cards.split(',');
      winningCards.push(cardsArray[0]);
      this.game.winningPlayersResult.push(winners[i].result);
    }
    for (let i = 0; i < winningCards.length; i++) {
      const card = winningCards[i];
      let winner = this.game.players.find((player) => player.playerCards[0] == card);
      this.game.winningPlayersName.push(winner.playerName);
      this.game.winningPlayersId.push(winner.playerId);
      console.log('V', this.game.winningPlayersName)
    }
    this.coinsWhichGetWinner = this.game.allChipsInPot / winners.length;
    for (let i = 0; i < this.game.winningPlayersId.length; i++) {
      const playerId = this.game.winningPlayersId[i];
      this.game.players[playerId].numberOfChips += this.coinsWhichGetWinner;
    }
    this.saveGame();
  }

  startNextRound() {
    this.setAllPlayerTurnFalse();
    this.setAllPlayersFoldStatusFalse();
    this.game.currentPlayerId = this.findPlayerWhichStartsNextRound();
    this.currentPlayer().playersTurn = true;
    this.setValuesBack();
    this.NewStack();
    this.giveCardsToPlayers();
    this.loadAllPlayersInGameArray();
    this.fillFlop();
    this.setBlinds();
    this.saveGame();
  }

  NewStack() {
    this.game.stack.length = 0;
    for (let i = 2; i < 11; i++) {
      this.game.stack.push(`${i}H`)
      this.game.stack.push(`${i}S`)
      this.game.stack.push(`${i}C`)
      this.game.stack.push(`${i}D`)
    }
    let cardsColor = ['H', 'S', 'C', 'D']
    for (let i = 2; i < cardsColor.length; i++) {
      const cardColor = cardsColor[i]
      this.game.stack.push(`A${cardColor}`)
      this.game.stack.push(`K${cardColor}`)
      this.game.stack.push(`Q${cardColor}`)
      this.game.stack.push(`J${cardColor}`)
    }
    this.shuffleCards(this.game.stack)
  }

  shuffleCards(stack: string[]) {
    let currentIndex = stack.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [stack[currentIndex], stack[randomIndex]] = [
        stack[randomIndex], stack[currentIndex]];
    }

    return stack;
  }

  setAllPlayersFoldStatusFalse() {
    for (let i = 0; i < this.game.players.length; i++) {
      const player = this.game.players[i];
      player.folded = false;
    }
  }

  /**It starts the player which sits two seats after the big blind player of the last round */
  findPlayerWhichStartsNextRound() {
    let playerIDWhichStartTheNextRound;
    for (let i = 0; i < 2; i++) {
      this.game.playerWithBigBlindId++
      this.game.playerWithBigBlindId = this.game.playerWithBigBlindId % this.game.players.length
      playerIDWhichStartTheNextRound = this.game.playerWithBigBlindId
    }
    return playerIDWhichStartTheNextRound;
  }

  setValuesBack() {
    this.game.allChipsInPot = 0;
    this.game.playerInGame = [];
    this.game.arrayOfPlayerWhoChecked = [];
    this.game.arrayOfPlayerWhoCalled = [];
    this.game.checkIsPossible = false;
    this.game.raiseIsPossible = false;
    this.game.showFlop = false;
    this.game.showTurn = false;
    this.game.showRiver = false;
    this.game.flop = [];
    this.game.arrayForFirstRound = [];
    this.game.bigBlindPlayerCheckedInTheFirstRound = false;
    this.game.roundEnds = false;
    this.game.winningPlayersName = [];
    this.game.winningPlayersResult = [];
    this.coinsWhichGetWinner = 0;
  }

  checkIfPlayerIsOnTheTable() {
    if (this.currentPlayer().folded) {
      this.goToNextPlayer();
    }
    else {
      this.currentPlayer().playersTurn = true;
      this.game.checkIsPossible = this.proofIfMoveCheckIsPossibile();
      this.checkIfAllPlayersCheckedOrCalled();
    }
    this.saveGame();
  }

  proofIfMoveCheckIsPossibile() {
    let moneyFromCurrentPlayer = this.currentPlayer().setMoney;
    let highestJackpotFormAllPlayers = this.getHighestJackpot();
    if (moneyFromCurrentPlayer >= highestJackpotFormAllPlayers) {
      return true
    }
    else {
      return false
    }
  }

  getHighestJackpot() {
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
    this.saveGame();
  }

  newGame() {
    this.game = new Game();
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogAddPlayerComponent);
    dialogRef.afterClosed().subscribe((name: string) => {
      if (name && name.length > 0) {
        let playerId: number = this.game.players.length
        let playerCards: string[] = ['2H', '2S'];
        let playersTurn: boolean = false;
        let numberOfChips: number = 100;
        let folded: boolean = false;
        let setMoney: number = 0;
        this.playerCreated = name;

        let player = new Player(name, this.game.userImages[playerId], playerId, playerCards, playersTurn, numberOfChips, folded, setMoney);
        this.game.players.push(player);
        this.saveGame()
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

