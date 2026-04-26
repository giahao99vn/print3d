const fileInput = document.getElementById('file-input');
const viewer = document.getElementById('viewer');
const placeholder = document.getElementById('placeholder');
const loading = document.getElementById('loading');
const priceDisplay = document.getElementById('price-display');
const weightDisplay = document.getElementById('weight-display');
const dimDisplay = document.getElementById('dim-display');
const materialSelect = document.getElementById('material');
const sizeWarning = document.getElementById('size-warning');

let currentVolumeCM3 = 0;

// Hệ thống tính thể tích lưới tam giác
function calculateVolume(geometry) {
    let position = geometry.attributes.position;
    let faces = position.count / 3;
    let sum = 0;
    
    let p1 = new THREE.Vector3(),
        p2 = new THREE.Vector3(),
        p3 = new THREE.Vector3();

    for (let i = 0; i < faces; i++) {
        p1.fromBufferAttribute(position, i * 3 + 0);
        p2.fromBufferAttribute(position, i * 3 + 1);
        p3.fromBufferAttribute(position, i * 3 + 2);
        sum += p1.dot(p2.clone().cross(p3)) / 6.0;
    }
    return Math.abs(sum); 
}

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        loading.classList.remove('hidden');

        // Bật viewer để xem 3D và AR
        const fileUrl = URL.createObjectURL(file);
        viewer.src = fileUrl;
        viewer.classList.remove('hidden');
        placeholder.classList.add('hidden');

        // Phân tích kỹ thuật file STL
        const reader = new FileReader();
        reader.onload = function(event) {
            const contents = event.target.result;
            const loader = new THREE.STLLoader();
            
            try {
                const geometry = loader.parse(contents);
                
                // 1. Tính toán thể tích
                const volumeMM3 = calculateVolume(geometry);
                currentVolumeCM3 = volumeMM3 / 1000;
                
                // 2. Tính toán Bounding Box (Kích thước bao)
                geometry.computeBoundingBox();
                const box = geometry.boundingBox;
                const sizeX = Math.abs(box.max.x - box.min.x);
                const sizeY = Math.abs(box.max.y - box.min.y);
                const sizeZ = Math.abs(box.max.z - box.min.z);
                
                // Hiển thị kích thước L x W x H
                dimDisplay.innerText = `${sizeX.toFixed(1)} x ${sizeY.toFixed(1)} x ${sizeZ.toFixed(1)} mm`;

                // 3. Hệ thống cảnh báo khả năng in (DfAM)
                // Giới hạn khổ in tối đa thiết lập là 325x325x315mm
                if (sizeX > 325 || sizeY > 325 || sizeZ > 315) {
                    sizeWarning.classList.remove('hidden');
                } else {
                    sizeWarning.classList.add('hidden');
                }
                
                updatePricing();
            } catch (error) {
                console.error("Lỗi:", error);
                alert("File STL bị lỗi. Vui lòng xuất lại từ phần mềm CAD.");
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

// Script cho thanh trượt So sánh Before/After (Infill Showcase)
const sliderContainer = document.getElementById('infill-slider');
const topImage = document.getElementById('slider-top-img');
const handle = document.getElementById('slider-handle');

let isDragging = false;

sliderContainer.addEventListener('mousedown', () => isDragging = true);
window.addEventListener('mouseup', () => isDragging = false);
window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    const rect = sliderContainer.getBoundingClientRect();
    let x = e.clientX - rect.left;
    
    // Giới hạn trong khung
    x = Math.max(0, Math.min(x, rect.width));
    
    const percentage = (x / rect.width) * 100;
    
    handle.style.left = `${percentage}%`;
    topImage.style.clipPath = `polygon(0 0, ${percentage}% 0, ${percentage}% 100%, 0 100%)`;
});
