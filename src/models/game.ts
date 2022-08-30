export class Game {
    public players: any[] = [];
    public stack: string[] = [];
    public playedCards: any[] = []; // card and position will be saved
    public currentPlayer: number = 0;
    public pickCardAnimation = false;
    public currentCard: string | any = '';
    public userImages: string[] = ['user-img-1.jpg', 'user-img-4.svg', 'user-img-3.svg', 'user-img-5.svg', 'user-img-2.svg', 'user-img-6.svg'];


    constructor() {
        for (let i = 1; i < 14; i++) {
            this.stack.push('red_' + i)
            this.stack.push('blue_' + i)
            this.stack.push('purple_' + i)
            this.stack.push('green_' + i)
        }

        shuffle(this.stack)
    }

    public toJson() {
        let players = createArrayPlayers(this.players);
        return {
            players: players,
            stack: this.stack,
            playedCards: this.playedCards,
            currentPlayer: this.currentPlayer,
            pickCardAnimation: this.pickCardAnimation,
            currentCard: this.currentCard,
            userImages: this.userImages
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