const components = new Map();

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
        console.log(transformString(component.name));
        console.log(component.name);
        components.set(url, component);
    }

    static go(url)
    {
        window.history.pushState({},"", "#" + url);
    }
}