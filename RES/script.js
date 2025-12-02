// script.js - File chính để điều phối giữa staff và admin

// Biến toàn cục
let currentUser = null;
let currentView = 'welcome';
let staffPressCount = 0;
let staffTimer = null;
let adminHoldTimer = null;
let adminHoldStartTime = null;
let adminHoldProgress = 0;

// Khởi tạo ứng dụng
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    startSplashScreen();
});

// Thiết lập event listeners
function setupEventListeners() {
    // Xử lý đăng nhập
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('cancel-login').addEventListener('click', cancelLogin);
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    
    // Xử lý phím DEL cho nhân viên (nhấn 2 lần cách nhau 2s)
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Delete' || event.key === 'Del') {
            handleStaffDelKeyPress();
        }
    });
    
    // Xử lý giữ phím DEL cho admin (giữ 5s)
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Delete' || event.key === 'Del') {
            handleAdminDelKeyPress(event);
        }
    });
    
    document.addEventListener('keyup', function(event) {
        if (event.key === 'Delete' || event.key === 'Del') {
            handleAdminDelKeyRelease();
        }
    });
}

// Xử lý phím DEL cho nhân viên (nhấn 2 lần cách nhau 2s)
function handleStaffDelKeyPress() {
    staffPressCount++;
    
    if (staffPressCount === 1) {
        // Bắt đầu đếm thời gian giữa hai lần nhấn (2 giây)
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

// Xử lý giữ phím DEL cho admin
function handleAdminDelKeyPress(event) {
    if (!adminHoldStartTime) {
        adminHoldStartTime = Date.now();
        adminHoldProgress = 0;
        
        // Bắt đầu hiệu ứng giữ
        adminHoldTimer = setInterval(() => {
            const currentTime = Date.now();
            const elapsed = currentTime - adminHoldStartTime;
            adminHoldProgress = Math.min(elapsed / 5000, 1); // 5 giây
            
            // Cập nhật thanh tiến trình
            updateAdminHoldProgress(adminHoldProgress);
            
            // Nếu đủ 5 giây
            if (elapsed >= 5000) {
                handleAdminHoldComplete();
            }
        }, 50);
        
        updateSplashMessage("ĐANG GIỮ PHÍM DEL... (5 giây cho admin)");
    }
    
    // Ngăn hành vi mặc định
    event.preventDefault();
}

// Xử lý nhả phím DEL
function handleAdminDelKeyRelease() {
    if (adminHoldTimer) {
        clearInterval(adminHoldTimer);
        adminHoldTimer = null;
    }
    
    if (adminHoldStartTime) {
        const elapsed = Date.now() - adminHoldStartTime;
        
        if (elapsed < 5000) {
            updateSplashMessage("Chưa đủ 5 giây! Giữ lâu hơn để vào admin");
            // Reset progress bar
            updateAdminHoldProgress(0);
        }
        
        adminHoldStartTime = null;
        adminHoldProgress = 0;
    }
}

// Xử lý khi giữ đủ 5 giây
function handleAdminHoldComplete() {
    clearInterval(adminHoldTimer);
    adminHoldTimer = null;
    adminHoldStartTime = null;
    
    updateSplashMessage("ĐÃ GIỮ ĐỦ 5 GIÂY! Mở đăng nhập admin...");
    
    // Reset progress bar
    updateAdminHoldProgress(1);
    
    setTimeout(() => {
        showLoginScreen();
        // Chỉ hiển thị option ADMIN
        document.getElementById('role').innerHTML = `
            <option value="">-- Chọn vai trò --</option>
            <option value="ADMIN">Quản trị viên (ADMIN)</option>
        `;
        updateLoginHint("Chế độ quản trị - Giữ DEL 5 giây");
        updateAdminHoldProgress(0);
    }, 500);
}

// Cập nhật thanh tiến trình giữ phím
function updateAdminHoldProgress(progress) {
    const loadingBar = document.querySelector('.loading-bar');
    if (loadingBar) {
        loadingBar.style.width = `${progress * 100}%`;
        loadingBar.style.backgroundColor = progress >= 1 ? '#28a745' : '#FFD700';
    }
}

// Cập nhật thông báo splash
function updateSplashMessage(message) {
    const hintElement = document.querySelector('.splash-message .hint');
    if (hintElement) {
        hintElement.textContent = message;
    }
}

// Cập nhật gợi ý đăng nhập
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

// Hiển thị màn hình đăng nhập
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

// Xử lý đăng nhập
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    
    const result = APP_CONFIG.authenticate(username, password, role);
    
    if (result.success) {
        currentUser = result.user;
        startApp();
    } else {
        alert(result.message);
    }
}

// Bắt đầu ứng dụng
function startApp() {
    hideLoginScreen();
    document.getElementById('main-app').classList.remove('hidden');
    
    document.getElementById('current-user').textContent = currentUser.name;
    document.getElementById('current-role').textContent = currentUser.role;
    
    createNavigationMenu();
    showDefaultView();
    
    // Load script tương ứng với vai trò
    loadRoleScript(currentUser.role);
}

// Load script theo vai trò
function loadRoleScript(role) {
    // Xóa script cũ nếu có
    const oldScript = document.getElementById('role-script');
    if (oldScript) {
        oldScript.remove();
    }
    
    // Thêm script mới
    const script = document.createElement('script');
    script.id = 'role-script';
    
    if (role === 'STAFF') {
        script.src = 'staff.js';
        script.onload = function() {
            console.log('Staff script loaded');
            // Khởi tạo staff functions
            if (typeof createNavigationMenu === 'function') {
                createNavigationMenu();
                showDefaultView();
            }
        };
    } else if (role === 'ADMIN') {
        script.src = 'admin.js';
        script.onload = function() {
            console.log('Admin script loaded');
            // Khởi tạo admin functions
            if (typeof createNavigationMenu === 'function') {
                createNavigationMenu();
                showDefaultView();
            }
        };
    }
    
    document.head.appendChild(script);
}

// Tạo menu điều hướng (tạm thời, sẽ được ghi đè bởi script vai trò)
function createNavigationMenu() {
    const nav = document.getElementById('main-nav');
    nav.innerHTML = '';
    
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

// Hiển thị trang mặc định (tạm thời)
function showDefaultView() {
    const defaultView = APP_CONFIG.getMenuForRole(currentUser.role)[0].id;
    switchView(defaultView);
}

// Chuyển view (tạm thời)
function switchView(viewId) {
    currentView = viewId;
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    const activeNav = document.getElementById(`nav-${viewId}`);
    if (activeNav) {
        activeNav.classList.add('active');
    }
    
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `<div class="welcome-message">
        <h1>Đang tải ${viewId}...</h1>
        <p>Vui lòng chờ trong giây lát</p>
    </div>`;
}

// Xử lý đăng xuất
function handleLogout() {
    currentUser = null;
    currentView = 'welcome';
    
    document.getElementById('main-app').classList.add('hidden');
    document.getElementById('splash-screen').classList.remove('hidden');
    document.getElementById('login-form').reset();
    
    // Xóa script vai trò
    const roleScript = document.getElementById('role-script');
    if (roleScript) {
        roleScript.remove();
    }
    
    // Reset splash message
    updateSplashMessage("Nhấn DEL hai lần cách nhau 2s cho nhân viên, giữ 5s cho admin");
}

// Màn hình khởi động
function startSplashScreen() {
    updateSplashMessage("Nhấn DEL hai lần cách nhau 2s cho nhân viên, giữ 5s cho admin");
    
    setTimeout(() => {
        if (!currentUser) {
            document.getElementById('splash-screen').classList.add('hidden');
        }
    }, 5000);
}
