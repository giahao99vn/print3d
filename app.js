// Khởi tạo AOS
AOS.init({
    duration: 1000,
    once: true,
    offset: 120,
    easing: 'ease-in-out'
});

// --- HỆ THỐNG THÔNG BÁO GIAO DIỆN MƯỢT MÀ (TOAST NOTIFICATION) ---
window.showToast = function(message, type = 'info') {
    const toast = document.createElement('div');
    let icon = '<i class="fa-solid fa-circle-info text-blue-400"></i>';
    let bgClass = 'bg-slate-800 border-slate-700';

    if(type === 'success') {
        icon = '<i class="fa-solid fa-circle-check text-emerald-400 animate-pulse"></i>';
        bgClass = 'bg-slate-900 border-emerald-500/50 shadow-emerald-500/20';
    } else if(type === 'error' || type === 'warning') {
        icon = '<i class="fa-solid fa-triangle-exclamation text-amber-500 animate-bounce"></i>';
        bgClass = 'bg-slate-900 border-amber-500/50 shadow-amber-500/20';
    }

    toast.className = `flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl text-white text-sm font-medium transform transition-all duration-500 translate-x-full opacity-0 ${bgClass}`;
    toast.innerHTML = `<div class="text-lg">${icon}</div> <div>${message}</div>`;

    const container = document.getElementById('toast-container');
    if(container) container.appendChild(toast);

    setTimeout(() => { toast.classList.remove('translate-x-full', 'opacity-0'); }, 10);
    setTimeout(() => {
        toast.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// --- 1. SETUP AUDIO ---
const bgMusic = document.getElementById('bgMusic');
const audioBtn = document.getElementById('audio-btn');
bgMusic.volume = 0.5;

audioBtn.addEventListener('click', () => {
    if (bgMusic.paused) {
        bgMusic.play().then(() => {
            audioBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
            audioBtn.classList.add('animate-pulse', 'text-viet-gold', 'shadow-[0_0_20px_rgba(212,175,55,0.6)]');
        }).catch(e => showToast("Trình duyệt chặn phát nhạc tự động. Vui lòng tương tác với trang web trước.", "warning"));
    } else {
        bgMusic.pause();
        audioBtn.innerHTML = '<i class="fa-solid fa-music"></i>';
        audioBtn.classList.remove('animate-pulse', 'text-viet-gold', 'shadow-[0_0_20px_rgba(212,175,55,0.6)]');
    }
});

// --- 2. LOGIC GAME TRÍ NHỚ ---
const gameModal = document.getElementById('game-modal');
const gameBoard = document.getElementById('game-board');
const winMessage = document.getElementById('win-message');
const cardIcons = [
    { icon: '<i class="fa-solid fa-cube text-brand-500"></i>', name: 'In 3D' },
    { icon: '<i class="fa-solid fa-gear text-slate-600"></i>', name: 'Hộp Giảm Tốc' },
    { icon: '<i class="fa-solid fa-sort-up text-emerald-500"></i>', name: 'Nón Lá' },
    { icon: '<i class="fa-solid fa-leaf text-green-600"></i>', name: 'Bánh Tét' },
    { icon: '<i class="fa-solid fa-coffee text-amber-600"></i>', name: 'Cà Phê' },
    { icon: '<i class="fa-solid fa-pen-ruler text-blue-600"></i>', name: 'Thiết kế Creo' }
];

let cards = [...cardIcons, ...cardIcons];
let hasFlippedCard = false, lockBoard = false;
let firstCard, secondCard, matchCount = 0;

function shuffle() { cards.sort(() => Math.random() - 0.5); }

function createBoard() {
    gameBoard.innerHTML = ''; shuffle();
    cards.forEach((item) => {
        const card = document.createElement('div');
        card.classList.add('memory-card');
        card.dataset.name = item.name;
        card.innerHTML = `<div class="front-face shadow-lg border border-brand-400"><i class="fa-solid fa-question text-white/50"></i></div>
                          <div class="back-face shadow-lg"><div class="text-3xl mb-1">${item.icon}</div><div class="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">${item.name}</div></div>`;
        card.addEventListener('click', flipCard);
        gameBoard.appendChild(card);
    });
    matchCount = 0; winMessage.classList.add('hidden');
}

function flipCard() {
    if (lockBoard || this === firstCard) return;
    this.classList.add('flip');
    if (!hasFlippedCard) { hasFlippedCard = true; firstCard = this; return; }
    secondCard = this; checkForMatch();
}

function checkForMatch() { firstCard.dataset.name === secondCard.dataset.name ? disableCards() : unflipCards(); }

function disableCards() {
    firstCard.removeEventListener('click', flipCard); secondCard.removeEventListener('click', flipCard);
    matchCount++;
    if (matchCount === cardIcons.length) setTimeout(() => winMessage.classList.remove('hidden'), 500);
    resetBoard();
}

function unflipCards() {
    lockBoard = true;
    setTimeout(() => { firstCard.classList.remove('flip'); secondCard.classList.remove('flip'); resetBoard(); }, 800);
}

function resetBoard() { [hasFlippedCard, lockBoard] = [false, false]; [firstCard, secondCard] = [null, null]; }
function openGame() { createBoard(); gameModal.classList.remove('hidden'); setTimeout(() => gameModal.classList.remove('opacity-0'), 10); }
function closeGame() { gameModal.classList.add('opacity-0'); setTimeout(() => gameModal.classList.add('hidden'), 300); }

// --- 3. BẢNG TÍNH GIÁ NHANH THEO GRAM ---
const pricingManual = { 
    petg: { under: 1000, over: 600 }, 
    pla: { under: 1100, over: 700 }, 
    abs: { under: 1200, over: 800 },
    carbon: { under: 2000, over: 1500 },
    tpu: { under: 1500, over: 1200 },
    pps: { under: 4000, over: 3500 }
};
const MIN_PRICE = 20000;
const CTV_PASSWORD = "CREO-GIAHAOONE"; 

const materialInputManual = document.getElementById('calc-material');
const weightInputManual = document.getElementById('calc-weight');
const passwordInputManual = document.getElementById('calc-password');
const rateInfoManual = document.getElementById('calc-rate-info');
const resSubtotal = document.getElementById('res-subtotal');
const resDiscount = document.getElementById('res-discount');
const resTotal = document.getElementById('res-total');
const ctvRow = document.getElementById('ctv-row');
const resCtv = document.getElementById('res-ctv');
const minPriceWarning = document.getElementById('min-price-warning');
const btnZaloManual = document.getElementById('btn-zalo-manual');

function setMaterialManual(mat) {
    materialInputManual.value = mat;
    document.querySelectorAll('.mat-btn').forEach(btn => btn.classList.remove('active-material', 'border-brand-500', 'bg-brand-50/50', 'border-red-500', 'bg-red-50/50'));
    
    const activeBtn = document.getElementById('btn-' + mat);
    if (mat === 'pps') {
        activeBtn.classList.add('border-red-500', 'bg-red-50/50');
    } else {
        activeBtn.classList.add('active-material', 'border-brand-500', 'bg-brand-50/50');
    }
    
    calculateManualPrice();
}

function formatVND(amount) { return new Intl.NumberFormat('vi-VN').format(Math.round(amount)) + 'đ'; }

function calculateManualPrice() {
    const mat = materialInputManual.value;
    const weight = parseFloat(weightInputManual.value) || 0;
    const pass = passwordInputManual.value;
    
    if (weight <= 0) { 
        rateInfoManual.innerText = "Hệ thống đang chờ dữ liệu để nội suy chi phí..."; 
        rateInfoManual.className = "mt-4 text-sm font-medium text-slate-400 italic";
        resSubtotal.innerText = '0đ'; resDiscount.innerText = '-0đ'; resTotal.innerText = '0đ'; 
        ctvRow.classList.add('hidden'); minPriceWarning.classList.add('hidden'); return; 
    }

    let rate = weight >= 400 ? pricingManual[mat].over : pricingManual[mat].under;
    rateInfoManual.innerText = weight >= 400 ? `Ưu đãi in số lượng lớn: Đơn giá ${rate}đ/g` : `Mức giá chuẩn: Đơn giá ${rate}đ/g`;
    
    if (mat === 'pps') {
        rateInfoManual.className = weight >= 400 ? "mt-4 text-sm font-black text-red-600" : "mt-4 text-sm font-bold text-red-500";
    } else {
        rateInfoManual.className = weight >= 400 ? "mt-4 text-sm font-black text-brand-600" : "mt-4 text-sm font-bold text-slate-600";
    }

    let subtotal = weight * rate; let discount = 0;
    if (subtotal > 1500000) discount = subtotal * 0.1;
    else if (subtotal > 1000000) discount = subtotal * 0.08;
    else if (subtotal > 500000) discount = subtotal * 0.05;

    let finalTotal = subtotal - discount;
    if (finalTotal > 0 && finalTotal < MIN_PRICE) { finalTotal = MIN_PRICE; minPriceWarning.classList.remove('hidden'); } 
    else { minPriceWarning.classList.add('hidden'); }

    resSubtotal.innerText = formatVND(subtotal); resDiscount.innerText = '-' + formatVND(discount); resTotal.innerText = formatVND(finalTotal);
    
    if (pass.trim().toUpperCase() === CTV_PASSWORD) { 
        ctvRow.classList.remove('hidden'); resCtv.innerText = formatVND(finalTotal * 0.95); 
    } else { 
        ctvRow.classList.add('hidden'); 
    }
}

setMaterialManual('petg'); 
weightInputManual.addEventListener('input', calculateManualPrice);
passwordInputManual.addEventListener('input', calculateManualPrice);

btnZaloManual.addEventListener('click', () => {
    const weight = parseFloat(weightInputManual.value) || 0;
    if(weight <= 0) {
        showToast("Vui lòng nhập khối lượng dự kiến của sản phẩm!", "error");
        return;
    }
    
    const matCode = materialInputManual.value;
    let matName = "PETG";
    if(matCode === 'pla') matName = "PLA";
    if(matCode === 'abs') matName = "ABS/ASA";
    if(matCode === 'carbon') matName = "Carbon Fiber";
    if(matCode === 'tpu') matName = "TPU (Dẻo)";
    if(matCode === 'pps') matName = "PPS-CF (Siêu kỹ thuật)";

    const custName = document.getElementById('manual-cust-name').value || "Chưa cung cấp";
    const custPhone = document.getElementById('manual-cust-phone').value || "Chưa cung cấp";
    const finalPriceText = resTotal.innerText;
    
    const originalBtnText = btnZaloManual.innerHTML;
    btnZaloManual.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang xử lý...';
    
    const formData = new URLSearchParams();
    formData.append('name', custName);
    formData.append('phone', custPhone);
    formData.append('material', matName);
    formData.append('color', 'Tùy chọn (Báo giá thủ công)');
    formData.append('dims', 'Báo giá nhanh (Gram)');
    formData.append('weight', weight + "g");
    formData.append('config', `Thủ công`);
    formData.append('price', finalPriceText);

    const GOOGLE_APP_URL = "https://script.google.com/macros/s/AKfycbzTq4LssG-Ox4pJwg6ek0fUSpKPSwcYw7SoO5D-z3r75_rw2bRJAcAadkv6kpHyojIp/exec"; 
    
    const zaloMessage = `[ĐẶT IN 3D WEB - THỦ CÔNG]\nChào Giahaoone, tôi muốn in đơn hàng với thông số sau:\n- Vật liệu: ${matName}\n- Khối lượng dự kiến: ${weight}g\n- Báo giá dự kiến: ${finalPriceText}\n(Tôi sẽ gửi kèm file hoặc bản vẽ ngay sau tin nhắn này!)`;

    fetch(GOOGLE_APP_URL, {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        btnZaloManual.innerHTML = originalBtnText;
        window.open(`https://zalo.me/0704141237?text=${encodeURIComponent(zaloMessage)}`, '_blank');
    })
    .catch(error => {
        console.error('Lỗi lưu sheet:', error);
        btnZaloManual.innerHTML = originalBtnText;
        window.open(`https://zalo.me/0704141237?text=${encodeURIComponent(zaloMessage)}`, '_blank');
    });
});

// --- 4. HỆ THỐNG PHÂN TÍCH 3D TỰ ĐỘNG BÁO GIÁ ĐA LUỒNG ---
const fileInput = document.getElementById('file-input');
const viewerContainer = document.getElementById('viewer-container');
const placeholder = document.getElementById('placeholder');
const loading = document.getElementById('loading');
const materialSelect = document.getElementById('material');
const resetViewerBtn = document.getElementById('reset-viewer-btn');
const infillSlider = document.getElementById('infill-slider');
const layerHeight = document.getElementById('layer-height');
const sizeWarning = document.getElementById('size-warning');
const btnZalo3D = document.getElementById('btn-zalo-3d');
const colorButtons = document.querySelectorAll('.color-btn');

let cart3D = [];
let activeCartId = null;
let currentMesh = null;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, viewerContainer.clientWidth / viewerContainer.clientHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(viewerContainer.clientWidth, viewerContainer.clientHeight);
renderer.outputEncoding = THREE.sRGBEncoding; 
renderer.toneMapping = THREE.ACESFilmicToneMapping; 
renderer.toneMappingExposure = 1.0;
viewerContainer.appendChild(renderer.domElement);

const pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(new THREE.RoomEnvironment(), 0.04).texture;

const dirLight = new THREE.DirectionalLight(0xffffff, 0.5); dirLight.position.set(2, 2, 2); scene.add(dirLight);
const controls = new THREE.OrbitControls(camera, renderer.domElement); controls.enableDamping = true;

function animate() { requestAnimationFrame(animate); controls.update(); renderer.render(scene, camera); }
animate();

function calculateVolume(geometry) {
    if(!geometry.attributes.position) return 0;
    let pos = geometry.attributes.position, sum = 0, p1 = new THREE.Vector3(), p2 = new THREE.Vector3(), p3 = new THREE.Vector3();
    for (let i = 0; i < pos.count / 3; i++) {
        p1.fromBufferAttribute(pos, i * 3 + 0); p2.fromBufferAttribute(pos, i * 3 + 1); p3.fromBufferAttribute(pos, i * 3 + 2);
        sum += p1.dot(p2.clone().cross(p3)) / 6.0;
    }
    return Math.abs(sum); 
}

const updatePricing3D = () => {
    if (cart3D.length === 0) return;
    
    const totalVol = cart3D.reduce((sum, item) => sum + item.volume, 0);
    const opt = materialSelect.options[materialSelect.selectedIndex];
    const density = parseFloat(opt.getAttribute('data-density'));
    const basePrice = parseInt(opt.value);
    const infill = parseInt(infillSlider.value);
    const layerMult = parseFloat(layerHeight.value);
    
    const effectiveVolumeRatio = 0.2 + 0.8 * (infill / 100);
    const weight = totalVol * density * effectiveVolumeRatio;
    document.getElementById('weight-display').innerHTML = `${weight.toFixed(1)} <span class="text-xs">g</span>`;
    
    let finalPrice = Math.round(weight * basePrice * layerMult);
    if(finalPrice > 0 && finalPrice < 20000) finalPrice = 20000;
    document.getElementById('price-display').innerText = `${finalPrice.toLocaleString('vi-VN')} đ`;

    const colorBtn = document.querySelector('.color-btn.border-white');
    const colorName = colorBtn ? colorBtn.getAttribute('title') : 'Vàng Đồng';
    const matName = opt.text.split(' - ')[0];
    const layerName = layerHeight.options[layerHeight.selectedIndex].text.split(' (')[0];
    const fileNames = cart3D.map(i => i.name).join(', ');
    
    const zaloMessage = `[ĐẶT IN 3D WEB]\nChào Giahaoone, tôi muốn in đơn hàng này:\n- Danh sách File (${cart3D.length}): ${fileNames}\n- Vật liệu: ${matName}\n- Màu sắc: ${colorName}\n- Độ đặc (Infill): ${infill}%\n- Độ mịn: ${layerName}\n- Tổng khối lượng: ${weight.toFixed(1)}g\n- Báo giá dự kiến: ${finalPrice.toLocaleString('vi-VN')} VNĐ\n(Tôi sẽ gửi kèm file STL ngay sau tin nhắn này!)`;
    
    document.getElementById('customer-info').classList.remove('hidden');
    
    btnZalo3D.onclick = () => {
        const custName = document.getElementById('cust-name').value || "Chưa cung cấp";
        const custPhone = document.getElementById('cust-phone').value || "Chưa cung cấp";

        const originalBtnText = btnZalo3D.innerHTML;
        btnZalo3D.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang xử lý...';
        
        const formData = new URLSearchParams();
        formData.append('name', custName);
        formData.append('phone', custPhone);
        formData.append('material', matName);
        formData.append('color', colorName);
        formData.append('dims', `Nhiều file (${cart3D.length})`);
        formData.append('weight', weight.toFixed(1) + "g");
        formData.append('config', `Infill ${infill}% | Layer ${layerName}`);
        formData.append('price', finalPrice.toLocaleString('vi-VN') + " đ");

        const GOOGLE_APP_URL = "https://script.google.com/macros/s/AKfycbzTq4LssG-Ox4pJwg6ek0fUSpKPSwcYw7SoO5D-z3r75_rw2bRJAcAadkv6kpHyojIp/exec"; 
        
        fetch(GOOGLE_APP_URL, { method: 'POST', body: formData })
        .then(res => res.json())
        .then(data => {
            btnZalo3D.innerHTML = originalBtnText;
            window.open(`https://zalo.me/0704141237?text=${encodeURIComponent(zaloMessage)}`, '_blank');
        })
        .catch(error => {
            console.error('Lỗi lưu sheet:', error);
            btnZalo3D.innerHTML = originalBtnText;
            window.open(`https://zalo.me/0704141237?text=${encodeURIComponent(zaloMessage)}`, '_blank');
        });
    };
};

materialSelect.addEventListener('change', updatePricing3D); layerHeight.addEventListener('change', updatePricing3D);
infillSlider.addEventListener('input', (e) => { document.getElementById('infill-val').innerText = `${e.target.value}%`; updatePricing3D(); });

colorButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        colorButtons.forEach(b => { b.classList.remove('border-white', 'shadow-[0_0_10px_rgba(255,255,255,0.3)]'); b.classList.add('border-transparent'); });
        const targetBtn = e.target;
        targetBtn.classList.remove('border-transparent'); targetBtn.classList.add('border-white', 'shadow-[0_0_10px_rgba(255,255,255,0.3)]');
        if (currentMesh) {
            currentMesh.material.color.setHex(parseInt(targetBtn.getAttribute('data-color')));
            currentMesh.material.roughness = parseFloat(targetBtn.getAttribute('data-roughness'));
            currentMesh.material.metalness = parseFloat(targetBtn.getAttribute('data-metalness'));
            currentMesh.material.needsUpdate = true;
        }
        updatePricing3D(); 
    });
});

