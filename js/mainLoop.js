// let last = 0;
// let heartTokens = BigInt(0); // hearts - accumulates into purchasing currency
// let kittyPaws = 0; // the purchasing currency
// let speed = .6; // Increases the rate that the timer on screen ticks up
// let addHeartsMod = 1.0; // Increases the number of extra modifiers.heartTokens getting added at once (instead of hard capping at the frame rate being the max)
// let flatRateHeartTokensBonus = BigInt(1);
// let flatRateKittyPawsBonus = 1;
// let kittyPawPriceDynamic = 10;

let modifiers = {
    last: 0,
    heartTokens: BigInt(0),
    kittyPaws: 0,
    speed: 0.6,
    addHeartsMod: 1.0,
    flatRateHeartTokensBonus: BigInt(1),
    flatRateKittyPawsBonus: 1.0,
    kittyPawPriceDynamic: 10
}

window.onload = (event) => {
    start();
}

function start() {
    initializeModifiers();
    initializeCounters();
    initializeShops();
    window.requestAnimationFrame(update);
}

function update(timeStamp) {
    let timeInSeconds = timeStamp / findInShop("autoIncrementer").baseMod;

    // This is what turns the game from manual to idle by starting the tick up of currency on a timer
    if (findInShop("autoIncrementer").owned) {
        if (timeInSeconds - modifiers.last >= modifiers.speed) {
            modifiers.last = timeInSeconds;
            updateHeartTokens();
            updateKittyPaws();
        }
    }

    updateHeartTokenDisplay();
    updateKittyPawsDisplay();
    
    // Updates the flat rate increment text in the +X Hearts! Button when the player purchases upgrades
    let flatHeartTokensButtonElement = document.getElementById("plusOneHeartsButton");
    flatHeartTokensButtonElement.innerHTML = `+${modifiers.flatRateHeartTokensBonus} Hearts!`;

    window.requestAnimationFrame(update);
}

