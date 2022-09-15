window.onload = () => {
    Data.Set();
};


var data = {
    html : {
        body : null,
        main : null
    },
    menuList : null,
    socials : null,
    sprites : null,
    faq : null,
    get performance () {
        if (performance.now() < 500) return performance.now() / 2;
        
        return 0;
    }
};


class Data
{
    static #loaded = false;
    static #OnDataLoad = [];
    static #WhileDataLoading = [];
    
    static get isLoaded ()
    {
        return this.#loaded;
    }
    
    static async #hasLoaded ()
    {
        for (let i = 0; i < this.#WhileDataLoading.length; i++)
        {
            await this.#WhileDataLoading[i]();
        }
        
        this.#loaded = true;
        
        for (let i = 0; i < this.#OnDataLoad.length; i++)
        {
            this.#OnDataLoad[i]();
        }
    }
    
    static Set ()
    {
        data.html.body = document.body;
        data.html.main = document.querySelector("main");
        
        let request = new XMLHttpRequest();
        
        request.onload = () => {
            if (request.status < 400)
            {
                var newData = JSON.parse(request.responseText);
                
                data.menuList = newData.menuList;
                data.socials = newData.socials;
                data.sprites = newData.sprites;
                
                this.checkSiteIndex();
            }
        };
        
        request.onerror = () => { ThrowError(2); };
        
        request.open("GET", "/data/data.json");
        request.overrideMimeType("application/json");
        request.send();
    }
    
    static addEventListener (event, callback)
    {
        if (event == null || callback == null) throw ThrowError(0);
        
        switch (event)
        {
            case "OnDataLoad":
                if (this.#OnDataLoad.length == 0) this.#OnDataLoad[0] = callback;
                else this.#OnDataLoad.push(callback);
                break;
            case "WhileDataLoading":
                if (this.#WhileDataLoading.length == 0) this.#WhileDataLoading[0] = callback;
                else this.#WhileDataLoading.push(callback);
                break;
        }
    }
    
    static checkSiteIndex ()
    {
        let siteIndex = parseInt(document.body.getAttribute("data-siteIndex"));
        
        switch (siteIndex)
        {
            case 1:
                let request = new XMLHttpRequest();
                
                request.onload = () => {
                    if (request.status < 400)
                    {
                        data.menuList = JSON.parse(request.responseText).menuList;
                        
                        this.#hasLoaded();
                    }
                };
                
                request.onerror = () => { ThrowError(2); };
                
                request.open("GET", "/data/data-js-plugins.json");
                request.overrideMimeType("application/json");
                request.send();
                return null;
        }
        
        this.#hasLoaded();
    }
}

class Background
{
    static Set ()
    {
        setInterval(() => {
            if (this.innerHeight == window.innerHeight && this.scrollHeight == data.html.body.scrollHeight) return null;
            
            this.innerHeight = window.innerHeight;
            this.scrollHeight = data.html.body.scrollHeight;
            
            this.Update();
        }, 16.67);
    }
    
    static Update ()
    {
        let newTime = 60 - (1 - this.scrollHeight / this.innerHeight) * 60;
        
        data.html.main.style.animation = `${newTime}s linear bg infinite`;
        data.html.body.style.animation = `${newTime}s linear body infinite`;
    }
}

class Header
{
    static #enabled = true;
    static #header = null;
    static #mainTop = null;
    static #scrollPos = null;
    
    static get isEnabled ()
    {
        return this.#enabled;
    }
    
    static Set ()
    {
        this.#header = document.querySelector("header");
        this.#mainTop = data.html.main.style.top;
        
        data.html.main.style.minHeight = "calc(100vh - (125 * var(--pixel-unit))";
        
        setInterval(() => {
            if (this.#scrollPos < window.pageYOffset)
            {
                if (!Menu.isEnabled) this.Toggle(false);
            }
            else if (this.#scrollPos > window.pageYOffset)
            {
                this.Toggle(true);
            }
            
            this.#scrollPos = window.pageYOffset;
        }, 16.67);
    }
    
    static Toggle (state)
    {
        if (this.#enabled == state) return;
        
        if (!state)
        {
            this.#header.style.transform = "translateY(-100%)";
            this.#header.style.transition = "transform 0.25s";
            data.html.main.style.top = "34px";
            data.html.main.style.minHeight = "calc(100vh - 62px)";
            data.html.main.style.transition = "top 0.25s";
        }
        else
        {
            this.#header.style.transform = "none";
            this.#header.style.transition = "transform 0.25s";
            data.html.main.style.top = this.#mainTop;
            data.html.main.style.minHeight = "calc(100vh - (125 * var(--pixel-unit))";
            data.html.main.style.transition = "top 0.25s";
        }
        
        this.#enabled = state;
    }
}

class Menu
{
    static #menuSection = null;
    static #navData = null;
    static #listIndex = 0;
    static #btnMenu = null;
    static #btnMenuImg = null;
    static #enabled = false;
    static #menu = null;
    static #overlay = null;
    static #dropdowns = [];
    
    static get listCount ()
    {
        return this.#listIndex;
    }
    
    static get isEnabled ()
    {
        return this.#enabled;
    }
    
    static #managed = class
    {
        #thisObj = null;
        #arrowImg = null;
        #dropdown = null;
        #ddHeight = null;
        #enabled = false;
        
        get isEnabled ()
        {
            return this.#enabled;
        }
        
        constructor (id)
        {
            this.#thisObj = document.querySelector(`#menuList_${id}`);
            this.#arrowImg = this.#thisObj.querySelector("img");
            this.#dropdown = document.querySelector(`#menuDropdown_${id}`);
            
            this.#ddHeight = this.#dropdown.scrollHeight;
            
            this.#thisObj.onclick = () => { this.Toggle(); };
        }
        
        Toggle ()
        {
            if (this.#thisObj.onclick != null) this.#thisObj.onclick = () => { };
            
            if (!this.#enabled)
            {
                this.#arrowImg.style.transform = "translate(calc(-480 * var(--pixel-unit)), 0)";
                this.#arrowImg.style.transition = "transform steps(8) 0.25s";
                this.#dropdown.style.maxHeight = `${this.#ddHeight}px`;
                this.#dropdown.style.transition = "max-height 0.25s";
                
                setTimeout(() => {
                    this.#arrowImg.style.transition = "none";
                    this.#dropdown.style.transition = "none";
                    
                    this.#enabled = true;
                    this.#thisObj.onclick = () => { this.Toggle(); };
                }, 250 + data.performance);
                
                return null;
            }
            
            this.#arrowImg.style.transform = "none";
            this.#arrowImg.style.transition = "transform steps(8) 0.25s";
            this.#dropdown.style.maxHeight = "0";
            this.#dropdown.style.transition = "max-height 0.25s";
            
            setTimeout(() => {
                this.#arrowImg.style.transition = "none";
                this.#dropdown.style.transition = "none";
                
                this.#enabled = false;
                this.#thisObj.onclick = () => { this.Toggle(); };
            }, 250 + data.performance);
        }
    }
    
    static Set ()
    {
        data.html.main.setAttribute("data-menuEnabled", "false");
        
        this.#menuSection = data.html.body.querySelector("#menuSection");
        this.#navData = document.createElement("div");
        this.#listIndex = 0;
        
        this.#navData.id = "menuNav";
        
        for (let iA = 0; iA < data.menuList.length; iA++)
        {
            var link = "/coming-soon";
            var subOutput;
            
            switch (data.menuList[iA].type)
            {
                case "link":
                    let aObject = document.createElement("a");
                    let divObject = document.createElement("div");
                    
                    if (data.menuList[iA].content != null) link = data.menuList[iA].content;
                    
                    aObject.href = link;
                    
                    divObject.classList.add("menuList");
                    divObject.append(data.menuList[iA].name);
                    
                    aObject.appendChild(divObject);
                    this.#navData.appendChild(aObject);
                    break;
                case "list":
                    if (data.menuList[iA].content == null) return null;
                    
                    subOutput = document.createElement("div");
                    subOutput.id = `menuDropdown_${this.#listIndex}`;
                    subOutput.classList.add("menuDropdown");
                    
                    for (let iB = 0; iB < data.menuList[iA].content.length; iB++)
                    {
                        let aObject = document.createElement("a");
                        let divObject = document.createElement("div");
                        
                        if (data.menuList[iA].content[iB].link != null)
                        {
                            link = data.menuList[iA].content[iB].link;
                        }
                        
                        aObject.href = link;
                        
                        divObject.classList.add("menuSubList");
                        divObject.append(data.menuList[iA].content[iB].name);
                        
                        aObject.appendChild(divObject);
                        subOutput.appendChild(aObject);
                        
                        if (iB == data.menuList[iA].content.length - 1)
                        {
                            let menuList = document.createElement("div");
                            let dropDiv = document.createElement("div");
                            let dropImg = document.createElement("img");
                            
                            menuList.id = `menuList_${this.#listIndex}`;
                            menuList.classList.add("menuList");
                            menuList.append(data.menuList[iA].name);
                            
                            dropImg.classList.add("unselectable");
                            dropImg.src = "/img/spr_menuDropdown.png";
                            dropImg.alt = data.menuList[iA].name;
                            
                            dropDiv.appendChild(dropImg);
                            menuList.appendChild(dropDiv);
                            this.#navData.append(menuList, subOutput);
                            
                            this.#listIndex++;
                        }
                    }
                    break;
            }
            
            if (iA != data.menuList.length - 1) continue;
            
            this.#btnMenu = document.querySelector("#btnMenu");
            this.#btnMenuImg = document.querySelector("img");
            
            this.#btnMenu.onclick = () => { this.Toggle(); };
        }
    }
    
    static Toggle ()
    {
        if (this.#btnMenu.onclick != null) this.#btnMenu.onclick = () => { };
        
        if (!Header.isEnabled) Header.Toggle(true);
        
        if (!this.#enabled)
        {
            data.html.body.setAttribute("data-scrollable", "false, menu");
            
            this.#btnMenuImg.style.transform = "translate(calc(-480 * var(--pixel-unit)), 0)";
            this.#btnMenuImg.style.transition = "transform steps(8) 0.5s";
            
            this.#menu = document.createElement("div");
            let menuSocials = document.createElement("div");
            
            let aSocialBtn = [
                document.createElement("a"),
                document.createElement("a"),
                document.createElement("a")
            ];
            
            let imgSocialBtn = [
                document.createElement("img"),
                document.createElement("img"),
                document.createElement("img")
            ];
            
            let divSiteInfo = document.createElement("div");
            let aSiteInfo = document.createElement("a");
            this.#overlay = document.createElement("hr");
            
            this.#menu.id = "menu";
            menuSocials.id = "menuSocials";
            
            aSocialBtn[0].href = data.socials.youtube;
            aSocialBtn[1].href = data.socials.twitter;
            aSocialBtn[2].href = data.socials.instagram;
            
            for (let i = 0; i < aSocialBtn.length; i++)
            {
                aSocialBtn[i].target = "_blank";
                aSocialBtn[i].rel = "noreferrer noopener";
            }
            
            imgSocialBtn[0].id = "menuBtnYt";
            imgSocialBtn[1].id = "menuBtnTwt";
            imgSocialBtn[2].id = "menuBtnInsta";
            
            for (let i = 0; i < imgSocialBtn.length; i++)
            {
                imgSocialBtn[i].classList.add("unselectable");
                imgSocialBtn[i].src = data.sprites.socials;
                
                aSocialBtn[i].appendChild(imgSocialBtn[i]);
                menuSocials.appendChild(aSocialBtn[i]);
            }
            
            divSiteInfo.id = "menuSiteInfo";
            
            aSiteInfo.href = "/site-info";
            aSiteInfo.innerHTML = "&#9432; About this site";
            
            divSiteInfo.appendChild(aSiteInfo);
            
            this.#overlay.id = "menuOverlay";
            
            this.#menu.append(this.#navData, menuSocials, divSiteInfo);
            this.#menuSection.append(this.#menu, this.#overlay);
            
            for (let i = 0; i < this.#listIndex; i++)
            {
                if (this.#dropdowns.length == 0) this.#dropdowns[0] = new this.#managed(i);
                else this.#dropdowns.push(new this.#managed(i));
            }
            
            this.#menu.style.transform = "none";
            this.#menu.style.transition = "transform 0.5s";
            this.#overlay.style.background = "rgba(0, 0, 0, 0.37)";
            this.#overlay.style.transition = "background 0.5s";
            
            data.html.main.setAttribute("data-menuEnabled", "true");
            
            data.html.main.style.transition = "max-width 0.5s, transform 0.5s";
            
            setTimeout(() => {
                this.#btnMenuImg.style.transition = "initial";
                this.#menu.style.transition = "initial";
                this.#overlay.style.transition = "initial";
                
                data.html.main.style.transition = "initial";
                
                this.#enabled = true;
                this.#btnMenu.onclick = () => { this.Toggle(); };
                this.#overlay.onclick = () => { this.Toggle(); };
            }, 500 + data.performance);
            
            return null;
        }
        
        this.#btnMenuImg.style.transform = "none";
        this.#btnMenuImg.style.transition = "transform steps(8) 0.25s";
        
        for (let i = 0; i < this.listCount; i++)
        {
            if (this.#dropdowns[i].isEnabled) this.#dropdowns[i].Toggle();
        }
        
        this.#menu.style.transform = "translateX(-100%)";
        this.#menu.style.transition = "transform 0.25s";
        this.#overlay.style.background = "none";
        this.#overlay.style.transition = "background 0.25s";
        
        data.html.main.setAttribute("data-menuEnabled", "false");
        
        data.html.main.style.transition = "max-width 0.25s, transform 0.25s";
        
        setTimeout(() => {
            this.#btnMenuImg.style.transition = "none";
            
            this.#menu.remove();
            this.#overlay.remove();
            
            data.html.body.setAttribute("data-scrollable", "true");
            
            data.html.main.style.transition = "initial";
            
            this.#enabled = false;
            this.#btnMenu.onclick = () => { this.Toggle(); };
        }, 250 + data.performance);
    }
}

class screenTrans
{
    static #clickedId = false;
    static #fadeEl = null;
    
    static fadeTime = 1;
    
    static get clickedIdAnchor ()
    {
        return this.#clickedId;
    }
    
    static Set ()
    {
        this.#fadeEl = document.querySelector(".fadeObject");
        
        this.#fadeEl.style.opacity = "0.0";
        this.#fadeEl.style.transition = `opacity ${0.25 * this.fadeTime}s`;
        
        setTimeout(() => {
            this.#fadeEl.style.pointerEvents = "none";
            this.#fadeEl.style.transition = "initial";
            
            data.html.body.setAttribute("data-scrollable", "true");
        }, (250 * this.fadeTime));
        
        setInterval(() => { this.ScanAnchors(); }, 16.67);
    }
    
    static ScanAnchors ()
    {
        let pageAnc = document.querySelectorAll("a:not([target='_blank'])");
        
        for (let iA = 0; iA < pageAnc.length; iA++)
        {
            var valid = true;
            
            for (let iB = 0; iB < pageAnc[iA].href.length; iB++)
            {
                if (pageAnc[iA].href[iB] == "#") valid = false;
            }
            
            if (!valid) return null;
            
            pageAnc[iA].onclick = e => {
                e.preventDefault();
                let target = pageAnc[iA].href;
                
                data.html.body.setAttribute("data-scrollable", "false");
                
                this.#fadeEl.style.pointerEvents = "all";
                this.#fadeEl.style.opacity = "1.0";
                this.#fadeEl.style.transition = `opacity ${0.25 * this.fadeTime}s`;
                
                setTimeout(() => {
                    window.location.href = target;
                }, 250 * this.fadeTime + data.performance);
            };
        }
    }
}


Data.addEventListener("OnDataLoad", () => {
    Background.Set();
    Header.Set();
    Menu.Set();
    
    screenTrans.Set();
});


function ThrowError (errorCode)
{
    var errorText;
    
    switch (errorCode)
    {
        case 0:
            errorText = "Value is unassigned or invalid";
            break;
        case 1:
            errorText = "No instance to work with";
            break;
        case 2:
            errorText = "File cannot be loaded";
            break;
    }
    
    errorText += `\nError Code: ${errorCode}`;
    
    alert(errorText);
    console.error(errorText);
    throw new Error(errorText);
}