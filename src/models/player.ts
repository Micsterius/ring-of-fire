export class Player {
    public playerImage: string | any = '';
    public playerName: string = '';
    public playerCards: string[] = [];

    constructor(name, image) {
        this.playerName = name;
        this.playerImage = image;
    }
}


