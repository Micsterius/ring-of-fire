export class Game {
    public players: string[] = [];
    public stack: string[] = [];
    public playedCards: any[] = []; // card and position will be saved
    public currentPlayer: number = 0;
    public pickCardAnimation = false;
    public currentCard: string | any = '';

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
        return {
            players: this.players,
            stack: this.stack,
            playedCards: this.playedCards,
            currentPlayer: this.currentPlayer,
            pickCardAnimation: this.pickCardAnimation,
            currentCard: this.currentCard
        }
    }
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