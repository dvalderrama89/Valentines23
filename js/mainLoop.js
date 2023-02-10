let heartTokens = BigInt(0);
let flatRateHeartTokensBonus = BigInt(1);

let modifiers = {
    last: 0,
    crowns: 0,
    speed: 0.6,
    addHeartsMod: 1.0,
    crownsFlatRateBonus: 1.0,
    crownsPriceDynamic: 10
}

window.onload = (event) => {
    start();
}

function start() {
    initializeModifiers();
    initializeCurrencyAndBigInts();    
    initializeShops();
    window.requestAnimationFrame(update);
}

function update(timeStamp) {
    let timeInSeconds = timeStamp / (findInShop("autoIncrementer").baseMod / (Math.pow(2, findInShop("speedBoost").tier)));

    // This is what turns the game from manual to idle by starting the tick up of currency on a timer
    if (findInShop("autoIncrementer").owned) {
        if (timeInSeconds - modifiers.last >= modifiers.speed) {
            console.log("incremengint with autoincrementer");
            modifiers.last = timeInSeconds;
            updateHeartTokens();
            updateCrowns();
        }
    }

    updateHeartTokenDisplay();
    updateCrownsDisplay();
    
    // Updates the flat rate increment text in the +X Hearts! Button when the player purchases upgrades
    let flatHeartTokensButtonElement = document.getElementById("plusOneHeartsButton");
    flatHeartTokensButtonElement.innerHTML = `+${flatRateHeartTokensBonus} Hearts!`;

    window.requestAnimationFrame(update);
}

// The id in the button HTML and the id in the ShopItems array of JSON objs has to match
function buy(elem) {
    let arrayItem = findInShop(elem.id);
    switch (elem.id) {
        case "plusOneBonus": {
            if (heartTokens >= arrayItem.price) {
                heartTokens -= BigInt(arrayItem.price);
                flatRateHeartTokensBonus++;
            }
            break;
        }
        case "autoIncrementer": {
            if (heartTokens >= arrayItem.price) {
                heartTokens -= BigInt(arrayItem.price);
                arrayItem.owned = 1;
            }
            break;
        }
        case "speedBoost": {
            if (!arrayItem.atMax && heartTokens >= arrayItem.price) {
                heartTokens -= BigInt(arrayItem.price);
                arrayItem.owned = 1;

                // Increments the power that the autoIncrementer increments at
                if (arrayItem.tier < 7) {
                    arrayItem.tier += 1;
                    document.getElementById(elem.id + "Text").innerHTML = `Speed Boost +${arrayItem.tier}`;

                    if (arrayItem.tier >= 7) {
                        arrayItem.atMax = 1;

                        // Remove the price because we're at max and update the shop button
                        document.getElementById(elem.id + "Price").innerHTML = "";
                        elem.innerHTML = "MAXED";
                    }
                }

            }
            break;
        }
        case "autoClaimer": {
            if (arrayItem.stock > 0 && heartTokens >= arrayItem.price) {
                heartTokens -= BigInt(arrayItem.price);
                arrayItem.owned = 1;
                arrayItem.stock--;
                elem.setAttribute("onClick", "toggleAutoClaimer(this)");
                elem.innerHTML = "On";
            }
            break;
        }
        default: {
            console.log("elem.id: " + elem.id) ;
        }
    }

    updateBuyButtons();
    updateHeartTokenDisplay();
}

function toggleAutoClaimer(elem=null) {
    let autoClaimer = findInShop("autoClaimer");
    if (elem?.innerHTML == "On") {
        elem.innerHTML = "Off";
        autoClaimer.toggle = 0;
    } else if (elem?.innerHTML == "Off") {
        elem.innerHTML = "On";
        autoClaimer.toggle = 1;
    }
}

function unlock(elem) {
    let treasureBoxItem = findInTreasureBox(elem.id);
    let parentDiv = document.getElementById(elem.id + "Item");
    switch(elem.id) {
        case "hpChapter1": {
            if (!treasureBoxItem.owned && modifiers.crowns >= treasureBoxItem.price) {
                treasureBoxItem.owned = 1;
                updateCrowns(-1 * treasureBoxItem.price);
                elem.remove(); // these removals save space on the screen on mobile
                document.getElementById(elem.id + "Price").innerHTML = ""; // Removes the price of the item because it's owned
                addViewButtonToDOM(parentDiv, treasureBoxItem);
            }
            break;
        }
        case "test1": {
            if (!treasureBoxItem.owned && modifiers.crowns >= treasureBoxItem.price) {
                treasureBoxItem.owned = 1;
                updateCrowns(-1 * treasureBoxItem.price);
                elem.remove();
                document.getElementById(elem.id + "Price").innerHTML = "";
                addViewButtonToDOM(parentDiv, treasureBoxItem);
            }
            break;
        }
        default: {
            console.log(elem.id);
        }
    }
}

