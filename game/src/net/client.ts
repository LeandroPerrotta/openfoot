import { connection, Message } from 'websocket';
import { ClientMessageTypes, ServerMessageType } from '../shared/net/net.type';
import { ConnectionsManager, Clients } from './connections-manager';

export type MessageCallbacks = Map<ClientMessageTypes, Function>;

export class Client{

    private connection: connection;
    public clientIndex: number;

    constructor(clients: Clients, connection: connection){

        this.connection = connection;

        this.connection.on('message', this.onRecvMessage.bind(this))
        this.connection.on('close', this.onClose.bind(this))
        this.connection.on('error', this.onError.bind(this))

        console.info('[Client]', 'Client connected!')

        this.clientIndex = clients.addClient(this);
    }

    onRecvMessage(message: Message){

        console.info('[Client]', `Message received:`)
        console.log(message)

        if(message.type == 'utf8'){

            const data = JSON.parse(message.utf8Data);

            const type = Number(data.type);
            if (isNaN(type) || !(type >= ClientMessageTypes.First && type <= ClientMessageTypes.Last)) {

                console.error('Unhandled message', data);
                throw new Error('Received unhandled message.');
            }

            const callback = Client.messageCallbacks.get(type);

            console.info('Message handler', type)
            if(callback)
                callback(this, data.data);   
        }     
    }

    onError(err: Error){

        console.info('[Client]', `Connection error: ${err.name} - ${err.message}`)
    }

    onClose(code: number, desc: string){

        this.doDisconnect();
        console.info('[Client]', `Client disconnects #${code} - ${desc}`)
    }

    doDisconnect(){

        ConnectionsManager.getGameConnection().onClientClose(this);
    }

    send(type: ServerMessageType, data: any) {

        this.connection.sendUTF(JSON.stringify({
            type,
            data
        }));
    }

    static messageCallbacks: MessageCallbacks = new Map();
    static registerMessageCallback(type: ClientMessageTypes, callback: Function) {

        if (this.messageCallbacks.has(type)) {

            throw Error(`Callback message for ${type} is already set`);
        }

        this.messageCallbacks.set(type, callback);
    }    
}