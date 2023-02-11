import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DialogAddPlayerComponent } from 'src/app/dialog-add-player/dialog-add-player.component';
import { DialogGameEndComponent } from 'src/app/dialog-game-end/dialog-game-end.component';
import { Game } from 'src/models/game';
import { Player } from 'src/models/player';
import { AudioService } from './audio.service';
import { GeneralService } from './general.service';

@Injectable({
  providedIn: 'root'
})
export class GameServiceService {
  game: Game;
  nbrOfRotation: number = 0;
  gameId: string;
  playerIsCreated: boolean = false;

  playersName: string = '';

  playerCreated: string = '';
  playerID: number;
  sameIpAddress: boolean = false;

  ipAddress: string = '';

  mouseOverValueDeveloperModeBtn: boolean = false;
  hideHintForDeveloperMode: boolean = false;
  timerStatus = "start";
  constructor(
    private firestore: AngularFirestore,
    public dialog: MatDialog,
    public audioService: AudioService,
    private generalService: GeneralService,
    private router: Router
  ) { }

  addItem(newItem: string) {
    this.playersName = newItem;
    console.log(this.playersName);
    console.log(newItem);
  }

  startGame(gameId) {
    this.gameId = gameId
    this.firestore
      .collection('games')
      .doc(this.gameId)
      .valueChanges()
      .subscribe((game: any) => this.initalizeGame(game))
  }

  initalizeGame(game) {
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
    this.game.developerMode = game.developerMode;
  }

  handleEventTimer(event) {
    this.timerStatus = event.action;
    if (this.timerStatus === "done") {
      if (this.game.checkIsPossible) {
        this.playerChecks();
        this.audioService.playCheckSound();
      }
      else {
        this.playerFolded();
        this.audioService.playFoldSound()
      };
    };
  }

  activateDeveloperMode() {
    this.game.developerMode = true;
    this.hideHintForDeveloperMode = true;
    this.saveGame();
  }

  mouseOverDeveloperModeBtn() {
    this.mouseOverValueDeveloperModeBtn = true;
  }

  mouseOutDeveloperModeBtn() {
    this.mouseOverValueDeveloperModeBtn = false;
  }