function addViewButtonToDOM(parentDiv, treasureBoxItem) {
    // add the View button
    let viewButtonElem = document.createElement("button");

    // add the anchor that will have the links to the treasure
    let anchorElem = document.createElement("a");
    anchorElem.setAttribute("target", "_blank");
    anchorElem.setAttribute("href", treasureBoxItem.filePath);
    let viewAnchorDisplayText = document.createTextNode("View");
    anchorElem.append(viewAnchorDisplayText);

    // combine them
    viewButtonElem.append(anchorElem);
    viewButtonElem.classList.add("purchase");
    parentDiv.append(viewButtonElem);
}

function incrementHearts(elem) {
    updateHeartTokens(flatRateHeartTokensBonus);    
}

function incrementCrowns(elem=null) {
    updateHeartTokens(-1 * modifiers.crownsPriceDynamic);
    updateCrowns(modifiers.crownsFlatRateBonus);
    incrementCrownPrice();
}

// TODO: make this non linear later (maybe)
function incrementCrownPrice() {
    modifiers.crownsPriceDynamic += 1;
    let crownPriceButtonElem = document.getElementById("crownClaimButton");
    crownPriceButtonElem.innerHTML = `-${modifiers.crownsPriceDynamic}💖 Claim!`;
}

function updateHeartTokens(flatRateIncrement=0) {
    if (flatRateIncrement) {
        heartTokens += BigInt(flatRateIncrement);
    } else {
        heartTokens += BigInt(1*modifiers.addHeartsMod);
    }

    updateBuyButtons();
}

function updateBuyButtons() {
    // for crown claim button
    let crownClaimButtonElem = document.getElementById("crownClaimButton");
    if (heartTokens >= modifiers.crownsPriceDynamic) {
        crownClaimButtonElem.disabled = false;
        let autoClaimer = findInShop("autoClaimer");
        if (autoClaimer.owned && autoClaimer.toggle) {
            incrementCrowns();
        }
    } else {
        crownClaimButtonElem.disabled = true;
    }

    // for buttons in the Shop
    for (let item of ShopItems) {
        if (heartTokens >= item.price) {
            let itemElem = document.getElementById(item.id);

            if (item?.atMax) {
                itemElem.disabled = true;    
            } else {
                itemElem.disabled = false;
            }
        } else {
            let itemElem = document.getElementById(item.id);
            let autoClaimer = findInShop("autoClaimer");

            if (item.id == "autoClaimer" && autoClaimer.owned == 1) {
                itemElem.disabled = false;
            } else {
                itemElem.disabled = true;
            }
        }
    }
}

function updateHeartTokenDisplay() {
    let displayCounter = document.getElementById("heartTokens");
    displayCounter.innerHTML = `${heartTokens} 💖`;
}

function updateCrowns(flatRateIncrement=0) {
    modifiers.crowns += flatRateIncrement;
    updateCrownButtons();
}

function updateCrownButtons() {
    for (let treasure of TreasureBox) {
        if (!treasure.owned) {
            let buttonElem = document.getElementById(treasure.id);
            let crownAnchor = buttonElem.firstChild;

            if (modifiers.crowns >= treasure.price) {
                buttonElem.disabled = false;
            } else {
                buttonElem.disabled = true;
            }
        }
    }
}

function updateCrownsDisplay() {
    let displayCounter = document.getElementById("crowns");
    displayCounter.innerHTML = `${modifiers.crowns} 👑`;
}

function initializeModifiers() {
    if (getCookie("modifiers")) {
        modifiers = JSON.parse(getCookie("modifiers"));

        // This may need to move elsewhere because it's only working here cos the currency is rendered statically
        let crownPriceButtonElem = document.getElementById("crownClaimButton");
        crownPriceButtonElem.innerHTML = `-${modifiers.crownsPriceDynamic}💖 Claim!`;
    }
}

function initializeCurrencyAndBigInts() {
    // Initializes the cookies for currency if they don't exist
    if (getCookie("heartTokens")) {
        let heartTokenDisplay = document.getElementById("heartTokens");
        heartTokens = BigInt(parseInt(getCookie("heartTokens")));
    }

    if (getCookie("crowns")) {
        let crownDisplayElem = document.getElementById("crowns");
        modifiers.crowns = parseInt(getCookie("crowns"));
    }

    if (getCookie("flatRateHeartTokensBonus")) {
        flatRateHeartTokensBonus = BigInt(parseInt(getCookie("flatRateHeartTokensBonus")));
    }
}

