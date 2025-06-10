import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

const container = document.getElementById('container');
const name = document.getElementById('name')
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(0, 0, 1);

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setClearColor(0x000000, 0);
renderer.outputEncoding = THREE.sRGBEncoding;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableZoom = false;
controls.minPolarAngle = Math.PI / 2;
controls.maxPolarAngle = Math.PI / 2;

const topLight = new THREE.DirectionalLight(0xffffff, 1.5);
topLight.position.set(0, 10, 0);
scene.add(topLight);
const ambient = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambient);

const models = [
 "bibimbap",
  "bulgogi",
  "chicken gochujang",
  "dakgangjeong",
  "gyeran jjim",
  "haemul pajeon",
  "hoeddeok",
  "jjajangmyeon",
  "kimbap",
  "kimchi",
  "mandu",
  "odeng",
  "rabokki",
  "sundubu-jjigae",
  "tteokbokki"
];
let currentIndex = 0;
let object;
let modelName = models[currentIndex];
const loader = new GLTFLoader();

function loadModel(name) {
    if (object) {
        scene.remove(object);
        object.traverse(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(mat => mat.dispose());
                } else {
                    child.material.dispose();
                }
            }
        });
        object = null;
    }

    loader.load(
        `assets/${name}.glb`,
        (gltf) => {
            object = gltf.scene;
            const box = new THREE.Box3().setFromObject(object);
            const size = new THREE.Vector3();
            box.getSize(size);
            const center = new THREE.Vector3();
            box.getCenter(center);
            object.position.sub(center);
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 1 / maxDim;
            object.scale.setScalar(scale);
            scene.add(object);
            console.log('added')
        },
        undefined,
        (error) => {
            console.error("Model load error:", error);
        }
    );
}

function nextModel() {
    currentIndex = (currentIndex + 1) % models.length;
    modelName = models[currentIndex];
    loadModel(modelName);
    console.log(modelName)
    name.innerText = modelName
}

loadModel(modelName);
setInterval(nextModel, 2000);

let mouseX = window.innerWidth / 2;
document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
});

function animate() {
    requestAnimationFrame(animate);
    if (object) {
        const normalizedMouseX = mouseX / window.innerWidth;
        const targetRotationY = THREE.MathUtils.lerp(-1, 1, normalizedMouseX);
        object.rotation.y += (targetRotationY - object.rotation.y) * 0.05;
        object.rotation.y = THREE.MathUtils.clamp(object.rotation.y, -1, 1);
    }

    controls.update();
    renderer.render(scene, camera);
}
animate();

const resizeObserver = new ResizeObserver(() => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
});
resizeObserver.observe(container);