// The id in the button HTML and the id in the ShopItems array of JSON objs has to match
// TODO set cookies that save what items have been bought
function buy(elem) {
    let arrayItem = findInShop(elem.id);
    switch (elem.id) {
        case "plusOneBonus": {
            if (modifiers.heartTokens >= arrayItem.price) {
                modifiers.heartTokens -= BigInt(arrayItem.price);
                modifiers.flatRateHeartTokensBonus++;
            }
            break;
        }
        case "autoIncrementer": {
            if (modifiers.heartTokens >= arrayItem.price) {
                modifiers.heartTokens -= BigInt(arrayItem.price);
                arrayItem.owned = 1;
            }
            break;
        }
        case "autoClaimer": {
            if (arrayItem.stock > 0 && modifiers.heartTokens >= arrayItem.price) {
                modifiers.heartTokens -= BigInt(arrayItem.price);
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

// TODO set cookies that save what items have been unlocked
function unlock(elem) {
    console.log("clicked");
}

function incrementHearts(elem) {
    updateHeartTokens(modifiers.flatRateHeartTokensBonus);    
}

function incrementKittyPaws(elem=null) {
    updateHeartTokens(-1 * modifiers.kittyPawPriceDynamic);
    updateKittyPaws(modifiers.flatRateKittyPawsBonus);
    increaseKittyPawPrice();
}

// TODO: make this non linear later (maybe)
function increaseKittyPawPrice() {
    modifiers.kittyPawPriceDynamic += 1;
    let kittyPawPriceButtonElem = document.getElementById("claimKittyPawsButton");
    kittyPawPriceButtonElem.innerHTML = `-${modifiers.kittyPawPriceDynamic}💖 Claim!`;
}

function updateHeartTokens(flatRateIncrement=0) {
    if (flatRateIncrement) {
        modifiers.heartTokens += BigInt(flatRateIncrement);
    } else {
        modifiers.heartTokens += BigInt(1*modifiers.addHeartsMod);
    }

    updateBuyButtons();
    setCookie("heartTokens", modifiers.heartTokens.toString(), 30);
}

function updateBuyButtons() {
    // for kitty paw claim button
    let kittyPawClaimButtonElem = document.getElementById("claimKittyPawsButton");
    if (modifiers.heartTokens >= modifiers.kittyPawPriceDynamic) {
        kittyPawClaimButtonElem.disabled = false;
        let autoClaimer = findInShop("autoClaimer");
        if (autoClaimer.owned && autoClaimer.toggle) {
            incrementKittyPaws();
        }
    } else {
        kittyPawClaimButtonElem.disabled = true;
    }

    // for buttons in the Shop
    for (let item of ShopItems) {
        if (modifiers.heartTokens >= item.price) {
            let itemElem = document.getElementById(item.id);
            itemElem.disabled = false;
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
    displayCounter.innerHTML = `${modifiers.heartTokens} 💖`;
}

function updateKittyPaws(flatRateIncrement=0) {
    modifiers.kittyPaws += flatRateIncrement;
    setCookie("kittyPaws", modifiers.kittyPaws.toString(), 30);
}

function updateKittyPawsDisplay() {
    let displayCounter = document.getElementById("kittyPaws");
    displayCounter.innerHTML = `${modifiers.kittyPaws} 🐾`;
}

// Update the shop dynamically every animation frame depending on what is in the ShopItems JSON
function renderShop() {
    let shopContainer = document.getElementById("shopContainer");

    for (const item of ShopItems) {
        // Check to see if the shop element already exists in the list, if it does get rid of it and render again
        let itemElem = document.getElementById(item.id + "Item");
        
        if (itemElem != null) {
            console.log("removing");
            itemElem.remove();
        }
        // outer div
        let shopItem = document.createElement("div");
        shopItem.classList.add("purchase", "menu");
        shopItem.setAttribute("id", item.id + "Item");

        // first inner div
        let shopItemDiv = document.createElement("div");
        let shopItemDisplayText = document.createTextNode(item.displayName);
        shopItemDiv.append(shopItemDisplayText);

        // second inner div
        let shopItemPriceDiv = document.createElement("div");
        shopItemPriceDiv.classList.add("push");
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

function initializeModifiers() {
    if (getCookie("modifiers")) {
        modifiers = JSON.parse(getCookie("modifiers"));
    }
}

function initializeCounters() {
    // Initializes the cookies for currency if they don't exist
    console.log("initializing counters");
    if (getCookie("heartTokens")) {
        let heartTokenDisplay = document.getElementById("heartTokens");
        modifiers.heartTokens = BigInt(parseInt(getCookie("heartTokens")));
    }

    if (getCookie("kittyPaws")) {
        let kittyPawsDisplay = document.getElementById("kittyPaws");
        modifiers.kittyPaws = parseInt(getCookie("kittyPaws"));
    }
}

function initializeShops() {
    if (getCookie("ShopItems")) {
        ShopItems = JSON.parse(getCookie("ShopItems"));

        if (findInShop("autoClaimer").owned) {
            let elem = document.getElementById("autoClaimer");
            elem.setAttribute("onClick", "toggleAutoClaimer(this)");
            if (findInShop("autoClaimer").toggle) {
                elem.innerHTML = "On";
            } else {
                elem.innerHTML = "Off";
            }
        }
    }

    if (getCookie("TreasureBox")) {
        TreasureBox = JSON.parse(getCookie("TreasureBox"));
    }

    renderShop();
    renderTreasureBox();
}

function renderTreasureBox() {
    console.log("todo tb");
}

function setCookie(cookieName, cookieValue, numDaysToExpire) {
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
    "displayName": "Manual Increment Bonus +1",
    "owned": 0,
    "price": 10,
    "increase": 1 
},
// This automatically generates heart tokens on a given interval dictated by the baseMod and other mod vars
{
    "id": "autoIncrementer",
    "displayName": "Auto Increment +1",
    "owned": 0,
    "price": 100,
    "baseMod": 10000
},
// Automaically claims kitty paws when there's enough money to buy them
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

var TreasureBox = {
    "audiobook": {
        "title": "HPCh1",
        "displayName": "Harry Potter - The Sorcerer's Stone Chapter 1 Audiobook",
        "filePath": "rewards/testFileHP1.mp3"
    }
}

window.addEventListener("beforeunload", (event) => {
    setCookie("ShopItems", JSON.stringify(ShopItems));
    setCookie("TreasureBox", JSON.stringify(TreasureBox));
    setCookie("modifiers", JSON.stringify(modifiers));
});


// TODO: add more shop items (convert manual kitty paw redeem to auto), add random event mechanic, add reward shop
// bugs: currency cookie isn't updated after purchasing from shop