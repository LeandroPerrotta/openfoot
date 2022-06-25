import { Client } from "../../net/client";
import { Tools } from "../../shared";
import { GameScore } from "../../shared/game.type";
import { ClientMessageTypes, ServerMessageType } from "../../shared/net/net.type";

export class Game {

    private client: Client;

    private timer = 0;
    private score: GameScore = { home: 0, visitor: 0 };
    private balance = 50;

    private event: NodeJS.Timeout;

    constructor(client: Client) {

        this.client = client;
        this.event = this.runTimer();
    }

    runTimer() {

        return setTimeout(this.onThink.bind(this));
    }

    endGame() {

        Game._games.delete(this.client.clientIndex);
    }

    pauseGame() {

        clearTimeout(this.event);
    }

    resumeGame() {

        this.event = this.runTimer();
    }

    ballControl() {

        const randomValue = Tools.random(1, 100);
        let balanceChange;

        if (randomValue <= 33) {
            balanceChange = -Tools.random(2, 6);
        }
        else if (randomValue <= 66) {
            balanceChange = Tools.random(0, 2);;
        }
        else {
            balanceChange = Tools.random(2, 6);
        }

        /* contra ataque */
        if (this.balance >= 70 && balanceChange < 0 && Tools.random(1, 100) < 10) {

            balanceChange = -Tools.random(50, 70);
        }
        else if (this.balance <= 30 && balanceChange > 0 && Tools.random(1, 100) < 10) {

            balanceChange = Tools.random(50, 70);
        }

        this.balance = Math.max(Math.min(this.balance + balanceChange, 100), 0);

        if (this.balance == 100) {

            this.score.home++;
            this.balance = 50;
        }
        else if (this.balance == 0) {

            this.score.visitor++;
            this.balance = 50;
        }
    }

    onThink() {

        this.timer = this.timer + 1;
        this.ballControl();

        this.client.send(ServerMessageType.GameTimer, { timer: this.timer, balance: this.balance, score: this.score });

        if (this.timer < 90) {
            this.event = setTimeout(this.onThink.bind(this), 1000)
        }
        else {
            this.endGame();
        }
    }

    private static _games: Map<number, Game> = new Map();
    static init() {

        Client.registerMessageCallback(ClientMessageTypes.GameStart, this.onPlayerStartGame)
        Client.registerMessageCallback(ClientMessageTypes.GamePause, this.onPlayerPauseGame)
    }

    static onPlayerStartGame(client: Client) {

        console.log('Player started game!')

        const game = new Game(client);
        Game._games.set(client.clientIndex, game);
    }

    static onPlayerPauseGame(client: Client, data: any) {

        const game = Game._games.get(client.clientIndex);

        if (!game) {
            throw new Error(`No game started for connecton #${client.clientIndex}`);
        }

        if(data.type == "pause") {
            game.pauseGame();
        }
        else{
            game.resumeGame();
        }
    }
}