import { Client } from "../../net/client";
import { ClientMessageTypes, ServerMessageType } from "../../shared/net/net.type";

export class Game{

    static init(){

        Client.registerMessageCallback(ClientMessageTypes.GameStart, this.onPlayerStartGame)
    }

    static onPlayerStartGame(client: Client){

        console.log('Player started game!')

        let timer = 0;

        Game.gameTick(client, timer);
    }

    static gameTick(client: Client, timer: number){

        timer = timer + 1;

        client.send(ServerMessageType.GameTimer, { timer });

        if(timer < 90){
            setTimeout(Game.gameTick, 1000, client, timer)
        }
    }

}