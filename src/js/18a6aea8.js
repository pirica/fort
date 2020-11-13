/**
 * Copyright 2020 Teenari
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const fetcher = fetch;
fetch = (...args) => {
    const error = (e) => {
        system.menu.message(e.name, `${e.message} (${args[0]})`, 'reload', false, () => {
            window.location = '';
        });
        throw e;
    };
    return fetcher(...args).then((r) => {
        if(!r.ok) throw new Error('test?');
        return r;
    }).catch(error);
};

class UI {
    constructor(Pages) {
        this.pages = Pages;
        this.color = Cookies.get('color') || this.pagecolor();
        this.setColor();

        $('#color').click(() => {
            return this.setColor(this.color === 'white' ? 'gray' : 'white');
        });
    }

    setColor(color=this.color) {
        this.color = color;
        Cookies.set('color', color);
        switch(color) {
            case 'white': {
                document.getElementsByTagName('html')[0].classList.add('white');
                $('html').css('color', '');
                $('.colorchange').children()[0].innerText = 'GRAY';
                $('style')[0].innerHTML = '.menu{background: white;}.understand{background: rgb(44, 47, 51); color: white;}.understand > img{background: rgb(44, 47, 51);}.understand > div:nth-of-type(4){background: white; color: rgb(44, 47, 51);}';
            } break;

            case 'gray': {
                document.getElementsByTagName('html')[0].classList.remove('white');
                $('.colorchange').children()[0].innerText = 'WHITE';
                $('html').css('color', 'white');
                $('style')[0].innerHTML = '.menu{background: rgb(44, 47, 51);}';
            } break;

            default: {
                console.log(`Unknown color: ${color}`);
                return this.setColor('white');
            } break;
        }
        return this;
    }

    pagecolor() {
        const hours = (new Date()).getHours();
        return (hours >= 6 && hours < 20) ? 'white' : 'black';
    }
}

class Menu {
    constructor(System, theme) {
        this.system = System;

        this.icons = {
            platforms: {
                benbot: {
                    PC: "https://benbotfn.tk/api/v1/exportAsset?path=FortniteGame/Content/UI/Friends_UI/Social/PC_PlatformIcon_64x.uasset",
                    CONSOLE: "https://benbotfn.tk/api/v1/exportAsset?path=FortniteGame/Content/UI/Friends_UI/Social/Console_PlatformIcon_64x.uasset",
                    EARTH: "https://benbotfn.tk/api/v1/exportAsset?path=FortniteGame/Content/UI/Friends_UI/Social/Earth_PlatformIcon_64x.uasset",
                    MOBILE: "https://benbotfn.tk/api/v1/exportAsset?path=FortniteGame/Content/UI/Friends_UI/Social/Mobile_PlatformIcon_64x.uasset",
                    XBL: "https://benbotfn.tk/api/v1/exportAsset?path=FortniteGame/Content/UI/Friends_UI/Social/xBox_PlatformIcon_64x.uasset",
                    PSN: "https://benbotfn.tk/api/v1/exportAsset?path=FortniteGame/Content/UI/Friends_UI/Social/PS4_w-backing_PlatformIcon_64x.uasset",
                    SWITCH: "https://benbotfn.tk/api/v1/exportAsset?path=FortniteGame/Content/UI/Friends_UI/Social/Switch_PlatformIcon_64x.uasset"
                }
            }
        };
        this.themes = {
            Default: {
                background: 'black&white',
                cosmetics: {
                    outfit: [
                        'CID_328_Athena_Commando_F_Tennis',
                        'CID_224_Athena_Commando_F_Dieselpunk',
                        'CID_018_Athena_Commando_M',
                        'CID_025_Athena_Commando_M',
                        'CID_052_Athena_Commando_F_PSBlue',
                        'CID_191_Athena_Commando_M_SushiChef',
                        'CID_044_Athena_Commando_F_SciPop'
                    ],
                    backpack: [
                        "BID_287_AztecFemaleEclipse",
                        "BID_286_WinterGhoulMaleEclipse"
                    ],
                    pickaxe: [
                        "Pickaxe_ID_164_DragonNinja"
                    ]
                }
            }
        }
        this.theme = this.themes[theme || 'Default'];
        this.LoadingText = null;
    }

    async hideMenu(menu) {
        menu.css('top', '200%');
        await new Promise((resolve) => setTimeout(resolve, 1000));
        menu.remove();
    }

    getImages(AthenaCosmeticLoadout) {
        const last = (character, data) => {
            return data.substring(data.lastIndexOf(character) + 1, data.length);
        }
        return {
            character: `https://fortnite-api.com/images/cosmetics/br/${last('.', AthenaCosmeticLoadout.characterDef).replace(/'/g, '')}/icon.png`,
            backpack: `https://fortnite-api.com/images/cosmetics/br/${last('.', AthenaCosmeticLoadout.backpackDef).replace(/'/g, '')}/icon.png`,
            pickaxe: `https://fortnite-api.com/images/cosmetics/br/${last('.', AthenaCosmeticLoadout.pickaxeDef).replace(/'/g, '')}/icon.png`,
            charid: last('.', AthenaCosmeticLoadout.characterDef).replace(/'/g, '')
        };
    }

    addCloseButton(menu) {
        $(`[class="menu-close"]`).click(async () => await this.hideMenu(menu));
        return $(`[class="menu-close"]`);
    }

    async reloadMembers() {
        const members = this.system.party.members;
        $('#members').empty();
        for (const [index, member] of members.entries()) {
            const images = this.getImages(member.meta['Default:AthenaCosmeticLoadout_j'].AthenaCosmeticLoadout);
            const div = document.createElement('div');
            document.getElementById('members').appendChild(div);
            const skin = this.system.cosmetics.all.find(e => e.id === images.charid);
            if(!skin) images.character = `https://cdn2.unrealengine.com/Kairos/portraits/${member.karios[1].value}.png`;
            const graident = `style="background: linear-gradient(0deg, ${member.karios ? JSON.parse(member.karios[0].value)[0] : null} 0%, ${member.karios ? JSON.parse(member.karios[0].value)[1] : null} 45%, ${member.karios ? JSON.parse(member.karios[0].value)[2] : null} 100%);"`;
            div.outerHTML = `<div id="${member.id}" class="icon" ${graident}><svg id="blob" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="width: 190%;position: absolute;left: -166px;top: 35px;opacity: 0;"><path fill="#7289DA" d="M44.6,-76.2C58.4,-69.2,70.7,-58.6,78.5,-45.3C86.3,-32,89.6,-16,89.2,-0.2C88.8,15.5,84.7,31,77.2,44.7C69.6,58.5,58.5,70.4,45.1,77.4C31.7,84.4,15.8,86.6,-0.4,87.3C-16.7,88,-33.3,87.3,-46.7,80.3C-60.1,73.2,-70.3,59.8,-77.3,45.4C-84.4,31,-88.3,15.5,-88.2,0C-88.2,-15.4,-84.1,-30.8,-76.7,-44.6C-69.3,-58.4,-58.5,-70.5,-45.1,-77.8C-31.8,-85.2,-15.9,-87.7,-0.3,-87.2C15.4,-86.8,30.7,-83.3,44.6,-76.2Z" transform="translate(100 100)"></path></svg><img width="120" height="120" draggable="false" src="${images.character}"><div>${member.displayName}</div></div>`;
            const memberFunction = async () => {
                this.createMenu(`MEMBER${member.id}`);
                const menu = $(`.menu`);
                let items = '';
                for (const key of Object.keys(images).filter(e => e !== 'charid')) {
                    const value = images[key];
                    items += `<div id="${key}" ${graident}><img src="${value}"></div>`;
                }
                menu.html(`<div class="menu-member" style="background: linear-gradient(0deg, ${JSON.parse(member.karios[0].value)[0]} 0%, ${JSON.parse(member.karios[0].value)[1]} 45%, ${JSON.parse(member.karios[0].value)[2]} 100%);"><img width="100" height="100" draggable="false" src="${images.character}"></div><div class="menu-member-username">${member.displayName}</div><div class="menu-close">✕</div><div class="menu-buttons"><div id="kick">ᐈ</div></div><div class="menu-cosmetics">${items}</div><div class="menu-shapeshift"><div>Shape Shift<img src="${images.character}"></div></div>`);
                for (const key of Object.keys(images)) {
                    $(`#${key}`).click(async () => {
                        $('.menu-cosmetics').fadeOut();
                        $('.menu-buttons').fadeOut();
                        $('.menu-shapeshift').fadeOut();
                    });
                }
                menu.fadeIn(250);
                $(`[id="kick"]`).click(async () => {
                    await this.hideMenu(menu);
                    if(member.id === this.system.account.id || this.system.party.members.find(m => m.displayName === system.account.displayName).role !== 'CAPTAIN') return;
                    await this.hideMenu(menu);
                    await this.system.kickPlayer(member.id);
                });

                $('.menu-shapeshift').children().eq(0).click(async () => {
                    await this.hideMenu(menu);
                    if(member.id === this.system.account.id) return;
                    await this.system.copyMember(member.id);
                });

                // $(`[id="${menuPrefix}hiddenPlayer"]`).click(async () => {
                //     if(member.id === this.system.account.id || this.system.party.members.find(m => m.displayName === $("#username")[0].innerText).role !== 'CAPTAIN') return;
                //     await this.hideMenu(menu);
                //     const f = this.system.hiddenMembers.find(m => m.id === member.id) ? 'showPlayer' : 'hidePlayer';
                //     await this.system[f](member.id);
                // });
                this.addCloseButton(menu);
            };
            $(`#${member.id}.icon`).click(async () => {
                await memberFunction();
            });
            if(!this.system.party.meta['Default:RawSquadAssignments_j'].RawSquadAssignments.find(m => m.memberId === member.id) && !this.system.hiddenMembers.find(m => m.id === member.id)) {
                $(`#${member.id}.icon`).animate({opacity: 0.5}, 500);
                $(`#${member.id}.icon`)[0].innerHTML += '<div style="position: absolute;font-family: t;color: white;opacity: 0.8;top: 44px;">Player may be glitched.</div>';
            }
            if(!this.system.party.meta['Default:RawSquadAssignments_j'].RawSquadAssignments.find(m => m.memberId === member.id) && this.system.hiddenMembers.find(m => m.id === member.id)) {
                $(`#${member.id}.icon`).animate({opacity: 0.5}, 500);
            }
        }
        return this;
    }

    createMenu() {
        if(document.getElementsByClassName(`menu`)[0]) document.getElementsByClassName(`menu`).remove();
        const menu = document.createElement('div');
        menu.classList.add('menu');
        menu.hidden = true;
        document.getElementById('menus').appendChild(menu);
        return menu;
    }

    changeUsername(username) {
        $('#username').html(username);
        return this;
    }

    convertPlatform(platform, url) {
        let ENUMNAME;
        switch(platform) {
            case 'WIN': {
                ENUMNAME = 'PC';
            } break;
    
            case 'MAC': {
                ENUMNAME = 'PC';
            } break;
    
            case 'AND': {
                ENUMNAME = 'MOBILE';
            } break;
    
            case 'IOS': {
                ENUMNAME = 'MOBILE';
            } break;
    
            case 'AND': {
                ENUMNAME = 'MOBILE';
            } break;
    
            case 'SWT': {
                ENUMNAME = 'SWITCH';
            } break;
    
            default: {
                if(this.icons.platforms.benbot[platform]) {
                    ENUMNAME = platform;
                    break;
                }
                ENUMNAME = 'EARTH';
            } break;
        }
    
        return url ? this.icons.platforms.benbot[ENUMNAME] : ENUMNAME;
    }

    setLoadingText(text, doNot) {
        this.LoadingText = text;
        let dots = 0;
        $('#status').html(text);
        if(!doNot) {
            const inv = setInterval(() => {
                if(this.LoadingText !== text) clearInterval(inv);
                dots += 1;
                if(dots === 4) dots = 0;
                $('#status').html(text + '.'.repeat(dots));
            }, 500);
        }
        return this;
    }

    message(title, message, button, disabled=false, click) {
        if($('#inform')[0]) $('#inform')[0].remove();
        $('body').children().first().before(`<div id="inform"><div class="fort-button"${disabled ? ' disabled' : ''}><div>${button}</div></div><div class="text"><div>${title}</div><div>${message}</div></div></div>`);
        const element = $('body').children().first();
        if(click) element.click(click);
        $('.loading').show().html(`<div class="line"></div><div class="line"></div>`);
        return $('body').children().first();
    }
}

class System {
    constructor ({
        url,
        theme,
        displayName
    }) {
        this.url = url || 'http://localhost:3000';
        this.account = null;
        this.party = null;
        this.friends = null;
        this.hiddenMembers = null;
        this.source = null;
        this.user = null;
        this.auth = null;
        this.displayName = displayName;
        this.messages = {
            party: null,
            friends: null,
            handler: null
        };
        this.cosmetics = {
            sorted: null,
            variants: null
        };
        this.items = {
            variants: {}
        };
        this.eventHandler = async (data) => {
            const json = JSON.parse(data.data);
            if(json.exit) return $('.message-container').fadeIn();
            if(json.event) {
                const data = json.data;
                const event = json.event;
                switch(event) {
                    case 'refresh:party': {
                        system.party = json.party;
                        await this.menu.reloadMembers();
                        if(data.displayName && data.meta.schema && data.meta.schema['Default:FrontendEmote_j']) {
                            const emoteItemDef = JSON.parse(data.meta.schema['Default:FrontendEmote_j']).FrontendEmote.emoteItemDef;
                            if($(`#${data.id}.member`).children('img[type="emote"]')[0]) {
                                $(`#${data.id}.member`).children('img[type="emote"]')[0].remove();
                            }
                            if(emoteItemDef.trim() !== "" && emoteItemDef.trim() !== "None") {
                                const gifs = ['https://cdn2.unrealengine.com/Kairos/gifs/Dab_opt.gif', 'https://cdn2.unrealengine.com/Kairos/gifs/Wiggle_opt.gif', 'https://cdn2.unrealengine.com/Kairos/gifs/LlamaBell_opt.gif'];
                                const image = gifs[Math.floor(Math.random() * gifs.length - 1) + 1];
                                $(`#${data.id}.icon`).children('img')[0].outerHTML += `<img draggable="false" src="${image}">`;
                            }
                        }
                    } break;
    
                    case 'friend:message': {
                        if(!this.messages.friends[data.author.id]) this.messages.friends[data.author.id] = [];
                        this.messages.friends[data.author.id].push(data);
                        if(this.messages.handler) this.messages.handler(data);
                    } break;

                    case 'party:member:joined': {
                    } break;

                    case 'party:member:left': {
                    } break;

                    case 'party:member:kicked': {
                    } break;
    
                    default: {
                        console.log(data);
                        console.log(`UNKNOWN EVENT ${event}`);
                    } break;
                }
            }
        };
        this.menu = new Menu(this, theme);
    }

    async authorize() {
        this.user = await this.getUser();
        this.auth = this.getAuthorizeCode();
        $('#members')[0].outerHTML = `<div id="members"><div class="icon" style="background: #5B6EAD;"><svg id="blob" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
<path fill="#7289DA" d="M44.6,-76.2C58.4,-69.2,70.7,-58.6,78.5,-45.3C86.3,-32,89.6,-16,89.2,-0.2C88.8,15.5,84.7,31,77.2,44.7C69.6,58.5,58.5,70.4,45.1,77.4C31.7,84.4,15.8,86.6,-0.4,87.3C-16.7,88,-33.3,87.3,-46.7,80.3C-60.1,73.2,-70.3,59.8,-77.3,45.4C-84.4,31,-88.3,15.5,-88.2,0C-88.2,-15.4,-84.1,-30.8,-76.7,-44.6C-69.3,-58.4,-58.5,-70.5,-45.1,-77.8C-31.8,-85.2,-15.9,-87.7,-0.3,-87.2C15.4,-86.8,30.7,-83.3,44.6,-76.2Z" transform="translate(100 100)"></path>
</svg><div style="
    background: #4F6096;
    height: fit-content;
    color: #4F6096;
    text-shadow: none;
">adsaads</div></div><div class="icon" style="background: #4F6096;"><svg id="blob" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="">
<path fill="#7289DA" d="M44.6,-76.2C58.4,-69.2,70.7,-58.6,78.5,-45.3C86.3,-32,89.6,-16,89.2,-0.2C88.8,15.5,84.7,31,77.2,44.7C69.6,58.5,58.5,70.4,45.1,77.4C31.7,84.4,15.8,86.6,-0.4,87.3C-16.7,88,-33.3,87.3,-46.7,80.3C-60.1,73.2,-70.3,59.8,-77.3,45.4C-84.4,31,-88.3,15.5,-88.2,0C-88.2,-15.4,-84.1,-30.8,-76.7,-44.6C-69.3,-58.4,-58.5,-70.5,-45.1,-77.8C-31.8,-85.2,-15.9,-87.7,-0.3,-87.2C15.4,-86.8,30.7,-83.3,44.6,-76.2Z" transform="translate(100 100)"></path>
</svg><div style="color: #5B6EAD;background: #5B6EAD;text-shadow: none;height: fit-content;">ss</div></div></div><div><div></div><svg id="blob" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="width: 350px;">

<defs>
  <clipPath id="blob2"><path fill="#7289DA" d="M44.6,-76.2C58.4,-69.2,70.7,-58.6,78.5,-45.3C86.3,-32,89.6,-16,89.2,-0.2C88.8,15.5,84.7,31,77.2,44.7C69.6,58.5,58.5,70.4,45.1,77.4C31.7,84.4,15.8,86.6,-0.4,87.3C-16.7,88,-33.3,87.3,-46.7,80.3C-60.1,73.2,-70.3,59.8,-77.3,45.4C-84.4,31,-88.3,15.5,-88.2,0C-88.2,-15.4,-84.1,-30.8,-76.7,-44.6C-69.3,-58.4,-58.5,-70.5,-45.1,-77.8C-31.8,-85.2,-15.9,-87.7,-0.3,-87.2C15.4,-86.8,30.7,-83.3,44.6,-76.2Z" style="z-index: 100;" transform="translate(100 100)" id="s"></path></clipPath></defs>  
<rect fill="#7289DA" clip-path="url(#blob2)" x="0" height="100%"></rect><rect y="13" fill="#6175B7" width="100%" height="0px" clip-path="url(#blob2)" style="transition: 0.2s;height: 0%;" x="0"></rect></svg></div>`;
        $('[clip-path="url(#blob2)"]').eq(1).animate({height: '100%'}, 10000);
        this.menu.setLoadingText('Logging out of last session');
        await this.logout();
        this.menu.setLoadingText('Creating new session');
        await this.createSession(this.displayName);
        this.menu.setLoadingText('Creating Event Source');
        this.source = await this.makeSource();
        window.onbeforeunload = async () => {
            await fetch(`${this.url}/api/account`, {
                credentials: 'include',
                method: "DELETE"
            });
        };
        await new Promise((resolve) => {
            this.source.onmessage = (data) => {
                const json = JSON.parse(data.data);
                if(json.completed) return resolve();
                if(json.message) this.menu.setLoadingText(json.message);
            }
        });
        this.menu.setLoadingText('Setting Properties');
        await this.setProperties();
        this.menu.setLoadingText('Setting Source Events');
        this.setSourceEvent(this.source);
        this.menu.setLoadingText('Starting Menu');
        await this.startMenu();

        return this;
    }

    async startMenu() {
        this.menu.setLoadingText('Setting Username').changeUsername(this.account.displayName).setLoadingText('Loading Members');
        await this.menu.reloadMembers();
        $('.members-container').children().eq(1).fadeOut();
        $('#fortnite').fadeOut(300);
        $('.menu-container').css('left', '300vh').show().animate({left: '58.5px'}, 700);
        $('#avatar').css('position', 'absolute').css('left', '-500px').show().animate({left: 10}, 700);
        $('.bar-container').fadeIn();
        $('.bar-emote').click(async () => await this.menu.showEmoteMenu());
        await new Promise((resolve) => setTimeout(resolve, 300));
        $('#DATA').fadeIn();
        $('#fortnite').css('padding', '0px');
        $('#color')[0].outerHTML = `<div id="settings" style="background: none;box-shadow: none;"><svg height="50" width="50" viewBox="0 0 8.4666665 8.4666669" version="1.1" id="svg8"><defs id="defs2"></defs><g id="layer1" transform="translate(0,-288.53332)"><path id="path940" style="fill: white;" transform="matrix(0.26458333,0,0,0.26458333,0,288.53332)" d="m 14,1 c -0.43057,-2.2524e-4 -0.812955,0.2751544 -0.949219,0.6835938 l -1.015625,3.046875 c -0.410051,0.1443778 -0.81115,0.3099019 -1.203125,0.4980468 L 7.9589844,3.7929688 c -0.385025,-0.192405 -0.8499682,-0.1168812 -1.1542969,0.1875 l -2.828125,2.828125 c -0.3043812,0.3043287 -0.379905,0.7692719 -0.1875,1.1542968 l 1.4335937,2.8671874 c -0.1885794,0.39394 -0.3554568,0.796828 -0.5,1.208984 l -3.0429687,1.015626 c -0.4084391,0.136264 -0.68381856,0.518648 -0.68359375,0.949218 v 4 c -2.2524e-4,0.43057 0.27515435,0.812955 0.68359375,0.949219 l 3.0527344,1.017578 c 0.1438828,0.407584 0.3090971,0.805606 0.4960937,1.195313 l -1.4394531,2.878906 c -0.1924051,0.385025 -0.1168813,0.849968 0.1875,1.154297 l 2.828125,2.830078 c 0.3043287,0.304381 0.7692719,0.379905 1.1542969,0.1875 l 2.8730466,-1.4375 c 0.391573,0.187086 0.791637,0.352283 1.201172,0.496094 l 1.017578,3.050781 C 13.187045,30.734612 13.56943,31.009991 14,31.009766 h 4 c 0.43057,2.25e-4 0.812955,-0.275154 0.949219,-0.683594 l 1.017578,-3.056641 c 0.406496,-0.143244 0.804637,-0.308036 1.193359,-0.49414 l 2.88086,1.441406 c 0.385025,0.192405 0.849967,0.116881 1.154296,-0.1875 l 2.828126,-2.830078 c 0.304381,-0.304329 0.379905,-0.769272 0.1875,-1.154297 l -1.435547,-2.871094 c 0.188179,-0.392579 0.353616,-0.794395 0.498047,-1.205078 l 3.046874,-1.015625 c 0.40844,-0.136264 0.683819,-0.518649 0.683594,-0.949219 v -4 c 2.25e-4,-0.43057 -0.275155,-0.812954 -0.683594,-0.949218 L 27.271484,12.039062 C 27.127133,11.629665 26.96127,11.229223 26.773438,10.837891 l 1.4375,-2.8750004 c 0.192405,-0.3850249 0.116881,-0.8499681 -0.1875,-1.1542968 L 25.195312,3.9804688 C 24.890983,3.676088 24.426041,3.6005642 24.041016,3.7929688 l -2.865235,1.4316406 c -0.395249,-0.1889764 -0.799375,-0.3552819 -1.21289,-0.5 L 18.949219,1.6835938 C 18.812955,1.2751544 18.43057,0.99977476 18,1 Z m 1.996094,7.9980469 c 3.854148,0 7.005859,3.1516861 7.005859,7.0058591 0,3.854136 -3.151711,6.998047 -7.005859,6.998047 -3.854149,0 -6.9980471,-3.143911 -6.9980471,-6.998047 0,-3.854173 3.1438981,-7.0058591 6.9980471,-7.0058591 z"></path></g></svg></div>`;
        return this;
    }

    async logout() {
        this.account = null;
        this.party = null;
        this.friends = null;
        return await this.sendRequest('api/account', {
            method: "DELETE"
        });
    }

    async createSession(displayName) {
        return await this.sendRequest(`api/account?displayName=${displayName}`, {
            method: "POST"
        });
    }

    async changeCosmeticItem(type, id, setItem) {
        if(!setItem) this.items[type.toLowerCase()] = this.cosmetics.sorted[type.toLowerCase()].find(cosmetic => cosmetic.id === id);
        return await this.requestOperation('api/account/meta', 'cosmetic', {
            type,
            arguments: [id]
        }, null, 'PUT');
    }

    async changeVariants(type, variants) {
        this.items.variants[type] = variants;
        return await this.requestOperation('api/account/meta', 'cosmetic', {
            type,
            arguments: [this.items[type].id, variants]
        }, null, 'PUT');
    }

    async copyMember(id, shape=true, emote="EID_HighTowerMango") {
        const { AthenaCosmeticLoadout } = this.party.members.find(m => m.id === id).meta['Default:AthenaCosmeticLoadout_j'];
        const keys = Object.keys(AthenaCosmeticLoadout).filter(k => AthenaCosmeticLoadout[k] && AthenaCosmeticLoadout[k] !== 'None');
        if(shape) {
            this.changeCosmeticItem('emote', emote);
            await new Promise((resolve) => setTimeout(resolve, 3800));
            this.changeCosmeticItem('emote', '');
        };
        for (const key of keys) {
            const value = AthenaCosmeticLoadout[key].split('.')[1].split('\'')[0];
            const type = key === 'characterDef' ? 'outfit' : key === 'backpackDef' ? 'backpack' : key === 'pickaxeDef' ? 'pickaxe' : null;
            this.changeCosmeticItem(type, value);
        }
        return true;
    }

    async joinFriend(id) {
        return await this.requestOperation('api/account/party', 'join', {
            type: 'friend',
            id
        }, null, 'POST');
    }

    async makeSource() {
        return new EventSource(`${this.url}/api/account/authorize?auth=${this.auth}`);
    }

    async setProperties() {
        this.account = await this.getAccount();
        this.party = await this.getParty();
        this.friends = await this.getFriends();
        this.hiddenMembers = [];
        this.messages = {
            party: [],
            friends: {},
            handler: null
        }
        this.cosmetics.sorted = {};
        this.items.variants = [];
        await this.sortCosmetics();
        await this.setDefaultItems();
        return this;
    }

    async getAccount() {
        const response = await (await this.sendRequest('api/account')).json();
        if(response.authorization === false) return null;
        return response;
    }

    async getParty() {
        return await (await this.sendRequest('api/account/party')).json();
    }

    async getFriends() {
        return await (await this.sendRequest('api/account/friends')).json();
    }

    async getTimeLeft() {
        return await (await this.sendRequest('api/account/time')).json();
    }

    async requestOperation(path, operation, body, options={}, method="POST") {
        return await this.sendRequest(path, {
            method,
            body: JSON.stringify({
                operation,
                ...body
            }),
            headers: {
                'Content-type': 'application/json'
            },
            ...options
        });
    }

    async sendRequest(path, options, isURL, cookie=true) {
        return await fetch(isURL ? path : `${this.url}/${path}`, {
            ...options,
            credentials: cookie ? 'omit' : 'include',
            headers: {
                ...cookie ? {'Set-Cookie': `auth=${this.user.id}`} : {},
                ...options ? options.headers ? options.headers : {} : {}
            },
        });
    }

    async sortCosmetics() {
        const data = (await (await fetch('https://fortnite-api.com/v2/cosmetics/br')).json()).data;
        this.cosmetics.all = data;
        for (const value of data) {
            if(!this.cosmetics.sorted[value.type.value]) this.cosmetics.sorted[value.type.value] = [];
            this.cosmetics.sorted[value.type.value].push(value);
        }
        return this;
    }

    async setDefaultItems() {
        const check = (data, main) => {
            const t = main.find(e => e.id === data[(Math.floor(Math.random() * data.length - 1) + 1)]);
            if(!t) return check(data, main);
            return t;
        }
        const cosmetics = {
            outfit: [
                'CID_328_Athena_Commando_F_Tennis',
                'CID_224_Athena_Commando_F_Dieselpunk',
                'CID_018_Athena_Commando_M',
                'CID_025_Athena_Commando_M',
                'CID_052_Athena_Commando_F_PSBlue',
                'CID_191_Athena_Commando_M_SushiChef',
                'CID_044_Athena_Commando_F_SciPop'
            ],
            backpack: [
                'BID_333_Reverb',
                'BID_338_StarWalker',
                'BID_343_CubeRedKnight',
                'BID_344_CubeWildCard'
            ],
            pickaxe: [
                'Pickaxe_ID_451_DarkEaglePurple'
            ]
        };
        for (const type of ['outfit', 'backpack', 'pickaxe']) {
            await this.changeCosmeticItem(type, check(cosmetics[type], this.cosmetics.sorted[type]).id);
        }
        return this;
    }

    async kickPlayer(id) {
        return await this.requestOperation('api/account/party/member', 'kick', {
            id
        });
    }

    async hidePlayer(id) {
        $(`#${id}.icon`).animate({opacity: 0.5}, 300);
        this.hiddenMembers.push({id});
        return await this.requestOperation('api/account/party/member', 'hide', {
            id
        });
    }
    
    async showPlayer(id) {
        $(`#${id}.icon`).animate({opacity: 1}, 300);
        this.hiddenMembers = this.hiddenMembers.filter(m => m.id !== id);
        return await this.requestOperation('api/account/party/member', 'show', {
            id
        });
    }

    async createBot(repl, name, cid) {
        return await this.requestOperation('api/repl/account', 'create', {
            repl,
            name,
            cid
        });
    }

    async deleteBot(repl) {
        return await this.requestOperation('api/repl/account', 'delete', {
            repl
        });
    }

    async editBot(repl, name, cid, oldName) {
        return await this.requestOperation('api/repl/account', 'edit', {
            repl,
            name,
            old: {
                name: oldName
            },
            cid
        });
    }

    async getUser() {
        return await (await system.sendRequest('https://api.blobry.com/user', {}, true, false)).json();
    }

    setSourceEvent(source) {
        source.onmessage = this.eventHandler;
        return this;
    }

    getAuthorizeCode() {
        return this.user.id;
    }

    get members() {
        if(!this.party) return null;
        return this.party.members;
    }
}

const system = new System({
    theme: 'Default',
    eventHandler: console.log,
    messageHandler: console.log,
    displayName: ''
});

$(document).ready(async () => {
    system.menu.rarities = await d3.json('/src/json/rarities.json');
    this.UI = new UI();
    const user = await (await fetch('https://api.blobry.com/user', {
        credentials: 'include'
    })).json();
    const outfitsW = (await (await fetch('https://fortnite-api.com/v2/cosmetics/br')).json()).data.filter(e => e.type.value === 'outfit');
    const outfits = outfitsW.slice(-50, outfitsW.length);
    if(user.authorization === false) {
        window.location = 'https://discord.com/api/oauth2/authorize?client_id=763165673161490442&redirect_uri=https%3A%2F%2Fapi.blobry.com%2Fauthorize&response_type=code&scope=identify';
    }
    const accountsNames = await (await fetch(`https://api.blobry.com/repl/accounts`, {
        credentials: 'include'
    }).catch((e) => {
        system.menu.message('CRASHED', 'error goes here', 'reload');
        throw e;
    })).json();
    if(!Cookies.get('understand')) {
        $('.understand').css('display', '');
        await new Promise((resolve) => $('#understand').click(resolve));
    }
    Cookies.set('understand', true);
    $('.understand').fadeOut(300);
    if(accountsNames.length === 0) {
        // return;
    }
    $('.loading')[0].innerHTML = '<div class="accounts-container"><div class="accounts"></div></div>';

    const cids = [
        'CID_328_Athena_Commando_F_Tennis',
        'CID_224_Athena_Commando_F_Dieselpunk',
        'CID_018_Athena_Commando_M',
        'CID_025_Athena_Commando_M',
        'CID_052_Athena_Commando_F_PSBlue',
        'CID_191_Athena_Commando_M_SushiChef',
        'CID_044_Athena_Commando_F_SciPop'
    ];
    const used = [];
    let displayName;
    const adjust = (color, amount) => '#' + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));

    for (const accountO of accountsNames) {
        const account = accountO.name;
        const div = document.createElement('div');
        document.getElementsByClassName('accounts')[0].appendChild(div);
        const cid = cids.filter(e => !used.includes(e))[cids.filter(e => !used.includes(e)).length * Math.random() | 0];
        const src = `https://fortnite-api.com/images/cosmetics/br/${accountO.cid ? accountO.cid : cid}/icon.png`;
        const sadd = document.createElement('img');
        sadd.src = src;
        sadd.hidden = true;
        document.body.appendChild(sadd);
        $(`[src="${src}"]`).imgcolr(function (img, color) {
            const twofive = adjust(color, -25);
            const two = adjust(color, 20);
            sadd.remove();
            div.outerHTML = `<div id="${account}" class="account" style="background: ${two}; border-bottom: 6px solid ${color};"><div style="background: ${color}; color: ${two}"><img src="${src}"><div class="threedots" id="${account}buttonsmIW">⠇</div></div><div style="color: ${twofive};">${account}</div></div>`;
            $(`[id="${account}"]`).click((e) => {
                if(e.target.className === 'threedots') return;
                displayName = account;
            });
            $(`[id="${account}buttonsmIW"]`).click((e) => {
                let handler = $._data(document.getElementById(`${account}buttonsmIW`), 'events').click[0].handler;
                const selector = `[id="${account}"]`;
                $('.accounts').children(`[id!="${account}"]`).fadeOut();
                $(selector).css('cursor', 'auto').css('top', '').css('left', '').css('position', 'relative').css('width', '171px').css('height', '204px').animate({top: '4vh', left: '-1vh', width: '313px', height: '218px'}).children()[0].style.height = '154px';
                $(selector).off('click').children()[1].outerHTML = `<textarea spellcheck="false" style="color: ${$(`[id="${account}"]`).children().eq(0).css('background').split(' none')[0]};">${account}</textarea>`;
                $(selector).children()[0].children[0].outerHTML += `<div><div id="skin"><img src="https://fortnite-api.com/images/cosmetics/br/${accountO.cid ? accountO.cid : cid}/icon.png"></div><div id="done" style="width: 40px;color: ${$(`[id="${account}"]`).css('background').split(' none')[0]};height: 40px;top: -113px;left: 261px;line-height: 50px;font-size: 40px;">✔</div></div>`;
                $(selector).children().eq(0).children().eq(1).children().css('outline', `1px solid ${$(selector).css('background').split(' none')[0]}`);
                $(selector).children().eq(0).children().eq(1).children().hover(
                    () => $(selector).children().eq(0).children().eq(1).children().css({'boxShadow': `${$(selector).css('background').split(' none')[0]} 0px 0px 29px`}),
                    () => $(selector).children().eq(0).children().eq(1).children().css({'boxShadow': `none`})
                );
                $(selector).children().eq(0).children().eq(1).children().css('background', 'none');
                let outfitsHTML = '';
                let skin = '';
                let name = '';
                for (const outfit of outfits) {
                    outfitsHTML += `<div style="border: 1px solid ${$(selector).children().eq(0).css('background').includes(' none') ? $(selector).children().eq(0).css('background').split(' none')[0] : $(selector).children().eq(0).css('background')};"><img src="${outfit.images.icon}"></div>`;
                }
                $('#done').click(async () => {
                    if(!$(selector).children().eq(1).val()) return;
                    name = $(selector).children().eq(1).val();
                    $('[id="menu-create"]').remove();
                    await system.editBot(accountO.repl, name, skin || accountO.cid, accountO.name);
                    $('.accounts').children(`[id!="${account}"]`).fadeIn();
                    $(`[id="${account}"]`).children().eq(0).children('div').remove();
                    $(`[id="${account}"]`).children().eq(1)[0].outerHTML = `<div style="color: ${$(`[id="${account}"]`).children().eq(1).css('color')};">${name}</div>`;
                    $(`[id="${account}"]`).children().eq(0).css('height', '100px');
                    $(`[id="${account}"]`).children().eq(0).children().eq(0).after(`<div class="threedots" id="${account}buttonsmIW">⠇</div>`);
                    $(`[id="${account}buttonsmIW"]`).click(handler);
                    $(`[id="${account}"]`).css('cursor', 'pointer').css('height', '').css('top', '').css('left', '').css('width', '171px');
                    accountsNames.accounts.find(e => e.name === accountO.name && accountO.repl === accountO.repl).name;
                    $(`[id="${account}"]`).click((e) => {
                        if(e.target.className === 'threedots') return;
                        system.url = accountO.repl;
                        displayName = name;
                    });
                });
                $('#skin').click(async () => {
                    let html = `<div class="account" id="menu-create" type="skin" style="position: absolute;left: 116.667px;cursor: auto;top: 35.4844px;background: ${$(selector).css('background')};border-bottom: 3px solid ${$(selector).children().eq(0).css('background').includes(' none') ? $(selector).children().eq(0).css('background').split(' none')[0] : $(selector).children().eq(0).css('background').includes(' none')};"><div style="height: 101px;background: ${$(selector).children().eq(0).css('background')};"><img src="${$(selector).children()[0].children[0].src}"><div></div></div><div class="accounts-create-skins">${outfitsHTML}</div></div>`;
                    if($('[id="menu-create"]')[0] && $('[id="menu-create"]')[0].style.left === '312.667px') {
                        return $('[id="menu-create"]').animate({left: '116.667px'}, 100);
                    }
                    const functionimg = (img, color) => {
                        const c = adjust(color, -15);
                        $(selector).css('background', c).css('border-bottom', `6px solid ${color}`);
                        $(selector).children().eq(0).children().eq(1).children().css('outline', `1px solid ${c}`);
                        $('#text').css('color', c);
                        $(selector).children().eq(0).children().eq(1).children().hover(
                            () => $(selector).children().eq(0).children().eq(1).children().css({'boxShadow': `${c} 0px 0px 29px`}),
                            () => $(selector).children().eq(0).children().eq(1).children().css({'boxShadow': `none`})
                        );
                        $(selector).children().eq(0).children().eq(1).children().css({'color': c});
                        $(selector).children().eq(0).css('background', color);
                        $(selector).children().eq(1).css('color', adjust(color, 30));
                        $(selector).hover(
                            () => $(selector).css({'boxShadow': `${$(selector).children().eq(0).css('background').split(' none')[0]} 0px 0px 29px`}),
                            () => $(selector).css({'boxShadow': `none`})
                        );
                        $(selector).children().eq(0).children().eq(1).children().css('background', 'none');
                        outfitsHTML = '';
                        for (const outfit of outfits) {
                            outfitsHTML += `<div style="border: 1px solid ${color};"><img src="${outfit.images.icon}"></div>`;
                        }
                    }
                    if(!$('[id="menu-create"]')[0]) {
                        $(selector).before(html);
                        $(selector).children().eq(0).children().eq(1).children().eq(0).css('outline', `1px solid ${$(selector).css('background').split(' none')[0]}`);
                        $('[id="menu-create"]').hover(
                            () => $('[id="menu-create"]').css({'boxShadow': `${$(selector).children().eq(0).css('background').split(' none')[0]} 0px 0px 29px`}),
                            () => $('[id="menu-create"]').css({'boxShadow': `none`})
                        );
                        $('[type="skin"]').css('border-bottom', `3px solid ${$(selector).children().eq(0).css('background').includes(' none') ? $(selector).children().eq(0).css('background').split(' none')[0] : $(selector).children().eq(0).css('background')}`);
                        $('[class="accounts-create-skins"]').children().click((e) => {
                            const outfitID = e.target.src.split('https://fortnite-api.com/images/cosmetics/br/')[1].split('/')[0];
                            skin = outfitID;
                            $(`[src="${$(selector).children()[0].children[0].src}"]`).attr('src', e.target.src);
                            $('[id="menu-create"]').animate({left: '116.667px'}, 100);
                            $(`[src="${$(selector).children()[0].children[0].src}"]`).imgcolr(functionimg);
                        });
                        $('[id="menu-create"]').animate({left: '312.667px'}, 100);
                    }
                    else {
                        $('[id="menu-create"]').animate({left: '116.667px'}, 100);
                        await new Promise((resolve) => setTimeout(resolve, 100));
                        $('[id="menu-create"]')[0].outerHTML = html;
                        $('[id="menu-create"]').hover(
                            () => $('[id="menu-create"]').css({'boxShadow': `${$(selector).children().eq(0).css('background').split(' none')[0]} 0px 0px 29px`}),
                            () => $('[id="menu-create"]').css({'boxShadow': `none`})
                        );
                        $(selector).children().eq(0).children().eq(1).children().eq(0).css('outline', `1px solid ${$(selector).css('background').split(' none')[0]}`);
                        $('[type="skin"]').css('border-bottom', `3px solid ${$(selector).children().eq(0).css('background').includes(' none') ? $(selector).children().eq(0).css('background').split(' none')[0] : $(selector).children().eq(0).css('background')}`);
                        $('[class="accounts-create-skins"]').children().click((e) => {
                            const outfitID = e.target.src.split('https://fortnite-api.com/images/cosmetics/br/')[1].split('/')[0];
                            skin = outfitID;
                            $(`[src="${$(selector).children()[0].children[0].src}"]`).attr('src', e.target.src);
                            $('[id="menu-create"]').animate({left: '116.667px'}, 100);
                            $(`[src="${$(selector).children()[0].children[0].src}"]`).imgcolr(functionimg);
                        });
                        $('[id="menu-create"]').animate({left: '312.667px'}, 50);
                    }
                });
            });
            $(`[id="${account}"]`).hover(
                () => $(`[id="${account}"]`).css({'boxShadow': `${twofive} 0px 0px 29px`}),
                () => $(`[id="${account}"]`).css({'boxShadow': `none`})
            );
        });
        used.push(cid);
    };
    const div = document.createElement('div');
    document.getElementsByClassName('accounts')[0].appendChild(div);
    div.outerHTML = '<div id="CREATENEWACCOUNT" class="account"><div><img src="https://fortnite-api.com/images/cosmetics/br/CID_044_Athena_Commando_F_SciPop/icon.png"></div><div>CREATE</div></div>';
    $('#CREATENEWACCOUNT').click(async () => {
        $('.accounts').children(`[id!="CREATENEWACCOUNT"]`).fadeOut();
        $('#CREATENEWACCOUNT').css('cursor', 'auto').css('top', '').css('left', '').css('position', 'relative').css('width', '171px').css('height', '204px').animate({top: '4vh', left: '-1vh', width: '313px', height: '218px'}).children()[0].style.height = '154px';
        $('#CREATENEWACCOUNT').off('click').children()[1].outerHTML = '<textarea spellcheck="false">CREATE</textarea>';
        $('#CREATENEWACCOUNT').children()[0].children[0].outerHTML += '<div><div id="skin"><img src="https://fortnite-api.com/images/cosmetics/br/CID_848_Athena_Commando_F_DarkNinjaPurple/icon.png"></div><div id="done" style="width: 40px;color: #382C52;height: 40px;top: -113px;left: 261px;line-height: 50px;font-size: 40px;">✔</div></div>';
        let outfitsHTML = '';
        let skin = '';
        let name = '';
        for (const outfit of outfits) {
            outfitsHTML += `<div style="border: 1px solid ${$('#CREATENEWACCOUNT').children().eq(0).css('background').includes(' none') ? $('#CREATENEWACCOUNT').children().eq(0).css('background').split(' none')[0] : $('#CREATENEWACCOUNT').children().eq(0).css('background')};"><img src="${outfit.images.icon}"></div>`;
        }
        $('#done').click(async () => {
            if(!$('#CREATENEWACCOUNT').children().eq(1).val()) return;
            name = $('#CREATENEWACCOUNT').children().eq(1).val();
            $('[id="menu-create"]').fadeOut();
            $('#CREATENEWACCOUNT').html(`<div style="background: none;top: 35%;color: ${$('#CREATENEWACCOUNT').children().eq(0).css('background').split(' none')[0]};font-size: 33px;">Create a repl account.</div><div style="display: flex;align-items: center;justify-content: center;color: ${$('#CREATENEWACCOUNT').children().eq(0).css('background').split(' none')[0]}"><div style="font-size: 24px;border: 1px solid;border-radius: 10px;display: inline-block;padding: 10px; cursor: pointer;" id="signUpREPL">Sign Up</div></div>`);
            $('#signUpREPL').click(() => {
                window.open('https://repl.it/signup', '_blank', 'location=yes,height=500,width=500,scrollbars=yes,status=yes');
                $('#CREATENEWACCOUNT').html(`<div style="background: none;top: 35%;color: ${$('#CREATENEWACCOUNT').children().eq(0).css('color')};font-size: 30px;">Create a webfort api repo.</div><div style="display: flex;align-items: center;justify-content: center;color: ${$('#CREATENEWACCOUNT').children().eq(0).css('color')};"><div style="font-size: 24px;border: 1px solid;border-radius: 10px;display: inline-block;padding: 10px;cursor:pointer;" id="CreateAPI">Create</div></div>`);
                $('#CreateAPI').click(() => {
                    const rgb2hex = (r,g,b) => ((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);
                    const color = adjust(`#${rgb2hex(...Array.from($('#CREATENEWACCOUNT').children().eq(0).css('color').split('(')[1].split(')')[0].replace(/ /g, '').split(','), Number))}`, 30);
                    $('head').append(`<style id="placeholder">::placeholder {
                        color: ${color} !important;
                        opacity: 1;
                    }</style>`);
                    window.open('https://repl.it/@teenari/wbdapi', '_blank', 'location=yes,height=500,width=500,scrollbars=yes,status=yes');
                    $('#CREATENEWACCOUNT').html(`<div style="background: none;font-size: 19px;line-height: 157px;white-space: pre-wrap;color: ${$('#CREATENEWACCOUNT').children().eq(0).css('color')};font-size: 40px;">Paste API Url below.</div><textarea spellcheck="false" style="font-size: 38px;color: ${color};text-decoration: underline;top: 0px;" placeholder="URL HERE"></textarea><div style="display: flex;align-items: center;justify-content: center;color: ${$('#CREATENEWACCOUNT').children().eq(0).css('color')};top: -19px;position: relative;"><div style="font-size: 24px;border: 1px solid;border-radius: 10px;display: inline-block;padding: 10px;cursor: pointer;margin: 10px;color: ${$('#CREATENEWACCOUNT').children().eq(0).css('color')};" id="Done">CREATE</div></div>`);
                    $('#CREATENEWACCOUNT').css('width', '527px');
                    $('#Done').click(async () => {
                        if(!$('[placeholder="URL HERE"]').val()) return;
                        const request = await system.createBot($('[placeholder="URL HERE"]').val(), name, skin || 'CID_848_Athena_Commando_F_DarkNinjaPurple');
                        if(!request.ok) return;
                        system.url = $('[placeholder="URL HERE"]').val();
                        displayName = name;
                    });
                });
            });
        });
        $('#skin').click(async () => {
            let html = `<div class="account" id="menu-create" type="skin" style="position: absolute;left: 116.667px;cursor: auto;top: 35.4844px;background: ${$('#CREATENEWACCOUNT').css('background')};border-bottom: 3px solid ${$('#CREATENEWACCOUNT').children().eq(0).css('background').includes(' none') ? $('#CREATENEWACCOUNT').children().eq(0).css('background').split(' none')[0] : $('#CREATENEWACCOUNT').children().eq(0).css('background').includes(' none')};"><div style="height: 101px;background: ${$('#CREATENEWACCOUNT').children().eq(0).css('background')};"><img src="${$('#CREATENEWACCOUNT').children()[0].children[0].src}"><div></div></div><div class="accounts-create-skins">${outfitsHTML}</div></div>`;
            if($('[id="menu-create"]')[0] && $('[id="menu-create"]')[0].style.left === '312.667px') {
                return $('[id="menu-create"]').animate({left: '116.667px'}, 100);
            }
            const functionimg = (img, color) => {
                const c = adjust(color, -15);
                $('#CREATENEWACCOUNT').css('background', c).css('border-bottom', `6px solid ${color}`);
                $('#CREATENEWACCOUNT').children().eq(0).children().eq(1).children().css('outline', `1px solid ${c}`);
                $('#text').css('color', c);
                $('#CREATENEWACCOUNT').children().eq(0).children().eq(1).children().hover(
                    () => $('#CREATENEWACCOUNT').children().eq(0).children().eq(1).children().css({'boxShadow': `${c} 0px 0px 29px`}),
                    () => $('#CREATENEWACCOUNT').children().eq(0).children().eq(1).children().css({'boxShadow': `none`})
                );
                $('#CREATENEWACCOUNT').children().eq(0).children().eq(1).children().css({'color': c});
                $('#CREATENEWACCOUNT').children().eq(0).css('background', color);
                $('#CREATENEWACCOUNT').children().eq(1).css('color', adjust(color, 30));
                $('#CREATENEWACCOUNT').hover(
                    () => $('#CREATENEWACCOUNT').css({'boxShadow': `${$('#CREATENEWACCOUNT').children().eq(0).css('background').split(' none')[0]} 0px 0px 29px`}),
                    () => $('#CREATENEWACCOUNT').css({'boxShadow': `none`})
                );
                $('#CREATENEWACCOUNT').children().eq(0).children().eq(1).children().css('background', 'none');
                outfitsHTML = '';
                for (const outfit of outfits) {
                    outfitsHTML += `<div style="border: 1px solid ${color};"><img src="${outfit.images.icon}"></div>`;
                }
            }
            if(!$('[id="menu-create"]')[0]) {
                $('#CREATENEWACCOUNT').before(html);
                $('#CREATENEWACCOUNT').children().eq(0).children().eq(1).children().eq(0).css('outline', `1px solid ${$('#CREATENEWACCOUNT').css('background').split(' none')[0]}`);
                $('[id="menu-create"]').hover(
                    () => $('[id="menu-create"]').css({'boxShadow': `${$('#CREATENEWACCOUNT').children().eq(0).css('background').split(' none')[0]} 0px 0px 29px`}),
                    () => $('[id="menu-create"]').css({'boxShadow': `none`})
                );
                $('[type="skin"]').css('border-bottom', `3px solid ${$('#CREATENEWACCOUNT').children().eq(0).css('background').includes(' none') ? $('#CREATENEWACCOUNT').children().eq(0).css('background').split(' none')[0] : $('#CREATENEWACCOUNT').children().eq(0).css('background')}`);
                $('[class="accounts-create-skins"]').children().click((e) => {
                    const outfitID = e.target.src.split('https://fortnite-api.com/images/cosmetics/br/')[1].split('/')[0];
                    skin = outfitID;
                    $(`[src="${$('#CREATENEWACCOUNT').children()[0].children[0].src}"]`).attr('src', e.target.src);
                    $('[id="menu-create"]').animate({left: '116.667px'}, 100);
                    $(`[src="${$('#CREATENEWACCOUNT').children()[0].children[0].src}"]`).imgcolr(functionimg);
                });
                $('[id="menu-create"]').animate({left: '312.667px'}, 100);
            }
            else {
                $('[id="menu-create"]').animate({left: '116.667px'}, 100);
                await new Promise((resolve) => setTimeout(resolve, 100));
                $('[id="menu-create"]')[0].outerHTML = html;
                $('[id="menu-create"]').hover(
                    () => $('[id="menu-create"]').css({'boxShadow': `${$('#CREATENEWACCOUNT').children().eq(0).css('background').split(' none')[0]} 0px 0px 29px`}),
                    () => $('[id="menu-create"]').css({'boxShadow': `none`})
                );
                $('#CREATENEWACCOUNT').children().eq(0).children().eq(1).children().eq(0).css('outline', `1px solid ${$('#CREATENEWACCOUNT').css('background').split(' none')[0]}`);
                $('[type="skin"]').css('border-bottom', `3px solid ${$('#CREATENEWACCOUNT').children().eq(0).css('background').includes(' none') ? $('#CREATENEWACCOUNT').children().eq(0).css('background').split(' none')[0] : $('#CREATENEWACCOUNT').children().eq(0).css('background')}`);
                $('[class="accounts-create-skins"]').children().click((e) => {
                    const outfitID = e.target.src.split('https://fortnite-api.com/images/cosmetics/br/')[1].split('/')[0];
                    skin = outfitID;
                    $(`[src="${$('#CREATENEWACCOUNT').children()[0].children[0].src}"]`).attr('src', e.target.src);
                    $('[id="menu-create"]').animate({left: '116.667px'}, 100);
                    $(`[src="${$('#CREATENEWACCOUNT').children()[0].children[0].src}"]`).imgcolr(functionimg);
                });
                $('[id="menu-create"]').animate({left: '312.667px'}, 50);
            }
        });
    });
    await new Promise((resolve) => {
        const inv = setInterval(() => {
            if(displayName) {
                resolve();
                clearInterval(inv);
            }
        });
    });
    $('.loading').fadeOut(300);
    system.displayName = displayName;
    if(accountsNames.find(e => e.name === system.displayName && e.repl)) system.url = accountsNames.find(e => e.name === system.displayName && e.repl).repl;
    await system.authorize();
});