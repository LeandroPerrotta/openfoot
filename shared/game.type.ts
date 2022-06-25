export enum GameTeam {
    Home = 'home',
    Visitor = 'visitor'
}

export type GameScore = {
    [GameTeam.Home]: number;
    [GameTeam.Visitor]: number;
}