function renderCart() {
    const cartSection = document.getElementById('cart-section');
    const cartList = document.getElementById('cart-list');
    
    if(cart3D.length === 0) {
        cartSection.classList.add('hidden');
        
        if (currentMesh) { scene.remove(currentMesh); currentMesh.geometry.dispose(); currentMesh.material.dispose(); currentMesh = null; }
        document.getElementById('dim-display').innerHTML = `0 x 0 x 0 mm`;
        document.getElementById('weight-display').innerHTML = `0.00 <span class="text-xs">g</span>`;
        document.getElementById('price-display').innerText = `0đ`;
        
        placeholder.classList.remove('opacity-0', 'pointer-events-none');
        document.getElementById('demo-models').classList.remove('hidden');
        resetViewerBtn.classList.add('hidden'); resetViewerBtn.classList.remove('flex');
        btnZalo3D.classList.add('hidden'); sizeWarning.classList.add('hidden'); document.getElementById('customer-info').classList.add('hidden');
        return;
    }
    
    cartSection.classList.remove('hidden');
    cartList.innerHTML = '';
    
    cart3D.forEach(item => {
        const li = document.createElement('li');
        const isActive = item.id === activeCartId;
        li.className = `flex justify-between items-center p-2 rounded-lg cursor-pointer border ${isActive ? 'bg-brand-900 border-brand-500' : 'bg-slate-900 border-slate-700 hover:border-slate-500'} transition`;
        li.onclick = () => previewItem(item.id);
        
        li.innerHTML = `
            <div class="flex-1 min-w-0 pr-2">
                <p class="text-xs font-bold text-white truncate" title="${item.name}">${item.name}</p>
                <p class="text-[10px] text-slate-400">${item.dims.x} x ${item.dims.y} x ${item.dims.z} mm</p>
            </div>
            <button onclick="event.stopPropagation(); removeCartItem(${item.id})" class="text-slate-500 hover:text-red-400 p-1 transition">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        `;
        cartList.appendChild(li);
    });
    
    updatePricing3D();
}