  recreatePlayer(gamePlayers) {
    let temporaryArrayOfAllPlayers = [];
    for (let i = 0; i < gamePlayers.length; i++) {
      let playerInfo = {
        "name": gamePlayers.shift(),
        "userImage": gamePlayers.shift(),
        "id": gamePlayers.shift(),
        "playerCards": [gamePlayers.shift(), gamePlayers.shift()],
        "playersTurn": gamePlayers.shift(),
        "numberOfChips": gamePlayers.shift(),
        "folded": gamePlayers.shift(),
        "setMoney": gamePlayers.shift()
      }
      let player = new Player(playerInfo)
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

  /** If the big blind player in the first round checks as his first move, the flop has to be shown.*/
  playerChecks() {
    this.currentPlayer().playersTurn = false;
    this.game.arrayOfPlayerWhoChecked.push(this.currentPlayer().playerId);
    if (this.bigBlindPlayerCheckedAsHisFirstMove()) {
      this.game.bigBlindPlayerCheckedInTheFirstRound = true;
      this.checkIfAllPlayersCheckedOrCalled();
      this.goToNextPlayer();
    } else this.goToNextPlayer();
  }

  bigBlindPlayerCheckedAsHisFirstMove() {
    return this.game.arrayForFirstRound.length == this.game.players.length - 1 && !this.game.showFlop
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

  checkNecessaryNumberOfCoinsToCall() {
   let nbrOfChipsToCall = this.getHighestJackpot() - this.currentPlayer().setMoney;
   if (nbrOfChipsToCall > this.currentPlayer().numberOfChips) return false;
   else return true;
  }

  playerSetMoney() {
    this.game.arrayOfPlayerWhoChecked.length = 0;
    this.currentPlayer().setMoney += 10;
    this.currentPlayer().numberOfChips -= 10;
    this.game.allChipsInPot += 10;
    this.game.callIsPossible = true;
    this.game.raiseIsPossible = true;
    this.currentPlayer().playersTurn = false;
    this.game.arrayOfPlayerWhoCalled.push(this.currentPlayer().playerId);
    this.saveGame();
    this.goToNextPlayer();
  }

  playerRaise() {
    let currentHighestJackpotOfOnePlayer = this.getHighestJackpot();
    this.currentPlayer().numberOfChips -= currentHighestJackpotOfOnePlayer * 2;
    this.game.allChipsInPot += currentHighestJackpotOfOnePlayer * 2;
    this.game.raiseIsPossible = true;
    this.currentPlayer().setMoney += currentHighestJackpotOfOnePlayer * 2;
    this.currentPlayer().playersTurn = false;
    //restart to count which player calls
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

  playerGoesAllIn() {
    this.game.arrayOfPlayerWhoChecked.length = 0;
    this.currentPlayer().setMoney += this.currentPlayer().numberOfChips;
    this.game.allChipsInPot += this.currentPlayer().numberOfChips;
    this.currentPlayer().numberOfChips = 0;
    this.game.raiseIsPossible = true;
    this.currentPlayer().playersTurn = false;
    this.game.arrayOfPlayerWhoCalled.push(this.currentPlayer().playerId);
    this.saveGame();
    this.goToNextPlayer();
  }

  checkNumberOfFoldedPlayers() {
    let allUnFoldedPlayers: any = this.game.players.filter(player => !player.folded)
    if (this.onlyOnePlayerIsStillInGame(allUnFoldedPlayers)) {
      let player = allUnFoldedPlayers[0]
      this.game.coinsWhichGetWinner = this.game.allChipsInPot;
      player.numberOfChips += this.game.allChipsInPot;
      this.game.winningPlayersName.push(player.playerName);
      this.game.roundEnds = true;
      setTimeout(() => this.startNextRound(), 10000);
    }
    else { this.goToNextPlayer(); }
  }

  onlyOnePlayerIsStillInGame(allUnFoldedPlayers) {
    return allUnFoldedPlayers.length == 1
  }

  goToNextPlayer() {
    this.game.currentPlayerId++
    this.game.currentPlayerId = this.game.currentPlayerId % this.game.players.length
    if (this.game.bigBlindPlayerCheckedInTheFirstRound) this.game.bigBlindPlayerCheckedInTheFirstRound = false;
    this.checkIfNextPlayerIsOnTheTable();
  }

  checkIfAllPlayersCheckedOrCalled() {
    if (this.allPlayersChecked() || this.allPlayersCalled() || this.game.bigBlindPlayerCheckedInTheFirstRound) {
      if (this.game.showRiver) this.checkWinConditions();
      if (this.game.showTurn && !this.game.showRiver) this.showRiver();
      if (this.game.showFlop && !this.game.showTurn) this.showTurn();
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
    if (!this.generalService.testModus) setTimeout(() => this.startNextRound(), 5000);
  }

  async findWinCardCombination(cardsOfPlayers) {
    //API from https://www.pokerapi.dev/ ### by Gareth Fuller
    let url = `https://api.pokerapi.dev/v1/winner/texas_holdem?cc=${this.game.flop[0]},${this.game.flop[1]},${this.game.flop[2]},${this.game.flop[3]},${this.game.flop[4]}${cardsOfPlayers}`

    let response = await fetch(url);
    let a = await response.json();
    console.log(a.winners)
    this.game.roundEnds = true;
    this.findPlayersWithTheseCards(a.winners)
  }

  findPlayersWithTheseCards(winners) {
    for (let i = 0; i < winners.length; i++) {
      const cards = winners[i].cards;
      let cardsArray = cards.split(',');
      this.game.winningCards.push(cardsArray[0]);
      this.game.winningPlayersResult.push(winners[i].result);
    }
    this.findPlayerWithWinningCards(winners);
    this.distributeChips(winners);
    this.saveGame();
    this.audioService.playMoneySound();
  }

  findPlayerWithWinningCards(winners) {
    for (let i = 0; i < winners.length; i++) {
      const card = this.game.winningCards[i];
      let winner = this.game.players.find((player) => player.playerCards[0] == card);
      this.game.winningPlayersName.push(winner.playerName);
      this.game.winningPlayersId.push(winner.playerId);
    }
  }

  distributeChips(winners) {
    this.game.coinsWhichGetWinner = this.game.allChipsInPot / winners.length;
    for (let i = 0; i < this.game.winningPlayersId.length; i++) {
      const playerId = this.game.winningPlayersId[i];
      this.game.players[playerId].numberOfChips += this.game.coinsWhichGetWinner;
    }
  }

  startNextRound() {
    this.checkWhichPlayerHaveEnoughMoneyForBigBlind();
    this.saveGame(); // finish game in case of only one player left
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

  checkWhichPlayerHaveEnoughMoneyForBigBlind() {
    this.game.roundEnds = false; // have to be included here, else it coudn't find the winning player after a player left the game
    let playerStillOnTable = [];
    for (let i = 0; i < this.game.players.length; i++) {
      const player = this.game.players[i];
      if (player.numberOfChips >= 10) {
        playerStillOnTable.push(player)
      }
    }
    this.game.players = playerStillOnTable;
    if (this.game.players.length == 1) {
      this.openDialogGameEnds();
      console.log('Hello world')
    }
  }

  openDialogGameEnds(): void {
    const dialogRef = this.dialog.open(DialogGameEndComponent);
    dialogRef.afterClosed().subscribe((name: string) => {
      this.router.navigateByUrl('')
    });
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
    this.game.winningPlayersName = [];
    this.game.winningPlayersResult = [];
    this.game.coinsWhichGetWinner = 0;
    this.game.callIsPossible = true;
    this.game.winningCards = [];
    this.game.winningPlayersId = [];
    this.saveGame();
  }

  checkIfNextPlayerIsOnTheTable() {
    if (this.currentPlayer().folded) this.goToNextPlayer();
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
    return moneyFromCurrentPlayer >= highestJackpotFormAllPlayers;
  }

  proofIfMoveCallIsPossibile() {
    let moneyFromCurrentPlayer = this.currentPlayer().setMoney;
    let highestJackpotFormAllPlayers = this.getHighestJackpot();
    return moneyFromCurrentPlayer != highestJackpotFormAllPlayers;
  }

  /** This function give the highest money of the highest Jackpot back to know, if the player can check or how much
   * money the player have to set for call or raise.
   */
  getHighestJackpot() {
    let allPlayersJackpots = this.game.players.map((player) => player.setMoney)
    let highestJackpot = -1;
    allPlayersJackpots.forEach((setMoney) => {
      if (highestJackpot < setMoney) highestJackpot = setMoney;
    })
    return highestJackpot
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

  /**Open dialog window for creat a new player*/
  openDialog(): void {
    const dialogRef = this.dialog.open(DialogAddPlayerComponent);
    dialogRef.afterClosed().subscribe((name: string) => {
      if (!name) {
        return
      }
      if (this.nameWithMinOneCharacterIsGiven(name) && !this.proofIfNameAlreadyExist(name) && this.numberOfPlayersIsUnderSix()) {
        this.game.ipAddress.push(this.ipAddress)
        this.createPlayer(name)
        this.saveGame();
      }
    });
  }

  createPlayer(name) {
    let playerId: number = this.game.players.length;
    this.playerID = this.game.players.length;
    this.playerCreated = name;
    this.playerIsCreated = true;
    let player = new Player(this.createPlayerJson(name, playerId));
    this.game.players.push(player);
  }

  createPlayerJson(name, id) {
    let playerInfo = {
      "name": name,
      "id": id,
      "playerCards": ['2H', '2S'],
      "playersTurn": false,
      "numberOfChips": 200,
      "folded": false,
      "setMoney": 0,
      "userImage": this.game.userImages[id]
    }
    return playerInfo
  }

  nameWithMinOneCharacterIsGiven(name) {
    return name && name.length > 0
  }

  proofIfNameAlreadyExist(name) {
    return this.game.players.some((player) => player.playerName == name)
  }

  numberOfPlayersIsUnderSix() {
    return this.game.players.length <= 6;
  }

  //not necessary if only play with friends. In case of open tables, it should be implemented against cheating
  /*
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

  */

  saveGame() {
    this.firestore
      .collection('games')
      .doc(this.gameId)
      .update({ ... this.game.toJson() });
  }
}

