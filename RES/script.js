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
    bills: [],
    qrCodes: []
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
    
    // Tạo dữ liệu đơn hàng dịch vụ
    appData.orders = initializeOrders();
    
    // Tạo dữ liệu hóa đơn
    appData.bills = initializeBills();
    
    // Tạo dữ liệu QR codes
    appData.qrCodes = initializeQRCodes();
}

// Khởi tạo dữ liệu đơn hàng dịch vụ
function initializeOrders() {
    const orders = [];
    const services = [
        ...APP_CONFIG.hotel.services.foods,
        ...APP_CONFIG.hotel.services.drinks,
        ...APP_CONFIG.hotel.services.desserts
    ];
    
    const statuses = ['pending', 'processing', 'completed', 'cancelled'];
    
    for (let i = 1; i <= 100; i++) {
        const room = appData.rooms[Math.floor(Math.random() * appData.rooms.length)];
        const orderDate = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000);
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        // Tạo các món ngẫu nhiên cho đơn hàng
        const orderItems = [];
        const numItems = Math.floor(Math.random() * 5) + 1;
        let totalAmount = 0;
        
        for (let j = 0; j < numItems; j++) {
            const service = services[Math.floor(Math.random() * services.length)];
            const quantity = Math.floor(Math.random() * 3) + 1;
            const itemTotal = service.price * quantity;
            
            orderItems.push({
                id: service.id,
                name: service.name,
                category: service.category,
                price: service.price,
                quantity: quantity,
                total: itemTotal
            });
            
            totalAmount += itemTotal;
        }
        
        orders.push({
            id: i,
            roomNumber: room.number,
            customerName: `Khách hàng ${Math.floor(Math.random() * 100)}`,
            orderDate: orderDate,
            deliveryDate: status === 'completed' ? 
                new Date(orderDate.getTime() + 30 * 60 * 1000) : null,
            items: orderItems,
            totalAmount: totalAmount,
            status: status,
            notes: Math.random() > 0.7 ? 'Yêu cầu đặc biệt' : '',
            staffName: ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C'][Math.floor(Math.random() * 3)]
        });
    }
    
    return orders;
}

