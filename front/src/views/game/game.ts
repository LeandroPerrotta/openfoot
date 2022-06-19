import m from "mithril";
import { Connection } from "../../net/connection";
import { ClientMessageTypes, ServerMessageType } from "../../shared/net/net.type";

export class Game {

    private timer: number = 0;

    constructor(){

        Connection.registerMessageCallback(ServerMessageType.GameTimer, this.onGameTimer.bind(this));
    }

    view() {
        return m('.game', [
            m('p', 'Game clock: ', m('span', this.timer + ' min')),
            m('button.btn.btn-warning', { type: 'button', onclick: this.onGameStart.bind(this) }, 'Play!')
        ])
    }

    onGameStart(){

        console.log('Game started')
        Connection.send(ClientMessageTypes.GameStart, 'game started')
    }

    onGameTimer(data: any){

        this.timer = data.timer;
        m.redraw();
        console.log('Timer', this.timer)
    }
}