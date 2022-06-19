import m, { Vnode } from "mithril";

import './layout.css';

export class Layout {

    view(vnode: Vnode) {

        return m('.layout', [
            m('.header', [
                m('.logo', 'OpenFoot'),
                m('.spacer'),
                m("nav.menu", [
                    m('ul.nav', [
                        m('li', m(m.route.Link, { href: '/home', class: 'nav-link text-white' }, 'Home')),
                        m('li', m(m.route.Link, { href: '/game', class: 'nav-link text-white' }, 'Game'))
                    ])
                ]),
            ]),
            m(".wrapper", vnode.children)
        ])
    }
}