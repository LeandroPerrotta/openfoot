const FRAMERATE = 10;

export class GameBalance {

    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D | null;
    private ball: CanvasImageSource;
    private resetPosition: number;
    private ballPosition: number;
    private ballMovingTo: number;
    private event: NodeJS.Timeout;
    private calculatedStepSize: number;

    constructor() {

        console.log('Instantiaed game-balance')

        this.ball = new Image();
        this.ball.src = 'assets/game/ball.png'

        this.canvas = document.getElementById('game-balance-canvas') as HTMLCanvasElement;

        const balance = document.getElementsByClassName('game-balance')[0];

        this.canvas.width = balance.clientWidth;
        this.canvas.height = balance.clientHeight;

        this.resetPosition = balance.clientWidth / 2 - 10;
        this.ballPosition = this.resetPosition;
        this.ballMovingTo = -1;
        this.calculatedStepSize = balance.clientWidth / 100 * 1;
        console.log('calculatedStepSize' , this.calculatedStepSize)

        this.context = this.canvas.getContext('2d');      
        
        this.event = setTimeout(this.renderBall.bind(this), 1000 / FRAMERATE)
    }

    private renderBall() {

        if(!this.context || !this.canvas) {

            console.error('No canvas found');
            return;
        }

        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);     
        const y = 1;

        if(this.ballMovingTo > 0){
            
            let distance = Math.abs(this.ballPosition - this.ballMovingTo);
            let stepSpeed = this.calculatedStepSize;

            if(distance > stepSpeed / 3){

                if(distance >= stepSpeed * 20) stepSpeed = stepSpeed * 5
                else if(distance <= stepSpeed * 5) stepSpeed = stepSpeed / 3
                
                const stepSize = this.ballMovingTo >= this.ballPosition ? stepSpeed : -stepSpeed;
                this.ballPosition = Math.max(Math.min(this.ballPosition + stepSize, this.canvas.width), 0);
            } 
        }

        this.context.drawImage(this.ball, this.ballPosition, y);
        this.event = setTimeout(this.renderBall.bind(this), 1000 / FRAMERATE)
    }    

    moveBallTo(position: number, reset: Boolean = false){

        if(reset){

            this.ballPosition = this.resetPosition;
        }
            

        this.ballMovingTo = this.canvas.width / 100 * position;
    }

    stop(){

        clearTimeout(this.event)
    }
}   