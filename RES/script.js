// Biến toàn cục
let currentUser = null;
let currentView = 'welcome';
let delPressCount = 0;
let delTimer = null;

// Dữ liệu ứng dụng
let appData = {
    rooms: [],
    bookings: [],
    staff: [],
    orders: [],
    customers: []
};

// Khởi tạo ứng dụng
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    startSplashScreen();
});

// Khởi tạo dữ liệu
function initializeApp() {
    appData.rooms = APP_CONFIG.initializeRooms();
    appData.bookings = APP_CONFIG.initializeBookings();
    appData.staff = APP_CONFIG.initializeStaff();
    appData.orders = [];
    appData.customers = [];
    
    // Tạo dữ liệu khách hàng từ bookings
    appData.bookings.forEach(booking => {
        if (!appData.customers.some(c => c.email === booking.customerEmail)) {
            appData.customers.push({
                id: appData.customers.length + 1,
                name: booking.customerName,
                phone: booking.customerPhone,
                email: booking.customerEmail,
                totalBookings: 1,
                lastBooking: booking.checkInDate
            });
        }
    });
}

// Thiết lập event listeners
function setupEventListeners() {
    // Xử lý nhấn phím DEL
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Delete' || event.key === 'Del') {
            handleDelKeyPress();
        }
    });
    
    // Xử lý đăng nhập
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('cancel-login').addEventListener('click', cancelLogin);
    
    // Xử lý đăng xuất
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
}

// Xử lý nhấn phím DEL
function handleDelKeyPress() {
    delPressCount++;
    
    if (delPressCount === 1) {
        // Bắt đầu đếm thời gian giữa hai lần nhấn
        delTimer = setTimeout(() => {
            delPressCount = 0;
        }, 500);
    } else if (delPressCount === 2) {
        clearTimeout(delTimer);
        delPressCount = 0;
        showLoginScreen();
    }
}

// Hiển thị màn hình đăng nhập
function showLoginScreen() {
    // Chỉ hiển thị nếu chưa đăng nhập
    if (!currentUser) {
        document.getElementById('splash-screen').classList.add('hidden');
        document.getElementById('login-screen').classList.remove('hidden');
    }
}

// Ẩn màn hình đăng nhập
function hideLoginScreen() {
    document.getElementById('login-screen').classList.add('hidden');
}

