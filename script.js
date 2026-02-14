// ===== Setup =====
let scene, camera, renderer;
let player, bullets = [];
let move = { forward: false, backward: false, left: false, right: false };
let speed = 0.2;

// Scene & Camera
scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // sky blue
camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);

// Renderer
renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Light
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7.5);
scene.add(light);

// Map (ground)
const groundGeo = new THREE.PlaneGeometry(50, 50);
const groundMat = new THREE.MeshStandardMaterial({color: 0x228B22});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI/2;
scene.add(ground);

// Player
const playerGeo = new THREE.BoxGeometry(1,1,1);
const playerMat = new THREE.MeshStandardMaterial({color: 0x0000ff});
player = new THREE.Mesh(playerGeo, playerMat);
player.position.y = 0.5;
scene.add(player);

// Bullets
const bulletGeo = new THREE.SphereGeometry(0.1, 8, 8);
const bulletMat = new THREE.MeshStandardMaterial({color: 0xffff00});

// ===== Controls =====
// Keyboard
window.addEventListener('keydown', (e)=>{
  if(e.key === 'w') move.forward = true;
  if(e.key === 's') move.backward = true;
  if(e.key === 'a') move.left = true;
  if(e.key === 'd') move.right = true;
});
window.addEventListener('keyup', (e)=>{
  if(e.key === 'w') move.forward = false;
  if(e.key === 's') move.backward = false;
  if(e.key === 'a') move.left = false;
  if(e.key === 'd') move.right = false;
});

// Shoot
function shoot() {
  const bullet = new THREE.Mesh(bulletGeo, bulletMat);
  bullet.position.copy(player.position);
  bullet.direction = new THREE.Vector3(0,0,-1).applyEuler(player.rotation);
  bullets.push(bullet);
  scene.add(bullet);
}
document.getElementById('shootBtn').addEventListener('click', shoot);

// Touch (mobile)
let touchStartX, touchStartY;
window.addEventListener('touchstart', (e)=>{
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
});
window.addEventListener('touchmove', (e)=>{
  const deltaX = e.touches[0].clientX - touchStartX;
  player.rotation.y -= deltaX * 0.005; // Sensitivitas kamera
  touchStartX = e.touches[0].clientX;
});

// ===== Animate =====
function animate() {
  requestAnimationFrame(animate);

  // Move player
  let dirX = 0, dirZ = 0;
  if(move.forward) dirZ -= speed;
  if(move.backward) dirZ += speed;
  if(move.left) dirX -= speed;
  if(move.right) dirX += speed;

  const angle = player.rotation.y;
  player.position.x += dirX * Math.cos(angle) - dirZ * Math.sin(angle);
  player.position.z += dirX * Math.sin(angle) + dirZ * Math.cos(angle);

  // Camera follows
  camera.position.x = player.position.x + 10 * Math.sin(player.rotation.y);
  camera.position.z = player.position.z + 10 * Math.cos(player.rotation.y);
  camera.position.y = player.position.y + 5;
  camera.lookAt(player.position);

  // Move bullets
  bullets.forEach((b,i)=>{
    b.position.add(b.direction.clone().multiplyScalar(0.5));
    if(Math.abs(b.position.x) > 50 || Math.abs(b.position.z) > 50) {
      scene.remove(b);
      bullets.splice(i,1);
    }
  });

  renderer.render(scene, camera);
}
animate();

// ===== Resize =====
window.addEventListener('resize', ()=>{
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
