import m from "mithril";
import { Connection } from "../../net/connection";
import { ClientMessageTypes, ServerMessageType } from "../../shared/net/net.type";
import { GameScore } from "../../shared/game.type";
import { GameBalance } from "../../components/canvas/game-balance";
import "./game.css";


export class Game {

    private timer: number = 0;
    private score: GameScore = { home: 0, visitor: 0 };
    private balance: GameBalance | null = null;

    private labelPause = "Pause";
    private gameStarted = false;

    constructor() {

        Connection.registerMessageCallback(ServerMessageType.GameTimer, this.onGameTimer.bind(this));
    }

    oncreate(){

        this.balance = new GameBalance();
    }

    view() {
        return m('.game', [

            m('.game-bar', [
                m('.team-home', [
                    m('.team-home-name', 'Time da casa'),
                    m('.team-home-score', this.score.home)
                ]),

                m('.center', [
                    m('.timer', this.timer)
                ]),

                m('.team-visitor', [
                    m('.team-visitor-score', this.score.visitor),
                    m('.team-visitor-name', 'Time visitante')
                ]),
            ]),

            m('.game-balance', [
                m('canvas#game-balance-canvas')
            ]),

            m('.game-bar-controls', [
                m('button.btn.btn-green', { onclick: this.onGameStart.bind(this), disabled: this.gameStarted }, 'Play!'),
                m('button.btn.btn-yellow', { onclick: this.onGamePause.bind(this), disabled: !this.gameStarted }, this.labelPause)
            ])
        ])
    }

    onGamePause() {

        if(this.labelPause == "Pause") {

            Connection.send(ClientMessageTypes.GamePause, { type: 'pause' })
            this.labelPause = 'Resume'
        }
        else{

            Connection.send(ClientMessageTypes.GamePause, { type: 'resume' })
            this.labelPause = 'Pause'
        }
        
    }

    onGameStart() {

        this.gameStarted = true;
        Connection.send(ClientMessageTypes.GameStart, 'game started')
    }

    onGameTimer(data: any) {

        this.timer = data.timer;

        const scoreChanged = this.score.home != data.score.home || this.score.visitor != data.score.visitor;

        this.score = data.score;

        m.redraw();
        
        this.balance?.moveBallTo(data.balance, scoreChanged)

        if(this.timer == 90){

            this.balance?.stop();
        }

        
        console.log('Timer', this.timer)
    }
}