// Hủy đăng nhập
function cancelLogin() {
    hideLoginScreen();
    // Chỉ hiển thị lại splash nếu chưa đăng nhập
    if (!currentUser) {
        document.getElementById('splash-screen').classList.remove('hidden');
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

// Bắt đầu ứng dụng sau khi đăng nhập
function startApp() {
    hideLoginScreen();
    document.getElementById('main-app').classList.remove('hidden');
    
    // Cập nhật thông tin người dùng
    document.getElementById('current-user').textContent = currentUser.name;
    document.getElementById('current-role').textContent = currentUser.role;
    
    // Tạo menu theo vai trò
    createNavigationMenu();
    
    // Hiển thị trang mặc định
    showDefaultView();
}

// Tạo menu điều hướng theo vai trò
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

// Hiển thị trang mặc định
function showDefaultView() {
    const defaultView = APP_CONFIG.getMenuForRole(currentUser.role)[0].id;
    switchView(defaultView);
}

// Chuyển view
function switchView(viewId) {
    currentView = viewId;
    
    // Cập nhật active menu
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.getElementById(`nav-${viewId}`).classList.add('active');
    
    // Hiển thị nội dung tương ứng
    const contentArea = document.getElementById('content-area');
    
    switch(viewId) {
        case 'dashboard':
            contentArea.innerHTML = renderAdminDashboard();
            break;
        case 'book-room':
            contentArea.innerHTML = renderBookRoom();
            break;
        case 'check-in':
            contentArea.innerHTML = renderCheckIn();
            break;
        case 'order-service':
            contentArea.innerHTML = renderOrderService();
            break;
        case 'check-out':
            contentArea.innerHTML = renderCheckOut();
            break;
        case 'room-management':
            contentArea.innerHTML = renderRoomManagement();
            break;
        case 'check-in-process':
            contentArea.innerHTML = renderCheckInProcess();
            break;
        case 'check-out-process':
            contentArea.innerHTML = renderCheckOutProcess();
            break;
        case 'qr-generator':
            contentArea.innerHTML = renderQRGenerator();
            break;
        case 'customer-management':
            contentArea.innerHTML = renderCustomerManagement();
            break;
        case 'staff-management':
            contentArea.innerHTML = renderStaffManagement();
            break;
        case 'reports':
            contentArea.innerHTML = renderReports();
            break;
        case 'service-management':
            contentArea.innerHTML = renderServiceManagement();
            break;
        case 'revenue-analysis':
            contentArea.innerHTML = renderRevenueAnalysis();
            break;
        case 'my-bookings':
            contentArea.innerHTML = renderMyBookings();
            break;
        default:
            contentArea.innerHTML = `<div class="welcome-message">
                <h1>Chào mừng ${currentUser.name}</h1>
                <p>Vai trò: ${currentUser.role}</p>
                <p>Vui lòng chọn một chức năng từ menu để bắt đầu</p>
            </div>`;
    }
}

// Xử lý đăng xuất
function handleLogout() {
    currentUser = null;
    currentView = 'welcome';
    
    // Ẩn ứng dụng chính
    document.getElementById('main-app').classList.add('hidden');
    
    // Hiển thị lại màn hình splash
    document.getElementById('splash-screen').classList.remove('hidden');
    
    // Reset form đăng nhập
    document.getElementById('login-form').reset();
}

// Màn hình khởi động
function startSplashScreen() {
    // Tự động ẩn sau 5 giây nếu không có tương tác
    setTimeout(() => {
        if (!currentUser) {
            document.getElementById('splash-screen').classList.add('hidden');
        }
    }, 5000);
}

// ========== RENDER FUNCTIONS ==========

// Render trang đặt phòng (CUSTOMER)
function renderBookRoom() {
    const availableRooms = appData.rooms.filter(room => room.status === 'available');
    
    return `
        <div class="room-booking">
            <h2 class="section-title"><i class="fas fa-bed"></i> Đặt phòng khách sạn</h2>
            
            <div class="form-row">
                <div class="form-control">
                    <label for="checkin-date"><i class="fas fa-calendar-check"></i> Ngày nhận phòng</label>
                    <input type="date" id="checkin-date" value="${new Date().toISOString().split('T')[0]}">
                </div>
                <div class="form-control">
                    <label for="checkout-date"><i class="fas fa-calendar-times"></i> Ngày trả phòng</label>
                    <input type="date" id="checkout-date" value="${new Date(Date.now() + 86400000).toISOString().split('T')[0]}">
                </div>
                <div class="form-control">
                    <label for="room-type"><i class="fas fa-door-closed"></i> Loại phòng</label>
                    <select id="room-type">
                        <option value="">Tất cả loại phòng</option>
                        ${Object.entries(APP_CONFIG.hotel.roomTypes).map(([key, type]) => 
                            `<option value="${key}">${type.name} - ${type.price.toLocaleString()}đ/đêm</option>`
                        ).join('')}
                    </select>
                </div>
            </div>
            
            <button class="btn btn-primary" onclick="searchAvailableRooms()">
                <i class="fas fa-search"></i> Tìm phòng trống
            </button>
            
            <div id="available-rooms-list" class="rooms-container" style="margin-top: 2rem;">
                ${availableRooms.slice(0, 12).map(room => `
                    <div class="room available" onclick="selectRoom(${room.number})">
                        <div class="room-number">${room.number}</div>
                        <div class="room-type">${room.typeName}</div>
                        <div class="room-price">${room.price.toLocaleString()}đ/đêm</div>
                        <div class="room-status status-available">Còn trống</div>
                    </div>
                `).join('')}
            </div>
            
            <div id="booking-form" class="hidden" style="margin-top: 2rem; padding: 1.5rem; background-color: #f9f9f9; border-radius: 8px;">
                <h3><i class="fas fa-user-check"></i> Thông tin đặt phòng</h3>
                <div class="form-row">
                    <div class="form-control">
                        <label for="customer-name">Họ tên</label>
                        <input type="text" id="customer-name" placeholder="Nhập họ tên">
                    </div>
                    <div class="form-control">
                        <label for="customer-phone">Số điện thoại</label>
                        <input type="tel" id="customer-phone" placeholder="Nhập số điện thoại">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-control">
                        <label for="customer-email">Email</label>
                        <input type="email" id="customer-email" placeholder="Nhập email">
                    </div>
                    <div class="form-control">
                        <label for="guest-count">Số lượng khách</label>
                        <select id="guest-count">
                            <option value="1">1 khách</option>
                            <option value="2">2 khách</option>
                            <option value="3">3 khách</option>
                            <option value="4">4 khách</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-control">
                        <label for="special-requests">Yêu cầu đặc biệt</label>
                        <textarea id="special-requests" rows="3" placeholder="Ghi chú thêm..."></textarea>
                    </div>
                </div>
                <button class="btn btn-success" onclick="confirmBooking()">
                    <i class="fas fa-check"></i> Xác nhận đặt phòng
                </button>
            </div>
        </div>
    `;
}

// Render trang gọi món (CUSTOMER)
function renderOrderService() {
    const services = APP_CONFIG.hotel.services;
    
    return `
        <div class="service-ordering">
            <h2 class="section-title"><i class="fas fa-utensils"></i> Gọi món tại phòng</h2>
            
            <div class="form-row">
                <div class="form-control">
                    <label for="order-room"><i class="fas fa-door-closed"></i> Số phòng</label>
                    <input type="number" id="order-room" placeholder="Nhập số phòng của bạn" min="101" max="723">
                </div>
                <div class="form-control">
                    <label for="order-name"><i class="fas fa-user"></i> Tên khách hàng</label>
                    <input type="text" id="order-name" placeholder="Nhập tên của bạn">
                </div>
            </div>
            
            <div class="service-categories">
                <div class="category">
                    <h3><i class="fas fa-utensil-spoon"></i> Món ăn</h3>
                    <div class="items-list">
                        ${services.foods.map(item => `
                            <div class="service-item">
                                <div class="item-info">
                                    <h4>${item.name}</h4>
                                    <p class="item-price">${item.price.toLocaleString()}đ</p>
                                </div>
                                <div class="item-controls">
                                    <button class="btn btn-secondary" onclick="decreaseQuantity('food-${item.id}')">-</button>
                                    <span id="food-${item.id}-qty" class="item-quantity">0</span>
                                    <button class="btn btn-secondary" onclick="increaseQuantity('food-${item.id}')">+</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="category">
                    <h3><i class="fas fa-glass-cheers"></i> Đồ uống</h3>
                    <div class="items-list">
                        ${services.drinks.map(item => `
                            <div class="service-item">
                                <div class="item-info">
                                    <h4>${item.name}</h4>
                                    <p class="item-price">${item.price.toLocaleString()}đ</p>
                                </div>
                                <div class="item-controls">
                                    <button class="btn btn-secondary" onclick="decreaseQuantity('drink-${item.id}')">-</button>
                                    <span id="drink-${item.id}-qty" class="item-quantity">0</span>
                                    <button class="btn btn-secondary" onclick="increaseQuantity('drink-${item.id}')">+</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="category">
                    <h3><i class="fas fa-ice-cream"></i> Tráng miệng</h3>
                    <div class="items-list">
                        ${services.desserts.map(item => `
                            <div class="service-item">
                                <div class="item-info">
                                    <h4>${item.name}</h4>
                                    <p class="item-price">${item.price.toLocaleString()}đ</p>
                                </div>
                                <div class="item-controls">
                                    <button class="btn btn-secondary" onclick="decreaseQuantity('dessert-${item.id}')">-</button>
                                    <span id="dessert-${item.id}-qty" class="item-quantity">0</span>
                                    <button class="btn btn-secondary" onclick="increaseQuantity('dessert-${item.id}')">+</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            
            <div class="order-summary">
                <h3><i class="fas fa-receipt"></i> Tóm tắt đơn hàng</h3>
                <div id="order-items-list"></div>
                <div class="order-total">
                    <strong>Tổng cộng:</strong> <span id="order-total-amount">0</span>đ
                </div>
                <button class="btn btn-success" onclick="placeOrder()" style="margin-top: 1rem;">
                    <i class="fas fa-paper-plane"></i> Gửi đơn đặt hàng
                </button>
            </div>
        </div>
        
        <style>
            .service-categories {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 1.5rem;
                margin-top: 1.5rem;
            }
            
            .category {
                background-color: #f9f9f9;
                padding: 1.5rem;
                border-radius: 8px;
            }
            
            .service-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 0;
                border-bottom: 1px solid #eee;
            }
            
            .item-quantity {
                margin: 0 10px;
                font-weight: bold;
                min-width: 30px;
                text-align: center;
            }
            
            .order-summary {
                margin-top: 2rem;
                padding: 1.5rem;
                background-color: #f0f5ff;
                border-radius: 8px;
            }
            
            .order-total {
                text-align: right;
                font-size: 1.2rem;
                margin-top: 1rem;
                padding-top: 1rem;
                border-top: 2px solid #ddd;
            }
        </style>
    `;
}

// Render trang quản lý phòng (STAFF)
function renderRoomManagement() {
    // Nhóm phòng theo tầng
    const roomsByFloor = {};
    appData.rooms.forEach(room => {
        if (!roomsByFloor[room.floor]) {
            roomsByFloor[room.floor] = [];
        }
        roomsByFloor[room.floor].push(room);
    });
    
    let floorsHTML = '';
    for (let floor = 1; floor <= APP_CONFIG.hotel.floors; floor++) {
        const floorRooms = roomsByFloor[floor] || [];
        
        floorsHTML += `
            <div class="floor-plan">
                <div class="floor-header">
                    <div class="floor-title">Tầng ${floor}</div>
                    <div class="floor-stats">
                        <span style="color: #4CAF50;">${floorRooms.filter(r => r.status === 'available').length} trống</span> | 
                        <span style="color: #f44336;">${floorRooms.filter(r => r.status === 'occupied').length} có khách</span> | 
                        <span style="color: #FF9800;">${floorRooms.filter(r => r.status === 'reserved').length} đã đặt</span>
                    </div>
                </div>
                <div class="rooms-container">
                    ${floorRooms.map(room => `
                        <div class="room ${room.status}" onclick="showRoomDetails(${room.number})">
                            <div class="room-number">${room.number}</div>
                            <div class="room-type">${room.typeName}</div>
                            <div class="room-status status-${room.status}">
                                ${room.status === 'available' ? 'Còn trống' : 
                                  room.status === 'occupied' ? 'Đã thuê' : 'Đã đặt'}
                            </div>
                            ${room.customer ? `<div class="room-customer">${room.customer}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    return `
        <div class="room-management">
            <h2 class="section-title"><i class="fas fa-door-closed"></i> Quản lý phòng</h2>
            
            <div class="controls" style="margin-bottom: 2rem;">
                <div class="form-row">
                    <div class="form-control">
                        <label for="filter-floor">Lọc theo tầng</label>
                        <select id="filter-floor" onchange="filterRoomsByFloor()">
                            <option value="all">Tất cả tầng</option>
                            ${Array.from({length: APP_CONFIG.hotel.floors}, (_, i) => 
                                `<option value="${i+1}">Tầng ${i+1}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="form-control">
                        <label for="filter-status">Lọc theo trạng thái</label>
                        <select id="filter-status" onchange="filterRoomsByStatus()">
                            <option value="all">Tất cả trạng thái</option>
                            <option value="available">Còn trống</option>
                            <option value="occupied">Đã thuê</option>
                            <option value="reserved">Đã đặt</option>
                        </select>
                    </div>
                    <div class="form-control">
                        <label for="filter-type">Lọc theo loại phòng</label>
                        <select id="filter-type" onchange="filterRoomsByType()">
                            <option value="all">Tất cả loại phòng</option>
                            ${Object.entries(APP_CONFIG.hotel.roomTypes).map(([key, type]) => 
                                `<option value="${key}">${type.name}</option>`
                            ).join('')}
                        </select>
                    </div>
                </div>
            </div>
            
            ${floorsHTML}
        </div>
    `;
}

// Render trang xuất bill và QR (STAFF)
function renderCheckOutProcess() {
    return `
        <div class="checkout-process">
            <h2 class="section-title"><i class="fas fa-file-invoice-dollar"></i> Check-out & Xuất hóa đơn</h2>
            
            <div class="form-row">
                <div class="form-control">
                    <label for="checkout-room"><i class="fas fa-door-closed"></i> Số phòng</label>
                    <input type="number" id="checkout-room" placeholder="Nhập số phòng" min="101" max="723">
                </div>
                <div class="form-control">
                    <button class="btn btn-primary" onclick="loadRoomBill()" style="margin-top: 1.5rem;">
                        <i class="fas fa-search"></i> Tìm thông tin
                    </button>
                </div>
            </div>
            
            <div id="bill-details" class="hidden" style="margin-top: 2rem;">
                <div class="bill-header" style="text-align: center; margin-bottom: 2rem;">
                    <h2>HÓA ĐƠN THANH TOÁN</h2>
                    <h3>Sunshine Hotel</h3>
                    <p>Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}</p>
                </div>
                
                <div class="bill-info">
                    <div class="form-row">
                        <div class="form-control">
                            <strong>Số phòng:</strong> <span id="bill-room-number">-</span>
                        </div>
                        <div class="form-control">
                            <strong>Loại phòng:</strong> <span id="bill-room-type">-</span>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-control">
                            <strong>Khách hàng:</strong> <span id="bill-customer">-</span>
                        </div>
                        <div class="form-control">
                            <strong>Số điện thoại:</strong> <span id="bill-phone">-</span>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-control">
                            <strong>Ngày nhận phòng:</strong> <span id="bill-checkin">-</span>
                        </div>
                        <div class="form-control">
                            <strong>Ngày trả phòng:</strong> <span id="bill-checkout">-</span>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-control">
                            <strong>Số ngày thuê:</strong> <span id="bill-days">-</span>
                        </div>
                        <div class="form-control">
                            <strong>Đơn giá phòng:</strong> <span id="bill-room-price">-</span>
                        </div>
                    </div>
                </div>
                
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Dịch vụ</th>
                                <th>Số lượng</th>
                                <th>Đơn giá</th>
                                <th>Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody id="bill-services">
                            <!-- Dữ liệu dịch vụ sẽ được thêm ở đây -->
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="4" style="text-align: right;"><strong>Tổng tiền phòng:</strong></td>
                                <td id="bill-room-total">0đ</td>
                            </tr>
                            <tr>
                                <td colspan="4" style="text-align: right;"><strong>Tổng tiền dịch vụ:</strong></td>
                                <td id="bill-services-total">0đ</td>
                            </tr>
                            <tr style="background-color: #f0f5ff;">
                                <td colspan="4" style="text-align: right;"><strong>TỔNG CỘNG:</strong></td>
                                <td id="bill-grand-total" style="font-weight: bold; font-size: 1.2rem;">0đ</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                
                <div class="qr-container">
                    <h3><i class="fas fa-qrcode"></i> Mã QR thanh toán</h3>
                    <p>Quét mã QR để thanh toán qua VietQR</p>
                    <div class="qr-code" id="qr-code-display">
                        <div style="text-align: center;">
                            <div style="font-size: 3rem; margin-bottom: 10px;">QR</div>
                            <div>VietQR</div>
                        </div>
                    </div>
                    <p id="qr-content">Nội dung QR: Đang tải...</p>
                    <button class="btn btn-success" onclick="generateQRCode()">
                        <i class="fas fa-sync-alt"></i> Tạo mã QR mới
                    </button>
                    <button class="btn btn-primary" onclick="printBill()" style="margin-left: 10px;">
                        <i class="fas fa-print"></i> In hóa đơn
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Render trang dashboard (ADMIN)
function renderAdminDashboard() {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const todayBookings = appData.bookings.filter(b => {
        const checkIn = new Date(b.checkInDate).toISOString().split('T')[0];
        return checkIn === todayStr;
    });
    
    const occupiedRooms = appData.rooms.filter(r => r.status === 'occupied').length;
    const availableRooms = appData.rooms.filter(r => r.status === 'available').length;
    
    let totalRevenue = 0;
    appData.bookings.forEach(b => {
        if (b.status === 'completed') {
            totalRevenue += b.totalAmount;
        }
    });
    
    // Tính doanh thu hôm nay
    const todayRevenue = todayBookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
    
    return `
        <div class="admin-dashboard">
            <h2 class="section-title"><i class="fas fa-tachometer-alt"></i> Tổng quan hệ thống</h2>
            
            <div class="dashboard-stats">
                <div class="stat-card" style="background-color: #e3f2fd;">
                    <div class="stat-icon">
                        <i class="fas fa-users" style="color: #2196f3;"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${appData.customers.length}</h3>
                        <p>Tổng khách hàng</p>
                    </div>
                </div>
                
                <div class="stat-card" style="background-color: #e8f5e9;">
                    <div class="stat-icon">
                        <i class="fas fa-bed" style="color: #4caf50;"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${occupiedRooms}/${appData.rooms.length}</h3>
                        <p>Phòng đã thuê</p>
                    </div>
                </div>
                
                <div class="stat-card" style="background-color: #fff3e0;">
                    <div class="stat-icon">
                        <i class="fas fa-calendar-check" style="color: #ff9800;"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${todayBookings.length}</h3>
                        <p>Đặt phòng hôm nay</p>
                    </div>
                </div>
                
                <div class="stat-card" style="background-color: #fce4ec;">
                    <div class="stat-icon">
                        <i class="fas fa-money-bill-wave" style="color: #e91e63;"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${todayRevenue.toLocaleString()}đ</h3>
                        <p>Doanh thu hôm nay</p>
                    </div>
                </div>
            </div>
            
            <div class="dashboard-content">
                <div class="dashboard-section">
                    <h3><i class="fas fa-chart-line"></i> Thống kê nhanh</h3>
                    <div class="form-row">
                        <div class="form-control">
                            <label for="report-date">Xem báo cáo theo ngày</label>
                            <input type="date" id="report-date" value="${todayStr}">
                        </div>
                        <div class="form-control">
                            <button class="btn btn-primary" onclick="loadDailyReport()" style="margin-top: 1.5rem;">
                                <i class="fas fa-chart-bar"></i> Xem báo cáo
                            </button>
                        </div>
                    </div>
                    
                    <div id="daily-report" style="margin-top: 1.5rem;">
                        <div class="table-container">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Chỉ số</th>
                                        <th>Giá trị</th>
                                        <th>Chi tiết</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Tổng số phòng trống</td>
                                        <td>${availableRooms}</td>
                                        <td>${(availableRooms/appData.rooms.length*100).toFixed(1)}% tổng phòng</td>
                                    </tr>
                                    <tr>
                                        <td>Doanh thu hôm nay</td>
                                        <td>${todayRevenue.toLocaleString()}đ</td>
                                        <td>${todayBookings.length} đơn hàng</td>
                                    </tr>
                                    <tr>
                                        <td>Tổng doanh thu</td>
                                        <td>${totalRevenue.toLocaleString()}đ</td>
                                        <td>${appData.bookings.length} lượt đặt phòng</td>
                                    </tr>
                                    <tr>
                                        <td>Tổng nhân viên</td>
                                        <td>${appData.staff.length}</td>
                                        <td>${appData.staff.filter(s => s.position === 'Quản lý').length} quản lý</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                <div class="dashboard-section">
                    <h3><i class="fas fa-history"></i> Đặt phòng gần đây</h3>
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Mã đặt</th>
                                    <th>Khách hàng</th>
                                    <th>Số phòng</th>
                                    <th>Ngày nhận</th>
                                    <th>Ngày trả</th>
                                    <th>Tổng tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${appData.bookings.slice(0, 5).map(booking => `
                                    <tr>
                                        <td>#${booking.id}</td>
                                        <td>${booking.customerName}</td>
                                        <td>${booking.roomNumber}</td>
                                        <td>${new Date(booking.checkInDate).toLocaleDateString('vi-VN')}</td>
                                        <td>${new Date(booking.checkOutDate).toLocaleDateString('vi-VN')}</td>
                                        <td>${booking.totalAmount.toLocaleString()}đ</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        
        <style>
            .dashboard-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1.5rem;
                margin-bottom: 2rem;
            }
            
            .stat-card {
                padding: 1.5rem;
                border-radius: 10px;
                display: flex;
                align-items: center;
                gap: 1rem;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            
            .stat-icon {
                font-size: 2.5rem;
            }
            
            .stat-info h3 {
                font-size: 2rem;
                margin-bottom: 0.5rem;
            }
            
            .dashboard-content {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                gap: 2rem;
            }
            
            .dashboard-section {
                background-color: white;
                padding: 1.5rem;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            }
        </style>
    `;
}

// Render trang quản lý khách hàng (ADMIN)
function renderCustomerManagement() {
    return `
        <div class="customer-management">
            <h2 class="section-title"><i class="fas fa-users"></i> Quản lý khách hàng</h2>
            
            <div class="controls" style="margin-bottom: 2rem;">
                <div class="form-row">
                    <div class="form-control">
                        <label for="search-customer">Tìm kiếm khách hàng</label>
                        <input type="text" id="search-customer" placeholder="Nhập tên, email hoặc số điện thoại">
                    </div>
                    <div class="form-control">
                        <button class="btn btn-primary" onclick="searchCustomers()" style="margin-top: 1.5rem;">
                            <i class="fas fa-search"></i> Tìm kiếm
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Họ tên</th>
                            <th>Số điện thoại</th>
                            <th>Email</th>
                            <th>Số lần đặt phòng</th>
                            <th>Lần đặt cuối</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody id="customers-list">
                        ${appData.customers.map(customer => `
                            <tr>
                                <td>${customer.id}</td>
                                <td>${customer.name}</td>
                                <td>${customer.phone}</td>
                                <td>${customer.email}</td>
                                <td>${customer.totalBookings}</td>
                                <td>${customer.lastBooking ? new Date(customer.lastBooking).toLocaleDateString('vi-VN') : 'Chưa có'}</td>
                                <td>
                                    <button class="btn btn-secondary" onclick="viewCustomerDetails(${customer.id})">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// Render trang phân tích doanh thu (ADMIN)
function renderRevenueAnalysis() {
    return `
        <div class="revenue-analysis">
            <h2 class="section-title"><i class="fas fa-chart-pie"></i> Phân tích doanh thu</h2>
            
            <div class="form-row">
                <div class="form-control">
                    <label for="date-from">Từ ngày</label>
                    <input type="date" id="date-from" value="${new Date(Date.now() - 30*86400000).toISOString().split('T')[0]}">
                </div>
                <div class="form-control">
                    <label for="date-to">Đến ngày</label>
                    <input type="date" id="date-to" value="${new Date().toISOString().split('T')[0]}">
                </div>
                <div class="form-control">
                    <button class="btn btn-primary" onclick="analyzeRevenue()" style="margin-top: 1.5rem;">
                        <i class="fas fa-chart-line"></i> Phân tích
                    </button>
                </div>
            </div>
            
            <div id="revenue-results" style="margin-top: 2rem;">
                <div class="revenue-cards">
                    <div class="revenue-card">
                        <h3>Doanh thu phòng</h3>
                        <div class="revenue-amount">12,500,000đ</div>
                        <div class="revenue-change positive">+12% so với kỳ trước</div>
                    </div>
                    
                    <div class="revenue-card">
                        <h3>Doanh thu dịch vụ</h3>
                        <div class="revenue-amount">3,200,000đ</div>
                        <div class="revenue-change positive">+8% so với kỳ trước</div>
                    </div>
                    
                    <div class="revenue-card">
                        <h3>Tổng doanh thu</h3>
                        <div class="revenue-amount">15,700,000đ</div>
                        <div class="revenue-change positive">+11% so với kỳ trước</div>
                    </div>
                </div>
                
                <div class="revenue-chart" style="margin-top: 2rem; padding: 1.5rem; background-color: #f9f9f9; border-radius: 8px; text-align: center;">
                    <h3>Biểu đồ doanh thu theo loại phòng</h3>
                    <div style="height: 300px; display: flex; align-items: flex-end; justify-content: center; gap: 2rem; margin-top: 2rem;">
                        <div class="chart-bar" style="height: 60%; background-color: #3a7bd5; width: 80px;">
                            <div class="chart-label">Tiêu chuẩn</div>
                            <div class="chart-value">6.2M</div>
                        </div>
                        <div class="chart-bar" style="height: 80%; background-color: #00d2ff; width: 80px;">
                            <div class="chart-label">Deluxe</div>
                            <div class="chart-value">8.1M</div>
                        </div>
                        <div class="chart-bar" style="height: 40%; background-color: #FFD700; width: 80px;">
                            <div class="chart-label">Suite</div>
                            <div class="chart-value">4.3M</div>
                        </div>
                        <div class="chart-bar" style="height: 30%; background-color: #1a2a6c; width: 80px;">
                            <div class="chart-label">Tổng thống</div>
                            <div class="chart-value">2.9M</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <style>
            .revenue-cards {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 1.5rem;
            }
            
            .revenue-card {
                background-color: white;
                padding: 1.5rem;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                text-align: center;
            }
            
            .revenue-amount {
                font-size: 2rem;
                font-weight: bold;
                margin: 1rem 0;
                color: #1a2a6c;
            }
            
            .revenue-change.positive {
                color: #4CAF50;
            }
            
            .chart-bar {
                display: flex;
                flex-direction: column;
                justify-content: flex-end;
                align-items: center;
                border-radius: 5px 5px 0 0;
                position: relative;
            }
            
            .chart-label {
                margin-top: 10px;
                font-weight: bold;
            }
            
            .chart-value {
                position: absolute;
                top: -25px;
                font-weight: bold;
            }
        </style>
    `;
}

// Các hàm render khác (vì giới hạn độ dài, tôi chỉ hiển thị một số hàm chính)
function renderCheckIn() {
    return `<h2>Trang Check-in (CUSTOMER)</h2><p>Chức năng đang được phát triển...</p>`;
}

function renderCheckOut() {
    return `<h2>Trang Check-out (CUSTOMER)</h2><p>Chức năng đang được phát triển...</p>`;
}

function renderCheckInProcess() {
    return `<h2>Trang Check-in Process (STAFF)</h2><p>Chức năng đang được phát triển...</p>`;
}

function renderQRGenerator() {
    return `<h2>Trang QR Generator (STAFF)</h2><p>Chức năng đang được phát triển...</p>`;
}

function renderStaffManagement() {
    return `<h2>Trang Quản lý nhân viên (ADMIN)</h2><p>Chức năng đang được phát triển...</p>`;
}

function renderReports() {
    return `<h2>Trang Báo cáo (ADMIN)</h2><p>Chức năng đang được phát triển...</p>`;
}

function renderServiceManagement() {
    return `<h2>Trang Quản lý dịch vụ (ADMIN)</h2><p>Chức năng đang được phát triển...</p>`;
}

function renderMyBookings() {
    return `<h2>Trang Đặt phòng của tôi (CUSTOMER)</h2><p>Chức năng đang được phát triển...</p>`;
}

// ========== UTILITY FUNCTIONS ==========

// Các hàm tiện ích cho ứng dụng
function searchAvailableRooms() {
    alert('Tìm kiếm phòng trống...');
    // Logic tìm phòng trống dựa trên ngày và loại phòng
}

function selectRoom(roomNumber) {
    document.getElementById('booking-form').classList.remove('hidden');
    alert(`Bạn đã chọn phòng ${roomNumber}`);
}

function confirmBooking() {
    alert('Đặt phòng thành công!');
    switchView('my-bookings');
}

function increaseQuantity(itemId) {
    const qtyElement = document.getElementById(`${itemId}-qty`);
    let qty = parseInt(qtyElement.textContent);
    qtyElement.textContent = qty + 1;
    updateOrderSummary();
}

function decreaseQuantity(itemId) {
    const qtyElement = document.getElementById(`${itemId}-qty`);
    let qty = parseInt(qtyElement.textContent);
    if (qty > 0) {
        qtyElement.textContent = qty - 1;
        updateOrderSummary();
    }
}

function updateOrderSummary() {
    // Logic cập nhật tổng đơn hàng
}

function placeOrder() {
    alert('Đơn hàng đã được gửi thành công!');
}

function loadRoomBill() {
    document.getElementById('bill-details').classList.remove('hidden');
    // Logic tải thông tin bill
}

function generateQRCode() {
    alert('Mã QR đã được tạo!');
}

function printBill() {
    alert('In hóa đơn...');
}

function filterRoomsByFloor() {
    alert('Lọc phòng theo tầng...');
}

function filterRoomsByStatus() {
    alert('Lọc phòng theo trạng thái...');
}

function filterRoomsByType() {
    alert('Lọc phòng theo loại...');
}

function showRoomDetails(roomNumber) {
    alert(`Chi tiết phòng ${roomNumber}`);
}

function loadDailyReport() {
    alert('Đang tải báo cáo...');
}

function searchCustomers() {
    alert('Đang tìm kiếm khách hàng...');
}

function viewCustomerDetails(customerId) {
    alert(`Xem chi tiết khách hàng ID: ${customerId}`);
}

function analyzeRevenue() {
    alert('Đang phân tích doanh thu...');
}
