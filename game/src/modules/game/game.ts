import { Client } from "../../net/client";
import { ClientMessageTypes, ServerMessageType } from "../../shared/net/net.type";

export class Game{

    private timer = 0;
    private balance = 50;
    private client: Client;

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

    onThink(){

        this.timer = this.timer + 1;

        this.client.send(ServerMessageType.GameTimer, { timer: this.timer });

        if(this.timer < 90){
            setTimeout(this.onThink.bind(this), 1000)
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