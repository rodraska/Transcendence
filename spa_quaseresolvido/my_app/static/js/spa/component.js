/* export default class Component extends HTMLElement
{
    constructor(template)   
    {
        super()
        fetch(template).then(async (r) => {
            if (r.ok)
            { 
            const html = await r.text();
            this.innerHTML = html;
            this.onInit();
            } else {
            this.innerHTML = "Not Found: " + template;
            }
        });
    }


    getElementById(id){
        return this.querySelector('#'+id);
    }

    onInit(){}
}

customElements.define("base-component", Component)
export {  } ;
 */

/* 
export default class Component extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const template = this.getAttribute('template'); // Get template from attribute
        if (template) {
            fetch(template).then(async (r) => {
                if (r.ok) {
                    const html = await r.text();
                    this.innerHTML = html;
                    this.onInit();
                } else {
                    this.innerHTML = "Not Found: " + template;
                }
            });
        }
    }

    getElementById(id) {
        return this.querySelector('#' + id);
    }

    onInit() {}
}

customElements.define("base-component", Component);

export {}; */
/* export default class Component extends HTMLElement {
    constructor() {
        super();
    }

    
    connectedCallback() {
        const template = this.getAttribute('template');
        console.log("Carregando template:", template);
        if (template) {
            fetch(template)
                .then(async (r) => {
                    if (r.ok) {
                        const html = await r.text();
                        this.innerHTML = html;
                        this.onInit();
                    } else {
                        this.innerHTML = `<p>Error loading template: ${template}</p>`;
                    }
                })
                .catch((error) => {
                    this.innerHTML = `<p>Error fetching template: ${template} - ${error}</p>`;
                });
        } else {
            this.innerHTML = '<p>Template attribute is missing.</p>';
        }
    }

    getElementById(id) {
        return this.querySelector('#' + id);
    }

    onInit() {
        console.log("component carregado!");
    }
}

customElements.define("base-component", Component);
 */

export default class Component extends HTMLElement {
    constructor(template) {
        super();
        fetch(template).then(async (r) => {
            if (r.ok) { 
                const html = await r.text();
                this.innerHTML = html;
                
                // ✅ Chamar função para executar scripts
                this.executeScripts();
                
                // ✅ Chamar função para interceptar navegação interna
                this.interceptLinks();

                this.onInit();
            } else {
                this.innerHTML = "Not Found: " + template;
            }
        });
    }

    getElementById(id) {
        return this.querySelector('#' + id);
    }

    onInit() {}

    executeScripts() {
        const inlineScripts = this.querySelectorAll("script:not([src])");
        inlineScripts.forEach(oldScript => {
            const newScript = document.createElement("script");
            newScript.textContent = oldScript.textContent;
            document.body.appendChild(newScript).parentNode.removeChild(newScript);
        });

        const externalScripts = this.querySelectorAll("script[src]");
        externalScripts.forEach(oldScript => {
            const newScript = document.createElement("script");
            newScript.src = oldScript.src;
            newScript.async = true;
            document.body.appendChild(newScript);
        });
    }

    interceptLinks() {
        const links = this.querySelectorAll("a[href^='#']");
        links.forEach(link => {
            link.addEventListener("click", (event) => {
                event.preventDefault(); // ✅ Evita o comportamento padrão
                const url = link.getAttribute("href").substring(1); // Remove o `#`
                Route.go(url); // ✅ Atualiza a página via SPA
            });
        });
    }
}

customElements.define("base-component", Component);
export { };
