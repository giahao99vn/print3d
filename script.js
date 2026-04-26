const fileInput = document.getElementById('file-input');
const viewerContainer = document.getElementById('viewer-container');
const placeholder = document.getElementById('placeholder');
const loading = document.getElementById('loading');
const priceDisplay = document.getElementById('price-display');
const weightDisplay = document.getElementById('weight-display');
const dimDisplay = document.getElementById('dim-display');
const materialSelect = document.getElementById('material');
const sizeWarning = document.getElementById('size-warning');

let currentVolumeCM3 = 0;

// ==========================================
// CẤU HÌNH MÔI TRƯỜNG HIỂN THỊ 3D (THREE.JS)
// ==========================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1f2937); // Màu nền khớp với giao diện (Tailwind gray-800)

// Tạo Camera
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000); // Tỷ lệ khung hình sẽ cập nhật sau

// Tạo Renderer (Bộ xuất hình ảnh)
const renderer = new THREE.WebGLRenderer({ antialias: true });
viewerContainer.appendChild(renderer.domElement);

// Thêm ánh sáng để nhìn rõ góc cạnh cơ khí
const ambientLight = new THREE.AmbientLight(0x404040, 1.5); 
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1).normalize();
scene.add(directionalLight);

// Thêm công cụ xoay/thu phóng bằng chuột
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

let currentMesh = null; // Biến lưu mô hình hiện tại

// Vòng lặp render liên tục
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// ==========================================
// THUẬT TOÁN TÍNH THỂ TÍCH & KÍCH THƯỚC
// ==========================================
function calculateVolume(geometry) {
    let position = geometry.attributes.position;
    let faces = position.count / 3;
    let sum = 0;
    let p1 = new THREE.Vector3(), p2 = new THREE.Vector3(), p3 = new THREE.Vector3();
    for (let i = 0; i < faces; i++) {
        p1.fromBufferAttribute(position, i * 3 + 0);
        p2.fromBufferAttribute(position, i * 3 + 1);
        p3.fromBufferAttribute(position, i * 3 + 2);
        sum += p1.dot(p2.clone().cross(p3)) / 6.0;
    }
    return Math.abs(sum); 
}

// ==========================================
// XỬ LÝ KHI KHÁCH HÀNG CHỌN FILE
// ==========================================
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        loading.classList.remove('hidden');

        const reader = new FileReader();
        reader.onload = function(event) {
            const contents = event.target.result;
            const loader = new THREE.STLLoader();
            
            try {
                const geometry = loader.parse(contents);
                
                // 1. TÍNH TOÁN THÔNG SỐ (Như cũ)
                currentVolumeCM3 = calculateVolume(geometry) / 1000;
                geometry.computeBoundingBox();
                const box = geometry.boundingBox;
                const sizeX = Math.abs(box.max.x - box.min.x);
                const sizeY = Math.abs(box.max.y - box.min.y);
                const sizeZ = Math.abs(box.max.z - box.min.z);
                
                dimDisplay.innerText = `${sizeX.toFixed(1)} x ${sizeY.toFixed(1)} x ${sizeZ.toFixed(1)} mm`;

                if (sizeX > 325 || sizeY > 325 || sizeZ > 315) {
                    sizeWarning.classList.remove('hidden');
                } else {
                    sizeWarning.classList.add('hidden');
                }
                updatePricing();

                // 2. HIỂN THỊ MÔ HÌNH 3D LÊN WEB
                if (currentMesh) scene.remove(currentMesh); // Xóa mô hình cũ nếu có
                
                // Cấu hình vật liệu (màu xanh dương công nghệ, có độ bóng mờ)
                const material = new THREE.MeshStandardMaterial({ 
                    color: 0x3b82f6, 
                    roughness: 0.4, 
                    metalness: 0.2 
                });
                
                currentMesh = new THREE.Mesh(geometry, material);
                
                // Căn giữa mô hình
                geometry.center();
                scene.add(currentMesh);

                // Tự động lùi Camera ra xa để nhìn bao quát toàn bộ khối
                geometry.computeBoundingSphere();
                camera.position.z = geometry.boundingSphere.radius * 2.5;

                // Bật khung hiển thị
                viewerContainer.classList.remove('hidden');
                placeholder.classList.add('hidden');

                // Cập nhật kích thước khung vẽ (Canvas) khớp với thẻ Div
                const width = viewerContainer.clientWidth;
                const height = viewerContainer.clientHeight;
                renderer.setSize(width, height);
                camera.aspect = width / height;
                camera.updateProjectionMatrix();

            } catch (error) {
                console.error("Lỗi:", error);
                alert("File STL bị lỗi. Vui lòng xuất lại từ phần mềm Creo.");
            } finally {
                loading.classList.add('hidden');
            }
        };
        reader.readAsArrayBuffer(file);
    }
});

function updatePricing() {
    if (currentVolumeCM3 === 0) return;
    const selectedOption = materialSelect.options[materialSelect.selectedIndex];
    const pricePerGram = parseInt(selectedOption.value);
    const density = parseFloat(selectedOption.getAttribute('data-density'));

    const weightGram = currentVolumeCM3 * density;
    const totalPrice = Math.round(weightGram * pricePerGram);

    weightDisplay.innerText = `${weightGram.toFixed(1)} g`;
    priceDisplay.innerText = `${totalPrice.toLocaleString('vi-VN')} đ`;
}
materialSelect.addEventListener('change', updatePricing);
