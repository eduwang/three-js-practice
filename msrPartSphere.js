import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const container = document.getElementById('sceneContainer');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, container.clientWidth / 600, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, 600);
container.appendChild(renderer.domElement);

camera.position.set(0, 0, 10);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// 디버깅을 위한 x,y,z 축
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// 빛
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7);
scene.add(light);
scene.add(new THREE.AmbientLight(0x404040));

// 구 (wireframe)
const sphereRadius = 3;
const sphereGeo = new THREE.SphereGeometry(sphereRadius, 64, 64);
const sphereMat = new THREE.MeshBasicMaterial({ color: 0x8888ff, wireframe: true });
const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
scene.add(sphereMesh);

// 반투명 원기둥 조각 그룹
const sliceGroup = new THREE.Group();
scene.add(sliceGroup);

// 구간 수 슬라이더
const sliceSlider = document.getElementById('slices');
const sliceCountText = document.getElementById('sliceCount');
const leftBtn = document.getElementById('leftRuleBtn');
const rightBtn = document.getElementById('rightRuleBtn');

let isRightRule = false;


//부피계산
const exactVolumeText = document.getElementById('exactVolume');
const approxVolumeText = document.getElementById('approxVolume');

function drawCylinders() {
  sliceGroup.clear();
  const n = parseInt(sliceSlider.value);
  const dy = (2 * sphereRadius) / n;
  let sum = 0;

  for (let i = 0; i < n; i++) {
    const y = -sphereRadius + i * dy + (isRightRule ? 0 : dy);
    const r = Math.sqrt(Math.max(sphereRadius ** 2 - y ** 2, 0));
    const height = dy;
    const area = r ** 2; // 밑면 넓이 (π 생략)
    sum += area * dy;    // π 없이 부피 누적

    const geometry = new THREE.CylinderGeometry(r, r, height, 32);
    const material = new THREE.MeshStandardMaterial({
      color: 0xff8800,
      transparent: true,
      opacity: 0.9,
    });

    const cylinder = new THREE.Mesh(geometry, material);
    cylinder.position.set(0, y + (isRightRule ? dy / 2 : -dy / 2), 0);
    sliceGroup.add(cylinder);
  }

  const exactVolume = (4 / 3) * sphereRadius ** 3;
  exactVolumeText.textContent = `${(4 / 3) * sphereRadius ** 3}π`;
  approxVolumeText.textContent = `${sum.toFixed(3)}π`;
}




leftBtn.addEventListener('click', () => {
  isRightRule = false;
  drawCylinders();
});

rightBtn.addEventListener('click', () => {
  isRightRule = true;
  drawCylinders();
});

sliceSlider.addEventListener('input', () => {
  sliceCountText.textContent = sliceSlider.value;
  drawCylinders(); // ✔️ 상태 유지
});


drawCylinders(false); // 초기

// 애니메이션 루프
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
