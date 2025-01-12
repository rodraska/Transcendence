export default class Component extends HTMLElement
{
    constructor(template)   
    {
        super()
        console.log("template: ", template);
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