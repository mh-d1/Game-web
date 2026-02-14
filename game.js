// =========================================
// SCENE, CAMERA, RENDERER
// =========================================

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.1, 1000
);
camera.position.set(0, 1.7, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Resize
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// =========================================
// FLOOR + MAP
// =========================================
const floorGeo = new THREE.PlaneGeometry(200, 200);
const floorMat = new THREE.MeshBasicMaterial({ color: 0x555555 });
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// DINDING
function createWall(x, z) {
    let geo = new THREE.BoxGeometry(4, 4, 1);
    let mat = new THREE.MeshBasicMaterial({ color: 0x222222 });
    let wall = new THREE.Mesh(geo, mat);
    wall.position.set(x, 2, z);
    scene.add(wall);
}
createWall(0, -10);
createWall(5, -10);
createWall(-5, -10);

// =========================================
// MUSUH
// =========================================
let enemyHP = 100;

const enemyGeo = new THREE.BoxGeometry(1.5, 2, 1.5);
const enemyMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const enemy = new THREE.Mesh(enemyGeo, enemyMat);
enemy.position.set(0, 1, -20);
scene.add(enemy);

let enemyDir = 1; // bergerak kiri kanan
let enemyShootCooldown = 0;

// =========================================
// PLAYER VAR
// =========================================
let hp = 100;
let ammo = 30;
let reserveAmmo = 90;
let isReloading = false;

// HUD Update
document.getElementById("ammo").textContent = ammo;
document.getElementById("hp").textContent = hp;

// =========================================
// SHOOTING
// =========================================
function shoot() {
    if (ammo <= 0 || isReloading) return;

    ammo--;
    document.getElementById("ammo").textContent = ammo;

    // Recoil kecil
    camera.rotation.x += (Math.random() - 0.5) * 0.01;
    camera.rotation.y += (Math.random() - 0.5) * 0.01;

    // Raycaster
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);

    const hit = raycaster.intersectObject(enemy);

    if (hit.length > 0) {
        enemyHP -= 20;

        enemy.material.color.set(0xff4444);
        setTimeout(() => enemy.material.color.set(0xff0000), 150);

        if (enemyHP <= 0) {
            scene.remove(enemy);
        }
    }
}

// Fire button mobile
document.getElementById("fireBtn").addEventListener("click", shoot);

// Pointer Lock (FPS mode)
document.body.addEventListener("click", () => {
    document.body.requestPointerLock();
});

// =========================================
// RELOAD SYSTEM
// =========================================
function reload() {
    if (isReloading) return;
    if (ammo === 30 || reserveAmmo <= 0) return;

    isReloading = true;

    setTimeout(() => {
        let needed = 30 - ammo;
        let used = Math.min(needed, reserveAmmo);

        ammo += used;
        reserveAmmo -= used;

        document.getElementById("ammo").textContent = ammo;
        isReloading = false;
    }, 1200); // waktu reload 1.2 detik
}

document.addEventListener("keydown", (e) => {
    if (e.key === "r" || e.key === "R") reload();
});

// =========================================
// MOVEMENT (WASD)
// =========================================
const keys = {};
document.addEventListener("keydown", (e) => keys[e.key] = true);
document.addEventListener("keyup", (e) => keys[e.key] = false);

function movePlayer() {
    let speed = 0.1;

    if (keys["w"]) camera.position.z -= Math.cos(camera.rotation.y) * speed;
    if (keys["s"]) camera.position.z += Math.cos(camera.rotation.y) * speed;
    if (keys["a"]) camera.position.x -= Math.cos(camera.rotation.y + Math.PI/2) * speed;
    if (keys["d"]) camera.position.x += Math.cos(camera.rotation.y + Math.PI/2) * speed;
}

// =========================================
// ENEMY AI
// =========================================
function enemyAI() {
    if (!enemy.parent) return;

    // Gerak bolak balik
    enemy.position.x += 0.05 * enemyDir;
    if (enemy.position.x > 5) enemyDir = -1;
    if (enemy.position.x < -5) enemyDir = 1;

    // Musuh menembak jika dekat
    let dist = enemy.position.distanceTo(camera.position);

    if (dist < 15 && enemyShootCooldown <= 0) {
        hp -= 10;
        document.getElementById("hp").textContent = hp;

        enemy.material.color.set(0xff8888);
        setTimeout(() => enemy.material.color.set(0xff0000), 200);

        enemyShootCooldown = 60; // cooldown 1 detik
    }

    if (enemyShootCooldown > 0) enemyShootCooldown--;

    if (hp <= 0) {
        alert("GAME OVER");
        location.reload();
    }
}

// =========================================
// ANIMATION LOOP
// =========================================
function animate() {
    requestAnimationFrame(animate);

    movePlayer();
    enemyAI();

    renderer.render(scene, camera);
}
animate();
