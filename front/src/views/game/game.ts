import m from "mithril";
import { Connection } from "../../net/connection";
import { ClientMessageTypes, ServerMessageType } from "../../shared/net/net.type";
import { GameScore } from "../../shared/game.type";

import "./game.css";

export class Game {

    private timer: number = 0;
    private score: GameScore = { home: 0, visitor: 0 };
    private canvas: HTMLCanvasElement | null = null;
    private context: CanvasRenderingContext2D | null = null;
    private ball: CanvasImageSource;

    constructor() {

        this.ball = new Image();
        this.ball.src = 'assets/game/ball.png'

        Connection.registerMessageCallback(ServerMessageType.GameTimer, this.onGameTimer.bind(this));
    }

    oncreate() {

        this.canvas = document.getElementById('game-balance-canvas') as HTMLCanvasElement;

        this.canvas.width = document.getElementsByClassName('game-balance')[0].clientWidth;
        this.canvas.height = document.getElementsByClassName('game-balance')[0].clientHeight;

        this.context = this.canvas.getContext('2d');
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
                m('button.btn.btn-warning', { type: 'button', onclick: this.onGameStart.bind(this) }, 'Play!')
            ])
        ])
    }

    renderBall(currentBalance: number) {

        if(!this.context || !this.canvas) {

            console.error('No canvas found');
            return;
        }

        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);     

        console.log(this.canvas.width, this.canvas.height)

        const width = this.canvas.width;
        const y = 1;
        const x = this.canvas.width / 100 * currentBalance;

        this.context.drawImage(this.ball, x, y);
    }

    onGameStart() {

        console.log('Game started')
        Connection.send(ClientMessageTypes.GameStart, 'game started')
    }

    onGameTimer(data: any) {

        this.timer = data.timer;
        this.score = data.score;

        m.redraw();
        this.renderBall(data.balance)

        console.log('Timer', this.timer)
    }
}