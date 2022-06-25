import { server } from 'websocket';
import http from 'http'
import { Client } from './client';

const SERVER_PORT = 8090

type ConnectionType = {
    game?: Clients;
}

export class ConnectionsManager{

    static _connections: ConnectionType = {};

    static createGameConnection(){

        const protocol = new Clients();
        this._connections.game = protocol;
    }

    static getGameConnection(){

        if(!this._connections.game){
            throw new Error('Game connection not initialized.');
        }

        return this._connections.game;
    }
}

export class Clients{

    private socket: server;
    private http: http.Server;
    private clients: Client[] = [];

    constructor(){

        this.http = http.createServer((req, res) => {

            res.writeHead(404);
            res.end();           
        })

        this.http.listen(SERVER_PORT, () => {
            console.info('[Protocol]', `Server listening at ${SERVER_PORT}`)
        })

        this.socket = new server({
            httpServer: this.http
            ,autoAcceptConnections: false
        })

        this.socket.on('request', (request) => {

            const client = request.accept('echo-protocol', request.origin);
            new Client(this, client);
        })
    }

    addClient(client: Client){
        const index = this.clients.push(client);
        client.clientIndex = index;

        return index;
    }

    onClientClose(client: Client){

        if(!client.clientIndex){

            console.error('[Connection] Client disconnected without clientId');
            return;
        }

        delete this.clients[client.clientIndex];
    }
}