window.removeCartItem = function(id) {
    cart3D = cart3D.filter(item => item.id !== id);
    if(cart3D.length > 0) {
        if(activeCartId === id) previewItem(cart3D[0].id);
        else renderCart();
    } else {
        renderCart();
    }
}

function previewItem(id) {
    activeCartId = id;
    const item = cart3D.find(i => i.id === id);
    if(!item) return;
    
    renderCart(); 
    
    document.getElementById('dim-display').innerHTML = `${item.dims.x} x ${item.dims.y} x ${item.dims.z} mm`;
    
    if(item.dims.x > 390 || item.dims.y > 390 || item.dims.z > 390) { sizeWarning.classList.remove('hidden'); } 
    else { sizeWarning.classList.add('hidden'); }

    if (currentMesh) { scene.remove(currentMesh); }
    
    const defaultColorBtn = document.querySelector('.color-btn.border-white') || colorButtons[0];
    currentMesh = new THREE.Mesh(item.geometry, new THREE.MeshStandardMaterial({ 
        color: parseInt(defaultColorBtn.getAttribute('data-color')), 
        roughness: parseFloat(defaultColorBtn.getAttribute('data-roughness')), 
        metalness: parseFloat(defaultColorBtn.getAttribute('data-metalness'))
    }));
    
    item.geometry.center(); 
    scene.add(currentMesh);
    item.geometry.computeBoundingSphere(); 
    camera.position.z = item.geometry.boundingSphere.radius * 2.5;
}

