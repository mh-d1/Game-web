// ===== Scene, Camera, Renderer =====
let scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Sky blue

let camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

let renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ===== Light =====
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 20, 10);
scene.add(light);

// ===== Map =====
const groundGeo = new THREE.PlaneGeometry(100, 100);
const groundMat = new THREE.MeshStandardMaterial({ color: 0x228B22 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// ===== Obstacles =====
const obstacles = [];
function addObstacle(x, z, w = 2, h = 3, d = 2) {
  const geo = new THREE.BoxGeometry(w, h, d);
  const mat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
  const box = new THREE.Mesh(geo, mat);
  box.position.set(x, h / 2, z);
  scene.add(box);
  obstacles.push(box);
}
// Tambahkan beberapa obstacles
addObstacle(10, 10);
addObstacle(-15, 5, 3, 4, 3);
addObstacle(0, -20, 5, 5, 5);
addObstacle(-25, -15, 4, 3, 2);
addObstacle(20, -10, 3, 3, 3);

// ===== Player =====
const player = {
  height: 2,
  speed: 0.3,
  turnSpeed: 0.002,
  object: new THREE.Object3D(),
};
player.object.position.set(0, player.height, 0);
scene.add(player.object);
camera.position.set(0, player.height, 0);
camera.rotation.order = "YXZ";

// ===== Senjata AWM =====
const weaponGeo = new THREE.BoxGeometry(0.2, 0.2, 2); // barrel
const weaponMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
const awm = new THREE.Mesh(weaponGeo, weaponMat);
awm.position.set(0, -0.3, -1); // posisi relatif ke player
player.object.add(awm);

// ===== Controls =====
const move = { forward: false, backward: false, left: false, right: false };
let isZoom = false;

window.addEventListener("keydown", (e) => {
  if (e.key === "w") move.forward = true;
  if (e.key === "s") move.backward = true;
  if (e.key === "a") move.left = true;
  if (e.key === "d") move.right = true;
  if (e.key === "Shift") isZoom = true; // zoom sniper
});
window.addEventListener("keyup", (e) => {
  if (e.key === "w") move.forward = false;
  if (e.key === "s") move.backward = false;
  if (e.key === "a") move.left = false;
  if (e.key === "d") move.right = false;
  if (e.key === "Shift") isZoom = false;
});

// ===== Touch Controls =====
let touchStartX, touchStartY;
window.addEventListener("touchstart", (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
});
window.addEventListener("touchmove", (e) => {
  const deltaX = e.touches[0].clientX - touchStartX;
  const deltaY = e.touches[0].clientY - touchStartY;

  player.object.rotation.y -= deltaX * 0.005; // horizontal turn
  camera.rotation.x -= deltaY * 0.005; // vertical look
  camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));

  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
});

// ===== Shooting =====
const bullets = [];
const bulletGeo = new THREE.SphereGeometry(0.1, 8, 8);
const bulletMat = new THREE.MeshStandardMaterial({ color: 0xffff00 });

function shoot() {
  const bullet = new THREE.Mesh(bulletGeo, bulletMat);
  bullet.position.copy(player.object.position);
  const dir = new THREE.Vector3(0, 0, -1);
  dir.applyEuler(player.object.rotation);
  bullet.direction = dir;
  bullets.push(bullet);
  scene.add(bullet);
}
document.getElementById("shootBtn").addEventListener("click", shoot);

// ===== Collision dengan obstacles =====
function checkCollision(pos) {
  for (let obs of obstacles) {
    const dx = Math.abs(pos.x - obs.position.x);
    const dz = Math.abs(pos.z - obs.position.z);
    const distX = obs.geometry.parameters.width / 2 + 0.5;
    const distZ = obs.geometry.parameters.depth / 2 + 0.5;
    if (dx < distX && dz < distZ) {
      return true;
    }
  }
  return false;
}

// ===== Animate =====
function animate() {
  requestAnimationFrame(animate);

  // Player movement
  let dx = 0,
    dz = 0;
  if (move.forward) dz -= player.speed;
  if (move.backward) dz += player.speed;
  if (move.left) dx -= player.speed;
  if (move.right) dx += player.speed;

  const angle = player.object.rotation.y;
  const newX = player.object.position.x + dx * Math.cos(angle) - dz * Math.sin(angle);
  const newZ = player.object.position.z + dx * Math.sin(angle) + dz * Math.cos(angle);

  if (!checkCollision({ x: newX, z: newZ })) {
    player.object.position.x = newX;
    player.object.position.z = newZ;
  }

  // Zoom sniper
  camera.fov = isZoom ? 30 : 75;
  camera.updateProjectionMatrix();

  // Camera FPS
  camera.position.copy(player.object.position);

  // Move bullets
  const bulletSpeed = 2; // AWM cepat
  bullets.forEach((b, i) => {
    b.position.add(b.direction.clone().multiplyScalar(bulletSpeed));
    // remove bullet if out of map
    if (Math.abs(b.position.x) > 50 || Math.abs(b.position.z) > 50) {
      scene.remove(b);
      bullets.splice(i, 1);
    }
  });

  renderer.render(scene, camera);
}
animate();

// ===== Resize =====
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
