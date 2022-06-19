import m from "mithril";
import { Connection } from "../../net/connection";
import { ClientMessageTypes, ServerMessageType } from "../../shared/net/net.type";
import { GameScore } from "../../shared/game.type";

import "./game.css";

export class Game {

    private timer: number = 0;
    private score: GameScore = { home: 0, visitor: 0 };

    constructor() {

        Connection.registerMessageCallback(ServerMessageType.GameTimer, this.onGameTimer.bind(this));
    }

    view() {
        return m('.game', [

            m('.container', [
                m('.game-bar.row', [
                    m('.team-home.col-sm-4.row', [
                        m('.team-home-name.col-sm-10', 'Time da casa'),
                        m('.team-home-score.col-sm-2.d-flex.justify-content-center', this.score.home)
                    ]),

                    m('.center.col-sm-4.d-flex.justify-content-center', [
                        m('.timer', this.timer)
                    ]),

                    m('.team-visitor.col-sm-4.row', [
                        m('.team-visitor-score.col-sm-2.d-flex.justify-content-center', this.score.visitor),
                        m('.team-visitor-name.col-sm-10', 'Time visitante')   
                    ]),
                ]),

                m('.game-bar-controls', [
                    m('button.btn.btn-warning', { type: 'button', onclick: this.onGameStart.bind(this) }, 'Play!')
                ])
                
            ])
        ])
    }

    onGameStart() {

        console.log('Game started')
        Connection.send(ClientMessageTypes.GameStart, 'game started')
    }

    onGameTimer(data: any) {

        this.timer = data.timer;
        this.score = data.score;

        m.redraw();

        console.log('Timer', this.timer)
    }
}