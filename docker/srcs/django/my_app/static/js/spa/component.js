class Component extends HTMLElement {
  constructor(template) {
    super();
    fetch(template)
      .then(async (r) => {
        if (r.ok) {
          const html = await r.text();
          this.innerHTML = html;
          this.onInit();
        } else {
          this.innerHTML = "Not Found: " + template;
        }
      })
      .catch(() => {
        this.innerHTML = "Error loading template. Check internet connection.";
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

export default Component;