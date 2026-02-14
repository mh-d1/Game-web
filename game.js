// =========================================
// SCENE, CAMERA, RENDERER
// =========================================

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.1, 1000
);
camera.position.set(0, 1.7, 5);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
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
let enemyHP = 50;

const enemyGeo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
const enemyMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const enemy = new THREE.Mesh(enemyGeo, enemyMat);
enemy.position.set(0, 1, -15);
scene.add(enemy);

// =========================================
// SHOOTING
// =========================================
let ammo = 30;
document.getElementById("ammo").textContent = ammo;

function shoot() {
    if (ammo <= 0) return;

    ammo--;
    document.getElementById("ammo").textContent = ammo;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);

    const hit = raycaster.intersectObject(enemy);

    if (hit.length > 0) {
        enemyHP -= 20;
        enemy.scale.y -= 0.1;

        if (enemyHP <= 0) {
            scene.remove(enemy);
        }
    }
}

document.body.addEventListener("click", () => {
    document.body.requestPointerLock();
    shoot();
});

// =========================================
// MOVEMENT
// =========================================
const keys = {};

document.addEventListener("keydown", (e)=> keys[e.key] = true);
document.addEventListener("keyup", (e)=> keys[e.key] = false);

let velocity = new THREE.Vector3();

function updateMovement(delta) {
    let speed = 5;

    if (keys["w"]) velocity.z = -speed;
    if (keys["s"]) velocity.z = speed;
    if (keys["a"]) velocity.x = -speed;
    if (keys["d"]) velocity.x = speed;

    camera.position.x += velocity.x * delta;
    camera.position.z += velocity.z * delta;

    velocity.set(0,0,0);
}

// =========================================
// MOUSE LOOK
// =========================================
let yaw = 0;
let pitch = 0;

document.addEventListener("mousemove", (e) => {
    if (document.pointerLockElement) {
        yaw -= e.movementX * 0.002;
        pitch -= e.movementY * 0.002;
        pitch = Math.max(-1.4, Math.min(1.4, pitch));
        camera.rotation.set(pitch, yaw, 0);
    }
});

// =========================================
// GAME LOOP
// =========================================
let lastTime = 0;

function animate(time) {
    let delta = (time - lastTime) / 1000;
    lastTime = time;

    updateMovement(delta);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
animate();
