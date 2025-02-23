// const components = new Map();

// function transformString(text) {
//     if (!text) return text;

//     // Convert first character separately
//     let result = text[0].toLowerCase();

//     // Process the rest of the string
//     for (let i = 1; i < text.length; i++) {
//         const char = text[i];
//         if (char === char.toUpperCase()) {
//             result += `-${char.toLowerCase()}`;
//         } else {
//             result += char;
//         }
//     }

//     return result;
// }

// function setPage(url)
// {
//     document.body.innerHTML = '';
//     const component = components.get(url);
//     if (component)
//         document.body.append(new component());
// }

// window.addEventListener('load', function() {
//     const currentHash = window.location.hash.replace(/^#/, '');
//     setPage(currentHash || "/");

// });

// window.addEventListener('hashchange', function() {
//     const currentHash = window.location.hash.replace(/^#/, '');
//     setPage(currentHash || "/");
// });

// class Route
// {
//     static subscribe(url, component)
//     {
//         if(customElements.get(transformString(component.name)) === undefined)
//             customElements.define(transformString(component.name), component);
//         components.set(url, component);
//     }

//     static go(url)
//     {
//         window.history.pushState({},"", "#" + url);
//     }
// }

// route.js

// A map to store route keys and component constructors.
// const routes = new Map();

// /**
//  * Normalize a route string:
//  * - Remove any leading '#' (if present)
//  * - Ensure the route starts with a '/'
//  * - Remove any trailing slash (except for the root "/")
//  */
// function normalizeRoute(url) {
//   // Remove leading '#' if present.
//   if (url.startsWith("#")) {
//     url = url.slice(1);
//   }
//   // Ensure the route starts with '/'
//   if (!url.startsWith("/")) {
//     url = "/" + url;
//   }
//   // Remove trailing slash if not the root route.
//   if (url !== "/" && url.endsWith("/")) {
//     url = url.slice(0, -1);
//   }
//   return url;
// }

// /**
//  * Set (or load) the component for a given route.
//  */
// function setPage(url) {
//   const normUrl = normalizeRoute(url);
//   // Clear the entire document body
//   document.body.innerHTML = "";
//   const component = routes.get(normUrl);
//   if (component) {
//     // Create an instance of the component and append it.
//     document.body.append(new component());
//   } else {
//     console.error("No route found for:", normUrl);
//   }
// }

// // Listen for page load and hash change events:
// window.addEventListener("load", () => {
//   // Use the current hash or default to "/"
//   const currentHash = window.location.hash || "/";
//   setPage(currentHash);
// });

// window.addEventListener("hashchange", () => {
//   const currentHash = window.location.hash;
//   setPage(currentHash);
// });

// /**
//  * The Route class exposes subscribe() to register a route and go() to navigate.
//  */
// class Route {
//   /**
//    * Register a route with a component.
//    * @param {string} url - The route (e.g. "/header")
//    * @param {class} component - The component class to render.
//    */
//   static subscribe(url, component) {
//     const normUrl = normalizeRoute(url);
//     // Optionally, define a custom element for the component.
//     // Here we use a simple naming convention based on the route.
//     const elementName =
//       normUrl === "/" ? "home-component" : normUrl.slice(1) + "-component";
//     if (!customElements.get(elementName)) {
//       customElements.define(elementName, component);
//     }
//     routes.set(normUrl, component);
//   }

//   /**
//    * Navigate to a given route.
//    * @param {string} url - The route to navigate to.
//    */
//   static go(url) {
//     const normUrl = normalizeRoute(url);
//     window.history.pushState({}, "", "#" + normUrl);
//     setPage(normUrl);
//   }
// }

// // Export the Route class for use in other modules.
// export default Route;

// Map to hold route-to-component associations.
const routes = new Map();

/**
 * Normalize a route string:
 * - Remove a leading '#' if present.
 * - Ensure the route starts with a '/'.
 * - Remove a trailing slash (except for the root "/").
 */
function normalizeRoute(url) {
  if (url.startsWith("#")) {
    url = url.slice(1);
  }
  if (!url.startsWith("/")) {
    url = "/" + url;
  }
  if (url !== "/" && url.endsWith("/")) {
    url = url.slice(0, -1);
  }
  return url;
}

// The container into which dynamic content will be loaded.
const contentContainer = document.getElementById("app");

/**
 * Loads the component associated with the given URL into the content container.
 */
function setPage(url) {
  const normUrl = normalizeRoute(url);
  const component = routes.get(normUrl);
  if (component) {
    contentContainer.innerHTML = "";
    // Derive a custom element name from the route.
    const elementName =
      normUrl === "/" ? "home-component" : normUrl.slice(1) + "-component";
    if (!customElements.get(elementName)) {
      customElements.define(elementName, component);
    }
    const instance = document.createElement(elementName);
    contentContainer.appendChild(instance);
  } else {
    console.error("No route found for:", normUrl);
  }
}

// Listen for the page load and hash change events.
window.addEventListener("load", () => {
  const currentHash = window.location.hash || "/";
  setPage(currentHash);
});

window.addEventListener("hashchange", () => {
  const currentHash = window.location.hash || "/";
  setPage(currentHash);
});

/**
 * The Route class exposes subscribe() to register a route and go() to navigate.
 */
class Route {
  /**
   * Register a route with its corresponding component.
   * @param {string} url - The route (e.g. "/login").
   * @param {class} component - The component class to render.
   */
  static subscribe(url, component) {
    const normUrl = normalizeRoute(url);
    routes.set(normUrl, component);
  }

  /**
   * Navigate to a given route.
   * @param {string} url - The route to navigate to.
   */
  static go(url) {
    const normUrl = normalizeRoute(url);
    window.history.pushState({}, "", "#" + normUrl);
    setPage(normUrl);
  }
}

export default Route;