// XỬ LÝ UPLOAD NHIỀU FILE
fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files); 
    if (files.length === 0) return;
    
    const validFiles = files.filter(file => {
        if (!file.name.toLowerCase().endsWith('.stl')) {
            showToast(`File "${file.name}" không đúng định dạng .stl!`, "error");
            return false;
        }
        return true;
    });

    if (validFiles.length === 0) {
        fileInput.value = '';
        return;
    }

    loading.classList.remove('hidden');
    let loadedCount = 0;

    validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const loader = new THREE.STLLoader();
                const geometry = loader.parse(event.target.result);
                
                if (!geometry || geometry.attributes.position === undefined) {
                    throw new Error("Dữ liệu file trống hoặc lỗi");
                }

                const vol = calculateVolume(geometry) / 1000;
                geometry.computeBoundingBox(); 
                const box = geometry.boundingBox;
                const dims = { 
                    x: Math.abs(box.max.x - box.min.x).toFixed(1), 
                    y: Math.abs(box.max.y - box.min.y).toFixed(1), 
                    z: Math.abs(box.max.z - box.min.z).toFixed(1) 
                };

                cart3D.push({
                    id: Date.now() + Math.random(),
                    name: file.name,
                    volume: vol || 35,
                    geometry: geometry,
                    dims: dims
                });
                showToast(`Đã thêm ${file.name} vào danh sách.`, "success");
            } catch (error) { 
                showToast(`Lỗi đọc file "${file.name}".`, "error");
            }
            
            loadedCount++;
            if(loadedCount === validFiles.length) {
                renderCart();
                if(cart3D.length > 0) previewItem(cart3D[cart3D.length - 1].id);
                loading.classList.add('hidden');
                
                placeholder.classList.add('opacity-0', 'pointer-events-none');
                document.getElementById('demo-models').classList.add('hidden');
                resetViewerBtn.classList.remove('hidden'); 
                resetViewerBtn.classList.add('flex');
                btnZalo3D.classList.remove('hidden');
            }
        };

        reader.onerror = function() {
            showToast(`Lỗi hệ thống khi đọc file "${file.name}".`, "error");
            loading.classList.add('hidden');
        };

        reader.readAsArrayBuffer(file);
    });
    fileInput.value = '';
});

