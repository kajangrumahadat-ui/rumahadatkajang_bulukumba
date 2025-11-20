// === PENGATURAN DASAR SCENE ===
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

const container = document.getElementById('3d-container');

// Set ukuran renderer awal
renderer.setSize(container.clientWidth, container.clientHeight); 
container.appendChild(renderer.domElement);

// Latar Belakang di dalam Card
scene.background = new THREE.Color(0x333333); 


// === PENCAHAYAAN KUAT (Penting untuk model yang tampak gelap) ===
// Meningkatkan intensitas cahaya agar model tidak terlihat hitam
const ambientLight = new THREE.AmbientLight(0xffffff, 2.0); // Intensitas dinaikkan ke 2.0
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 3.0); // Intensitas dinaikkan ke 3.0
directionalLight.position.set(10, 20, 15); // Posisikan cahaya dari atas-depan
scene.add(directionalLight);

// Pencahayaan tambahan dari arah lain (membantu model 3D lebih terlihat)
const fillLight = new THREE.DirectionalLight(0xffffff, 1.5);
fillLight.position.set(-10, 10, -10);
scene.add(fillLight);


// === KONTROL KAMERA ===
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; 
controls.dampingFactor = 0.05;

camera.position.set(5, 5, 5); 
controls.update(); 


// === PEMUATAN MODEL 3D (Optimasi Loading) ===
const loader = new THREE.GLTFLoader();

// HARAP DIPERIKSA: PASTIKAN NAMA FILE DI SINI SAMA PERSIS DENGAN FILE .glb ANDA
const modelPath = 'assets/3d_models/rumah_adat_kajang.glb'; 

loader.load(
    modelPath,
    function (gltf) {
        const model = gltf.scene;
        scene.add(model);
        console.log("Model 3D berhasil dimuat!");

        // Otomatisatur posisi kamera ke model yang dimuat
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        // Atur kamera agar melihat pusat model
        controls.target.copy(center);
        
        // Atur posisi kamera berdasarkan ukuran model
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * (Math.PI / 180);
        let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
        cameraZ *= 2.5; // Jarak zoom sedikit menjauh

        camera.position.set(center.x, center.y + (maxDim / 4), center.z + cameraZ);
        controls.update();

        // Sembunyikan indikator loading
        document.getElementById('loading-indicator').style.display = 'none';
    },
    // Fungsi untuk melacak progres loading
    function (xhr) {
        const percent = Math.round(xhr.loaded / xhr.total * 100);
        document.getElementById('loading-indicator').innerText = `Memuat Model 3D Rumah Adat... ${percent}%`;
    },
    // Fungsi untuk menangani error
    function (error) {
        console.error('Terjadi error saat memuat model 3D:', error);
        document.getElementById('loading-indicator').innerText = 'Gagal memuat. Cek Console (F12) untuk Path Error 404.';
        document.getElementById('loading-indicator').style.backgroundColor = 'rgba(150, 0, 0, 0.9)';
    }
);


// === RENDER LOOP & RESPONSIVITAS ===
function animate() {
    requestAnimationFrame(animate);
    controls.update(); 
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    const newWidth = container.clientWidth;
    const newHeight = container.clientHeight;

    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
}, false);