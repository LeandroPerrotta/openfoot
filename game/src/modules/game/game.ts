import { Client } from "../../net/client";
import { Tools } from "../../shared";
import { GameScore } from "../../shared/game.type";
import { ClientMessageTypes, ServerMessageType } from "../../shared/net/net.type";

export class Game{

    private client: Client;

    private timer = 0;
    private score: GameScore = { home: 0, visitor: 0 };
    private balance = 50;

    constructor(client: Client){

        this.client = client;
    }

    startGame(){

        this.onThink();
    }

    endGame(){

        for(const index in Game._games){

            if(this === Game._games[index]){
                delete Game._games[index];
                return;
            }
        }
    }

    ballControl(){

        const randomValue = Tools.random(1, 100);
        let balanceChange = randomValue >= 50 ? 5 : -5;

        /* contra ataque */
        if(this.balance >= 70 && balanceChange < 0 && Tools.random(1, 100) < 10) {

            balanceChange = -Tools.random(50, 70);
        }
        else if(this.balance <= 30 && balanceChange > 0 && Tools.random(1, 100) < 10){

            balanceChange = Tools.random(50, 70);
        }

        this.balance = Math.max(Math.min(this.balance + balanceChange, 100), 0);

        if(this.balance == 100) {

            this.score.home++;
            this.balance = 50;
        }
        else if(this.balance == 0) {

            this.score.visitor++;
            this.balance = 50;
        }
    }

    onThink(){

        this.timer = this.timer + 1;
        this.ballControl();

        this.client.send(ServerMessageType.GameTimer, { timer: this.timer, balance: this.balance, score: this.score });

        if(this.timer < 90){
            setTimeout(this.onThink.bind(this), 1000)
        }
        else{
            this.endGame();
        }
    }

    private static _games: Game[] = [];
    static init(){

        Client.registerMessageCallback(ClientMessageTypes.GameStart, this.onPlayerStartGame)
    }

    static onPlayerStartGame(client: Client){

        console.log('Player started game!')

        const game = new Game(client);
        Game._games.push(game);

        game.startGame();
    }
}