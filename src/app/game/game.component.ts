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
  currentPlayer: any;

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
      let name = gamePlayers.shift()
      let playerImage = gamePlayers.shift()
      let playerId = gamePlayers.shift()
      let playerCards = [gamePlayers.shift(), gamePlayers.shift()]
      let playersTurn = gamePlayers.shift()
      let numberOfChips = gamePlayers.shift()
      let folded = gamePlayers.shift()

      let player = new Player(name, playerImage, playerId, playerCards, playersTurn, numberOfChips, folded)
      temporaryArrayOfAllPlayers.push(player)
      console.log(temporaryArrayOfAllPlayers)
    }

    return temporaryArrayOfAllPlayers;
  }

  startPokerGame() {
    this.giveCardsToPlayers()
    this.giveCardsToPlayers()
    this.pokerGameIsStarted = true;
    this.setAllPlayerTurnFalse();
    this.game.currentPlayerId = this.findPlayerWhoStartsRandomized();
    this.currentPlayer = this.game.players[this.game.currentPlayerId];
    this.currentPlayer.playersTurn = true;
    //this.firestore.collection('games').add({ ... this.game.toJson() });
    this.saveGame();
    this.loadAllPlayersInGameArray();
    this.showQuestionForJackpot = true;
    this.gameStarted = true;
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

  playerFolded() {
    this.showQuestionForJackpot = false;
    this.game.players[this.game.currentPlayerId].folded = true;
    this.game.players[this.game.currentPlayerId].playersTurn = false;
    this.checkNumberOfFoldedPlayers();
  }

  checkNumberOfFoldedPlayers(){
    let allFoldedPlayers:any = this.game.players.filter(player => !player.folded)
    if(allFoldedPlayers.length == 1){
      let player = allFoldedPlayers[0]
      alert('look in console')
      console.log('Es gewinnt:', player)
    }
    else {
      console.log('2', this.currentPlayer)
      this.goToNextPlayer();
    }
  }

  goToNextPlayer() {
    console.log('3', this.currentPlayer)
    this.game.currentPlayerId++
    this.game.currentPlayerId = this.game.currentPlayerId % this.game.players.length
    this.checkIfPlayerIsOnTheTable();
  }

  checkIfPlayerIsOnTheTable() {
    if (this.game.players[this.game.currentPlayerId].folded) {
      this.goToNextPlayer();
    }
    else {  
      this.game.players[this.game.currentPlayerId].playersTurn = true;
    }
    this.showQuestionForJackpot = true;
  }



  playerFoldedOld() {
    this.showQuestionForJackpot = false;
    let idOfNextPlayer;
    let player;
    if (this.gameStarted) {
      player = this.game.players.find(player => player.playersTurn);
      console.log(player)
      this.gameStarted = false;
      player.playersTurn = false;
      player.folded = true;
    }
    player.playersTurn = false;
    player.folded = true;
    this.playerInGame.splice(this.playerInGame.indexOf(player), 1)
    console.log(this.playerInGame)


    /*if (player.playerId < this.game.players.length - 1) {
      idOfNextPlayer = this.findNextPlayer(player.playerId)
    }
    else {
      this.game.players[0].playersTurn = true;
    }
*/
    this.showQuestionForJackpot = true;
  }

  findNextPlayer(id) {
    for (let i = id + 1; i < this.game.players.length; i++) {
      const nextPlayer = this.game.players[i];
      if (!nextPlayer.folded) {
        return i;
      }
    }
  }

  nextRoundOnBetting() {
    let playersInGame = this.game.players.filter(player => !player.folded)
    if (playersInGame.length > 1) {
      let nextPlayer = this.game.players.find(player => !player.folded)
      nextPlayer.playersTurn = true;
    }
  }

  playerSetMoney() {
    this.showQuestionForJackpot = false;
    let idOfNextPlayer;
    for (let i = 0; i < this.game.players.length; i++) {
      const player = this.game.players[i];
      if (player.playersTurn && !player.folded) {
        player.playersTurn = false;
        player.numberOfChips -= 5;
        this.allChipsInPot += 5;
        if (i == this.game.players.length - 1) {
          idOfNextPlayer = 0;
        }
        else {
          idOfNextPlayer = i + 1;
        }
      }
    }
    if (!this.game.players[idOfNextPlayer].folded) {
      this.game.players[idOfNextPlayer].playersTurn = true;
    }

    this.showQuestionForJackpot = true;
  }

  giveCardsToPlayers() {
    if (this.game.players[0].playerCards.length < 2) {
      for (let i = 0; i < this.game.players.length; i++) {
        let newCard = this.game.stack.pop();
        this.game.players[i].playerCards.push(newCard);
      }
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


