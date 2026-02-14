

/* ==================== JS FILE (script.js) ==================== */
const c = document.getElementById("game");
const ctx = c.getContext("2d");

let player = { x: 200, y: 200, size: 20, speed: 4 };
let target = { x: Math.random()*380, y: Math.random()*380, size: 16 };
let score = 0;

function drawPlayer() {
  ctx.fillStyle = "#4af";
  ctx.fillRect(player.x, player.y, player.size, player.size);
}

function drawTarget() {
  ctx.fillStyle = "#f44";
  ctx.fillRect(target.x, target.y, target.size, target.size);
}

const keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

function move() {
  if (keys["ArrowUp"]) player.y -= player.speed;
  if (keys["ArrowDown"]) player.y += player.speed;
  if (keys["ArrowLeft"]) player.x -= player.speed;
  if (keys["ArrowRight"]) player.x += player.speed;
}

function checkHit() {
  if (
    player.x < target.x + target.size &&
    player.x + player.size > target.x &&
    player.y < target.y + target.size &&
    player.y + player.size > target.y
  ) {
    score++;
    target.x = Math.random()*380;
    target.y = Math.random()*380;
  }
}

function loop() {
  ctx.clearRect(0, 0, 420, 420);
  move();
  checkHit();
  drawPlayer();
  drawTarget();

  ctx.fillStyle = "white";
  ctx.fillText("Score: " + score, 10, 20);

  requestAnimationFrame(loop);
}

loop();
