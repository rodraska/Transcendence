const routes = new Map();
let contentContainer = null;

function normalizeRoute(url) {
  if (url.startsWith("#")) url = url.slice(1);
  if (!url.startsWith("/")) url = "/" + url;
  if (url !== "/" && url.endsWith("/")) url = url.slice(0, -1);
  return url;
}

function setPage(url) {
  const normUrl = normalizeRoute(url);
  if (!contentContainer) {
    console.error("Content container is not set in Route.");
    return;
  }
  const component = routes.get(normUrl);
  if (component) {
    contentContainer.innerHTML = "";
    // Use the custom element’s tag name defined during subscribe.
    const elementName =
      normUrl === "/" ? "home-component" : normUrl.slice(1) + "-component";
    const el = document.createElement(elementName);
    contentContainer.append(el);
  } else {
    console.error("No route found for:", normUrl);
  }
}

window.addEventListener("load", () => {
  console.log('new page load');
  const currentHash = window.location.hash || "/";
  setPage(currentHash);
});

window.addEventListener("hashchange", () => {
  console.log('new hashchange');
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
