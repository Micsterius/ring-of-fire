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
  // gameStarted: boolean = false;
  playerInGame: any[] = [];
  arrayOfPlayerWhoChecked: any[] = [];
  arrayOfPlayerWhoCalled: any[] = [];
  checkIsPossible: boolean = false;
  raiseIsPossible: boolean = false;
  showFlop: boolean = false;
  showTurn: boolean = false;
  showRiver: boolean = false;
  flop: string[] = [];
  temporarySaveOfBigblind: number;
  playerWithBigBlindId: number;
  arrayForFirstRound: any[] = [];
  bigBlindPlayerCheckedInTheFirstRound: boolean = false;
  roundEnds: boolean = false;
  winningPlayers: any[] = [];
  coinsWhichGetWinner: number = 0;
  playerCreated: string = '';

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
          this.game.pickCardAnimation = game.pickCardAnimation;
          this.game.currentCard = game.currentCard;
          this.game.userImages = game.userImages;
          this.game.pokerGameIsStarted = game.pokerGameIsStarted
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
    this.showQuestionForJackpot = true;
    this.setBlinds();
    this.temporarySaveOfBigblind = this.getHighestJackpot();
    this.saveGame();
    console.log(this.game.players)
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
    this.allChipsInPot += 5;
  }

  setBigBlind() {
    let a = this.game.currentPlayerId
    for (let i = 0; i < this.game.players.length - 1; i++) {
      a++
      a = a % this.game.players.length
    }
    this.game.players[a].setMoney += 10;
    this.game.players[a].numberOfChips -= 10;
    this.allChipsInPot += 10;
    this.playerWithBigBlindId = a;
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
    this.currentPlayer().playersTurn = false;
    this.arrayOfPlayerWhoChecked.push(this.currentPlayer());
    if (this.arrayForFirstRound.length == this.game.players.length - 1 && !this.showFlop) {
      this.bigBlindPlayerCheckedInTheFirstRound = true;
      this.checkIfAllPlayersCheckedOrCalled();
      this.goToNextPlayer();
    } else { this.goToNextPlayer() }
  }

  playerCalled() {
    this.showQuestionForJackpot = false;
    this.arrayForFirstRound.push(this.currentPlayer()) // only necessary for the first round
    if (this.getHighestJackpot() == 0) {
      this.currentPlayer().setMoney += 10;
      this.currentPlayer().numberOfChips -= 10;
      this.allChipsInPot += 10;
    }
    else {
      this.currentPlayer().numberOfChips -= this.getHighestJackpot() - this.currentPlayer().setMoney;
      this.allChipsInPot += this.getHighestJackpot() - this.currentPlayer().setMoney;
      this.currentPlayer().setMoney += this.getHighestJackpot() - this.currentPlayer().setMoney;
    }
    this.raiseIsPossible = true;
    this.currentPlayer().playersTurn = false;
    this.arrayOfPlayerWhoCalled.push(this.currentPlayer())
    this.goToNextPlayer();
    this.showQuestionForJackpot = true;
  }

  playerRaise() {
    this.showQuestionForJackpot = false;
    let currentHighestJackpot = this.getHighestJackpot();
    this.currentPlayer().numberOfChips -= currentHighestJackpot * 2;
    this.allChipsInPot += currentHighestJackpot * 2;
    this.raiseIsPossible = true;
    this.currentPlayer().setMoney += currentHighestJackpot * 2;
    this.currentPlayer().playersTurn = false;
    this.arrayOfPlayerWhoCalled.length = 0;
    this.arrayOfPlayerWhoCalled.push(this.currentPlayer())
    this.goToNextPlayer();
    this.showQuestionForJackpot = true;
  }

  playerFolded() {
    this.showQuestionForJackpot = false;
    this.arrayForFirstRound.push(this.currentPlayer());
    this.currentPlayer().folded = true;
    this.currentPlayer().playersTurn = false;
    this.playerInGame.splice(this.playerInGame.indexOf(this.currentPlayer()), 2)
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
    if (this.bigBlindPlayerCheckedInTheFirstRound) {
      this.bigBlindPlayerCheckedInTheFirstRound = false;
    }
    else {
      this.checkIfPlayerIsOnTheTable();
    }

  }

  checkIfAllPlayersCheckedOrCalled() {
    if (this.allPlayersChecked() || this.allPlayersCalled() || this.bigBlindPlayerCheckedInTheFirstRound) {
      if (this.showTurn && this.showRiver) {
        this.checkWinConditions();
        this.clearAllPlayersSetMoney();
      }
      if (this.showTurn && !this.showRiver) {
        this.showRiver = true;
        this.showNextCard()
        this.clearAllPlayersSetMoney();
      }
      if (this.showFlop && !this.showTurn) {
        this.showTurn = true;
        this.showNextCard()
        this.clearAllPlayersSetMoney();
      }
      this.showFlop = true
      this.raiseIsPossible = false;
      this.clearAllPlayersSetMoney();
      this.checkIsPossible = true;
      this.arrayOfPlayerWhoChecked.length = 0;
      this.arrayOfPlayerWhoCalled.length = 0;
    }
  }

  clearAllPlayersSetMoney() {
    for (let i = 0; i < this.game.players.length; i++) {
      const player = this.game.players[i];
      player.setMoney = 0
    }
  }

  showNextCard() {
    this.flop.push(this.game.stack.pop())
    this.raiseIsPossible = false;
    this.checkIsPossible = true;
  }

  allPlayersChecked() {
    return this.playerInGame.length == this.arrayOfPlayerWhoChecked.length
  }

  allPlayersCalled() {
    return this.playerInGame.length == this.arrayOfPlayerWhoCalled.length
  }

  async checkWinConditions() {
    let cardsOfPlayers = '';
    for (let i = 0; i < this.playerInGame.length; i++) {
      const player = this.playerInGame[i];
      cardsOfPlayers += `&pc[]=${player.playerCards[0]},${player.playerCards[1]}`
    }

    //API from https://www.pokerapi.dev/ ### by Gareth Fuller
    let url = `https://api.pokerapi.dev/v1/winner/texas_holdem?cc=${this.flop[0]},${this.flop[1]},${this.flop[2]},${this.flop[3]},${this.flop[4]}${cardsOfPlayers}`

    let response = await fetch(url)
    let a = await response.json()
    this.findPlayersWithTheseCards(a.winners)

    this.roundEnds = true;
    this.showQuestionForJackpot = false;
    setTimeout(() => {
      this.startNextRound();
    }, 5000);
  }

  findPlayersWithTheseCards(winners) {
    let winningCards = [];
    for (let i = 0; i < winners.length; i++) {
      const cards = winners[i].cards;
      let cardsArray = cards.split(',');
      winningCards.push(cardsArray[0])
    }
    for (let i = 0; i < winningCards.length; i++) {
      const card = winningCards[i];
      let winner = this.game.players.find((player) => player.playerCards[0] == card);
      this.winningPlayers.push(winner)
    }
    this.coinsWhichGetWinner = this.allChipsInPot / winners.length
    for (let i = 0; i < this.winningPlayers.length; i++) {
      const player = this.winningPlayers[i];
      player.numberOfChips += this.coinsWhichGetWinner
    }
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
    this.showQuestionForJackpot = true;
    this.setBlinds();
    this.temporarySaveOfBigblind = this.getHighestJackpot();
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

  setAllPlayersFoldStatusFalse(){
    for (let i = 0; i < this.game.players.length; i++) {
      const player = this.game.players[i];
      player.folded = false;
    }
  }

  /**It starts the player which sits two seats after the big blind player of the last round */
  findPlayerWhichStartsNextRound() {
    let playerIDWhichStartTheNextRound;
    for (let i = 0; i < 2; i++) {
      this.playerWithBigBlindId++
      this.playerWithBigBlindId = this.playerWithBigBlindId % this.game.players.length
      playerIDWhichStartTheNextRound = this.playerWithBigBlindId
    }
    return playerIDWhichStartTheNextRound;
  }

  setValuesBack() {
    this.cardsForPlayers = [];
    this.allChipsInPot = 0;
    this.playerInGame = [];
    this.arrayOfPlayerWhoChecked = [];
    this.arrayOfPlayerWhoCalled = [];
    this.checkIsPossible = false;
    this.raiseIsPossible = false;
    this.showFlop = false;
    this.showTurn = false;
    this.showRiver = false;
    this.flop = [];
    this.arrayForFirstRound = [];
    this.bigBlindPlayerCheckedInTheFirstRound = false;
    this.roundEnds = false;
    this.winningPlayers = [];
    this.coinsWhichGetWinner = 0;
  }

  checkIfPlayerIsOnTheTable() {
    if (this.currentPlayer().folded) {
      this.goToNextPlayer();
    }
    else {
      this.currentPlayer().playersTurn = true;
      this.checkIsPossible = this.proofIfMoveCheckIsPossibile();
      this.checkIfAllPlayersCheckedOrCalled();
    }
    this.showQuestionForJackpot = true;
  }

  proofIfMoveCheckIsPossibile() {
    let moneyFromCurrentPlayer = this.currentPlayer().setMoney;
    let highestJackpotFormAllPlayers = this.getHighestJackpot();
    if (moneyFromCurrentPlayer >= highestJackpotFormAllPlayers) {
      return true
    }
    else { return false }
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
        console.log(this.game.players)
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