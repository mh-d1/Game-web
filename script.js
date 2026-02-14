const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let zoom = 1;
let bots = [];
let mouseX = canvas.width / 2;
let mouseY = canvas.height / 2;

// generate bots
for (let i = 0; i < 10; i++) {
    bots.push({
        x: Math.random() * 2000 - 1000,
        y: Math.random() * 2000 - 1000,
        size: Math.random() * 20 + 10,
        alive: true
    });
}

// detect mouse movement
canvas.addEventListener("mousemove", e => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});

// zoom sniper (mouse scroll)
canvas.addEventListener("wheel", e => {
    zoom += e.deltaY * -0.001;
    if (zoom < 1) zoom = 1;
    if (zoom > 10) zoom = 10;

    document.getElementById("zoomLevel").innerText = "Zoom: " + zoom.toFixed(1) + "x";
});

// shoot
canvas.addEventListener("click", () => {
    bots.forEach(bot => {
        if (!bot.alive) return;

        let bx = canvas.width/2 + bot.x / (zoom * 1.5);
        let by = canvas.height/2 + bot.y / (zoom * 1.5);

        // jika crosshair berada di bot
        if (Math.hypot(mouseX - bx, mouseY - by) < bot.size) {
            bot.alive = false;
        }
    });
});

// draw background sore
function drawBackground() {
    let sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
    sky.addColorStop(0, "#ffb37a");
    sky.addColorStop(0.5, "#f28a90");
    sky.addColorStop(1, "#6b4fa3");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#3b8b3b";
    ctx.fillRect(0, canvas.height * 0.55, canvas.width, canvas.height);

    ctx.fillStyle = "#47a347";
    ctx.fillRect(0, canvas.height * 0.62, canvas.width, canvas.height);
}

// draw scope following mouse
function drawScope() {
    ctx.strokeStyle = "rgba(255,255,255,0.6)";
    ctx.lineWidth = 2;

    // lingkaran scope
    ctx.beginPath();
    ctx.arc(mouseX, mouseY, 200, 0, Math.PI * 2);
    ctx.stroke();

    // garis horizontal
    ctx.beginPath();
    ctx.moveTo(mouseX - 220, mouseY);
    ctx.lineTo(mouseX + 220, mouseY);
    ctx.stroke();

    // garis vertikal
    ctx.beginPath();
    ctx.moveTo(mouseX, mouseY - 220);
    ctx.lineTo(mouseX, mouseY + 220);
    ctx.stroke();
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBackground();

    ctx.save();
    ctx.scale(zoom, zoom);

    bots.forEach(bot => {
        if (bot.alive) {
            ctx.fillStyle = "red";

            let bx = canvas.width/2 + bot.x / (zoom * 1.5);
            let by = canvas.height/2 + bot.y / (zoom * 1.5);

            ctx.beginPath();
            ctx.arc(bx/zoom, by/zoom, bot.size / zoom, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    ctx.restore();

    drawScope();

    requestAnimationFrame(render);
}

render();
