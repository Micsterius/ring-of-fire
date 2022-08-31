export class Player {
    public playerImage: string | any = '';
    public playerName: string = '';
    public playerCards: string[] = [];
    public playerId: number;
    public playersTurn:boolean = false;
    public numberOfChips:number = 100;
    public folded:boolean = false;
    public setMoney:number = 0;

    constructor(name, playerImage, playerId, playerCards, playersTurn, numberOfChips, folded, setMoney) {
        this.playerName = name;
        this.playerImage = playerImage;
        this.playerId = playerId;
        this.playerCards = playerCards;
        this.playersTurn = playersTurn;
        this.numberOfChips = numberOfChips;
        this.folded = folded;
        this.setMoney = setMoney;
    }

    public playerToJson() {
        return {
            playerName: this.playerName,
            playerImage: this.playerImage,
            playerId: this.playerId,
            playerCards: this.playerName,
            playersTurn: this.playerImage,
            numberOfChips: this.playerId,
            folded: this.folded,
            setMoney: this.setMoney
        }
    }
}