function initializeShops() {
    if (getCookie("ShopItems")) {
        ShopItems = JSON.parse(getCookie("ShopItems"));
    }

    if (getCookie("TreasureBox")) {
        TreasureBox = JSON.parse(getCookie("TreasureBox"));
    }

    renderShop();
    renderTreasureBox();

    // This only works after the shop has rendered because otherwise there's no elements in the DOM to grab
    if (findInShop("autoClaimer").owned) {
        let elem = document.getElementById("autoClaimer");
        elem.setAttribute("onClick", "toggleAutoClaimer(this)");
        elem.removeAttribute("disabled");
        if (findInShop("autoClaimer").toggle) {
            elem.innerHTML = "On";
        } else {
            elem.innerHTML = "Off";
        }
    }

    // Speed Boost dynamic text
    document.getElementById(findInShop("speedBoost").id + "Text").innerHTML = `Speed Boost +${findInShop("speedBoost").tier}`;
    if (findInShop("speedBoost").atMax) {
        // Remove the price because we're at max and update the shop button
        document.getElementById(findInShop("speedBoost").id + "Price").innerHTML = "";
        elem.innerHTML = "MAXED";
    }

    updateBuyButtons();

    for (const treasure of TreasureBox) {
        initOwnedTreasureBoxItems(treasure);
    }
}

function initOwnedTreasureBoxItems(item) {    
    if (item.owned) {
        let parentDiv = document.getElementById(item.id + "Item");
        document.getElementById(item.id).remove(); // removes all buttons that say "unlock" if the item is owned
        document.getElementById(item.id + "Price").innerHTML = ""; // remove item price so it doesn't look like you have to pay to View
        addViewButtonToDOM(parentDiv, item);
    }
}

// Update the shop dynamically every animation frame depending on what is in the ShopItems JSON
function renderShop() {
    let shopContainer = document.getElementById("shopContainer");

    for (const item of ShopItems) {
        // Check to see if the shop element already exists in the list, if it does get rid of it and render again
        let itemElem = document.getElementById(item.id + "Item");
        
        if (itemElem != null) {
            itemElem.remove();
        }
        // outer div
        let shopItem = document.createElement("div");
        shopItem.classList.add("purchase", "menu");
        shopItem.setAttribute("id", item.id + "Item");

        // first inner div
        let shopItemDiv = document.createElement("div");
        let shopItemDisplayText = document.createTextNode(item.displayName);
        shopItemDiv.setAttribute("id", item.id + "Text");
        shopItemDiv.append(shopItemDisplayText);

        // second inner div
        let shopItemPriceDiv = document.createElement("div");
        shopItemPriceDiv.classList.add("push");
        shopItemPriceDiv.setAttribute("id", item.id + "Price");
        let shopItemPriceDisplayText = document.createTextNode(`${item.price}💖`);
        shopItemPriceDiv.append(shopItemPriceDisplayText);

        // third inner div (which has a button inside of it)
        let shopItemBuyDiv = document.createElement("div");
        let shopItemBuyButton = document.createElement("button");
        shopItemBuyButton.setAttribute("id", item.id);
        shopItemBuyButton.setAttribute("type", "button");
        shopItemBuyButton.setAttribute("onClick", "buy(this)");
        shopItemBuyButton.classList.add("purchase");
        shopItemBuyButton.disabled = true;
        let shopItemBuyButtonDisplayText = document.createTextNode("Buy");
        shopItemBuyButton.append(shopItemBuyButtonDisplayText);
        shopItemBuyDiv.append(shopItemBuyButton);

        // Combine the three divs to the outer div
        shopItem.append(shopItemDiv);
        shopItem.append(shopItemPriceDiv);
        shopItem.append(shopItemBuyDiv);

        // Final combine
        shopContainer.append(shopItem);
    }
}

