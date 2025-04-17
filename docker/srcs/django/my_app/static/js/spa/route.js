const routes = new Map();
let contentContainer = null;

function normalizeRoute(url) {
  if (url.startsWith("#")) url = url.slice(1);
  if (!url.startsWith("/")) url = "/" + url;
  if (url !== "/" && url.endsWith("/")) url = url.slice(0, -1);
  return url;
}

function forfeitIfGame(newRoute) {
  if (
    window.currentMatchData &&
    window.currentMatchData.matchId &&
    normalizeRoute(newRoute) !== "/curve" && normalizeRoute(newRoute) !== "/pong"
  ) {
    console.log('new route forfeit');
    const pongSocket = window.pongSocket;
    const curveSocket = window.curveSocket;

    if (pongSocket && pongSocket.readyState === WebSocket.OPEN) {
      let playerNumber = 1;
      if (window.loggedInUserName === window.currentMatchData.player2)
        playerNumber = 2;

      console.log('playerNumber: ', playerNumber);

      pongSocket.send(JSON.stringify({
        'type': 'game_control',
        'action': 'stop',
        'player_number': playerNumber
      }))
    }

    if (curveSocket && curveSocket.readyState === WebSocket.OPEN) {
      let playerNumber = 1;
      if (window.loggedInUserName === window.currentMatchData.player2)
        playerNumber = 2;

      console.log('playerNumber: ', playerNumber);

      curveSocket.send(JSON.stringify({
        'type': 'game_control',
        'action': 'stop',
        'player_number': playerNumber
      }))
    }

    window.pongSocket = null;
    window.curveSocket = null;
    window.currentMatchData = null;
  }
}

function setPage(url) {
  //forfeitIfActiveMatch(url);
  forfeitIfGame(url);
  const normUrl = normalizeRoute(url);
  if (!contentContainer) {
    console.error("Content container is not set in Route.");
    return;
  }
  const component = routes.get(normUrl);
  if (component) {
    contentContainer.innerHTML = "";
    const elementName =
      normUrl === "/" ? "home-component" : normUrl.slice(1) + "-component";
    const el = document.createElement(elementName);
    contentContainer.append(el);
  } else {
    console.error("No route found for:", normUrl);
  }
}

window.addEventListener("load", () => {
  if (!window.location.hash) {
    return;
  }
  const currentHash = window.location.hash || "/";
  setPage(currentHash);
});

window.addEventListener("hashchange", () => {
  setPage(window.location.hash);
});

class Route {
  static setContentContainer(containerElement) {
    contentContainer = containerElement;
  }
  static subscribe(url, component) {
    const normUrl = normalizeRoute(url);
    const elementName =
      normUrl === "/" ? "home-component" : normUrl.slice(1) + "-component";
    if (!customElements.get(elementName)) {
      customElements.define(elementName, component);
    }
    routes.set(normUrl, component);
  }
  static go(url) {
    const normUrl = normalizeRoute(url);
    window.history.pushState({}, "", "#" + normUrl);
    setPage(normUrl);
  }
}

export { normalizeRoute };
export default Route;
