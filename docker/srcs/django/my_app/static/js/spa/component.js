export default class Component extends HTMLElement {
  constructor(template) {
    super();
    fetch(template)
      .then(async (r) => {
        console.log('Template fetch response:', r);
        console.log('Template URL:', template);
        if (r.ok) {
          const html = await r.text();
          this.innerHTML = html;
          this.onInit();
        } else {
          console.error('Template fetch failed:', r.status, r.statusText);
          this.innerHTML = "Not Found: " + template;
        }
      })
      .catch((error) => {
        console.error('Template fetch error:', error);
        this.innerHTML = "Error loading template.";
      });
  }

  getElementById(id) {
    return this.querySelector("#" + id);
  }

  onInit() {}
}

if (!customElements.get("base-component")) {
  customElements.define("base-component", Component);
}
