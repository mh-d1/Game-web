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
const ambient = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambient);

const directional = new THREE.DirectionalLight(0xffffff, 1);
directional.position.set(10, 20, 10);
scene.add(directional);

// ===== Map / Ground =====
const groundGeo = new THREE.PlaneGeometry(100, 100);
const groundMat = new THREE.MeshStandardMaterial({ 
  color: 0x556B2F, // dark olive green
  roughness: 1,
  metalness: 0
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// ===== Obstacles =====
const obstacles = [];
function addObstacle(x, z, w = 2, h = 3, d = 2, color = 0x8B4513) {
  const geo = new THREE.BoxGeometry(w, h, d);
  const mat = new THREE.MeshStandardMaterial({ color, roughness:0.8, metalness:0.2 });
  const box = new THREE.Mesh(geo, mat);
  box.position.set(x, h/2, z);
  box.castShadow = true;
  scene.add(box);
  obstacles.push(box);
}
// Tambahkan obstacles dengan warna lebih realistis
addObstacle(10, 10, 3,4,3,0x8B4513); // coklat tua
addObstacle(-15, 5, 3,4,3,0xA0522D); // sienna
addObstacle(0, -20, 5,5,5,0x654321); // dark brown
addObstacle(-25, -15, 4,3,2,0x8B4513);
addObstacle(20, -10, 3,3,3,0xA0522D);

// ===== Player =====
const player = {
  height: 2,
  speed: 0.3,
  object: new THREE.Object3D()
};
player.object.position.set(0, player.height, 0);
scene.add(player.object);
camera.position.set(0, player.height, 0);
camera.rotation.order = "YXZ";

// ===== Senjata AWM =====
const weaponGeo = new THREE.BoxGeometry(0.2, 0.2, 2);
const weaponMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
const awm = new THREE.Mesh(weaponGeo, weaponMat);
awm.position.set(0, -0.3, -1);
player.object.add(awm);

// ===== Controls FPS =====
const controls = new THREE.PointerLockControls(camera, renderer.domElement);
scene.add(controls.getObject());
document.body.addEventListener('click', () => { controls.lock(); });

const move = { forward:false, backward:false, left:false, right:false };
let isZoom = false;

// Keyboard controls
window.addEventListener('keydown', e => {
  switch(e.code){
    case 'KeyW': move.forward = true; break;
    case 'KeyS': move.backward = true; break;
    case 'KeyA': move.left = true; break;
    case 'KeyD': move.right = true; break;
    case 'ShiftLeft': isZoom = true; break;
  }
});
window.addEventListener('keyup', e => {
  switch(e.code){
    case 'KeyW': move.forward = false; break;
    case 'KeyS': move.backward = false; break;
    case 'KeyA': move.left = false; break;
    case 'KeyD': move.right = false; break;
    case 'ShiftLeft': isZoom = false; break;
  }
});

// ===== Touch controls =====
let touchStartX, touchStartY;
window.addEventListener("touchstart", e => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
});
window.addEventListener("touchmove", e => {
  const deltaX = e.touches[0].clientX - touchStartX;
  const deltaY = e.touches[0].clientY - touchStartY;

  controls.getObject().rotation.y -= deltaX * 0.005; // horizontal
  camera.rotation.x -= deltaY * 0.005; // vertical
  camera.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, camera.rotation.x));

  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
});

// ===== Shooting =====
const bullets = [];
const bulletGeo = new THREE.SphereGeometry(0.1,8,8);
const bulletMat = new THREE.MeshStandardMaterial({ color:0xffff00 });

function shoot(){
  const bullet = new THREE.Mesh(bulletGeo, bulletMat);
  bullet.position.copy(controls.getObject().position);
  const dir = new THREE.Vector3(0,0,-1);
  dir.applyEuler(controls.getObject().rotation);
  bullet.direction = dir;
  bullets.push(bullet);
  scene.add(bullet);
}
document.getElementById("shootBtn").addEventListener("click", shoot);

// ===== Collision =====
function checkCollision(pos){
  for(let obs of obstacles){
    const dx = Math.abs(pos.x - obs.position.x);
    const dz = Math.abs(pos.z - obs.position.z);
    const distX = obs.geometry.parameters.width/2 + 0.5;
    const distZ = obs.geometry.parameters.depth/2 + 0.5;
    if(dx<distX && dz<distZ) return true;
  }
  return false;
}

// ===== Animate =====
function animate(){
  requestAnimationFrame(animate);

  // Player movement
  const speed = player.speed;
  const direction = new THREE.Vector3();
  if(move.forward) direction.z -= speed;
  if(move.backward) direction.z += speed;
  if(move.left) direction.x -= speed;
  if(move.right) direction.x += speed;

  // calculate new position
  const angle = controls.getObject().rotation.y;
  const newX = controls.getObject().position.x + direction.x*Math.cos(angle) - direction.z*Math.sin(angle);
  const newZ = controls.getObject().position.z + direction.x*Math.sin(angle) + direction.z*Math.cos(angle);

  if(!checkCollision({x:newX, z:newZ})){
    controls.getObject().position.x = newX;
    controls.getObject().position.z = newZ;
  }

  // Zoom sniper
  camera.fov = isZoom ? 30 : 75;
  camera.updateProjectionMatrix();

  // Move bullets
  const bulletSpeed = 2; // AWM
  bullets.forEach((b,i)=>{
    b.position.add(b.direction.clone().multiplyScalar(bulletSpeed));
    if(Math.abs(b.position.x)>50 || Math.abs(b.position.z)>50){
      scene.remove(b);
      bullets.splice(i,1);
    }
  });

  renderer.render(scene, camera);
}
animate();

// ===== Resize =====
window.addEventListener("resize", ()=>{
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
