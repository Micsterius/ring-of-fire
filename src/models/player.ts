export class Player {
    public playerImage: string | any = '';
    public playerName: string = '';
    public playerCards: string[] = [];
    public playerId: number;
    public playersTurn:boolean = false;
    public numberOfChips:number = 100;
    public folded:boolean = false;
    public setMoney:number = 0;

    constructor(playerInfo) {
        this.playerName = playerInfo.name;
        this.playerImage = playerInfo.userImage;
        this.playerId = playerInfo.id;
        this.playerCards = playerInfo.playerCards;
        this.playersTurn = playerInfo.playersTurn;
        this.numberOfChips = playerInfo.numberOfChips;
        this.folded = playerInfo.folded;
        this.setMoney = playerInfo.setMoney;
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