function createGearGeometry() {
    const shape = new THREE.Shape();
    const teeth = 16, outerRadius = 30, innerRadius = 24;
    for (let i = 0; i < teeth * 2; i++) {
        const r = i % 2 === 0 ? outerRadius : innerRadius;
        const a = (i / (teeth * 2)) * Math.PI * 2;
        if (i === 0) shape.moveTo(Math.cos(a) * r, Math.sin(a) * r);
        else shape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    shape.closePath();
    const holePath = new THREE.Path(); holePath.absarc(0, 0, 10, 0, Math.PI * 2, false); shape.holes.push(holePath);
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 10, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.5, bevelThickness: 0.5 }); geo.center(); return geo;
}

function createCircuitBoxGeometry() {
    const shape = new THREE.Shape(); const w = 60, h = 40, r = 4; const x = -w/2, y = -h/2;
    shape.moveTo(x, y + r); shape.lineTo(x, y + h - r); shape.quadraticCurveTo(x, y + h, x + r, y + h); shape.lineTo(x + w - r, y + h); shape.quadraticCurveTo(x + w, y + h, x + w, y + h - r); shape.lineTo(x + w, y + r); shape.quadraticCurveTo(x + w, y, x + w - r, y); shape.lineTo(x + r, y); shape.quadraticCurveTo(x, y, x, y + r);
    const hole = new THREE.Path(); const hw = 50, hh = 30, hr = 2; const hx = -hw/2, hy = -hh/2; hole.moveTo(hx, hy + hr); hole.lineTo(hx, hy + hh - hr); hole.quadraticCurveTo(hx, hy + hh, hx + hr, hy + hh); hole.lineTo(hx + hw - hr, hy + hh); hole.quadraticCurveTo(hx + hw, hy + hh, hx + hw, hy + hh - hr); hole.lineTo(hx + hw, hy + hr); hole.quadraticCurveTo(hx + hw, hy, hx + hw - hr, hy); hole.lineTo(hx + hr, hy); hole.quadraticCurveTo(hx, hy, hx, hy + hr); shape.holes.push(hole);
    const pos = [[-25, -15], [25, -15], [25, 15], [-25, 15]]; pos.forEach(p => { const screwHole = new THREE.Path(); screwHole.absarc(p[0], p[1], 1.5, 0, Math.PI * 2, false); shape.holes.push(screwHole); });
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 15, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.5, bevelThickness: 0.5 }); geo.center(); return geo;
}

