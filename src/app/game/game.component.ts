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
  playerIsCreated: boolean = false;

  playerCreated: string = '';

  ipAddress: string = '';
  developerMode: boolean = true;


  /**next tasks:
   *  - All in Options.
   *  - player has 10s or he folded automatica
   */

  constructor(private route: ActivatedRoute, private firestore: AngularFirestore, public dialog: MatDialog) {
  }


  ngOnInit(): void {
    this.newGame();
    this.getIPAddress();
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
          this.game.callIsPossible = game.callIsPossible;
          this.game.coinsWhichGetWinner = game.coinsWhichGetWinner;
          this.game.winningCards = game.winningCards;
          this.game.ipAddress = game.ipAddress;
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
      this.game.callIsPossible = false;
      this.game.raiseIsPossible = false;
      this.checkIfAllPlayersCheckedOrCalled();
      this.goToNextPlayer();
    } else { this.goToNextPlayer() }
  }

  playerCalled() {
    this.game.arrayForFirstRound.push(this.currentPlayer().playerId) // only necessary for the first round
    this.currentPlayer().numberOfChips -= this.getHighestJackpot() - this.currentPlayer().setMoney;
    this.game.allChipsInPot += this.getHighestJackpot() - this.currentPlayer().setMoney;
    this.currentPlayer().setMoney += this.getHighestJackpot() - this.currentPlayer().setMoney;
    this.game.raiseIsPossible = true;
    this.currentPlayer().playersTurn = false;
    this.game.arrayOfPlayerWhoCalled.push(this.currentPlayer().playerId)
    this.saveGame();
    this.goToNextPlayer();
  }

  playerSetMoney() {
    this.game.arrayOfPlayerWhoChecked.length = 0;
    this.currentPlayer().setMoney += 10;
    this.currentPlayer().numberOfChips -= 10;
    this.game.allChipsInPot += 10;
    this.game.callIsPossible = true;
    this.game.raiseIsPossible = true;
    this.currentPlayer().playersTurn = false;
    if (this.game.arrayForFirstRound.length == this.game.players.length - 1 && !this.game.showFlop) {
      this.game.arrayOfPlayerWhoCalled.length = 0;
    } else { this.game.arrayOfPlayerWhoCalled.push(this.currentPlayer().playerId); }
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
    this.game.playerInGame.splice(this.game.playerInGame.indexOf(this.currentPlayer().playerId), 1)
    this.checkNumberOfFoldedPlayers();
    this.saveGame();
  }

  checkNumberOfFoldedPlayers() {
    let allUnFoldedPlayers: any = this.game.players.filter(player => !player.folded)
    if (allUnFoldedPlayers.length == 1) {
      let player = allUnFoldedPlayers[0]
      this.game.coinsWhichGetWinner = this.game.allChipsInPot;
      player.numberOfChips += this.game.allChipsInPot;
      this.game.winningPlayersName.push(player.playerName);
      this.game.roundEnds = true;
      setTimeout(() => {
        this.startNextRound();
      }, 15000);
    }
    else { this.goToNextPlayer(); }
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
      if (this.game.showRiver) { this.checkWinConditions() }
      if (this.game.showTurn && !this.game.showRiver) { this.showRiver() }
      if (this.game.showFlop && !this.game.showTurn) { this.showTurn() }
      this.game.showFlop = true
      this.game.raiseIsPossible = false;
      this.clearAllPlayersSetMoney();
      this.game.checkIsPossible = true;
      this.game.arrayOfPlayerWhoChecked.length = 0;
      this.game.arrayOfPlayerWhoCalled.length = 0;
      this.saveGame();
    }
  }

  showRiver() {
    this.game.showRiver = true;
    this.showNextCard()
    this.clearAllPlayersSetMoney();
  }

  showTurn() {
    this.game.showTurn = true;
    this.showNextCard()
    this.clearAllPlayersSetMoney();
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

  checkWinConditions() {
    let cardsOfPlayers = '';
    for (let i = 0; i < this.game.playerInGame.length; i++) {
      const playerId = this.game.playerInGame[i];
      cardsOfPlayers += `&pc[]=${this.game.players[playerId].playerCards[0]},${this.game.players[playerId].playerCards[1]}`
    }
    this.findWinCardCombination(cardsOfPlayers)
    this.saveGame();
    setTimeout(() => {
      this.startNextRound();
    }, 5000);
  }

  async findWinCardCombination(cardsOfPlayers) {
    //API from https://www.pokerapi.dev/ ### by Gareth Fuller
    let url = `https://api.pokerapi.dev/v1/winner/texas_holdem?cc=${this.game.flop[0]},${this.game.flop[1]},${this.game.flop[2]},${this.game.flop[3]},${this.game.flop[4]}${cardsOfPlayers}`

    let response = await fetch(url);
    let a = await response.json();
    this.game.roundEnds = true;
    this.findPlayersWithTheseCards(a.winners)
  }

  findPlayersWithTheseCards(winners) {
    for (let i = 0; i < winners.length; i++) {
      const cards = winners[i].cards;
      let cardsArray = cards.split(',');
      this.game.winningCards.push(cardsArray[0]);
      this.game.winningCards.push(cardsArray[1]);
      this.game.winningPlayersResult.push(winners[i].result);
    }
    this.findPlayerWithWinningCards(winners);
    this.distributeChips(winners);
    this.saveGame();
  }

  findPlayerWithWinningCards(winners) {
    for (let i = 0; i < winners.length; i++) {
      const card = this.game.winningCards[i];
      let winner = this.game.players.find((player) => player.playerCards[0] == card);
      this.game.winningPlayersName.push(winner.playerName);
      this.game.winningPlayersId.push(winner.playerId);
    }
    console.log(this.game.winningPlayersId)
  }

  distributeChips(winners) {
    this.game.coinsWhichGetWinner = this.game.allChipsInPot / winners.length;
    for (let i = 0; i < this.game.winningPlayersId.length; i++) {
      const playerId = this.game.winningPlayersId[i];
      this.game.players[playerId].numberOfChips += this.game.coinsWhichGetWinner;
    }
  }

  startNextRound() {
    this.clearAllPlayersSetMoney();
    this.setAllPlayerTurnFalse();
    this.setAllPlayersFoldStatusFalseAndSetMoneyToZero();
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

  setAllPlayersFoldStatusFalseAndSetMoneyToZero() {
    for (let i = 0; i < this.game.players.length; i++) {
      const player = this.game.players[i];
      player.folded = false;
      player.setMoney = 0;
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
    this.game.coinsWhichGetWinner = 0;
    this.game.callIsPossible = true;
    this.game.winningCards = [];
    this.saveGame();
  }

  checkIfPlayerIsOnTheTable() {
    if (this.currentPlayer().folded) {
      this.goToNextPlayer();
    }
    else {
      this.currentPlayer().playersTurn = true;
      this.game.checkIsPossible = this.proofIfMoveCheckIsPossibile();
      this.game.callIsPossible = this.proofIfMoveCallIsPossibile();
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

  proofIfMoveCallIsPossibile() {
    let moneyFromCurrentPlayer = this.currentPlayer().setMoney;
    let highestJackpotFormAllPlayers = this.getHighestJackpot();
    if (moneyFromCurrentPlayer == highestJackpotFormAllPlayers) {
      return false;
    }
    else {
      return true;
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

      if (name && name.length > 0 && !this.ipAddressIsAlreadyInGame(this.ipAddress) || this.developerMode) {
        this.game.ipAddress.push(this.ipAddress)
        let playerId: number = this.game.players.length
        let playerCards: string[] = ['2H', '2S'];
        let playersTurn: boolean = false;
        let numberOfChips: number = 200;
        let folded: boolean = false;
        let setMoney: number = 0;
        this.playerCreated = name;
        this.playerIsCreated = true;
        let player = new Player(name, this.game.userImages[playerId], playerId, playerCards, playersTurn, numberOfChips, folded, setMoney);
        this.game.players.push(player);

        this.saveGame();
      } else { alert('ip is already there') }
    });
  }

  async getIPAddress() {
    let url = 'https://api.ipify.org/?format=json';
    let response = await fetch(url);
    let ipAddressOfCurrentPlayer = await response.json();
    let formatedIpAddress = ipAddressOfCurrentPlayer.ip.split('.');
    let newFormatedIpAddress = `${formatedIpAddress[0]}` + `${formatedIpAddress[1]}` + `${formatedIpAddress[2]}` + `${formatedIpAddress[3]}`
    this.ipAddress = newFormatedIpAddress;
  }

  ipAddressIsAlreadyInGame(ipAddressOfCurrentPlayer) {
    return this.game.ipAddress.some((ip) => ip == ipAddressOfCurrentPlayer);
  }

  saveGame() {
    this
      .firestore
      .collection('games')
      .doc(this.gameId)
      .update({ ... this.game.toJson() });
  }
}

