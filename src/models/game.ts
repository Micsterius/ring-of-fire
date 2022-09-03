export class Game {
    public players: any[] = [];
    public stack: string[] = [];
    public playedCards: any[] = []; // card and position will be saved
    public currentPlayerId: number = 0;
    public pickCardAnimation = false;
    public currentCard: string | any = '';
    public userImages: string[] = ['user-img-1.jpg', 'user-img-4.svg', 'user-img-3.svg', 'user-img-5.svg', 'user-img-2.svg', 'user-img-6.svg'];
    public pokerGameIsStarted = false;
    public playerInGame: any[] = [];
    public allChipsInPot: number = 0;
    public bigBlindPlayerCheckedInTheFirstRound: boolean = false;
    public arrayForFirstRound: any[] = [];
    public arrayOfPlayerWhoChecked: any[] = [];
    public arrayOfPlayerWhoCalled: any[] = [];
    public showFlop: boolean = false;
    public showTurn: boolean = false;
    public showRiver: boolean = false;
    public flop: string[] = [];
    public playerWithBigBlindId: number;
    public roundEnds: boolean = false;
    public winningPlayers: any[] = [];


    constructor() {
        for (let i = 2; i < 11; i++) {
            this.stack.push(`${i}H`)
            this.stack.push(`${i}S`)
            this.stack.push(`${i}C`)
            this.stack.push(`${i}D`)
        }
        let cardsColor = ['H', 'S', 'C', 'D']
        for (let i = 2; i < cardsColor.length; i++) {
            const cardColor = cardsColor[i]
            this.stack.push(`A${cardColor}`)
            this.stack.push(`K${cardColor}`)
            this.stack.push(`Q${cardColor}`)
            this.stack.push(`J${cardColor}`)
        }


        shuffle(this.stack)
    }

    public toJson() {
        let players = createArrayPlayers(this.players);
        return {
            players: players,
            stack: this.stack,
            playedCards: this.playedCards,
            currentPlayerId: this.currentPlayerId,
            pickCardAnimation: this.pickCardAnimation,
            currentCard: this.currentCard,
            userImages: this.userImages,
            pokerGameIsStarted: this.pokerGameIsStarted,
            playerInGame: this.playerInGame,
            allChipsInPot: this.allChipsInPot,
            bigBlindPlayerCheckedInTheFirstRound: this.bigBlindPlayerCheckedInTheFirstRound,
            arrayForFirstRound: this.arrayForFirstRound,
            arrayOfPlayerWhoChecked: this.arrayOfPlayerWhoChecked,
            arrayOfPlayerWhoCalled: this.arrayOfPlayerWhoCalled,
            showFlop: this.showFlop,
            showTurn: this.showTurn,
            showRiver: this.showRiver,
            flop: this.flop,
            playerWithBigBlindId: this.playerWithBigBlindId,
            roundEnds: this.roundEnds,
            winningPlayers: this.winningPlayers
        }
    }

}


function createArrayPlayers(players) {
    let arr = []
    for (let i = 0; i < players.length; i++) {
        const player = players[i];
        arr.push(player.playerName);
        arr.push(player.playerImage);
        arr.push(player.playerId);
        if (player.playerCards.length != 0) {
            for (let i = 0; i < player.playerCards.length; i++) {
                const card = player.playerCards[i];
                arr.push(card);
            }
        }
        arr.push(player.playersTurn);
        arr.push(player.numberOfChips);
        arr.push(player.folded);
        arr.push(player.setMoney);
    }
    return arr;
}

function shuffle(stack: string[]) {
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