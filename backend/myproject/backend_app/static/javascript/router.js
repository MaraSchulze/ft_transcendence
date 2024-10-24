import { createNavBar } from './navBar.js';

const routes = {
    '/': () => import('/static/javascript/login.js').then(module => module.loadPage(document.getElementById('app'))),
    '/login': () => import('/static/javascript/login.js').then(module => module.loadPage(document.getElementById('app'))),
    '/registration': () => import('/static/javascript/registration.js').then(module => module.loadPage(document.getElementById('app'))),
    '/start': () => import('/static/javascript/start.js').then(module => module.loadPage(document.getElementById('app'))),
    '/profile': () => import('/static/javascript/profile.js').then(module => module.loadPage(document.getElementById('app'))),
    '/pong': () => import('/static/javascript/homeView.js').then(module => module.homeView()),
    '/game-room/:id': (id) => import('/static/javascript/gameRoomView.js').then(module => module.gameRoomView(id)),
};

export function navigateTo(url) {
    history.pushState(null, null, url);
    router();
}

function router() {
    const path = window.location.pathname;
    const gameroom = path.match(/\/game-room\/(\d+)/);
    const pong = path.match(/\/pong/);
    console.log("My path", path);

    // get logged in status
    const isLoggedIn = true; // debug

    if (gameroom) {
        console.log("Gameroom", gameroom[1]);
        // Handle game-room route with dynamic id
        routes['/game-room/:id'](gameroom[1]);
        console.log(routes['/game-room/:id'](gameroom[1]));
    } else {
        const loadRoute = routes[path];
        if (loadRoute) {
            loadRoute().then(() => {
                // create NavBar depending on login status
                if (isLoggedIn) {
                    createNavBar();
                } else {
                    const navBar = document.getElementById('navBar');
                    navBar.innerHTML = '';
                }
            });
        } else {
            const appDiv = document.getElementById('app');
            appDiv.innerHTML = '<h2>404</h2><p>Page not found.</p>';
        }
    }
}

window.addEventListener('popstate', router);

document.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('click', event => {
        if (event.target.matches('[data-link]')) {
            event.preventDefault();
            navigateTo(event.target.href);
        }
    });
    router();
});