import { w3cwebsocket, ICloseEvent, IMessageEvent } from 'websocket';
import { ClientMessageTypes, ServerMessageType } from '../shared/net/net.type';

export type MessageCallbacks = Map<ServerMessageType, Function>;

export class Connection {

    private static client: w3cwebsocket;
    private static messageCallbacks: MessageCallbacks = new Map();


    static connect() {

        this.client = new w3cwebsocket('ws://localhost:8090/', 'echo-protocol')

        this.client.onopen = () => {

            console.info('Connection', 'Connected')
        }

        this.client.onerror = this.onError.bind(this);
        this.client.onclose = this.onClose.bind(this);
        this.client.onmessage = this.onRecvMessage.bind(this);
    }

    static onRecvMessage(message: IMessageEvent) {

        console.info('[Client]', `Message received: ${message.data}`)

        const data = JSON.parse(message.data.toString());

        const type = Number(data.type);
        if (isNaN(type) || !(type >= ServerMessageType.First && type <= ServerMessageType.Last)) {

            console.error('Unhandled message', data);
            throw new Error('Received unhandled message.');
        }

        const callback = this.messageCallbacks.get(type);

        console.info('Message handler', type)
        if(callback)
            callback(data.data);
    }

    static onClose(event: ICloseEvent) {

        console.info('[Client]', `Client disconnects #${event.code} - ${event.reason}`)
    }

    static onError(err: Error) {

        console.error('[Connection]', `Protocol error: ${err.message}`)
    }

    static send(type: ClientMessageTypes, data: any) {

        this.client.send(JSON.stringify({
            type,
            data
        }));
    }

    static registerMessageCallback(type: ServerMessageType, callback: Function) {

        if (this.messageCallbacks.has(type)) {

            throw Error(`Callback message for ${type} is already set`);
        }

        this.messageCallbacks.set(type, callback);
    }
}