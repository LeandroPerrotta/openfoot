import { Client } from "../../net/client";
import { Tools } from "../../shared";
import { GameScore, GameTeam } from "../../shared/game.type";
import { ClientMessageTypes, ServerMessageType } from "../../shared/net/net.type";

export class Game {

    private client: Client;

    private timer = 0;
    private score: GameScore = { [GameTeam.Home]: 0, [GameTeam.Visitor]: 0 };
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

    updateClient() {

        this.client.send(ServerMessageType.GameTimer, { timer: this.timer, balance: this.balance, score: this.score });
    }

    changeScore(balanceChange: number) {

        let goalMessage = 'GOOOOL!'
        let goalTeam = balanceChange > 0 ? GameTeam.Home : GameTeam.Visitor;

        this.score[goalTeam]++;
        this.restartGameBalance();

        this.client.send(ServerMessageType.GameGoal, { message: goalMessage, goalTeam: goalTeam})

        setTimeout(this.resumeGame.bind(this), 5000)
    }

    restartGameBalance() {

        this.balance = 50;
    }

    penalty(balanceChange: number) {

        let penaltyChance = 0;

        if (balanceChange > 0 && this.balance > 80)
            penaltyChance = this.balance + balanceChange >= 95 ? 10 : 5;
        else if (balanceChange < 0 && this.balance < 20) {
            penaltyChance = this.balance - balanceChange <= 5 ? 10 : 5;
        }

        if (Tools.random(1, 100) > penaltyChance) {

            return false;
        }

        setTimeout(() => {
            this.client.send(ServerMessageType.GamePenaltie, { message: 'PENALTI!' });
        })

        setTimeout(() => {
            this.client.send(ServerMessageType.GamePenaltie, { message: '3...' });
        }, 2000)

        setTimeout(() => {
            this.client.send(ServerMessageType.GamePenaltie, { message: '2...' });
        }, 4000)

        setTimeout(() => {
            this.client.send(ServerMessageType.GamePenaltie, { message: '1...' });
        }, 6000)

        setTimeout(() => {

            const goal = Tools.random(1, 100) > 20 ? true : false;

            if (goal)
                this.changeScore(balanceChange)
            else{
                this.client.send(ServerMessageType.GamePenaltie, { message: 'DEFENDEUU!', last: true });
                setTimeout(this.resumeGame.bind(this), 2000);
            }            
                
        }, 8000)

        return true;

    }

    ballControl() {

        const randomValue = Tools.random(1, 100);
        let balanceChange: number;

        if (randomValue <= 33) {
            balanceChange = -Tools.random(2, 6);
        }
        else if (randomValue <= 66) {
            balanceChange = Tools.random(0, 2);;
        }
        else {
            balanceChange = Tools.random(4, 8);
        }

        if (this.penalty(balanceChange)) {

            this.updateClient();
            return false;
        }

        /* contra ataque */
        if (this.balance >= 70 && balanceChange < 0 && Tools.random(1, 100) < 15) {

            balanceChange = -Tools.random(60, 80);
        }
        else if (this.balance <= 30 && balanceChange > 0 && Tools.random(1, 100) < 10) {

            balanceChange = Tools.random(50, 70);
        }

        this.balance = Math.max(Math.min(this.balance + balanceChange, 100), 0);

        if (this.balance == 100 || this.balance == 0) {

            this.changeScore(balanceChange);
            return false;
        }

        return true;
    }

    onThink() {

        this.timer = this.timer + 1;
        if (!this.ballControl()) {
            return;
        }

        this.updateClient();

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

        if (data.type == "pause") {
            game.pauseGame();
        }
        else {
            game.resumeGame();
        }
    }
}