export class Tools {

    static random(min: number, max: number){
        return Math.random() * (max - min) + min;
    }
}