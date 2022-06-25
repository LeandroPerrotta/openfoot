export enum ServerMessageType {
    GameTimer,
    GamePenaltie,
    GameGoal,

    First = GameTimer,
    Last = GameGoal
}

export enum ClientMessageTypes {
    GameStart,
    GamePause,

    First = GameStart,
    Last = GamePause
}