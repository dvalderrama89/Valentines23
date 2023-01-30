const fps = 1000 / 60;
let deltaTime = 0;
let lastTimestamp = 0;
let last = 0;
let tokens = BigInt(0);
let speed = .6;
let modifier = 2.0;

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
        displayCounter.innerHTML = tokens += BigInt((1*modifier));
        setCookie("Tokens", tokens.toString(), 30);
    }

    window.requestAnimationFrame(update);
}

function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    window.location.hostname;
  }