window.loadDemoModel = function(type) {
    loading.classList.remove('hidden');
    setTimeout(() => {
        let geometry, name;
        if (type === 'gear') { geometry = createGearGeometry(); name = "Banh_Rang_Demo.stl"; } 
        else if (type === 'box') { geometry = createCircuitBoxGeometry(); name = "Khung_Mach_Demo.stl"; } 
        else { geometry = new THREE.TorusKnotGeometry(25, 6, 100, 16); name = "Tru_Xoan_Demo.stl"; }
        
        const vol = calculateVolume(geometry) / 1000 || 35;
        geometry.computeBoundingBox(); const box = geometry.boundingBox;
        const dims = { x: Math.abs(box.max.x - box.min.x).toFixed(1), y: Math.abs(box.max.y - box.min.y).toFixed(1), z: Math.abs(box.max.z - box.min.z).toFixed(1) };

        cart3D.push({ id: Date.now() + Math.random(), name: name, volume: vol, geometry: geometry, dims: dims });
        
        renderCart();
        previewItem(cart3D[cart3D.length - 1].id);
        loading.classList.add('hidden');
        showToast(`Đã thêm file mẫu ${name}`, "success");
        
        placeholder.classList.add('opacity-0', 'pointer-events-none'); document.getElementById('demo-models').classList.add('hidden');
        resetViewerBtn.classList.remove('hidden'); resetViewerBtn.classList.add('flex'); btnZalo3D.classList.remove('hidden');
    }, 500);
};

