// script.js - FILE CHÍNH HOÀN CHỈNH

// ========== KHAI BÁO BIẾN (CHỈ KHI CHƯA TỒN TẠI) ==========
if (typeof currentUser === 'undefined') {
    let currentUser = null;
}

if (typeof currentView === 'undefined') {
    let currentView = 'welcome';
}

if (typeof staffPressCount === 'undefined') {
    let staffPressCount = 0;
}

if (typeof staffTimer === 'undefined') {
    let staffTimer = null;
}

// ========== KHỞI TẠO ỨNG DỤNG ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('Ứng dụng khởi động...');
    setupEventListeners();
    startSplashScreen();
});

// ========== THIẾT LẬP EVENT LISTENERS ==========
function setupEventListeners() {
    // Xử lý phím Ctrl + C để vào admin
    document.addEventListener('keydown', function(event) {
        // Ctrl + C cho admin
        if (event.ctrlKey ) {
            event.preventDefault(); // Ngăn hành vi mặc định copy
            handleAdminShortcut();
            return;
        }
        
        // DEL cho nhân viên (chỉ khi chưa đăng nhập)
        if (!currentUser && (event.key === 'Delete' || event.key === 'Del')) {
            handleStaffDelKeyPress();
        }
    });
    
    // Form đăng nhập
    const loginForm = document.getElementById('login-form');
    const cancelBtn = document.getElementById('cancel-login');
    const logoutBtn = document.getElementById('logout-btn');
    
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (cancelBtn) cancelBtn.addEventListener('click', cancelLogin);
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
}

// ========== XỬ LÝ PHÍM TẮT ADMIN (CTRL + C) ==========
function handleAdminShortcut() {
    console.log('Ctrl được nhấn - Mở đăng nhập admin');
    
    // Chỉ xử lý khi chưa đăng nhập
    if (currentUser) return;
    
    // Hiển thị thông báo
    updateSplashMessage("ĐÃ NHẬN PHÍM TẮT ADMIN Ctrl...");
    
    setTimeout(() => {
        showLoginScreen();
        // Chỉ hiển thị option ADMIN
        document.getElementById('role').innerHTML = `
            <option value="">-- Chọn vai trò --</option>
            <option value="ADMIN">Quản trị viên (ADMIN)</option>
        `;
        updateLoginHint("Chế độ quản trị - Phím tắt Ctrl");
    }, 300);
}

// ========== XỬ LÝ PHÍM DEL CHO NHÂN VIÊN ==========
function handleStaffDelKeyPress() {
    // Chỉ xử lý khi chưa đăng nhập
    if (currentUser) return;
    
    staffPressCount++;
    
    if (staffPressCount === 1) {
        // Bắt đầu đếm thời gian
        staffTimer = setTimeout(() => {
            staffPressCount = 0;
            updateSplashMessage("Nhấn DEL lần nữa để đăng nhập nhân viên");
        }, 2000);
        
        updateSplashMessage("Đã nhấn DEL lần 1, nhấn lần nữa trong 2 giây");
    } else if (staffPressCount === 2) {
        clearTimeout(staffTimer);
        staffPressCount = 0;
        
        updateSplashMessage("Mở đăng nhập nhân viên...");
        setTimeout(() => {
            showLoginScreen();
            // Chỉ hiển thị option STAFF
            document.getElementById('role').innerHTML = `
                <option value="">-- Chọn vai trò --</option>
                <option value="STAFF">Nhân viên (STAFF)</option>
            `;
            updateLoginHint("Chế độ nhân viên - Nhấn DEL 2 lần");
        }, 300);
    }
}

// ========== ĐĂNG NHẬP ==========
function showLoginScreen() {
    if (!currentUser) {
        document.getElementById('splash-screen').classList.add('hidden');
        document.getElementById('login-screen').classList.remove('hidden');
        document.getElementById('login-form').reset();
    }
}

function hideLoginScreen() {
    document.getElementById('login-screen').classList.add('hidden');
}

function cancelLogin() {
    hideLoginScreen();
    if (!currentUser) {
        document.getElementById('splash-screen').classList.remove('hidden');
        updateSplashMessage("Nhấn DEL hai lần cho nhân viên | Ctrl+C cho admin");
    }
}

function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    
    if (!APP_CONFIG || !APP_CONFIG.authenticate) {
        alert('Hệ thống chưa được cấu hình đúng!');
        return;
    }
    
    const result = APP_CONFIG.authenticate(username, password, role);
    
    if (result.success) {
        currentUser = result.user;
        startApp();
    } else {
        alert(result.message);
    }
}

// ========== BẮT ĐẦU APP ==========
function startApp() {
    hideLoginScreen();
    document.getElementById('main-app').classList.remove('hidden');
    
    // Hiển thị thông tin user
    document.getElementById('current-user').textContent = currentUser.name;
    document.getElementById('current-role').textContent = currentUser.role;
    
    // Tạo menu và hiển thị view mặc định
    createNavigationMenu();
    showDefaultView();
}

function createNavigationMenu() {
    const nav = document.getElementById('main-nav');
    if (!nav) return;
    
    nav.innerHTML = '';
    
    if (!APP_CONFIG || !APP_CONFIG.getMenuForRole) {
        console.error('APP_CONFIG không tồn tại!');
        return;
    }
    
    const menuItems = APP_CONFIG.getMenuForRole(currentUser.role);
    
    menuItems.forEach(item => {
        const navItem = document.createElement('div');
        navItem.className = 'nav-item';
        navItem.id = `nav-${item.id}`;
        navItem.innerHTML = `<i class="${item.icon}"></i> ${item.name}`;
        navItem.addEventListener('click', () => switchView(item.id));
        
        nav.appendChild(navItem);
    });
}

