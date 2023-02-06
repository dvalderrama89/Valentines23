const fps = 1000 / 60;
let deltaTime = 0;
let lastTimestamp = 0;
let last = 0;
let heartTokens = BigInt(0); // hearts - accumulates into purchasing currency
let kittyPaws = 0; // the purchasing currency
let speed = .6; // Increases the rate that the timer on screen ticks up
let modifier = 1.0; // Increases the number of extra heartTokens getting added at once (instead of hard capping at the frame rate being the max)
let flatRateHeartTokensBonus = BigInt(1);
let flatRateKittyPawsBonus = 1;
let kittyPawPriceDynamic = 10;

window.onload = (event) => {
    start();
}

function start() {
    initializeCounters();
    initializeShops();
    window.requestAnimationFrame(update);
}

function update(timeStamp) {
    let timeInSeconds = timeStamp / findInShop("autoIncrementer").baseMod;

    // This is what turns the game from manual to idle by starting the tick up of currency on a timer
    if (findInShop("autoIncrementer").owned) {
        if (timeInSeconds - last >= speed) {
            last = timeInSeconds;
            updateHeartTokens();
            updateKittyPaws();
        }
    }

    updateHeartTokenDisplay();
    updateKittyPawsDisplay();
    
    // Updates the flat rate increment text in the +X Hearts! Button when the player purchases upgrades
    let flatHeartTokensButtonElement = document.getElementById("plusOneHeartsButton");
    flatHeartTokensButtonElement.innerHTML = `+${flatRateHeartTokensBonus} Hearts!`;

    window.requestAnimationFrame(update);
}

// The id in the button HTML and the id in the ShopItems array of JSON objs has to match
// TODO set cookies that save what items have been bought
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
        default: {
            console.log("elem.id: " + elem.id) ;
        }
    }

    updateBuyButtons();
    updateHeartTokenDisplay();
}

// TODO set cookies that save what items have been unlocked
function unlock(elem) {
    console.log("clicked");
}

function incrementHearts(elem) {
    updateHeartTokens(flatRateHeartTokensBonus);    
}

function incrementKittyPaws(elem=null) {
    updateHeartTokens(-1 * kittyPawPriceDynamic);
    updateKittyPaws(flatRateKittyPawsBonus);
    increaseKittyPawPrice();
}

// TODO: make this non linear later (maybe)
function increaseKittyPawPrice() {
    kittyPawPriceDynamic += 1;
    let kittyPawPriceButtonElem = document.getElementById("claimKittyPawsButton");
    kittyPawPriceButtonElem.innerHTML = `-${kittyPawPriceDynamic}💖 Claim!`;
}

function updateHeartTokens(flatRateIncrement=0) {
    if (flatRateIncrement) {
        heartTokens += BigInt(flatRateIncrement);
    } else {
        heartTokens += BigInt(1*modifier);
    }

    updateBuyButtons();
    setCookie("heartTokens", heartTokens.toString(), 30);
}

function updateBuyButtons() {
    // for kitty paw claim button
    let kittyPawClaimButtonElem = document.getElementById("claimKittyPawsButton");
    if (heartTokens >= kittyPawPriceDynamic) {
        kittyPawClaimButtonElem.disabled = false;
    } else {
        kittyPawClaimButtonElem.disabled = true;
    }

    // for buttons in the Shop
    for (let item of ShopItems) {
        if (heartTokens >= item.price) {
            let itemElem = document.getElementById(item.id);
            itemElem.disabled = false;
        } else {
            let itemElem = document.getElementById(item.id);
            itemElem.disabled = true;
        }
    }
}

function updateHeartTokenDisplay() {
    let displayCounter = document.getElementById("heartTokens");
    displayCounter.innerHTML = `${heartTokens} 💖`;
}

function updateKittyPaws(flatRateIncrement=0) {
    kittyPaws += flatRateIncrement;
    setCookie("kittyPaws", kittyPaws.toString(), 30);
}

function updateKittyPawsDisplay() {
    let displayCounter = document.getElementById("kittyPaws");
    displayCounter.innerHTML = `${kittyPaws} 🐾`;
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

function initializeCounters() {
    // Initializes the cookies for currency if they don't exist
    console.log("initializing counters");
    if (!getCookie("heartTokens")) {
        console.log("initializing hearts to 0");
        setCookie("heartTokens", 0, 30);
    } else {
        let heartTokenDisplay = document.getElementById("heartTokens");
        heartTokens = BigInt(parseInt(getCookie("heartTokens")));
    }

    if (!getCookie("kittyPaws")) {
        console.log("initializing paws to 0");
        setCookie("kittyPaws", 0, 30);
    } else {
        let kittyPawsDisplay = document.getElementById("kittyPaws");
        kittyPaws = BigInt(parseInt(getCookie("kittyPaws")));
    }
}

function initializeShops() {
    renderShop();
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


// TODO: add more shop items (convert manual kitty paw redeem to auto), add random event mechanic, add reward shop
// bugs: currency cookie isn't updated after purchasing from shop