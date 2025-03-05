/* const components = new Map();

function transformString(text) {
    if (!text) return text;
    
    // Convert first character separately
    let result = text[0].toLowerCase();
    
    // Process the rest of the string
    for (let i = 1; i < text.length; i++) {
        const char = text[i];
        if (char === char.toUpperCase()) {
            result += `-${char.toLowerCase()}`;
        } else {
            result += char;
        }
    }
    
    return result;
}

function setPage(url)
{
    document.body.innerHTML = '';
    const component = components.get(url);
    if (component)
        document.body.append(new component());
}

/* function setPage(url)
{
    const content = document.getElementById("content");
    content.innerHTML = ''; // Mantém a navbar intacta
    const component = components.get(url);
    if (component)
        content.append(new component());
}


window.addEventListener('load', function() {
    const currentHash = window.location.hash.replace(/^#/, '');
    setPage(currentHash || "/");

});

window.addEventListener('hashchange', function() {
    const currentHash = window.location.hash.replace(/^#/, '');
    setPage(currentHash || "/");
});


class Route
{
    static subscribe(url, component)
    {
        if(customElements.get(transformString(component.name)) === undefined) 
            customElements.define(transformString(component.name), component);
        components.set(url, component);
    }


    static go(url)
    {
            window.history.pushState({},"", "#" + url);
    }
    
   /*  static go(url)
    {
        if (window.history.length === 1) {
            history.replaceState({},"", "#" + url);
        } else {
            window.history.pushState({},"", "#" + url);
        }
        
    } 
}



 */
const components = new Map();

function transformString(text) {
    if (!text) return text;
    
    let result = text[0].toLowerCase();
    for (let i = 1; i < text.length; i++) {
        const char = text[i];
        if (char === char.toUpperCase()) {
            result += `-${char.toLowerCase()}`;
        } else {
            result += char;
        }
    }
    return result;
}

function setPage(url) {
    console.log("🔹 Navegando para:", url);
    const content = document.getElementById("content"); // Container onde as páginas são carregadas
    if (!content) return;

    content.innerHTML = ''; // Limpa o conteúdo anterior

    const component = components.get(url);
    if (component) {
        content.append(new component());
    }
}

window.addEventListener('load', function() {
    const currentHash = window.location.hash.replace(/^#/, '');
    setPage(currentHash || "/");
});

window.addEventListener('hashchange', function() {
    const currentHash = window.location.hash.replace(/^#/, '');
    setPage(currentHash || "/");
});

class Route {
    static subscribe(url, component) {
        if (customElements.get(transformString(component.name)) === undefined) 
            customElements.define(transformString(component.name), component);
        components.set(url, component);
    }

    static go(url) {
        window.history.pushState({}, "", "#" + url);
        setPage(url);
    }
}

export default Route;