import m from "mithril";
import { Layout } from "./layout";
import { Game } from './views/game/game';

import { Connection } from './net/connection';

Connection.connect();

m.route(document.body, "/home", {
    "/home": {
        render: function () {
            return m(Layout, m('p', 'Hello world'))
        }
    },
    "/game": {
        render: function () {
            return m(Layout, m(Game))
        }
    }
})