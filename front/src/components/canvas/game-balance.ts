const FRAMERATE = 20;

export class GameBalance {

    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private ball: CanvasImageSource;
    private resetPosition: number;
    private ballPosition: number;
    private ballMovingTo: number;
    private calculatedStepSize: number;

    private randomStepDirection: number = 0;
    private randomStepLastRefresh: number = 0;

    private frameLast: number = 0;
    private frameRate: number = 1000 / FRAMERATE;
    private frameTick: number = 0;

    constructor() {

        console.log('Instantiaed game-balance')

        this.ball = new Image();
        this.ball.src = 'assets/game/ball.png'

        this.canvas = document.getElementById('game-balance-canvas') as HTMLCanvasElement;

        const context = this.canvas.getContext('2d');
        if (!context) {
            throw new Error('No context found');
        }

        this.context = context;

        const balance = document.getElementsByClassName('game-balance')[0];

        this.canvas.width = balance.clientWidth;
        this.canvas.height = balance.clientHeight;

        this.resetPosition = balance.clientWidth / 2 - 10;
        this.ballPosition = this.resetPosition;
        this.ballMovingTo = -1;
        this.calculatedStepSize = balance.clientWidth / 100 * 0.5;
        console.log('calculatedStepSize', this.calculatedStepSize)

        this.animate();
    }

    private animate() {

        this.frameTick = requestAnimationFrame(this.animate.bind(this))

        if (Date.now() - this.frameLast > this.frameRate) {

            this.frameLast = Date.now();
            this.renderBall()
        }
    }

    private renderBall() {

        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const y = 1;

        if (this.ballMovingTo > 0) {

            let distance = Math.abs(this.ballPosition - this.ballMovingTo);
            let stepSpeed = this.calculatedStepSize;

            //a bola esta distante o sulficiente para andar na direção ao alvo
            if (distance > stepSpeed * 1) {

                if (distance >= stepSpeed * 20) stepSpeed = stepSpeed * 5
                else if (distance <= stepSpeed * 5) stepSpeed = stepSpeed / 2

                const stepSize = this.ballMovingTo >= this.ballPosition ? stepSpeed : -stepSpeed;
                this.ballPosition = Math.max(Math.min(this.ballPosition + stepSize, this.canvas.width), 0);
            }
        }

        this.context.drawImage(this.ball, this.ballPosition, y);
    }

    moveBallTo(position: number, reset: Boolean = false) {

        if (reset) {

            this.ballPosition = this.resetPosition;
        }


        this.ballMovingTo = this.canvas.width / 100 * position;
    }

    stop() {

        cancelAnimationFrame(this.frameTick)
    }
}   