function showDefaultView() {
    if (!APP_CONFIG || !currentUser) return;
    
    const menuItems = APP_CONFIG.getMenuForRole(currentUser.role);
    if (menuItems.length > 0) {
        const defaultView = menuItems[0].id;
        switchView(defaultView);
    }
}

// ========== CHUYỂN VIEW ==========
function switchView(viewId) {
    if (!currentUser) return;
    
    currentView = viewId;
    
    // Cập nhật menu active
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const activeNav = document.getElementById(`nav-${viewId}`);
    if (activeNav) {
        activeNav.classList.add('active');
    }
    
    const contentArea = document.getElementById('content-area');
    if (!contentArea) return;
    
    // Nếu là STAFF, gọi hàm từ staff.js
    if (currentUser.role === 'STAFF') {
        switch(viewId) {
            case 'room-management':
                if (typeof renderRoomManagement === 'function') {
                    contentArea.innerHTML = renderRoomManagement();
                } else {
                    contentArea.innerHTML = '<p>Chức năng quản lý phòng không khả dụng</p>';
                }
                break;
            case 'check-in-process':
                if (typeof renderCheckInProcess === 'function') {
                    contentArea.innerHTML = renderCheckInProcess();
                }
                break;
            case 'check-out-process':
                if (typeof renderCheckOutProcess === 'function') {
                    contentArea.innerHTML = renderCheckOutProcess();
                }
                break;
            case 'qr-generator':
                if (typeof renderQRGenerator === 'function') {
                    contentArea.innerHTML = renderQRGenerator();
                }
                break;
            default:
                contentArea.innerHTML = `<div class="welcome-message">
                    <h1>Chào mừng ${currentUser.name}</h1>
                    <p>Vai trò: ${currentUser.role}</p>
                    <p>Chọn chức năng từ menu để bắt đầu</p>
                </div>`;
        }
    }
    // Nếu là ADMIN, gọi hàm từ admin.js
    else if (currentUser.role === 'ADMIN') {
        switch(viewId) {
            case 'dashboard':
                if (typeof renderAdminDashboard === 'function') {
                    contentArea.innerHTML = renderAdminDashboard();
                } else {
                    contentArea.innerHTML = '<p>Chức năng tổng quan không khả dụng</p>';
                }
                break;
            case 'room-management':
                if (typeof renderRoomManagementAdmin === 'function') {
                    contentArea.innerHTML = renderRoomManagementAdmin();
                }
                break;
            case 'reports':
                if (typeof renderReports === 'function') {
                    contentArea.innerHTML = renderReports();
                }
                break;
            case 'revenue-analysis':
                if (typeof renderRevenueAnalysis === 'function') {
                    contentArea.innerHTML = renderRevenueAnalysis();
                }
                break;
            case 'bill-history':
                if (typeof renderBillHistory === 'function') {
                    contentArea.innerHTML = renderBillHistory();
                }
                break;
            case 'service-analytics':
                if (typeof renderServiceAnalytics === 'function') {
                    contentArea.innerHTML = renderServiceAnalytics();
                }
                break;
            default:
                contentArea.innerHTML = `<div class="welcome-message">
                    <h1>Chào mừng ${currentUser.name}</h1>
                    <p>Vai trò: ${currentUser.role}</p>
                    <p>Chọn chức năng từ menu để bắt đầu</p>
                </div>`;
        }
    }
}

// ========== XỬ LÝ ĐĂNG XUẤT ==========
function handleLogout() {
    currentUser = null;
    currentView = 'welcome';
    staffPressCount = 0;
    
    document.getElementById('main-app').classList.add('hidden');
    document.getElementById('splash-screen').classList.remove('hidden');
    document.getElementById('login-form').reset();
    
    // Reset splash message
    updateSplashMessage("Nhấn DEL hai lần cho nhân viên | Ctrl+C cho admin");
}

// ========== MÀN HÌNH KHỞI ĐỘNG ==========
function startSplashScreen() {
    updateSplashMessage("Nhấn DEL hai lần cho nhân viên | Ctrl+C cho admin");
    
    setTimeout(() => {
        if (!currentUser) {
            document.getElementById('splash-screen').classList.add('hidden');
        }
    }, 5000);
}

// ========== HÀM TIỆN ÍCH ==========
function updateSplashMessage(message) {
    const hintElement = document.querySelector('.splash-message .hint');
    if (hintElement) {
        hintElement.textContent = message;
    }
}

function updateLoginHint(message) {
    const loginFooter = document.querySelector('.login-footer');
    if (loginFooter) {
        const existingHint = loginFooter.querySelector('.login-hint');
        if (existingHint) {
            existingHint.remove();
        }
        
        const hintElement = document.createElement('p');
        hintElement.className = 'login-hint';
        hintElement.style.color = '#e91e63';
        hintElement.style.fontWeight = 'bold';
        hintElement.style.marginTop = '10px';
        hintElement.innerHTML = `<i class="fas fa-info-circle"></i> ${message}`;
        loginFooter.appendChild(hintElement);
    }
}

// ========== HÀM KHỞI TẠO (TÙY CHỌN) ==========
function initializeApp() {
    console.log('Khởi tạo ứng dụng...');
    
    // Kiểm tra dữ liệu
    if (typeof appData === 'undefined') {
        console.warn('appData chưa được khai báo');
    }
    
    if (typeof APP_CONFIG === 'undefined') {
        console.warn('APP_CONFIG chưa được khai báo');
    }
    
    console.log('App đã sẵn sàng!');
}

// Gọi khởi tạo (có thể gọi từ đây hoặc từ DOMContentLoaded)
initializeApp();
