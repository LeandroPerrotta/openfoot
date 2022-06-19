import { Client } from "../net/client";
import { Game } from "./game/game";

export class Modules{

    static init(){

        Game.init();

        console.log('Messages handler: ')
        console.log(Client.messageCallbacks)
    }
}