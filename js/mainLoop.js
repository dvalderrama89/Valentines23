const fps = 1000 / 60;
let deltaTime = 0;
let lastTimestamp = 0;
let last = 0;
let heartTokens = BigInt(0); // hearts - accumulates into purchasing currency
let kittyPaws = 0; // the purchasing currency
let speed = .6; // Increases the rate that the timer on screen ticks up
let modifier = 2.0; // Increases the number of extra heartTokens getting added at once (instead of hard capping at the frame rate being the max)

window.onload = (event) => {
    start();
}

function start() {
    window.requestAnimationFrame(update);
}

function update(timeStamp) {
    let timeInSeconds = timeStamp / 1000;

    if (timeInSeconds - last >= speed) {
        last = timeInSeconds;
        let displayCounter = document.getElementById("counter");
        displayCounter.innerHTML = heartTokens += BigInt((1*modifier));
        setCookie("heartTokens", heartTokens.toString(), 30);
        console.log('cookie: ' + getCookie("heartTokens"));
    }

    window.requestAnimationFrame(update);
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



// TODO: add getCookie + prevent overwriting cookie on accident