// Khởi tạo dữ liệu hóa đơn
function initializeBills() {
    const bills = [];
    
    for (let i = 1; i <= 30; i++) {
        const booking = appData.bookings[Math.floor(Math.random() * appData.bookings.length)];
        const billDate = new Date(booking.checkInDate);
        billDate.setDate(billDate.getDate() + Math.floor(Math.random() * 10));
        
        const room = appData.rooms.find(r => r.number === booking.roomNumber) || appData.rooms[0];
        const days = Math.ceil((new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / (1000 * 60 * 60 * 24));
        
        // Lấy dịch vụ cho phòng này
        const roomOrders = appData.orders.filter(o => o.roomNumber === booking.roomNumber && o.status === 'completed');
        let serviceTotal = 0;
        let serviceItems = [];
        
        roomOrders.forEach(order => {
            serviceTotal += order.totalAmount;
            order.items.forEach(item => {
                serviceItems.push({
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    total: item.total
                });
            });
        });
        
        const roomTotal = room.price * days;
        const totalAmount = roomTotal + serviceTotal;
        
        bills.push({
            id: i,
            billNumber: `HD${1000 + i}`,
            bookingId: booking.id,
            roomNumber: booking.roomNumber,
            customerName: booking.customerName,
            customerId: booking.customerId,
            checkInDate: booking.checkInDate,
            checkOutDate: booking.checkOutDate,
            actualCheckOutDate: billDate,
            days: days,
            roomType: booking.roomTypeName,
            roomPrice: room.price,
            roomTotal: roomTotal,
            services: serviceItems,
            serviceTotal: serviceTotal,
            totalAmount: totalAmount,
            paymentMethod: booking.paymentMethod,
            status: 'paid',
            staffName: booking.staffName,
            createdDate: billDate,
            qrCodeId: i
        });
    }
    
    return bills;
}

// Khởi tạo dữ liệu QR codes
function initializeQRCodes() {
    const qrCodes = [];
    
    appData.bills.forEach(bill => {
        qrCodes.push({
            id: bill.id,
            billId: bill.id,
            roomNumber: bill.roomNumber,
            customerName: bill.customerName,
            totalAmount: bill.totalAmount,
            checkOutDate: bill.actualCheckOutDate,
            createdDate: bill.createdDate,
            content: `Số phòng: ${bill.roomNumber}|Loại phòng: ${bill.roomType}|Số ngày: ${bill.days}|Ngày trả: ${new Date(bill.actualCheckOutDate).toLocaleDateString('vi-VN')}|Tổng tiền: ${bill.totalAmount} VND`,
            staffName: bill.staffName
        });
    });
    
    return qrCodes;
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
        case 'room-management':
            contentArea.innerHTML = renderRoomManagement();
            break;
        case 'check-in-process':
            contentArea.innerHTML = renderCheckInProcess();
            break;
        case 'service-orders':
            contentArea.innerHTML = renderServiceOrders();
            break;
        case 'check-out-process':
            contentArea.innerHTML = renderCheckOutProcess();
            break;
        case 'qr-generator':
            contentArea.innerHTML = renderQRGenerator();
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
        case 'bill-history':
            contentArea.innerHTML = renderBillHistory();
            break;
        case 'service-analytics':
            contentArea.innerHTML = renderServiceAnalytics();
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

// Render trang quản lý phòng (STAFF/ADMIN) - CHỈ HIỂN THỊ, KHÔNG LỌC
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
                        <div class="room ${room.status}" data-room="${room.number}">
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
            <p>Hiển thị tất cả phòng theo từng tầng</p>
            
            ${floorsHTML}
        </div>
    `;
}

// Render trang check-in khách (STAFF)
function renderCheckInProcess() {
    return `
        <div class="checkin-process">
            <h2 class="section-title"><i class="fas fa-user-check"></i> Check-in khách hàng</h2>
            
            <div class="form-container">
                <div class="form-row">
                    <div class="form-control">
                        <label for="checkin-room"><i class="fas fa-door-closed"></i> Số phòng</label>
                        <select id="checkin-room">
                            <option value="">-- Chọn phòng --</option>
                            ${appData.rooms
                                .filter(room => room.status === 'available' || room.status === 'reserved')
                                .map(room => `
                                    <option value="${room.number}">${room.number} - ${room.typeName} (${room.status === 'available' ? 'Trống' : 'Đã đặt'})</option>
                                `).join('')}
                        </select>
                    </div>
                    <div class="form-control">
                        <label for="checkin-customer-name"><i class="fas fa-user"></i> Họ tên khách hàng</label>
                        <input type="text" id="checkin-customer-name" placeholder="Nhập họ tên">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-control">
                        <label for="checkin-customer-id"><i class="fas fa-id-card"></i> CMND/CCCD</label>
                        <input type="text" id="checkin-customer-id" placeholder="Nhập số CMND/CCCD">
                    </div>
                    <div class="form-control">
                        <label for="checkin-customer-phone"><i class="fas fa-phone"></i> Số điện thoại</label>
                        <input type="tel" id="checkin-customer-phone" placeholder="Nhập số điện thoại">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-control">
                        <label for="checkin-date"><i class="fas fa-calendar-check"></i> Ngày nhận phòng</label>
                        <input type="date" id="checkin-date" value="${new Date().toISOString().split('T')[0]}">
                    </div>
                    <div class="form-control">
                        <label for="checkout-date"><i class="fas fa-calendar-times"></i> Ngày trả phòng dự kiến</label>
                        <input type="date" id="checkout-date" value="${new Date(Date.now() + 86400000).toISOString().split('T')[0]}">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-control">
                        <label for="checkin-guests"><i class="fas fa-users"></i> Số lượng khách</label>
                        <select id="checkin-guests">
                            <option value="1">1 khách</option>
                            <option value="2">2 khách</option>
                            <option value="3">3 khách</option>
                            <option value="4">4 khách</option>
                            <option value="5">5 khách trở lên</option>
                        </select>
                    </div>
                    <div class="form-control">
                        <label for="checkin-payment-method"><i class="fas fa-credit-card"></i> Phương thức thanh toán</label>
                        <select id="checkin-payment-method">
                            <option value="cash">Tiền mặt</option>
                            <option value="banking">Chuyển khoản</option>
                            <option value="credit">Thẻ tín dụng</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-control full-width">
                        <label for="checkin-notes"><i class="fas fa-sticky-note"></i> Ghi chú</label>
                        <textarea id="checkin-notes" rows="3" placeholder="Ghi chú thêm..."></textarea>
                    </div>
                </div>
                
                <div class="form-actions" style="margin-top: 2rem;">
                    <button class="btn btn-success" onclick="processCheckIn()">
                        <i class="fas fa-check"></i> Xác nhận Check-in
                    </button>
                    <button class="btn btn-secondary" onclick="clearCheckInForm()">
                        <i class="fas fa-times"></i> Xóa form
                    </button>
                </div>
            </div>
            
            <div id="checkin-result" class="hidden" style="margin-top: 2rem; padding: 1.5rem; background-color: #f0f9f0; border-radius: 8px;">
                <h3><i class="fas fa-check-circle"></i> Check-in thành công!</h3>
                <p id="checkin-success-message"></p>
            </div>
        </div>
    `;
}

// Render trang đơn đặt dịch vụ (STAFF)
function renderServiceOrders() {
    const pendingOrders = appData.orders.filter(o => o.status === 'pending');
    const processingOrders = appData.orders.filter(o => o.status === 'processing');
    
    return `
        <div class="service-orders">
            <h2 class="section-title"><i class="fas fa-concierge-bell"></i> Đơn đặt dịch vụ</h2>
            
            <div class="order-tabs">
                <button class="tab-btn active" onclick="showOrderTab('pending')">Đang chờ (${pendingOrders.length})</button>
                <button class="tab-btn" onclick="showOrderTab('processing')">Đang xử lý (${processingOrders.length})</button>
                <button class="tab-btn" onclick="showOrderTab('new')">Tạo đơn mới</button>
            </div>
            
            <div id="pending-orders-tab" class="order-tab">
                <h3><i class="fas fa-clock"></i> Đơn hàng đang chờ</h3>
                ${pendingOrders.length > 0 ? `
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Mã đơn</th>
                                    <th>Phòng</th>
                                    <th>Khách hàng</th>
                                    <th>Thời gian đặt</th>
                                    <th>Món đặt</th>
                                    <th>Tổng tiền</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${pendingOrders.map(order => `
                                    <tr>
                                        <td>#${order.id}</td>
                                        <td><span class="room-badge">${order.roomNumber}</span></td>
                                        <td>${order.customerName}</td>
                                        <td>${formatDateTime(order.orderDate)}</td>
                                        <td>
                                            <small>
                                                ${order.items.map(item => `${item.name} x${item.quantity}`).join(', ')}
                                            </small>
                                        </td>
                                        <td>${formatCurrency(order.totalAmount)}</td>
                                        <td>
                                            <button class="btn btn-success btn-sm" onclick="processOrder(${order.id})">
                                                <i class="fas fa-play"></i> Xử lý
                                            </button>
                                            <button class="btn btn-danger btn-sm" onclick="cancelOrder(${order.id})">
                                                <i class="fas fa-times"></i> Hủy
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : '<p class="no-data">Không có đơn hàng nào đang chờ</p>'}
            </div>
            
            <div id="processing-orders-tab" class="order-tab hidden">
                <h3><i class="fas fa-cogs"></i> Đơn hàng đang xử lý</h3>
                ${processingOrders.length > 0 ? `
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Mã đơn</th>
                                    <th>Phòng</th>
                                    <th>Khách hàng</th>
                                    <th>Thời gian đặt</th>
                                    <th>Món đặt</th>
                                    <th>Tổng tiền</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${processingOrders.map(order => `
                                    <tr>
                                        <td>#${order.id}</td>
                                        <td><span class="room-badge">${order.roomNumber}</span></td>
                                        <td>${order.customerName}</td>
                                        <td>${formatDateTime(order.orderDate)}</td>
                                        <td>
                                            <small>
                                                ${order.items.map(item => `${item.name} x${item.quantity}`).join(', ')}
                                            </small>
                                        </td>
                                        <td>${formatCurrency(order.totalAmount)}</td>
                                        <td>
                                            <button class="btn btn-success btn-sm" onclick="completeOrder(${order.id})">
                                                <i class="fas fa-check"></i> Hoàn thành
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : '<p class="no-data">Không có đơn hàng nào đang xử lý</p>'}
            </div>
            
            <div id="new-order-tab" class="order-tab hidden">
                <h3><i class="fas fa-plus-circle"></i> Tạo đơn dịch vụ mới</h3>
                
                <div class="form-row">
                    <div class="form-control">
                        <label for="order-room-select"><i class="fas fa-door-closed"></i> Số phòng</label>
                        <select id="order-room-select">
                            <option value="">-- Chọn phòng --</option>
                            ${appData.rooms
                                .filter(room => room.status === 'occupied')
                                .map(room => `
                                    <option value="${room.number}">${room.number} - ${room.customerName}</option>
                                `).join('')}
                        </select>
                    </div>
                    <div class="form-control">
                        <label for="order-customer-name"><i class="fas fa-user"></i> Tên khách hàng</label>
                        <input type="text" id="order-customer-name" placeholder="Tự động điền khi chọn phòng" readonly>
                    </div>
                </div>
                
                <div class="service-selection">
                    <h4>Chọn món</h4>
                    
                    <div class="service-categories">
                        <div class="category">
                            <h5><i class="fas fa-utensil-spoon"></i> Món ăn</h5>
                            <div class="items-grid">
                                ${APP_CONFIG.hotel.services.foods.map(food => `
                                    <div class="service-item-select">
                                        <input type="checkbox" id="food-${food.id}" value="${food.id}" data-name="${food.name}" data-price="${food.price}">
                                        <label for="food-${food.id}">
                                            <strong>${food.name}</strong>
                                            <span class="item-price">${formatCurrency(food.price)}</span>
                                        </label>
                                        <input type="number" min="1" max="10" value="1" class="item-quantity" data-item="food-${food.id}">
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="category">
                            <h5><i class="fas fa-glass-cheers"></i> Đồ uống</h5>
                            <div class="items-grid">
                                ${APP_CONFIG.hotel.services.drinks.map(drink => `
                                    <div class="service-item-select">
                                        <input type="checkbox" id="drink-${drink.id}" value="${drink.id}" data-name="${drink.name}" data-price="${drink.price}">
                                        <label for="drink-${drink.id}">
                                            <strong>${drink.name}</strong>
                                            <span class="item-price">${formatCurrency(drink.price)}</span>
                                        </label>
                                        <input type="number" min="1" max="10" value="1" class="item-quantity" data-item="drink-${drink.id}">
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="category">
                            <h5><i class="fas fa-ice-cream"></i> Tráng miệng</h5>
                            <div class="items-grid">
                                ${APP_CONFIG.hotel.services.desserts.map(dessert => `
                                    <div class="service-item-select">
                                        <input type="checkbox" id="dessert-${dessert.id}" value="${dessert.id}" data-name="${dessert.name}" data-price="${dessert.price}">
                                        <label for="dessert-${dessert.id}">
                                            <strong>${dessert.name}</strong>
                                            <span class="item-price">${formatCurrency(dessert.price)}</span>
                                        </label>
                                        <input type="number" min="1" max="10" value="1" class="item-quantity" data-item="dessert-${dessert.id}">
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="order-summary">
                    <h4><i class="fas fa-receipt"></i> Tóm tắt đơn hàng</h4>
                    <div id="selected-items-list" style="margin: 1rem 0;">
                        <p class="no-data">Chưa có món nào được chọn</p>
                    </div>
                    <div class="order-total">
                        <strong>Tổng cộng:</strong> <span id="order-total-amount">0</span>đ
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-control full-width">
                        <label for="order-notes"><i class="fas fa-sticky-note"></i> Ghi chú</label>
                        <textarea id="order-notes" rows="2" placeholder="Ghi chú thêm..."></textarea>
                    </div>
                </div>
                
                <div class="form-actions" style="margin-top: 1.5rem;">
                    <button class="btn btn-primary" onclick="submitNewOrder()">
                        <i class="fas fa-paper-plane"></i> Gửi đơn hàng
                    </button>
                    <button class="btn btn-secondary" onclick="clearOrderForm()">
                        <i class="fas fa-times"></i> Xóa form
                    </button>
                </div>
            </div>
        </div>
        
        <style>
            .order-tabs {
                display: flex;
                gap: 1rem;
                margin-bottom: 2rem;
                border-bottom: 2px solid #eee;
                padding-bottom: 1rem;
            }
            
            .tab-btn {
                padding: 10px 20px;
                background: none;
                border: none;
                border-bottom: 3px solid transparent;
                font-size: 1rem;
                cursor: pointer;
                color: #666;
            }
            
            .tab-btn.active {
                border-bottom-color: #3a7bd5;
                color: #3a7bd5;
                font-weight: bold;
            }
            
            .order-tab {
                display: block;
            }
            
            .order-tab.hidden {
                display: none;
            }
            
            .room-badge {
                background-color: #e3f2fd;
                color: #2196f3;
                padding: 4px 10px;
                border-radius: 12px;
                font-weight: bold;
            }
            
            .no-data {
                padding: 2rem;
                text-align: center;
                color: #999;
                font-style: italic;
            }
            
            .service-categories {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 1.5rem;
                margin-top: 1rem;
            }
            
            .items-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 10px;
                margin-top: 1rem;
            }
            
            .service-item-select {
                background-color: #f9f9f9;
                padding: 10px;
                border-radius: 8px;
                border: 1px solid #eee;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .service-item-select input[type="checkbox"] {
                width: 18px;
                height: 18px;
            }
            
            .service-item-select label {
                flex: 1;
                cursor: pointer;
            }
            
            .item-quantity {
                width: 60px;
                padding: 5px;
                border: 1px solid #ddd;
                border-radius: 4px;
            }
            
            .full-width {
                grid-column: 1 / -1;
            }
            
            .btn-sm {
                padding: 5px 10px;
                font-size: 0.9rem;
                margin: 2px;
            }
        </style>
    `;
}

// Render trang check-out & xuất bill (STAFF) - KHÔNG XEM ĐƯỢC BILL CŨ
function renderCheckOutProcess() {
    return `
        <div class="checkout-process">
            <h2 class="section-title"><i class="fas fa-file-invoice-dollar"></i> Check-out & Xuất hóa đơn</h2>
            <p>Chỉ tạo bill mới, không xem được bill cũ</p>
            
            <div class="form-row">
                <div class="form-control">
                    <label for="checkout-room"><i class="fas fa-door-closed"></i> Số phòng</label>
                    <select id="checkout-room">
                        <option value="">-- Chọn phòng --</option>
                        ${appData.rooms
                            .filter(room => room.status === 'occupied')
                            .map(room => `
                                <option value="${room.number}">${room.number} - ${room.customerName}</option>
                            `).join('')}
                    </select>
                </div>
                <div class="form-control">
                    <button class="btn btn-primary" onclick="loadCheckoutInfo()" style="margin-top: 1.5rem;">
                        <i class="fas fa-search"></i> Tải thông tin
                    </button>
                </div>
            </div>
            
            <div id="checkout-info" class="hidden" style="margin-top: 2rem;">
                <div class="customer-info" style="background-color: #f0f5ff; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
                    <h4><i class="fas fa-user"></i> Thông tin khách hàng</h4>
                    <div class="form-row">
                        <div class="form-control">
                            <strong>Họ tên:</strong> <span id="checkout-customer-name">-</span>
                        </div>
                        <div class="form-control">
                            <strong>Số điện thoại:</strong> <span id="checkout-customer-phone">-</span>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-control">
                            <strong>CMND/CCCD:</strong> <span id="checkout-customer-id">-</span>
                        </div>
                        <div class="form-control">
                            <strong>Ngày nhận phòng:</strong> <span id="checkout-checkin">-</span>
                        </div>
                    </div>
                </div>
                
                <div class="bill-details">
                    <div class="bill-header" style="text-align: center; margin-bottom: 2rem;">
                        <h3>HÓA ĐƠN THANH TOÁN</h3>
                        <h4>Sunshine Hotel</h4>
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
                    
                    <div class="qr-container" style="margin-top: 2rem;">
                        <h4><i class="fas fa-qrcode"></i> Mã QR thanh toán</h4>
                        <p>Quét mã QR để thanh toán qua VietQR</p>
                        <div class="qr-code" id="qr-code-display" style="margin: 1rem auto; width: 200px; height: 200px; background-color: white; border: 1px solid #ddd; display: flex; align-items: center; justify-content: center;">
                            <div style="text-align: center;">
                                <div style="font-size: 3rem; margin-bottom: 10px;">QR</div>
                                <div>VietQR</div>
                            </div>
                        </div>
                        <p id="qr-content" style="text-align: center; font-size: 0.9rem; color: #666;">Nội dung QR: Đang tải...</p>
                        
                        <div class="form-row" style="margin-top: 1.5rem;">
                            <div class="form-control">
                                <label for="payment-method-final"><i class="fas fa-credit-card"></i> Phương thức thanh toán</label>
                                <select id="payment-method-final">
                                    <option value="cash">Tiền mặt</option>
                                    <option value="banking">Chuyển khoản</option>
                                    <option value="credit">Thẻ tín dụng</option>
                                </select>
                            </div>
                            <div class="form-control">
                                <label for="payment-status"><i class="fas fa-check-circle"></i> Trạng thái thanh toán</label>
                                <select id="payment-status">
                                    <option value="paid">Đã thanh toán</option>
                                    <option value="pending">Chờ thanh toán</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-actions" style="text-align: center; margin-top: 2rem;">
                            <button class="btn btn-success" onclick="generateQRAndSaveBill()">
                                <i class="fas fa-save"></i> Lưu hóa đơn & Tạo QR
                            </button>
                            <button class="btn btn-primary" onclick="printBill()" style="margin-left: 10px;">
                                <i class="fas fa-print"></i> In hóa đơn
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Render trang tạo QR (STAFF)
function renderQRGenerator() {
    return `
        <div class="qr-generator">
            <h2 class="section-title"><i class="fas fa-qrcode"></i> Tạo QR thanh toán</h2>
            
            <div class="form-container">
                <div class="form-row">
                    <div class="form-control">
                        <label for="qr-room-number"><i class="fas fa-door-closed"></i> Số phòng</label>
                        <input type="number" id="qr-room-number" placeholder="Nhập số phòng" min="101" max="723">
                    </div>
                    <div class="form-control">
                        <label for="qr-customer-name"><i class="fas fa-user"></i> Tên khách hàng</label>
                        <input type="text" id="qr-customer-name" placeholder="Nhập tên khách hàng">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-control">
                        <label for="qr-room-type"><i class="fas fa-bed"></i> Loại phòng</label>
                        <select id="qr-room-type">
                            <option value="">-- Chọn loại phòng --</option>
                            ${Object.entries(APP_CONFIG.hotel.roomTypes).map(([key, type]) => 
                                `<option value="${key}">${type.name}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="form-control">
                        <label for="qr-days"><i class="fas fa-calendar-day"></i> Số ngày thuê</label>
                        <input type="number" id="qr-days" min="1" max="30" value="1" placeholder="Số ngày">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-control">
                        <label for="qr-checkout-date"><i class="fas fa-calendar-times"></i> Ngày trả phòng</label>
                        <input type="date" id="qr-checkout-date" value="${new Date().toISOString().split('T')[0]}">
                    </div>
                    <div class="form-control">
                        <label for="qr-total-amount"><i class="fas fa-money-bill-wave"></i> Tổng tiền (VND)</label>
                        <input type="number" id="qr-total-amount" placeholder="Nhập tổng tiền" min="0">
                    </div>
                </div>
                
                <div class="form-actions" style="margin-top: 1.5rem;">
                    <button class="btn btn-primary" onclick="generateNewQR()">
                        <i class="fas fa-qrcode"></i> Tạo mã QR
                    </button>
                </div>
            </div>
            
            <div id="qr-result" class="hidden" style="margin-top: 2rem;">
                <div class="qr-display" style="text-align: center; padding: 2rem; background-color: #f9f9f9; border-radius: 8px;">
                    <h4><i class="fas fa-qrcode"></i> Mã QR đã tạo</h4>
                    <div class="qr-image" id="qr-image-container" style="margin: 1rem auto; width: 250px; height: 250px; background-color: white; border: 2px solid #ddd; display: flex; align-items: center; justify-content: center;">
                        <div style="text-align: center;">
                            <div style="font-size: 4rem; margin-bottom: 10px;">QR</div>
                            <div style="font-weight: bold;">VietQR</div>
                            <div style="font-size: 0.8rem; margin-top: 5px;">Sunshine Hotel</div>
                        </div>
                    </div>
                    <p id="qr-details" style="margin-top: 1rem;"></p>
                    <button class="btn btn-success" onclick="saveQRCode()" style="margin-top: 1rem;">
                        <i class="fas fa-save"></i> Lưu mã QR
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
    
    // Thống kê
    const occupiedRooms = appData.rooms.filter(r => r.status === 'occupied').length;
    const availableRooms = appData.rooms.filter(r => r.status === 'available').length;
    const todayCheckIns = appData.bookings.filter(b => {
        const checkIn = new Date(b.checkInDate).toISOString().split('T')[0];
        return checkIn === todayStr && b.status === 'active';
    }).length;
    
    const todayCheckOuts = appData.bookings.filter(b => {
        const checkOut = b.actualCheckOutDate ? 
            new Date(b.actualCheckOutDate).toISOString().split('T')[0] : null;
        return checkOut === todayStr && b.status === 'completed';
    }).length;
    
    const pendingOrders = appData.orders.filter(o => o.status === 'pending').length;
    const cancelledOrders = appData.orders.filter(o => o.status === 'cancelled').length;
    
    // Doanh thu hôm nay
    const todayRevenue = appData.bills.filter(bill => {
        const billDate = new Date(bill.createdDate).toISOString().split('T')[0];
        return billDate === todayStr;
    }).reduce((sum, bill) => sum + bill.totalAmount, 0);
    
    // Tổng doanh thu
    const totalRevenue = appData.bills.reduce((sum, bill) => sum + bill.totalAmount, 0);
    
    return `
        <div class="admin-dashboard">
            <h2 class="section-title"><i class="fas fa-tachometer-alt"></i> Tổng quan hệ thống</h2>
            
            <div class="dashboard-stats">
                <div class="stat-card" style="background-color: #e3f2fd;">
                    <div class="stat-icon">
                        <i class="fas fa-door-closed" style="color: #2196f3;"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${occupiedRooms}/${appData.rooms.length}</h3>
                        <p>Phòng đã thuê</p>
                        <small>${availableRooms} phòng trống</small>
                    </div>
                </div>
                
                <div class="stat-card" style="background-color: #e8f5e9;">
                    <div class="stat-icon">
                        <i class="fas fa-user-check" style="color: #4caf50;"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${todayCheckIns}</h3>
                        <p>Check-in hôm nay</p>
                        <small>${todayCheckOuts} check-out</small>
                    </div>
                </div>
                
                <div class="stat-card" style="background-color: #fff3e0;">
                    <div class="stat-icon">
                        <i class="fas fa-concierge-bell" style="color: #ff9800;"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${pendingOrders}</h3>
                        <p>Đơn dịch vụ chờ</p>
                        <small>${cancelledOrders} đơn đã hủy</small>
                    </div>
                </div>
                
                <div class="stat-card" style="background-color: #fce4ec;">
                    <div class="stat-icon">
                        <i class="fas fa-money-bill-wave" style="color: #e91e63;"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${formatCurrency(todayRevenue)}</h3>
                        <p>Doanh thu hôm nay</p>
                        <small>Tổng: ${formatCurrency(totalRevenue)}</small>
                    </div>
                </div>
            </div>
            
            <div class="dashboard-content">
                <div class="dashboard-section">
                    <h3><i class="fas fa-chart-line"></i> Hoạt động gần đây</h3>
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Thời gian</th>
                                    <th>Hoạt động</th>
                                    <th>Chi tiết</th>
                                    <th>Nhân viên</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${getRecentActivities().slice(0, 8).map(activity => `
                                    <tr>
                                        <td>${formatDateTime(activity.time)}</td>
                                        <td>
                                            <span class="activity-badge activity-${activity.type}">
                                                ${getActivityLabel(activity.type)}
                                            </span>
                                        </td>
                                        <td>${activity.details}</td>
                                        <td>${activity.staff}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="dashboard-section">
                    <h3><i class="fas fa-bed"></i> Tình trạng phòng</h3>
                    <div class="room-status-chart">
                        <div style="height: 200px; display: flex; align-items: flex-end; justify-content: center; gap: 2rem; margin-top: 1rem;">
                            <div class="chart-bar" style="height: ${(occupiedRooms/appData.rooms.length)*100}%; background-color: #f44336; width: 60px;">
                                <div class="chart-value">${occupiedRooms}</div>
                                <div class="chart-label">Đã thuê</div>
                            </div>
                            <div class="chart-bar" style="height: ${(availableRooms/appData.rooms.length)*100}%; background-color: #4CAF50; width: 60px;">
                                <div class="chart-value">${availableRooms}</div>
                                <div class="chart-label">Trống</div>
                            </div>
                            <div class="chart-bar" style="height: ${((appData.rooms.length - occupiedRooms - availableRooms)/appData.rooms.length)*100}%; background-color: #FF9800; width: 60px;">
                                <div class="chart-value">${appData.rooms.length - occupiedRooms - availableRooms}</div>
                                <div class="chart-label">Đã đặt</div>
                            </div>
                        </div>
                    </div>
                    
                    <h3 style="margin-top: 2rem;"><i class="fas fa-qrcode"></i> QR đã tạo gần đây</h3>
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Phòng</th>
                                    <th>Khách hàng</th>
                                    <th>Số tiền</th>
                                    <th>Ngày tạo</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${appData.qrCodes.slice(-5).reverse().map(qr => `
                                    <tr>
                                        <td><span class="room-badge">${qr.roomNumber}</span></td>
                                        <td>${qr.customerName}</td>
                                        <td>${formatCurrency(qr.totalAmount)}</td>
                                        <td>${formatDateTime(qr.createdDate)}</td>
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
                grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
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
                font-size: 1.8rem;
                margin-bottom: 0.3rem;
                color: #1a2a6c;
            }
            
            .stat-info small {
                font-size: 0.85rem;
                opacity: 0.8;
            }
            
            .dashboard-content {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 2rem;
            }
            
            .dashboard-section {
                background-color: white;
                padding: 1.5rem;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            }
            
            .activity-badge {
                padding: 4px 10px;
                border-radius: 12px;
                font-size: 0.85rem;
                font-weight: bold;
            }
            
            .activity-checkin {
                background-color: #e8f5e9;
                color: #2e7d32;
            }
            
            .activity-checkout {
                background-color: #ffebee;
                color: #c62828;
            }
            
            .activity-order {
                background-color: #e3f2fd;
                color: #1565c0;
            }
            
            .chart-bar {
                display: flex;
                flex-direction: column;
                justify-content: flex-end;
                align-items: center;
                border-radius: 5px 5px 0 0;
                position: relative;
            }
            
            .chart-value {
                position: absolute;
                top: -25px;
                font-weight: bold;
            }
            
            .chart-label {
                margin-top: 10px;
                font-weight: bold;
                font-size: 0.9rem;
            }
            
            @media (max-width: 1024px) {
                .dashboard-content {
                    grid-template-columns: 1fr;
                }
            }
        </style>
    `;
}

// Render trang lịch sử hóa đơn (ADMIN)
function renderBillHistory() {
    return `
        <div class="bill-history">
            <h2 class="section-title"><i class="fas fa-history"></i> Lịch sử hóa đơn</h2>
            
            <div class="controls" style="margin-bottom: 2rem;">
                <div class="form-row">
                    <div class="form-control">
                        <label for="search-bill">Tìm kiếm</label>
                        <input type="text" id="search-bill" placeholder="Số phòng, tên KH, mã hóa đơn..." onkeyup="searchBills()">
                    </div>
                    <div class="form-control">
                        <label for="filter-bill-date">Từ ngày</label>
                        <input type="date" id="filter-bill-date" onchange="searchBills()">
                    </div>
                    <div class="form-control">
                        <label for="filter-bill-date-to">Đến ngày</label>
                        <input type="date" id="filter-bill-date-to" onchange="searchBills()">
                    </div>
                </div>
            </div>
            
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Mã HD</th>
                            <th>Ngày xuất</th>
                            <th>Phòng</th>
                            <th>Khách hàng</th>
                            <th>Ngày nhận</th>
                            <th>Ngày trả</th>
                            <th>Số ngày</th>
                            <th>Tổng tiền</th>
                            <th>Thanh toán</th>
                            <th>Nhân viên</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody id="bills-list">
                        ${appData.bills.map(bill => `
                            <tr>
                                <td><strong>${bill.billNumber}</strong></td>
                                <td>${formatDate(bill.createdDate)}</td>
                                <td><span class="room-badge">${bill.roomNumber}</span></td>
                                <td>${bill.customerName}</td>
                                <td>${formatDate(bill.checkInDate)}</td>
                                <td>${formatDate(bill.actualCheckOutDate)}</td>
                                <td>${bill.days}</td>
                                <td><strong>${formatCurrency(bill.totalAmount)}</strong></td>
                                <td>
                                    <span class="payment-badge payment-${bill.paymentMethod}">
                                        ${bill.paymentMethod === 'cash' ? 'Tiền mặt' : 
                                          bill.paymentMethod === 'banking' ? 'Chuyển khoản' : 'Thẻ tín dụng'}
                                    </span>
                                </td>
                                <td>${bill.staffName}</td>
                                <td>
                                    <button class="btn btn-secondary btn-sm" onclick="viewBillDetails(${bill.id})">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button class="btn btn-primary btn-sm" onclick="printBillById(${bill.id})">
                                        <i class="fas fa-print"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        
        <style>
            .payment-badge {
                padding: 4px 10px;
                border-radius: 12px;
                font-size: 0.85rem;
                font-weight: bold;
            }
            
            .payment-cash {
                background-color: #e8f5e9;
                color: #2e7d32;
            }
            
            .payment-banking {
                background-color: #e3f2fd;
                color: #1565c0;
            }
            
            .payment-credit {
                background-color: #f3e5f5;
                color: #7b1fa2;
            }
        </style>
    `;
}

// Render trang thống kê dịch vụ (ADMIN)
function renderServiceAnalytics() {
    // Thống kê dịch vụ
    const serviceStats = calculateServiceStats();
    
    return `
        <div class="service-analytics">
            <h2 class="section-title"><i class="fas fa-utensils"></i> Thống kê dịch vụ</h2>
            
            <div class="analytics-stats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
                <div style="background-color: #e8f5e9; padding: 1.5rem; border-radius: 8px; text-align: center;">
                    <h4>Tổng đơn hàng</h4>
                    <p style="font-size: 2rem; font-weight: bold;">${appData.orders.length}</p>
                </div>
                <div style="background-color: #fff3e0; padding: 1.5rem; border-radius: 8px; text-align: center;">
                    <h4>Đơn đã hủy</h4>
                    <p style="font-size: 2rem; font-weight: bold;">${serviceStats.cancelledOrders}</p>
                </div>
                <div style="background-color: #fce4ec; padding: 1.5rem; border-radius: 8px; text-align: center;">
                    <h4>Doanh thu dịch vụ</h4>
                    <p style="font-size: 2rem; font-weight: bold;">${formatCurrency(serviceStats.totalRevenue)}</p>
                </div>
                <div style="background-color: #e3f2fd; padding: 1.5rem; border-radius: 8px; text-align: center;">
                    <h4>Món phổ biến</h4>
                    <p style="font-size: 2rem; font-weight: bold;">${serviceStats.topItem}</p>
                </div>
            </div>
            
            <div class="analytics-content">
                <div class="dashboard-section">
                    <h3><i class="fas fa-chart-bar"></i> Thống kê theo loại món</h3>
                    <div style="height: 300px; display: flex; align-items: flex-end; justify-content: center; gap: 2rem; margin-top: 2rem;">
                        <div class="chart-bar" style="height: ${(serviceStats.byCategory.food/ serviceStats.totalItems)*100}%; background-color: #3a7bd5; width: 80px;">
                            <div class="chart-value">${serviceStats.byCategory.food}</div>
                            <div class="chart-label">Món ăn</div>
                        </div>
                        <div class="chart-bar" style="height: ${(serviceStats.byCategory.drink/ serviceStats.totalItems)*100}%; background-color: #00d2ff; width: 80px;">
                            <div class="chart-value">${serviceStats.byCategory.drink}</div>
                            <div class="chart-label">Đồ uống</div>
                        </div>
                        <div class="chart-bar" style="height: ${(serviceStats.byCategory.dessert/ serviceStats.totalItems)*100}%; background-color: #FFD700; width: 80px;">
                            <div class="chart-value">${serviceStats.byCategory.dessert}</div>
                            <div class="chart-label">Tráng miệng</div>
                        </div>
                    </div>
                </div>
                
                <div class="dashboard-section">
                    <h3><i class="fas fa-list"></i> Top 10 món được gọi nhiều nhất</h3>
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Tên món</th>
                                    <th>Loại</th>
                                    <th>Số lượng</th>
                                    <th>Doanh thu</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${serviceStats.topItems.map((item, index) => `
                                    <tr>
                                        <td>${index + 1}</td>
                                        <td>${item.name}</td>
                                        <td>
                                            <span class="category-badge category-${item.category}">
                                                ${item.category === 'food' ? 'Món ăn' : 
                                                  item.category === 'drink' ? 'Đồ uống' : 'Tráng miệng'}
                                            </span>
                                        </td>
                                        <td>${item.quantity}</td>
                                        <td>${formatCurrency(item.revenue)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <div class="dashboard-section" style="margin-top: 2rem;">
                <h3><i class="fas fa-calendar-alt"></i> Đơn hàng theo trạng thái</h3>
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Trạng thái</th>
                                <th>Số lượng</th>
                                <th>Tỷ lệ</th>
                                <th>Doanh thu</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><span class="status-badge status-active">Đang chờ</span></td>
                                <td>${appData.orders.filter(o => o.status === 'pending').length}</td>
                                <td>${((appData.orders.filter(o => o.status === 'pending').length / appData.orders.length) * 100).toFixed(1)}%</td>
                                <td>${formatCurrency(appData.orders.filter(o => o.status === 'pending').reduce((sum, o) => sum + o.totalAmount, 0))}</td>
                            </tr>
                            <tr>
                                <td><span class="status-badge status-active">Đang xử lý</span></td>
                                <td>${appData.orders.filter(o => o.status === 'processing').length}</td>
                                <td>${((appData.orders.filter(o => o.status === 'processing').length / appData.orders.length) * 100).toFixed(1)}%</td>
                                <td>${formatCurrency(appData.orders.filter(o => o.status === 'processing').reduce((sum, o) => sum + o.totalAmount, 0))}</td>
                            </tr>
                            <tr>
                                <td><span class="status-badge status-active">Hoàn thành</span></td>
                                <td>${appData.orders.filter(o => o.status === 'completed').length}</td>
                                <td>${((appData.orders.filter(o => o.status === 'completed').length / appData.orders.length) * 100).toFixed(1)}%</td>
                                <td>${formatCurrency(appData.orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.totalAmount, 0))}</td>
                            </tr>
                            <tr>
                                <td><span class="status-badge status-inactive">Đã hủy</span></td>
                                <td>${appData.orders.filter(o => o.status === 'cancelled').length}</td>
                                <td>${((appData.orders.filter(o => o.status === 'cancelled').length / appData.orders.length) * 100).toFixed(1)}%</td>
                                <td>${formatCurrency(appData.orders.filter(o => o.status === 'cancelled').reduce((sum, o) => sum + o.totalAmount, 0))}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        
        <style>
            .analytics-content {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 2rem;
            }
            
            .category-badge {
                padding: 4px 10px;
                border-radius: 12px;
                font-size: 0.85rem;
                font-weight: bold;
            }
            
            .category-food {
                background-color: #ffebee;
                color: #c62828;
            }
            
            .category-drink {
                background-color: #e3f2fd;
                color: #1565c0;
            }
            
            .category-dessert {
                background-color: #fff3e0;
                color: #ef6c00;
            }
            
            @media (max-width: 1024px) {
                .analytics-content {
                    grid-template-columns: 1fr;
                }
            }
        </style>
    `;
}

// Các trang khác (giữ nguyên cấu trúc)
function renderReports() {
    return `<h2>Trang Báo cáo (ADMIN)</h2><p>Chức năng chi tiết...</p>`;
}

function renderServiceManagement() {
    return `<h2>Trang Quản lý dịch vụ (ADMIN)</h2><p>Chức năng chi tiết...</p>`;
}

function renderRevenueAnalysis() {
    return `<h2>Trang Phân tích doanh thu (ADMIN)</h2><p>Chức năng chi tiết...</p>`;
}

// ========== UTILITY FUNCTIONS ==========

// Hàm hỗ trợ định dạng
function formatCurrency(amount) {
    return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

function formatDate(date) {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('vi-VN');
}

function formatDateTime(date) {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleString('vi-VN');
}

// Hàm tính toán thống kê dịch vụ
function calculateServiceStats() {
    const allItems = [];
    
    // Gom nhóm tất cả các món đã đặt
    appData.orders.forEach(order => {
        order.items.forEach(item => {
            const existing = allItems.find(i => i.id === item.id);
            if (existing) {
                existing.quantity += item.quantity;
                existing.revenue += item.total;
            } else {
                allItems.push({
                    id: item.id,
                    name: item.name,
                    category: item.category,
                    quantity: item.quantity,
                    revenue: item.total
                });
            }
        });
    });
    
    // Sắp xếp theo số lượng
    allItems.sort((a, b) => b.quantity - a.quantity);
    
    // Tính theo loại
    const byCategory = {
        food: 0,
        drink: 0,
        dessert: 0
    };
    
    allItems.forEach(item => {
        byCategory[item.category] += item.quantity;
    });
    
    const totalItems = allItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalRevenue = allItems.reduce((sum, item) => sum + item.revenue, 0);
    const cancelledOrders = appData.orders.filter(o => o.status === 'cancelled').length;
    const topItem = allItems.length > 0 ? allItems[0].name : 'N/A';
    
    return {
        totalItems,
        totalRevenue,
        cancelledOrders,
        topItem,
        byCategory,
        topItems: allItems.slice(0, 10)
    };
}

// Hàm lấy hoạt động gần đây
function getRecentActivities() {
    const activities = [];
    
    // Thêm check-in
    appData.bookings.slice(-5).forEach(booking => {
        activities.push({
            time: booking.createdDate,
            type: 'checkin',
            details: `Check-in phòng ${booking.roomNumber} - ${booking.customerName}`,
            staff: booking.staffName
        });
    });
    
    // Thêm check-out
    appData.bills.slice(-5).forEach(bill => {
        activities.push({
            time: bill.createdDate,
            type: 'checkout',
            details: `Check-out phòng ${bill.roomNumber} - ${bill.customerName}`,
            staff: bill.staffName
        });
    });
    
    // Thêm đơn hàng
    appData.orders.slice(-5).forEach(order => {
        activities.push({
            time: order.orderDate,
            type: 'order',
            details: `Đơn dịch vụ phòng ${order.roomNumber} - ${order.items.length} món`,
            staff: order.staffName
        });
    });
    
    // Sắp xếp theo thời gian
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    
    return activities.slice(0, 10);
}

function getActivityLabel(type) {
    switch(type) {
        case 'checkin': return 'Check-in';
        case 'checkout': return 'Check-out';
        case 'order': return 'Đơn dịch vụ';
        default: return 'Hoạt động';
    }
}

// ========== EVENT HANDLERS ==========

// Hàm xử lý check-in
function processCheckIn() {
    const roomNumber = document.getElementById('checkin-room').value;
    const customerName = document.getElementById('checkin-customer-name').value;
    const customerId = document.getElementById('checkin-customer-id').value;
    const customerPhone = document.getElementById('checkin-customer-phone').value;
    const checkinDate = document.getElementById('checkin-date').value;
    const checkoutDate = document.getElementById('checkout-date').value;
    const guests = document.getElementById('checkin-guests').value;
    const paymentMethod = document.getElementById('checkin-payment-method').value;
    const notes = document.getElementById('checkin-notes').value;
    
    if (!roomNumber || !customerName || !customerId || !customerPhone) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
        return;
    }
    
    // Tìm phòng
    const room = appData.rooms.find(r => r.number == roomNumber);
    if (!room) {
        alert('Không tìm thấy phòng!');
        return;
    }
    
    // Cập nhật trạng thái phòng
    room.status = 'occupied';
    room.customer = customerName;
    room.customerName = customerName;
    room.customerPhone = customerPhone;
    room.checkInDate = new Date(checkinDate);
    room.checkOutDate = new Date(checkoutDate);
    
    // Tạo booking mới
    const newBookingId = appData.bookings.length + 1;
    const roomTypeName = APP_CONFIG.hotel.roomTypes[room.type].name;
    
    appData.bookings.push({
        id: newBookingId,
        customerName: customerName,
        customerPhone: customerPhone,
        customerId: customerId,
        roomNumber: room.number,
        roomType: room.type,
        roomTypeName: roomTypeName,
        checkInDate: new Date(checkinDate),
        checkOutDate: new Date(checkoutDate),
        actualCheckOutDate: null,
        status: 'active',
        totalAmount: 0, // Sẽ tính khi check-out
        services: [],
        paymentMethod: paymentMethod,
        staffName: currentUser.name,
        createdDate: new Date(),
        notes: notes
    });
    
    // Hiển thị kết quả
    document.getElementById('checkin-success-message').innerHTML = `
        Đã check-in thành công cho khách <strong>${customerName}</strong> vào phòng <strong>${roomNumber}</strong>.<br>
        Ngày nhận: ${checkinDate} | Ngày trả: ${checkoutDate}<br>
        Mã đặt phòng: #${newBookingId}
    `;
    document.getElementById('checkin-result').classList.remove('hidden');
    
    // Reset form
    setTimeout(() => {
        clearCheckInForm();
        document.getElementById('checkin-result').classList.add('hidden');
    }, 5000);
}

function clearCheckInForm() {
    document.getElementById('checkin-room').value = '';
    document.getElementById('checkin-customer-name').value = '';
    document.getElementById('checkin-customer-id').value = '';
    document.getElementById('checkin-customer-phone').value = '';
    document.getElementById('checkin-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('checkout-date').value = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    document.getElementById('checkin-guests').value = '1';
    document.getElementById('checkin-payment-method').value = 'cash';
    document.getElementById('checkin-notes').value = '';
}

// Hàm xử lý đơn hàng dịch vụ
function showOrderTab(tabName) {
    // Ẩn tất cả các tab
    document.querySelectorAll('.order-tab').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    // Xóa active từ tất cả các button
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Hiển thị tab được chọn
    document.getElementById(`${tabName}-orders-tab`).classList.remove('hidden');
    
    // Thêm active cho button
    event.target.classList.add('active');
}

function processOrder(orderId) {
    const order = appData.orders.find(o => o.id === orderId);
    if (order) {
        order.status = 'processing';
        alert(`Đã chuyển đơn #${orderId} sang trạng thái xử lý`);
        switchView('service-orders');
    }
}

function cancelOrder(orderId) {
    if (confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
        const order = appData.orders.find(o => o.id === orderId);
        if (order) {
            order.status = 'cancelled';
            alert(`Đã hủy đơn #${orderId}`);
            switchView('service-orders');
        }
    }
}

function completeOrder(orderId) {
    const order = appData.orders.find(o => o.id === orderId);
    if (order) {
        order.status = 'completed';
        order.deliveryDate = new Date();
        alert(`Đã hoàn thành đơn #${orderId}`);
        switchView('service-orders');
    }
}

// Hàm xử lý check-out
function loadCheckoutInfo() {
    const roomNumber = document.getElementById('checkout-room').value;
    if (!roomNumber) {
        alert('Vui lòng chọn phòng!');
        return;
    }
    
    const room = appData.rooms.find(r => r.number == roomNumber);
    if (!room || room.status !== 'occupied') {
        alert('Phòng này không có khách hoặc đã trả!');
        return;
    }
    
    // Tìm booking
    const booking = appData.bookings.find(b => 
        b.roomNumber == roomNumber && b.status === 'active'
    );
    
    if (!booking) {
        alert('Không tìm thấy thông tin đặt phòng!');
        return;
    }
    
    // Hiển thị thông tin
    document.getElementById('checkout-customer-name').textContent = room.customerName;
    document.getElementById('checkout-customer-phone').textContent = room.customerPhone;
    document.getElementById('checkout-customer-id').textContent = booking.customerId;
    document.getElementById('checkout-checkin').textContent = formatDate(room.checkInDate);
    
    document.getElementById('bill-room-number').textContent = room.number;
    document.getElementById('bill-room-type').textContent = room.typeName;
    
    // Tính số ngày
    const checkIn = new Date(room.checkInDate);
    const checkOut = new Date();
    const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    document.getElementById('bill-days').textContent = days;
    
    // Tính tiền phòng
    document.getElementById('bill-room-price').textContent = formatCurrency(room.price);
    const roomTotal = room.price * days;
    document.getElementById('bill-room-total').textContent = formatCurrency(roomTotal);
    
    // Lấy dịch vụ
    const roomOrders = appData.orders.filter(o => 
        o.roomNumber == roomNumber && o.status === 'completed'
    );
    
    let servicesHTML = '';
    let servicesTotal = 0;
    let serviceIndex = 1;
    
    roomOrders.forEach(order => {
        order.items.forEach(item => {
            servicesHTML += `
                <tr>
                    <td>${serviceIndex++}</td>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>${formatCurrency(item.price)}</td>
                    <td>${formatCurrency(item.total)}</td>
                </tr>
            `;
            servicesTotal += item.total;
        });
    });
    
    document.getElementById('bill-services').innerHTML = servicesHTML;
    document.getElementById('bill-services-total').textContent = formatCurrency(servicesTotal);
    
    // Tính tổng
    const grandTotal = roomTotal + servicesTotal;
    document.getElementById('bill-grand-total').textContent = formatCurrency(grandTotal);
    
    // Tạo nội dung QR
    const qrContent = `Số phòng: ${room.number}|Loại phòng: ${room.typeName}|Số ngày: ${days}|Ngày trả: ${formatDate(checkOut)}|Tổng tiền: ${grandTotal} VND`;
    document.getElementById('qr-content').textContent = `Nội dung QR: ${qrContent}`;
    
    // Hiển thị phần check-out
    document.getElementById('checkout-info').classList.remove('hidden');
}

function generateQRAndSaveBill() {
    const roomNumber = document.getElementById('checkout-room').value;
    const paymentMethod = document.getElementById('payment-method-final').value;
    const paymentStatus = document.getElementById('payment-status').value;
    
    if (!roomNumber) {
        alert('Vui lòng chọn phòng trước!');
        return;
    }
    
    // Tạo bill mới
    const newBillId = appData.bills.length + 1;
    const room = appData.rooms.find(r => r.number == roomNumber);
    const booking = appData.bookings.find(b => b.roomNumber == roomNumber && b.status === 'active');
    
    if (!room || !booking) {
        alert('Không tìm thấy thông tin!');
        return;
    }
    
    // Tính toán
    const checkIn = new Date(room.checkInDate);
    const checkOut = new Date();
    const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const roomTotal = room.price * days;
    
    const roomOrders = appData.orders.filter(o => 
        o.roomNumber == roomNumber && o.status === 'completed'
    );
    let serviceTotal = 0;
    let serviceItems = [];
    
    roomOrders.forEach(order => {
        order.items.forEach(item => {
            serviceTotal += item.total;
            serviceItems.push({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                total: item.total
            });
        });
    });
    
    const totalAmount = roomTotal + serviceTotal;
    
    // Tạo bill
    const newBill = {
        id: newBillId,
        billNumber: `HD${1000 + newBillId}`,
        bookingId: booking.id,
        roomNumber: room.number,
        customerName: room.customerName,
        customerId: booking.customerId,
        checkInDate: room.checkInDate,
        checkOutDate: room.checkOutDate,
        actualCheckOutDate: checkOut,
        days: days,
        roomType: room.typeName,
        roomPrice: room.price,
        roomTotal: roomTotal,
        services: serviceItems,
        serviceTotal: serviceTotal,
        totalAmount: totalAmount,
        paymentMethod: paymentMethod,
        status: paymentStatus === 'paid' ? 'paid' : 'pending',
        staffName: currentUser.name,
        createdDate: new Date(),
        qrCodeId: newBillId
    };
    
    appData.bills.push(newBill);
    
    // Tạo QR code
    const newQR = {
        id: newBillId,
        billId: newBillId,
        roomNumber: room.number,
        customerName: room.customerName,
        totalAmount: totalAmount,
        checkOutDate: checkOut,
        createdDate: new Date(),
        content: `Số phòng: ${room.number}|Loại phòng: ${room.typeName}|Số ngày: ${days}|Ngày trả: ${formatDate(checkOut)}|Tổng tiền: ${totalAmount} VND`,
        staffName: currentUser.name
    };
    
    appData.qrCodes.push(newQR);
    
    // Cập nhật trạng thái phòng và booking
    room.status = 'available';
    room.customer = null;
    room.customerName = null;
    room.customerPhone = null;
    room.checkInDate = null;
    room.checkOutDate = null;
    
    booking.status = 'completed';
    booking.actualCheckOutDate = checkOut;
    booking.totalAmount = totalAmount;
    
    alert(`Đã tạo hóa đơn #${newBill.billNumber} thành công và tạo mã QR!`);
    switchView('room-management');
}

function printBill() {
    alert('In hóa đơn... (Trong thực tế sẽ gọi window.print())');
}

// Hàm tạo QR mới
function generateNewQR() {
    const roomNumber = document.getElementById('qr-room-number').value;
    const customerName = document.getElementById('qr-customer-name').value;
    const roomType = document.getElementById('qr-room-type').value;
    const days = document.getElementById('qr-days').value;
    const checkoutDate = document.getElementById('qr-checkout-date').value;
    const totalAmount = document.getElementById('qr-total-amount').value;
    
    if (!roomNumber || !customerName || !roomType || !days || !totalAmount) {
        alert('Vui lòng điền đầy đủ thông tin!');
        return;
    }
    
    const roomTypeName = APP_CONFIG.hotel.roomTypes[roomType]?.name || 'Chưa xác định';
    
    // Tạo nội dung QR
    const qrContent = `Số phòng: ${roomNumber}|Loại phòng: ${roomTypeName}|Số ngày: ${days}|Ngày trả: ${checkoutDate}|Tổng tiền: ${totalAmount} VND`;
    
    // Hiển thị kết quả
    document.getElementById('qr-details').innerHTML = `
        <strong>Thông tin QR:</strong><br>
        Phòng: ${roomNumber}<br>
        Khách: ${customerName}<br>
        Loại phòng: ${roomTypeName}<br>
        Số ngày: ${days}<br>
        Ngày trả: ${checkoutDate}<br>
        Tổng tiền: ${formatCurrency(parseInt(totalAmount))}<br>
        <small>Nội dung QR: ${qrContent}</small>
    `;
    
    document.getElementById('qr-result').classList.remove('hidden');
}

function saveQRCode() {
    alert('Đã lưu mã QR vào hệ thống!');
    document.getElementById('qr-result').classList.add('hidden');
    
    // Reset form
    document.getElementById('qr-room-number').value = '';
    document.getElementById('qr-customer-name').value = '';
    document.getElementById('qr-room-type').value = '';
    document.getElementById('qr-days').value = '1';
    document.getElementById('qr-checkout-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('qr-total-amount').value = '';
}

// Hàm tìm kiếm bill (ADMIN)
function searchBills() {
    const searchTerm = document.getElementById('search-bill').value.toLowerCase();
    const fromDate = document.getElementById('filter-bill-date').value;
    const toDate = document.getElementById('filter-bill-date-to').value;
    
    const filteredBills = appData.bills.filter(bill => {
        const matchesSearch = 
            bill.billNumber.toLowerCase().includes(searchTerm) ||
            bill.roomNumber.toString().includes(searchTerm) ||
            bill.customerName.toLowerCase().includes(searchTerm);
        
        const billDate = new Date(bill.createdDate).toISOString().split('T')[0];
        const matchesDate = 
            (!fromDate || billDate >= fromDate) &&
            (!toDate || billDate <= toDate);
        
        return matchesSearch && matchesDate;
    });
    
    // Cập nhật bảng
    const tbody = document.getElementById('bills-list');
    if (tbody) {
        tbody.innerHTML = filteredBills.map(bill => `
            <tr>
                <td><strong>${bill.billNumber}</strong></td>
                <td>${formatDate(bill.createdDate)}</td>
                <td><span class="room-badge">${bill.roomNumber}</span></td>
                <td>${bill.customerName}</td>
                <td>${formatDate(bill.checkInDate)}</td>
                <td>${formatDate(bill.actualCheckOutDate)}</td>
                <td>${bill.days}</td>
                <td><strong>${formatCurrency(bill.totalAmount)}</strong></td>
                <td>
                    <span class="payment-badge payment-${bill.paymentMethod}">
                        ${bill.paymentMethod === 'cash' ? 'Tiền mặt' : 
                          bill.paymentMethod === 'banking' ? 'Chuyển khoản' : 'Thẻ tín dụng'}
                    </span>
                </td>
                <td>${bill.staffName}</td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="viewBillDetails(${bill.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-primary btn-sm" onclick="printBillById(${bill.id})">
                        <i class="fas fa-print"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
}

function viewBillDetails(billId) {
    const bill = appData.bills.find(b => b.id === billId);
    if (!bill) return;
    
    const modalHTML = `
        <div class="bill-details-modal">
            <h3>Chi tiết hóa đơn ${bill.billNumber}</h3>
            
            <div class="bill-info">
                <div class="form-row">
                    <div class="form-control">
                        <strong>Ngày xuất:</strong> ${formatDateTime(bill.createdDate)}
                    </div>
                    <div class="form-control">
                        <strong>Nhân viên:</strong> ${bill.staffName}
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-control">
                        <strong>Khách hàng:</strong> ${bill.customerName}
                    </div>
                    <div class="form-control">
                        <strong>CMND/CCCD:</strong> ${bill.customerId}
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-control">
                        <strong>Phòng:</strong> ${bill.roomNumber} (${bill.roomType})
                    </div>
                    <div class="form-control">
                        <strong>Số ngày:</strong> ${bill.days} ngày
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-control">
                        <strong>Ngày nhận:</strong> ${formatDate(bill.checkInDate)}
                    </div>
                    <div class="form-control">
                        <strong>Ngày trả:</strong> ${formatDate(bill.actualCheckOutDate)}
                    </div>
                </div>
            </div>
            
            <h4>Chi tiết thanh toán</h4>
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Mục</th>
                            <th>Số lượng</th>
                            <th>Đơn giá</th>
                            <th>Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>1</td>
                            <td>Tiền phòng (${bill.days} ngày)</td>
                            <td>${bill.days}</td>
                            <td>${formatCurrency(bill.roomPrice)}</td>
                            <td>${formatCurrency(bill.roomTotal)}</td>
                        </tr>
                        ${bill.services.map((service, index) => `
                            <tr>
                                <td>${index + 2}</td>
                                <td>${service.name}</td>
                                <td>${service.quantity}</td>
                                <td>${formatCurrency(service.price)}</td>
                                <td>${formatCurrency(service.total)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="4" style="text-align: right;"><strong>Tổng tiền phòng:</strong></td>
                            <td>${formatCurrency(bill.roomTotal)}</td>
                        </tr>
                        <tr>
                            <td colspan="4" style="text-align: right;"><strong>Tổng tiền dịch vụ:</strong></td>
                            <td>${formatCurrency(bill.serviceTotal)}</td>
                        </tr>
                        <tr style="background-color: #f0f5ff;">
                            <td colspan="4" style="text-align: right;"><strong>TỔNG CỘNG:</strong></td>
                            <td style="font-weight: bold; font-size: 1.2rem;">${formatCurrency(bill.totalAmount)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            
            <div class="payment-info">
                <p><strong>Phương thức thanh toán:</strong> 
                    ${bill.paymentMethod === 'cash' ? 'Tiền mặt' : 
                      bill.paymentMethod === 'banking' ? 'Chuyển khoản' : 'Thẻ tín dụng'}
                </p>
                <p><strong>Trạng thái:</strong> 
                    <span class="status-badge ${bill.status === 'paid' ? 'status-active' : 'status-inactive'}">
                        ${bill.status === 'paid' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                    </span>
                </p>
            </div>
            
            <div style="text-align: center; margin-top: 2rem;">
                <button class="btn btn-primary" onclick="printBillById(${bill.id})">
                    <i class="fas fa-print"></i> In hóa đơn
                </button>
                <button class="btn btn-secondary" onclick="closeModal()" style="margin-left: 10px;">
                    <i class="fas fa-times"></i> Đóng
                </button>
            </div>
        </div>
    `;
    
    // Tạo modal và hiển thị
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 800px;">
            <div class="modal-header">
                <h3>Hóa đơn ${bill.billNumber}</h3>
                <button class="close-modal" onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
            <div class="modal-body">
                ${modalHTML}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function printBillById(billId) {
    alert(`In hóa đơn #${billId}...`);
}

function closeModal() {
    document.querySelector('.modal')?.remove();
}