resetViewerBtn.addEventListener('click', () => { cart3D = []; renderCart(); showToast("Đã dọn dẹp sạch khu vực phân tích."); });

// --- 5. TRÌNH DIỄN CƠ KHÍ (EXPLODED VIEW) ---
const exContainer = document.getElementById('exploded-container');
const exSlider = document.getElementById('explode-slider');

if(exContainer) {
    const exScene = new THREE.Scene();
    const exCamera = new THREE.PerspectiveCamera(45, exContainer.clientWidth / exContainer.clientHeight, 0.1, 1000);
    const exRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    exRenderer.setSize(exContainer.clientWidth, exContainer.clientHeight);
    exRenderer.outputEncoding = THREE.sRGBEncoding;
    exRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    exContainer.appendChild(exRenderer.domElement);
    
    const exEnv = new THREE.PMREMGenerator(exRenderer);
    exScene.environment = exEnv.fromScene(new THREE.RoomEnvironment(), 0.04).texture;
    const exLight = new THREE.DirectionalLight(0xffffff, 0.8);
    exLight.position.set(50, 50, 50);
    exScene.add(exLight);

    const exControls = new THREE.OrbitControls(exCamera, exRenderer.domElement);
    exControls.enableDamping = true;
    exCamera.position.set(0, -70, 80); 

    function createCustomGearForExplode(teeth, outerR, innerR, depth, hasHole = true) {
        const shape = new THREE.Shape();
        for (let i = 0; i < teeth * 2; i++) {
            const r = i % 2 === 0 ? outerR : innerR;
            const a = (i / (teeth * 2)) * Math.PI * 2;
            if (i === 0) shape.moveTo(Math.cos(a) * r, Math.sin(a) * r);
            else shape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        shape.closePath();
        if(hasHole) {
            const hole = new THREE.Path();
            hole.absarc(0, 0, 4, 0, Math.PI * 2, false);
            shape.holes.push(hole);
        }
        const geo = new THREE.ExtrudeGeometry(shape, { depth: depth, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.5, bevelThickness: 0.5 });
        geo.center(); return geo;
    }

    const exParts = [];
    const gearGroup = new THREE.Group();
    exScene.add(gearGroup);

    const sunMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.7, roughness: 0.2 });
    const sunGear = new THREE.Mesh(createCustomGearForExplode(12, 12, 9, 8), sunMat);
    gearGroup.add(sunGear);
    exParts.push({ mesh: sunGear, basePos: new THREE.Vector3(0,0,0), dir: new THREE.Vector3(0,0,1), maxDist: 40 });

    const planetMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, metalness: 0.6, roughness: 0.3 });
    const planets = [];
    for(let i=0; i<3; i++) {
        const angle = (i / 3) * Math.PI * 2;
        const pGear = new THREE.Mesh(createCustomGearForExplode(12, 12, 9, 8), planetMat);
        const px = Math.cos(angle) * 22;
        const py = Math.sin(angle) * 22;
        pGear.position.set(px, py, 0);
        gearGroup.add(pGear);
        planets.push(pGear);
        exParts.push({ mesh: pGear, basePos: new THREE.Vector3(px, py, 0), dir: new THREE.Vector3(Math.cos(angle), Math.sin(angle), 0).normalize(), maxDist: 35 });
    }

    const ringShape = new THREE.Shape();
    ringShape.absarc(0, 0, 42, 0, Math.PI * 2, false);
    const ringHole = new THREE.Path();
    const rTeeth = 36;
    for (let i = 0; i < rTeeth * 2; i++) {
        const r = i % 2 === 0 ? 34 : 37;
        const a = (i / (rTeeth * 2)) * Math.PI * 2;
        if (i === 0) ringHole.moveTo(Math.cos(a) * r, Math.sin(a) * r);
        else ringHole.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ringShape.holes.push(ringHole);
    const ringGeo = new THREE.ExtrudeGeometry(ringShape, { depth: 10, bevelEnabled: true, bevelSize: 0.5, bevelThickness: 0.5 });
    ringGeo.center();
    const ringMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.4 });
    const ringGear = new THREE.Mesh(ringGeo, ringMat);
    gearGroup.add(ringGear);
    exParts.push({ mesh: ringGear, basePos: new THREE.Vector3(0,0,0), dir: new THREE.Vector3(0,0,-1), maxDist: 30 });

    const shaftGeo = new THREE.CylinderGeometry(3.8, 3.8, 40, 32);
    shaftGeo.rotateX(Math.PI/2);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0xD4AF37, metalness: 0.9, roughness: 0.1 });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    gearGroup.add(shaft);
    exParts.push({ mesh: shaft, basePos: new THREE.Vector3(0,0,0), dir: new THREE.Vector3(0,0,1), maxDist: 70 });

    exSlider.addEventListener('input', (e) => {
        const val = e.target.value / 100;
        exParts.forEach(p => {
            p.mesh.position.copy(p.basePos).add(p.dir.clone().multiplyScalar(val * p.maxDist));
        });
    });

    function animateExploded() {
        requestAnimationFrame(animateExploded);
        exControls.update();
        exRenderer.render(exScene, exCamera);
        
        if (exSlider.value < 5) {
            const speed = 0.03; 
            sunGear.rotation.z += speed;
            shaft.rotation.z += speed; 
            planets.forEach(p => p.rotation.z -= speed); 
            ringGear.rotation.z -= (speed / 3); 
        }
    }
    animateExploded();

    window.addEventListener('resize', () => {
        exCamera.aspect = exContainer.clientWidth / exContainer.clientHeight;
        exCamera.updateProjectionMatrix();
        exRenderer.setSize(exContainer.clientWidth, exContainer.clientHeight);
    });
}

// --- 6. SCROLL TO TOP NÚT NỔI ---
const backToTopBtn = document.getElementById('backToTopBtn');
window.addEventListener('scroll', () => {
    if (window.scrollY > 400) { 
        backToTopBtn.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-4'); 
    } else { 
        backToTopBtn.classList.add('opacity-0', 'pointer-events-none', 'translate-y-4'); 
    }
});
function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }

// ==========================================

// ==========================================
// 8. HỆ THỐNG GIAO DIỆN SÁNG/TỐI (DARK/LIGHT MODE)
// ==========================================
const themeToggleBtn = document.getElementById('theme-toggle-btn');

if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('global-dark');
    themeToggleBtn.classList.add('theme-is-dark');
}

themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('global-dark');
    themeToggleBtn.classList.toggle('theme-is-dark');
    
    if (document.body.classList.contains('global-dark')) {
        localStorage.setItem('theme', 'dark');
        showToast("Đã chuyển sang chế độ Giao diện Tối", "success");
    } else {
        localStorage.setItem('theme', 'light');
        showToast("Đã chuyển sang chế độ Giao diện Sáng", "info");
    }
});
