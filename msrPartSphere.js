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
const sphereMat = new THREE.MeshBasicMaterial({
  color: 0x8888ff,
  wireframe: false,
  transparent: true,
  opacity: 0.2,  // ← 불투명도 낮추기
  depthWrite: false  // 👈 핵심 설정
});



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

//슬라이더 고정
sliceSlider.setAttribute("step", 2);
sliceSlider.setAttribute("min", 8);
sliceSlider.setAttribute("max", 200);


let isRightRule = false;


//부피계산
const lowerVolumeText = document.getElementById('lowerVolume');
const upperVolumeText = document.getElementById('upperVolume');
const exactVolumeText = document.getElementById('exactVolume');


function drawCylinders() {
  sliceGroup.clear();
  const n = parseInt(sliceSlider.value);
  const dx = (2 * sphereRadius) / n;

  let lowerSum = 0;
  let upperSum = 0;

  for (let i = 0; i < n; i++) {
    const leftX = -sphereRadius + i * dx;
    const rightX = leftX + dx;

    const rLeft = Math.sqrt(Math.max(sphereRadius ** 2 - leftX ** 2, 0));
    const rRight = Math.sqrt(Math.max(sphereRadius ** 2 - rightX ** 2, 0));

    const minR = Math.min(rLeft, rRight);
    const maxR = Math.max(rLeft, rRight);

    lowerSum += minR ** 2 * dx;
    upperSum += maxR ** 2 * dx;

    const r = isRightRule ? maxR : minR;
    const geometry = new THREE.CylinderGeometry(r, r, dx, 32);
    const material = new THREE.MeshStandardMaterial({
      color: isRightRule ? 0xff4444 : 0x44aa88,
      transparent: true,
      opacity: 0.8,
    });

    const cylinder = new THREE.Mesh(geometry, material);
    cylinder.rotation.z = Math.PI / 2; // x축 방향으로 눕힘
    cylinder.position.set(leftX + dx / 2, 0, 0);
    sliceGroup.add(cylinder);
  }

  const exactVolume = (4 / 3) * sphereRadius ** 3;

  lowerVolumeText.textContent = `${lowerSum.toFixed(3)}π`;
  upperVolumeText.textContent = `${upperSum.toFixed(3)}π`;
  exactVolumeText.textContent = `${exactVolume.toFixed(3)}π`;
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

//rendering order
sphereMesh.renderOrder = 0;
sliceGroup.renderOrder = 1;

// 애니메이션 루프
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