function renderTreasureBox() {
    let treasureBoxContainer = document.getElementById("treasureBoxContainer");

    for (const item of TreasureBox) {
        // Check to see if the shop element already exists in the list, if it does get rid of it and render again
        let itemElem = document.getElementById(item.id + "Item");
        
        if (itemElem != null) {
            itemElem.remove();
        }
        // outer div
        let treasureBoxItem = document.createElement("div");
        treasureBoxItem.classList.add("purchase", "menu");
        treasureBoxItem.setAttribute("id", item.id + "Item");

        // first inner div
        let treasureBoxItemDiv = document.createElement("div");
        let treasureBoxDisplayText = document.createTextNode(item.displayName);
        treasureBoxItemDiv.append(treasureBoxDisplayText);

        // second inner div (price)
        let treasureBoxPriceDiv = document.createElement("div");
        treasureBoxPriceDiv.classList.add("push");
        treasureBoxPriceDiv.setAttribute("id", item.id + "Price");
        let treasureBoxPriceDisplayText = document.createTextNode(`${item.price}👑`);
        treasureBoxPriceDiv.append(treasureBoxPriceDisplayText);

        // third inner div (which has a button inside of it)
        let treasureBoxBuyDiv = document.createElement("div");
        let treasureBoxBuyButton = document.createElement("button");
        treasureBoxBuyButton.setAttribute("id", item.id);
        treasureBoxBuyButton.setAttribute("type", "button");
        treasureBoxBuyButton.setAttribute("onClick", "unlock(this)");
        treasureBoxBuyButton.classList.add("purchase");
        treasureBoxBuyButton.disabled = true;
        let treasureBoxBuyButtonDisplayText = document.createTextNode("Unlock");
        treasureBoxBuyButton.append(treasureBoxBuyButtonDisplayText);

        // Append the button to the button div
        treasureBoxBuyDiv.append(treasureBoxBuyButton);

        // Combine the three divs to the outer div
        treasureBoxItem.append(treasureBoxItemDiv);
        treasureBoxItem.append(treasureBoxPriceDiv);
        treasureBoxItem.append(treasureBoxBuyDiv);

        // Final combine
        treasureBoxContainer.append(treasureBoxItem);
    }   
}

function setCookie(cookieName, cookieValue, numDaysToExpire=30) {
    const d = new Date();
    d.setTime(d.getTime() + (numDaysToExpire*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cookieName + "=" + cookieValue + ";" + expires + ";path=/";
    window.location.hostname;
}

function getCookie(cookieName) {
    let cookieValue = '';
    if (document.cookie.split(';').some((item) => item.trim().startsWith(`${cookieName}=`))) {
        cookieValue = document.cookie
        .split('; ')
        .find((row) => row.startsWith(`${cookieName}=`))
        ?.split('=')[1];
    }
    return cookieValue;
}

// Every item needs the following and everything else is optional:
// id, displayName, owned, price
var ShopItems = 
[{
    "id": "plusOneBonus",
    "displayName": "Click Bonus +1",
    "owned": 0,
    "price": 10,
    "increase": 1 
},
// This automatically generates heart tokens on a given interval dictated by the baseMod and other mod vars
{
    "id": "autoIncrementer",
    "displayName": "Autoclick +1",
    "owned": 0,
    "price": 10,
    "baseMod": 1000 // about 6 seconds between each +1 increase to start
},
// This will cut the autoIncrementer in half each time it's applied until the total of autoIncrementer.baseMod/(Math.pow(2, 7)) <= 7
{
    "id": "speedBoost",
    "displayName": "Speed Boost +1",
    "owned": 0,
    "price": 50,
    "tier": 1,
    "atMax": 0, // flipped to 1 when tier = 7
},
// Automaically claims crowns when there's enough money to buy them
{
    "id": "autoClaimer",
    "displayName": "Auto Claimer",
    "owned": 0,
    "price": 20,
    "stock": 1,
    "toggle": 1,
}];

function findInShop(itemID) {
    return ShopItems.find(item => item.id == itemID);
}

function findInTreasureBox(itemID) {
    return TreasureBox.find(item => item.id == itemID);
}

var TreasureBox = 
[{
    "id": "hpChapter1",
    "displayName": "Audiobook - Chapter 1",
    "owned": 0,
    "price": 1,
    "filePath": "rewards/testFileHP1.mp3"
},
{
    "id": "test1",
    "displayName": "Test - Test Test 1",
    "owned": 0,
    "price": 2,
    "filePath": "rewards/test.mp3"
}];


const terminationEvent = 'onpagehide' in self ? 'pagehide' : 'unload';
window.addEventListener(terminationEvent, (event) => {
    try {
        setCookie("modifiers", JSON.stringify(modifiers));
        setCookie("heartTokens", heartTokens);
        setCookie("flatRateHeartTokensBonus", flatRateHeartTokensBonus);
        setCookie("ShopItems", JSON.stringify(ShopItems));
        setCookie("TreasureBox", JSON.stringify(TreasureBox));
    } catch (e) {
        console.log(e);
    } finally {
        console.log("Cookies saved");
    }
});