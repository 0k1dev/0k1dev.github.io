// script.js - FILE CHÍNH

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

if (typeof adminHoldTimer === 'undefined') {
    let adminHoldTimer = null;
}

if (typeof adminHoldStartTime === 'undefined') {
    let adminHoldStartTime = null;
}

if (typeof adminHoldProgress === 'undefined') {
    let adminHoldProgress = 0;
}

// ========== KHỞI TẠO ỨNG DỤNG ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('Ứng dụng khởi động...');
    setupEventListeners();
    startSplashScreen();
});

// ========== XỬ LÝ PHÍM ==========
function setupEventListeners() {
    // Form đăng nhập
    const loginForm = document.getElementById('login-form');
    const cancelBtn = document.getElementById('cancel-login');
    const logoutBtn = document.getElementById('logout-btn');
    
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (cancelBtn) cancelBtn.addEventListener('click', cancelLogin);
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    
    // Xử lý phím DEL
    document.addEventListener('keydown', handleKeyPress);
}

function handleKeyPress(event) {
    if (event.key === 'Delete' || event.key === 'Del') {
        handleDelKeyPress();
    }
}

function handleDelKeyPress() {
    if (!staffPressCount) staffPressCount = 0;
    
    staffPressCount++;
    
    if (staffPressCount === 1) {
        staffTimer = setTimeout(() => {
            staffPressCount = 0;
            updateSplashMessage("Nhấn DEL lần nữa để đăng nhập nhân viên");
        }, 2000);
        
        updateSplashMessage("Đã nhấn DEL lần 1, nhấn lần nữa trong 2 giây");
    } else if (staffPressCount === 2) {
        clearTimeout(staffTimer);
        staffPressCount = 0;
        updateSplashMessage("Hiển thị đăng nhập...");
        setTimeout(() => {
            showLoginScreen();
            // Chỉ hiển thị option STAFF
            document.getElementById('role').innerHTML = `
                <option value="">-- Chọn vai trò --</option>
                <option value="STAFF">Nhân viên (STAFF)</option>
            `;
            updateLoginHint("Chế độ nhân viên - Nhấn DEL 2 lần");
        }, 500);
    }
}

// ========== ĐĂNG NHẬP ==========
function showLoginScreen() {
    if (!currentUser) {
        document.getElementById('splash-screen').classList.add('hidden');
        document.getElementById('login-screen').classList.remove('hidden');
    }
}

function hideLoginScreen() {
    document.getElementById('login-screen').classList.add('hidden');
}

function cancelLogin() {
    hideLoginScreen();
    if (!currentUser) {
        document.getElementById('splash-screen').classList.remove('hidden');
        updateSplashMessage("Nhấn DEL hai lần để đăng nhập nhân viên");
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
    
    document.getElementById('current-user').textContent = currentUser.name;
    document.getElementById('current-role').textContent = currentUser.role;
    
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
                </div>`;
        }
    }
    // Nếu là ADMIN, gọi hàm từ admin.js
    else if (currentUser.role === 'ADMIN') {
        switch(viewId) {
            case 'dashboard':
                if (typeof renderAdminDashboard === 'function') {
                    contentArea.innerHTML = renderAdminDashboard();
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
                </div>`;
        }
    }
}

// ========== XỬ LÝ ĐĂNG XUẤT ==========
function handleLogout() {
    currentUser = null;
    currentView = 'welcome';
    
    document.getElementById('main-app').classList.add('hidden');
    document.getElementById('splash-screen').classList.remove('hidden');
    document.getElementById('login-form').reset();
    
    // Reset splash message
    updateSplashMessage("Nhấn DEL hai lần để đăng nhập nhân viên");
}

// ========== MÀN HÌNH KHỞI ĐỘNG ==========
function startSplashScreen() {
    updateSplashMessage("Nhấn DEL hai lần để đăng nhập nhân viên");
    
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
