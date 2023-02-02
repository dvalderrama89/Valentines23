const fps = 1000 / 60;
let deltaTime = 0;
let lastTimestamp = 0;
let last = 0;
let heartTokens = BigInt(0); // hearts - accumulates into purchasing currency
let kittyPaws = 0; // the purchasing currency
let speed = .6; // Increases the rate that the timer on screen ticks up
let modifier = 1.0; // Increases the number of extra heartTokens getting added at once (instead of hard capping at the frame rate being the max)

window.onload = (event) => {
    start();
}

function start() {
    initializeCounters();
    window.requestAnimationFrame(update);
}

function update(timeStamp) {
    let timeInSeconds = timeStamp / 1000;

    if (timeInSeconds - last >= speed) {
        last = timeInSeconds;
        updateHeartTokens();
        updateKittyPaws();
    }

    window.requestAnimationFrame(update);
}

function buy(elem) {
    switch (elem.id) {
        case "plusOneBonus": {
            if (heartTokens >= ShopItems.plusOneBonus.price) {
                heartTokens -= BigInt(ShopItems.plusOneBonus.price);
                modifier += ShopItems.plusOneBonus.increase;
            }
        }
    }
}



function updateHeartTokens() {
    let displayCounter = document.getElementById("heartTokens");
    let updatedHearts = heartTokens += BigInt((1*modifier));
    displayCounter.innerHTML = `${updatedHearts} Hearts`;
    setCookie("heartTokens", heartTokens.toString(), 30);
    // console.log('cookie: ' + getCookie("heartTokens"));
}

function updateKittyPaws() {
    let displayCounter = document.getElementById("kittyPaws");
    let updatedHearts = kittyPaws += 1*modifier;
    displayCounter.innerHTML = `${updatedHearts} Kitty Paws`;
    setCookie("kittyPaws", kittyPaws.toString(), 30);
    // console.log('cookie: ' + getCookie("kittyPaws"));
}

function initializeCounters() {
    // Initializes the cookies for currency if they don't exist
    if (!getCookie("heartTokens")) {
        setCookie("heartTokens", 0, 30);
    } else {
        let heartTokens = document.getElementById("heartTokens");
        heartTokens.innerHTML = getCookie("heartTokens");
    }

    if (!getCookie("kittyPaws")) {
        setCookie("kittyPaws", 0, 30);
    } else {
        let kittyPaws = document.getElementById("kittyPaws");
        kittyPaws.innerHTML = getCookie("kittyPaws");
    }
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

var ShopItems = {
    "plusOneBonus": {
        "price": 10,
        "increase": 1 
    }
}


// TODO: add more UI output to the html