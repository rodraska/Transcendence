const routes = new Map();
let contentContainer = null;

function normalizeRoute(url) {
  if (url.startsWith("#")) url = url.slice(1);
  if (!url.startsWith("/")) url = "/" + url;
  if (url !== "/" && url.endsWith("/")) url = url.slice(0, -1);
  return url;
}

function forfeitIfActiveMatch(newRoute) {
  if (
    window.currentMatchData &&
    window.currentMatchData.matchId &&
    normalizeRoute(newRoute) !== "/active-match"
  ) {
    import("../utils/socketManager.js").then((module) => {
      const socket = module.getOrCreateSocket();
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ action: "forfeit" }));
      }
    });
    window.currentMatchData = null;
  }
}

function setPage(url) {
  forfeitIfActiveMatch(url);
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
