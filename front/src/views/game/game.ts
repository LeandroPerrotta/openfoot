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
    private game_message: HTMLElement = document.createElement('div');

    private labelPause = "Pause";
    private gameStarted = false;

    constructor() {

        Connection.registerMessageCallback(ServerMessageType.GameTimer, this.onGameTimer.bind(this));
        Connection.registerMessageCallback(ServerMessageType.GameGoal, this.onGameGoal.bind(this));
        Connection.registerMessageCallback(ServerMessageType.GamePenaltie, this.onGamePenaltie.bind(this));
    }

    oncreate(){

        const game_message = document.getElementById('game-message');

        if(!game_message) {
            throw new Error('Game message element not found.');
        }

        this.game_message = game_message;
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
                m('#game-message', [ m('span') ]),
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

    onGameGoal(data: any) {

        const span = this.game_message.children[0] as HTMLElement;

        this.game_message.style.display = 'block';
        span.classList.add('goal')

        span.innerHTML = data.message;

        setTimeout(this.clearGameMessage.bind(this), 4000)
    }
    
    onGamePenaltie(data: any) {

        const span = this.game_message.children[0] as HTMLElement;

        this.game_message.style.display = 'block';
        span.classList.add('penalty')
        
        span.innerHTML = data.message;

        if(data.last)
            setTimeout(this.clearGameMessage.bind(this), 2000)
    }

    clearGameMessage() {

        const span = this.game_message.children[0] as HTMLElement;

        this.game_message.style.display = 'none';
        span.innerHTML = '';    
        span.classList.remove('penalty', 'goal');    
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