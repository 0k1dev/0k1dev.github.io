// staff.js - CHỈ CHỨA CHỨC NĂNG NHÂN VIÊN (KHÔNG CÓ ĐĂNG NHẬP)
// Đầy đủ chức năng: Quản lý phòng, Check-in, Order dịch vụ, Check-out, Tạo QR thanh toán

// ========== RENDER FUNCTIONS - STAFF ==========

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
                    ${floorRooms.map(room => {
                        let clickHandler = '';
                        let cursorStyle = '';
                        
                        if (room.status === 'reserved') {
                            clickHandler = `onclick="showReservedRoomInfo(${room.number})"`;
                            cursorStyle = 'cursor: pointer;';
                        } else if (room.status === 'occupied') {
                            clickHandler = `onclick="showOccupiedRoomInfo(${room.number})"`;
                            cursorStyle = 'cursor: pointer;';
                        }
                        
                        return `
                            <div class="room ${room.status}" ${clickHandler} style="${cursorStyle}">
                                <div class="room-number">${room.number}</div>
                                <div class="room-type">${room.typeName}</div>
                                <div class="room-status status-${room.status}">
                                    ${room.status === 'available' ? 'Còn trống' : 
                                      room.status === 'occupied' ? 'Đã thuê' : 'Đã đặt'}
                                </div>
                                ${room.customerName ? `<div class="room-customer">${room.customerName}</div>` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
    
    return `
        <div class="room-management">
            <h2 class="section-title"><i class="fas fa-door-closed"></i> Quản lý phòng</h2>
            <p>Nhấn vào phòng "Đã đặt" để xem số điện thoại nhân viên</p>
            <p>Nhấn vào phòng "Đã thuê" để xem thông tin chi tiết</p>
            
            ${floorsHTML}
        </div>
    `;
}

// Hiển thị thông tin phòng đã đặt
function showReservedRoomInfo(roomNumber) {
    const room = appData.rooms.find(r => r.number === roomNumber);
    if (!room || room.status !== 'reserved') return;
    
    alert(`Phòng ${room.number} - ĐÃ ĐẶT\nSố điện thoại nhân viên: ${room.staffPhone}\n\nĐối chiếu số điện thoại này với nhân viên để xác nhận.`);
}

// Hiển thị thông tin phòng đã thuê
function showOccupiedRoomInfo(roomNumber) {
    const room = appData.rooms.find(r => r.number === roomNumber);
    if (!room || room.status !== 'occupied') return;
    
    const booking = appData.bookings.find(b => b.roomNumber === room.number && b.status === 'active');
    
    let servicesHTML = '';
    if (room.services && room.services.length > 0) {
        servicesHTML = room.services.map(service => 
            `${service.name} x${service.quantity} - ${formatCurrency(service.total)}`
        ).join('\n');
    }
    
    const message = `
Phòng: ${room.number} - ${room.typeName}
Khách hàng: ${room.customerName}
Số điện thoại: ${room.customerPhone}
CCCD: ${room.customerId}
Ngày nhận phòng: ${formatDateTime(room.checkInDate)}
Ngày trả phòng dự kiến: ${formatDate(room.checkOutDate)}
${booking ? `Nhân viên check-in: ${booking.staffName}` : ''}

DỊCH VỤ ĐÃ GỌI:
${servicesHTML || 'Chưa gọi dịch vụ nào'}
    `;
    
    alert(message);
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
                                .filter(room => room.status === 'available')
                                .map(room => `
                                    <option value="${room.number}">${room.number} - ${room.typeName}</option>
                                `).join('')}
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-control">
                        <label for="checkin-customer-name"><i class="fas fa-user"></i> Họ tên khách hàng *</label>
                        <input type="text" id="checkin-customer-name" placeholder="Nhập họ tên" required>
                    </div>
                    <div class="form-control">
                        <label for="checkin-customer-phone"><i class="fas fa-phone"></i> Số điện thoại *</label>
                        <input type="tel" id="checkin-customer-phone" placeholder="09xxxxxxxx" 
                               pattern="(09|03|07|08|05)[0-9]{8}" maxlength="10" required>
                        <small>Định dạng: 09xxxxxxxx (10 số)</small>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-control">
                        <label for="checkin-customer-id"><i class="fas fa-id-card"></i> CCCD *</label>
                        <input type="text" id="checkin-customer-id" placeholder="12 số CCCD" 
                               pattern="[0-9]{12}" maxlength="12" required>
                        <small>12 số CCCD</small>
                    </div>
                    <div class="form-control">
                        <label for="checkin-guests"><i class="fas fa-users"></i> Số lượng khách</label>
                        <select id="checkin-guests">
                            <option value="1">1 khách</option>
                            <option value="2" selected>2 khách</option>
                            <option value="3">3 khách</option>
                            <option value="4">4 khách</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-control">
                        <label for="checkin-date"><i class="fas fa-calendar-check"></i> Ngày nhận phòng</label>
                        <input type="date" id="checkin-date" value="${new Date().toISOString().split('T')[0]}" required>
                    </div>
                    <div class="form-control">
                        <label for="checkout-date"><i class="fas fa-calendar-times"></i> Ngày trả phòng dự kiến</label>
                        <input type="date" id="checkout-date" value="${new Date(Date.now() + 86400000).toISOString().split('T')[0]}" required>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-control">
                        <label for="checkin-payment-method"><i class="fas fa-credit-card"></i> Phương thức thanh toán</label>
                        <select id="checkin-payment-method">
                            <option value="cash">Tiền mặt</option>
                            <option value="banking">Chuyển khoản</option>
                            <option value="credit">Thẻ tín dụng</option>
                        </select>
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
                <div id="checkin-success-message"></div>
            </div>
        </div>
    `;
}

// Xử lý check-in
function processCheckIn() {
    const roomNumber = document.getElementById('checkin-room').value;
    const customerName = document.getElementById('checkin-customer-name').value;
    const customerPhone = document.getElementById('checkin-customer-phone').value;
    const customerId = document.getElementById('checkin-customer-id').value;
    const checkinDate = document.getElementById('checkin-date').value;
    const checkoutDate = document.getElementById('checkout-date').value;
    const guests = document.getElementById('checkin-guests').value;
    const paymentMethod = document.getElementById('checkin-payment-method').value;
    
    // Kiểm tra thông tin
    if (!roomNumber || !customerName || !customerPhone || !customerId || !checkinDate || !checkoutDate) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
        return;
    }
    
    if (!isValidPhone(customerPhone)) {
        alert('Số điện thoại không hợp lệ! Vui lòng nhập đúng 10 số (09, 03, 07, 08, 05).');
        return;
    }
    
    if (!isValidCCCD(customerId)) {
        alert('CCCD không hợp lệ! Vui lòng nhập đúng 12 số.');
        return;
    }
    
    const room = appData.rooms.find(r => r.number == roomNumber);
    if (!room) {
        alert('Không tìm thấy phòng!');
        return;
    }
    
    if (room.status !== 'available') {
        alert('Phòng này không còn trống!');
        return;
    }
    
    // Cập nhật trạng thái phòng
    room.status = 'occupied';
    room.customerName = customerName;
    room.customerPhone = customerPhone;
    room.customerId = customerId;
    room.checkInDate = new Date(checkinDate);
    room.checkOutDate = new Date(checkoutDate);
    room.services = [];
    
    // Tạo booking mới
    const newBookingId = appData.bookings.length + 1;
    
    appData.bookings.push({
        id: newBookingId,
        customerName: customerName,
        customerPhone: customerPhone,
        customerId: customerId,
        roomNumber: room.number,
        roomType: room.type,
        roomTypeName: room.typeName,
        checkInDate: new Date(checkinDate),
        checkOutDate: new Date(checkoutDate),
        actualCheckOutDate: null,
        status: 'active',
        totalAmount: 0,
        services: [],
        paymentMethod: paymentMethod,
        staffName: currentUser ? currentUser.name : 'Nhân viên',
        createdDate: new Date()
    });
    
    // Hiển thị kết quả
    document.getElementById('checkin-success-message').innerHTML = `
        <p>Đã check-in thành công cho khách <strong>${customerName}</strong></p>
        <p>Phòng: <strong>${roomNumber}</strong> - ${room.typeName}</p>
        <p>Ngày nhận: ${checkinDate} | Ngày trả: ${checkoutDate}</p>
        <p>Số điện thoại: ${customerPhone} | CCCD: ${customerId}</p>
        <p>Mã đặt phòng: #${newBookingId}</p>
        <p>Nhân viên thực hiện: ${currentUser ? currentUser.name : 'Nhân viên'}</p>
    `;
    document.getElementById('checkin-result').classList.remove('hidden');
    
    setTimeout(() => {
        clearCheckInForm();
        document.getElementById('checkin-result').classList.add('hidden');
    }, 5000);
}

function clearCheckInForm() {
    document.getElementById('checkin-room').value = '';
    document.getElementById('checkin-customer-name').value = '';
    document.getElementById('checkin-customer-phone').value = '';
    document.getElementById('checkin-customer-id').value = '';
    document.getElementById('checkin-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('checkout-date').value = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    document.getElementById('checkin-guests').value = '2';
    document.getElementById('checkin-payment-method').value = 'cash';
}

// Render trang order đồ ăn/thức uống
function renderOrderService() {
    const occupiedRooms = appData.rooms.filter(room => room.status === 'occupied');
    
    return `
        <div class="order-service">
            <h2 class="section-title"><i class="fas fa-utensils"></i> Order dịch vụ ăn uống</h2>
            
            <div class="form-container">
                <div class="form-row">
                    <div class="form-control">
                        <label for="order-room"><i class="fas fa-door-closed"></i> Chọn phòng *</label>
                        <select id="order-room" onchange="updateOrderCustomerInfo()">
                            <option value="">-- Chọn phòng --</option>
                            ${occupiedRooms.map(room => `
                                <option value="${room.number}">${room.number} - ${room.customerName}</option>
                            `).join('')}
                        </select>
                    </div>
                </div>
                
                <div id="order-customer-info" class="hidden" style="background-color: #f0f9ff; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
                    <div class="form-row">
                        <div class="form-control">
                            <strong>Khách hàng:</strong> <span id="order-customer-name">-</span>
                        </div>
                        <div class="form-control">
                            <strong>Số điện thoại:</strong> <span id="order-customer-phone">-</span>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-control">
                            <strong>Phòng:</strong> <span id="order-room-info">-</span>
                        </div>
                        <div class="form-control">
                            <strong>Tổng dịch vụ hiện tại:</strong> <span id="order-current-total">0đ</span>
                        </div>
                    </div>
                </div>
                
                <!-- Menu dịch vụ -->
                <div class="menu-section">
                    <h4><i class="fas fa-list"></i> Menu dịch vụ</h4>
                    
                    <!-- Thức uống -->
                    <div class="menu-category" style="margin-top: 1.5rem;">
                        <h5><i class="fas fa-coffee"></i> Thức uống</h5>
                        <div class="menu-items" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem; margin-top: 1rem;">
                            ${renderMenuItem('Cà phê đen', 'Cà phê đen truyền thống', 25000)}
                            ${renderMenuItem('Cà phê sữa', 'Cà phê sữa đặc biệt', 30000)}
                            ${renderMenuItem('Nước suối', 'Nước suối 500ml', 15000)}
                            ${renderMenuItem('Nước ngọt', 'Coca/Pepsi/7Up 330ml', 20000)}
                            ${renderMenuItem('Nước cam ép', 'Cam tươi ép', 35000)}
                            ${renderMenuItem('Trà đá', 'Trà đá truyền thống', 10000)}
                        </div>
                    </div>
                    
                    <!-- Đồ ăn nhẹ -->
                    <div class="menu-category" style="margin-top: 2rem;">
                        <h5><i class="fas fa-hamburger"></i> Đồ ăn nhẹ</h5>
                        <div class="menu-items" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem; margin-top: 1rem;">
                            ${renderMenuItem('Mì tôm trứng', 'Mì tôm + 2 trứng', 40000)}
                            ${renderMenuItem('Bánh mì pate', 'Bánh mì pate đặc biệt', 25000)}
                            ${renderMenuItem('Trái cây dĩa', 'Dĩa trái cây theo mùa', 50000)}
                            ${renderMenuItem('Bánh ngọt', 'Bánh ngọt các loại', 30000)}
                            ${renderMenuItem('Xúc xích nướng', 'Xúc xích Đức', 45000)}
                            ${renderMenuItem('Bánh bao', 'Bánh bao nhân thịt', 20000)}
                        </div>
                    </div>
                    
                    <!-- Tráng miệng -->
                    <div class="menu-category" style="margin-top: 2rem;">
                        <h5><i class="fas fa-ice-cream"></i> Tráng miệng</h5>
                        <div class="menu-items" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem; margin-top: 1rem;">
                            ${renderMenuItem('Kem vani', 'Kem vani Ý', 35000)}
                            ${renderMenuItem('Kem socola', 'Kem socola Bỉ', 35000)}
                            ${renderMenuItem('Chè đậu đen', 'Chè đậu đen truyền thống', 25000)}
                            ${renderMenuItem('Sữa chua', 'Sữa chua hoa quả', 20000)}
                            ${renderMenuItem('Bánh flan', 'Bánh flan caramel', 30000)}
                            ${renderMenuItem('Trái cây mix', 'Mix 3 loại trái cây', 40000)}
                        </div>
                    </div>
                    
                    <!-- Dịch vụ khác -->
                    <div class="menu-category" style="margin-top: 2rem;">
                        <h5><i class="fas fa-concierge-bell"></i> Dịch vụ khác</h5>
                        <div class="menu-items" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem; margin-top: 1rem;">
                            ${renderMenuItem('Giặt ủi', 'Giặt 1kg đồ', 50000)}
                            ${renderMenuItem('Thuê xe máy', 'Thuê 24 giờ', 150000)}
                            ${renderMenuItem('Đưa đón sân bay', 'Xe 4-7 chỗ', 300000)}
                            ${renderMenuItem('Tour du lịch', 'Tour nửa ngày', 500000)}
                        </div>
                    </div>
                </div>
                
                <!-- Danh sách order hiện tại -->
                <div class="current-order" style="margin-top: 2rem; padding: 1.5rem; background-color: #fff8e1; border-radius: 8px;">
                    <h4><i class="fas fa-shopping-cart"></i> Đơn hàng hiện tại</h4>
                    <div id="order-items-list" style="margin-top: 1rem;">
                        <p style="text-align: center; color: #999; font-style: italic;">Chưa có món nào trong đơn hàng</p>
                    </div>
                    <div style="text-align: right; margin-top: 1rem;">
                        <strong>Tổng tiền:</strong> <span id="order-total-amount" style="font-size: 1.2rem; color: #e74c3c;">0đ</span>
                    </div>
                </div>
                
                <!-- Custom order -->
                <div class="custom-order" style="margin-top: 2rem; padding: 1.5rem; background-color: #f0f5ff; border-radius: 8px;">
                    <h4><i class="fas fa-edit"></i> Thêm dịch vụ tùy chỉnh</h4>
                    <div class="form-row">
                        <div class="form-control">
                            <label for="custom-service-name">Tên dịch vụ</label>
                            <input type="text" id="custom-service-name" placeholder="Ví dụ: Nước ép cam">
                        </div>
                        <div class="form-control">
                            <label for="custom-service-price">Giá tiền (VND)</label>
                            <input type="number" id="custom-service-price" placeholder="50000" min="1000">
                        </div>
                        <div class="form-control">
                            <label for="custom-service-quantity">Số lượng</label>
                            <input type="number" id="custom-service-quantity" value="1" min="1" max="99">
                        </div>
                        <div class="form-control">
                            <button class="btn btn-primary" onclick="addCustomToOrder()" style="margin-top: 1.5rem;">
                                <i class="fas fa-plus-circle"></i> Thêm dịch vụ
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Nút hành động -->
                <div class="form-actions" style="margin-top: 2rem; text-align: center;">
                    <button class="btn btn-success" onclick="confirmOrder()">
                        <i class="fas fa-check"></i> Xác nhận đơn hàng
                    </button>
                    <button class="btn btn-secondary" onclick="clearOrder()" style="margin-left: 10px;">
                        <i class="fas fa-times"></i> Hủy đơn
                    </button>
                    <button class="btn btn-primary" onclick="createBillFromOrder()" style="margin-left: 10px;">
                        <i class="fas fa-file-invoice-dollar"></i> Tạo hóa đơn ngay
                    </button>
                </div>
            </div>
            
            <div id="order-success" class="hidden" style="margin-top: 2rem; padding: 1.5rem; background-color: #d4edda; border-radius: 8px; text-align: center;">
                <h4><i class="fas fa-check-circle"></i> Order thành công!</h4>
                <p id="order-success-message"></p>
                <p id="order-bill-info" class="hidden"></p>
            </div>
        </div>
    `;
}

function renderMenuItem(name, description, price) {
    return `
        <div class="menu-item" style="border: 1px solid #ddd; padding: 1rem; border-radius: 8px; background: white;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>${name}</strong>
                    <p style="color: #666; margin: 5px 0; font-size: 0.9em;">${description}</p>
                    <strong style="color: #e74c3c;">${formatCurrency(price)}</strong>
                </div>
                <button class="btn btn-sm btn-primary" onclick="addToOrder('${name}', ${price})">
                    <i class="fas fa-plus"></i> Thêm
                </button>
            </div>
        </div>
    `;
}

// Biến lưu đơn hàng tạm thời
let currentOrder = {
    roomNumber: null,
    items: [],
    total: 0
};

// Cập nhật thông tin khách hàng khi chọn phòng
function updateOrderCustomerInfo() {
    const roomNumber = document.getElementById('order-room').value;
    if (!roomNumber) {
        document.getElementById('order-customer-info').classList.add('hidden');
        return;
    }
    
    const room = appData.rooms.find(r => r.number == roomNumber);
    if (!room) return;
    
    document.getElementById('order-customer-name').textContent = room.customerName;
    document.getElementById('order-customer-phone').textContent = room.customerPhone;
    document.getElementById('order-room-info').textContent = room.number + ' - ' + room.typeName;
    
    const currentServiceTotal = room.services ? 
        room.services.reduce((sum, service) => sum + service.total, 0) : 0;
    document.getElementById('order-current-total').textContent = formatCurrency(currentServiceTotal);
    
    document.getElementById('order-customer-info').classList.remove('hidden');
    
    currentOrder = {
        roomNumber: roomNumber,
        items: [],
        total: 0
    };
    
    updateOrderDisplay();
}

// Thêm món vào order
function addToOrder(itemName, itemPrice) {
    const roomNumber = document.getElementById('order-room').value;
    if (!roomNumber) {
        alert('Vui lòng chọn phòng trước khi thêm món!');
        return;
    }
    
    const existingItem = currentOrder.items.find(item => item.name === itemName);
    if (existingItem) {
        existingItem.quantity++;
        existingItem.total = existingItem.quantity * existingItem.price;
    } else {
        currentOrder.items.push({
            name: itemName,
            price: itemPrice,
            quantity: 1,
            total: itemPrice
        });
    }
    
    currentOrder.total = currentOrder.items.reduce((sum, item) => sum + item.total, 0);
    
    updateOrderDisplay();
}

// Thêm dịch vụ tùy chỉnh
function addCustomToOrder() {
    const roomNumber = document.getElementById('order-room').value;
    if (!roomNumber) {
        alert('Vui lòng chọn phòng trước!');
        return;
    }
    
    const serviceName = document.getElementById('custom-service-name').value;
    const servicePrice = parseInt(document.getElementById('custom-service-price').value);
    const serviceQuantity = parseInt(document.getElementById('custom-service-quantity').value);
    
    if (!serviceName || !servicePrice || servicePrice < 1000) {
        alert('Vui lòng nhập đầy đủ thông tin dịch vụ!');
        return;
    }
    
    currentOrder.items.push({
        name: serviceName,
        price: servicePrice,
        quantity: serviceQuantity,
        total: servicePrice * serviceQuantity
    });
    
    currentOrder.total = currentOrder.items.reduce((sum, item) => sum + item.total, 0);
    
    document.getElementById('custom-service-name').value = '';
    document.getElementById('custom-service-price').value = '';
    document.getElementById('custom-service-quantity').value = 1;
    
    updateOrderDisplay();
}

// Cập nhật hiển thị order
function updateOrderDisplay() {
    const orderItemsList = document.getElementById('order-items-list');
    const orderTotalAmount = document.getElementById('order-total-amount');
    
    if (currentOrder.items.length === 0) {
        orderItemsList.innerHTML = '<p style="text-align: center; color: #999; font-style: italic;">Chưa có món nào trong đơn hàng</p>';
        orderTotalAmount.textContent = '0đ';
        return;
    }
    
    orderItemsList.innerHTML = `
        <div style="margin-bottom: 1rem;">
            ${currentOrder.items.map((item, index) => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: white; border-radius: 5px; margin-bottom: 5px;">
                    <div>
                        <strong>${item.name}</strong>
                        <div style="font-size: 0.9em; color: #666;">
                            ${formatCurrency(item.price)} x ${item.quantity}
                        </div>
                    </div>
                    <div style="display: flex; align-items: center;">
                        <span style="margin-right: 1rem; color: #e74c3c; font-weight: bold;">
                            ${formatCurrency(item.total)}
                        </span>
                        <button class="btn btn-sm btn-danger" onclick="removeOrderItem(${index})" style="padding: 2px 8px;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    orderTotalAmount.textContent = formatCurrency(currentOrder.total);
}

// Xóa món khỏi order
function removeOrderItem(index) {
    currentOrder.items.splice(index, 1);
    currentOrder.total = currentOrder.items.reduce((sum, item) => sum + item.total, 0);
    updateOrderDisplay();
}

// Xác nhận order
function confirmOrder() {
    const roomNumber = document.getElementById('order-room').value;
    if (!roomNumber) {
        alert('Vui lòng chọn phòng!');
        return;
    }
    
    if (currentOrder.items.length === 0) {
        alert('Đơn hàng trống! Vui lòng thêm ít nhất một món.');
        return;
    }
    
    const room = appData.rooms.find(r => r.number == roomNumber);
    if (!room) {
        alert('Không tìm thấy phòng!');
        return;
    }
    
    if (!room.services) {
        room.services = [];
    }
    
    currentOrder.items.forEach(item => {
        room.services.push({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            total: item.total,
            orderDate: new Date(),
            staffName: currentUser ? currentUser.name : 'Nhân viên'
        });
    });
    
    document.getElementById('order-success-message').innerHTML = `
        Đã order thành công cho phòng <strong>${roomNumber}</strong><br>
        Tổng số món: <strong>${currentOrder.items.length}</strong><br>
        Tổng tiền: <strong>${formatCurrency(currentOrder.total)}</strong><br>
        Khách hàng: <strong>${room.customerName}</strong>
    `;
    
    document.getElementById('order-success').classList.remove('hidden');
    
    currentOrder = {
        roomNumber: null,
        items: [],
        total: 0
    };
    
    updateOrderDisplay();
    
    setTimeout(() => {
        document.getElementById('order-success').classList.add('hidden');
    }, 5000);
}

// Xóa order
function clearOrder() {
    currentOrder = {
        roomNumber: null,
        items: [],
        total: 0
    };
    updateOrderDisplay();
    alert('Đã xóa đơn hàng hiện tại');
}

// Tạo hóa đơn ngay từ order
function createBillFromOrder() {
    const roomNumber = document.getElementById('order-room').value;
    if (!roomNumber) {
        alert('Vui lòng chọn phòng!');
        return;
    }
    
    if (currentOrder.items.length === 0) {
        alert('Đơn hàng trống! Vui lòng thêm ít nhất một món.');
        return;
    }
    
    const room = appData.rooms.find(r => r.number == roomNumber);
    if (!room) {
        alert('Không tìm thấy phòng!');
        return;
    }
    
    // Thêm dịch vụ vào phòng trước
    if (!room.services) {
        room.services = [];
    }
    
    currentOrder.items.forEach(item => {
        room.services.push({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            total: item.total,
            orderDate: new Date(),
            staffName: currentUser ? currentUser.name : 'Nhân viên'
        });
    });
    
    // Chuyển sang trang check-out với phòng đã chọn
    switchView('check-out');
    
    // Đợi DOM load xong
    setTimeout(() => {
        document.getElementById('checkout-room').value = roomNumber;
        loadCheckoutInfo();
    }, 100);
}

// Render trang check-out & xuất bill (STAFF)
function renderCheckOutProcess() {
    return `
        <div class="checkout-process">
            <h2 class="section-title"><i class="fas fa-file-invoice-dollar"></i> Check-out & Xuất hóa đơn</h2>
            
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
                            <strong>CCCD:</strong> <span id="checkout-customer-id">-</span>
                        </div>
                        <div class="form-control">
                            <strong>Ngày nhận phòng:</strong> <span id="checkout-checkin">-</span>
                        </div>
                    </div>
                </div>
                
                <!-- Dịch vụ đã gọi -->
                <div class="service-section" style="margin-bottom: 2rem;">
                    <h4><i class="fas fa-utensils"></i> Dịch vụ đã gọi</h4>
                    <div id="checkout-services-list" style="margin-top: 1rem;">
                        <!-- Dữ liệu sẽ được thêm bằng JavaScript -->
                    </div>
                    <div style="text-align: right; margin-top: 1rem;">
                        <strong>Tổng dịch vụ:</strong> <span id="service-total-amount">0đ</span>
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
                                    <th>Mục</th>
                                    <th>Số lượng</th>
                                    <th>Đơn giá</th>
                                    <th>Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody id="bill-items">
                                <!-- Dữ liệu sẽ được thêm bằng JavaScript -->
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
                    
                    <div class="form-row" style="margin-top: 2rem;">
                        <div class="form-control">
                            <label for="payment-method-final"><i class="fas fa-credit-card"></i> Phương thức thanh toán</label>
                            <select id="payment-method-final">
                                <option value="cash">Tiền mặt</option>
                                <option value="banking">Chuyển khoản</option>
                                <option value="credit">Thẻ tín dụng</option>
                                <option value="qr">QR Code</option>
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
                        <button class="btn btn-success" onclick="createBill()">
                            <i class="fas fa-save"></i> Tạo hóa đơn
                        </button>
                        <button class="btn btn-primary" onclick="printBill()" style="margin-left: 10px;">
                            <i class="fas fa-print"></i> In hóa đơn
                        </button>
                        <button class="btn btn-info" onclick="generateQRForBill()" style="margin-left: 10px;">
                            <i class="fas fa-qrcode"></i> Tạo QR thanh toán
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Tải thông tin check-out
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
    
    // Hiển thị thông tin khách hàng
    document.getElementById('checkout-customer-name').textContent = room.customerName;
    document.getElementById('checkout-customer-phone').textContent = room.customerPhone;
    document.getElementById('checkout-customer-id').textContent = room.customerId;
    document.getElementById('checkout-checkin').textContent = formatDate(room.checkInDate);
    
    // Thông tin phòng
    document.getElementById('bill-room-number').textContent = room.number;
    document.getElementById('bill-room-type').textContent = room.typeName;
    
    // Tính số ngày
    const checkIn = new Date(room.checkInDate);
    const checkOut = new Date();
    const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)) || 1;
    document.getElementById('bill-days').textContent = days;
    
    // Tính tiền phòng
    document.getElementById('bill-room-price').textContent = formatCurrency(room.price);
    const roomTotal = room.price * days;
    document.getElementById('bill-room-total').textContent = formatCurrency(roomTotal);
    
    // Hiển thị dịch vụ đã gọi
    const servicesList = document.getElementById('checkout-services-list');
    const billItems = document.getElementById('bill-items');
    
    if (room.services && room.services.length > 0) {
        servicesList.innerHTML = room.services.map(service => `
            <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee;">
                <span>${service.name} x${service.quantity}</span>
                <span>${formatCurrency(service.total)}</span>
            </div>
        `).join('');
        
        billItems.innerHTML = `
            <tr>
                <td>1</td>
                <td>Tiền phòng (${days} ngày)</td>
                <td>${days}</td>
                <td>${formatCurrency(room.price)}</td>
                <td>${formatCurrency(roomTotal)}</td>
            </tr>
            ${room.services.map((service, index) => `
                <tr>
                    <td>${index + 2}</td>
                    <td>${service.name}</td>
                    <td>${service.quantity}</td>
                    <td>${formatCurrency(service.price)}</td>
                    <td>${formatCurrency(service.total)}</td>
                </tr>
            `).join('')}
        `;
        
        const serviceTotal = room.services.reduce((sum, service) => sum + service.total, 0);
        document.getElementById('service-total-amount').textContent = formatCurrency(serviceTotal);
        document.getElementById('bill-services-total').textContent = formatCurrency(serviceTotal);
    } else {
        servicesList.innerHTML = '<p style="color: #999; font-style: italic;">Không có dịch vụ nào</p>';
        billItems.innerHTML = `
            <tr>
                <td>1</td>
                <td>Tiền phòng (${days} ngày)</td>
                <td>${days}</td>
                <td>${formatCurrency(room.price)}</td>
                <td>${formatCurrency(roomTotal)}</td>
            </tr>
        `;
        document.getElementById('service-total-amount').textContent = '0đ';
        document.getElementById('bill-services-total').textContent = '0đ';
    }
    
    const serviceTotal = room.services ? room.services.reduce((sum, service) => sum + service.total, 0) : 0;
    const grandTotal = roomTotal + serviceTotal;
    document.getElementById('bill-grand-total').textContent = formatCurrency(grandTotal);
    
    document.getElementById('checkout-info').classList.remove('hidden');
}

// Tạo hóa đơn
function createBill() {
    const roomNumber = document.getElementById('checkout-room').value;
    const paymentMethod = document.getElementById('payment-method-final').value;
    const paymentStatus = document.getElementById('payment-status').value;
    
    if (!roomNumber) {
        alert('Vui lòng chọn phòng trước!');
        return;
    }
    
    const room = appData.rooms.find(r => r.number == roomNumber);
    const booking = appData.bookings.find(b => b.roomNumber == roomNumber && b.status === 'active');
    
    if (!room || !booking) {
        alert('Không tìm thấy thông tin!');
        return;
    }
    
    const checkIn = new Date(room.checkInDate);
    const checkOut = new Date();
    const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)) || 1;
    const roomTotal = room.price * days;
    const serviceTotal = room.services ? room.services.reduce((sum, service) => sum + service.total, 0) : 0;
    const totalAmount = roomTotal + serviceTotal;
    
    // Tạo bill mới
    const newBillId = appData.bills.length + 1;
    const newBill = {
        id: newBillId,
        billNumber: `HD${1000 + newBillId}`,
        roomNumber: room.number,
        customerName: room.customerName,
        customerId: room.customerId,
        checkInDate: room.checkInDate,
        checkOutDate: checkOut,
        days: days,
        roomType: room.typeName,
        roomPrice: room.price,
        roomTotal: roomTotal,
        services: room.services || [],
        serviceTotal: serviceTotal,
        totalAmount: totalAmount,
        paymentMethod: paymentMethod,
        status: paymentStatus === 'paid' ? 'paid' : 'pending',
        staffName: currentUser ? currentUser.name : 'Nhân viên',
        createdDate: new Date()
    };
    
    appData.bills.push(newBill);
    
    // Cập nhật trạng thái phòng
    room.status = 'available';
    room.customerName = null;
    room.customerPhone = null;
    room.customerId = null;
    room.checkInDate = null;
    room.checkOutDate = null;
    room.services = [];
    
    // Cập nhật booking
    booking.status = 'completed';
    booking.actualCheckOutDate = checkOut;
    booking.totalAmount = totalAmount;
    
    alert(`Đã tạo hóa đơn #${newBill.billNumber} thành công!\nSố tiền: ${formatCurrency(totalAmount)}`);
    
    // Reset và quay về trang quản lý phòng
    document.getElementById('checkout-info').classList.add('hidden');
    document.getElementById('checkout-room').value = '';
    switchView('room-management');
}

// Tạo QR cho bill hiện tại
function generateQRForBill() {
    const roomNumber = document.getElementById('checkout-room').value;
    if (!roomNumber) {
        alert('Vui lòng chọn phòng và tải thông tin trước!');
        return;
    }
    
    const totalAmount = parseFloat(document.getElementById('bill-grand-total').textContent.replace(/[^0-9]/g, ''));
    if (!totalAmount || totalAmount === 0) {
        alert('Không có số tiền để tạo QR!');
        return;
    }
    
    // Chuyển sang trang tạo QR
    switchView('qr-generator');
    
    // Đợi DOM load xong
    setTimeout(() => {
        document.getElementById('qr-amount').value = totalAmount;
        document.getElementById('qr-description').value = `Thanh toán phòng ${roomNumber}`;
        generateVietQR();
    }, 100);
}

function printBill() {
    alert('In hóa đơn... (Trong thực tế sẽ gọi window.print())');
    // window.print();
}

// Render trang tạo mã thanh toán (STAFF) - SỬ DỤNG VIETQR API
function renderQRGenerator() {
    return `
        <div class="qr-generator">
            <h2 class="section-title"><i class="fas fa-qrcode"></i> Tạo mã thanh toán</h2>
            <p>Tạo mã QR thanh toán qua ngân hàng</p>
            
            <div class="form-container">
                <div class="form-row">
                    <div class="form-control">
                        <label for="qr-amount"><i class="fas fa-money-bill-wave"></i> Số tiền (VND) *</label>
                        <input type="number" id="qr-amount" placeholder="Nhập số tiền" min="1000" required>
                        <small>Tối thiểu 1,000 VND</small>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-control">
                        <label for="qr-description"><i class="fas fa-file-alt"></i> Nội dung chuyển khoản *</label>
                        <input type="text" id="qr-description" placeholder="Ví dụ: Thanh toán phòng 101" required>
                        <small>Tối đa 20 ký tự</small>
                    </div>
                </div>
                
                <div class="bank-info" style="background-color: #f0f5ff; padding: 1.5rem; border-radius: 8px; margin-top: 1rem;">
                    <h4><i class="fas fa-university"></i> Thông tin tài khoản</h4>
                    <div class="form-row">
                        <div class="form-control">
                            <strong>Ngân hàng:</strong> Ngân hàng Á Châu - ACB
                        </div>
                        <div class="form-control">
                            <strong>Mã ngân hàng:</strong> 970416
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-control">
                            <strong>Số tài khoản:</strong> 43146717
                        </div>
                        <div class="form-control">
                            <strong>Chi nhánh:</strong> QUY NHƠN
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-control">
                            <strong>Tên chủ tài khoản:</strong> ĐINH TẤN HUY
                        </div>
                    </div>
                </div>
                
                <div class="form-actions" style="margin-top: 2rem; text-align: center;">
                    <button class="btn btn-primary" onclick="generateVietQR()">
                        <i class="fas fa-qrcode"></i> Tạo mã QR
                    </button>
                    <button class="btn btn-secondary" onclick="clearQRForm()">
                        <i class="fas fa-times"></i> Xóa form
                    </button>
                    <button class="btn btn-info" onclick="showQRHistory()" style="margin-left: 10px;">
                        <i class="fas fa-history"></i> Lịch sử QR
                    </button>
                </div>
            </div>
            
            <div id="vietqr-result" class="hidden" style="margin-top: 2rem;">
                <div class="qr-result-container" style="text-align: center; padding: 2rem; background-color: #f9f9f9; border-radius: 8px;">
                    <h4><i class="fas fa-qrcode"></i> Mã QR thanh toán VietQR</h4>
                    
                    <div style="display: flex; gap: 2rem; margin-top: 1.5rem; flex-wrap: wrap; justify-content: center;">
                        <div class="qr-display" style="flex: 1; min-width: 300px;">
                            <div id="real-qr-image" style="margin: 0 auto; width: 250px; height: 250px; background-color: white; border: 2px solid #ddd; display: flex; align-items: center; justify-content: center;">
                                <img id="generated-qr" src="" alt="QR Code" style="max-width: 100%; max-height: 100%; display: none;">
                                <div id="qr-loading" style="text-align: center;">
                                    <div class="spinner" style="font-size: 3rem; margin-bottom: 10px;">⌛</div>
                                    <div>Đang tạo mã QR...</div>
                                </div>
                            </div>
                            <p style="margin-top: 1rem; font-size: 0.9rem; color: #666;">Quét mã QR để thanh toán</p>
                        </div>
                        
                        <div class="qr-details" style="flex: 1; min-width: 300px; text-align: left;">
                            <h5>Thông tin thanh toán</h5>
                            <div id="vietqr-details" style="background-color: white; padding: 1.5rem; border-radius: 8px; margin-top: 1rem;">
                                <p><strong>Số tiền:</strong> <span id="qr-amount-display">0</span> VND</p>
                                <p><strong>Nội dung:</strong> <span id="qr-description-display">-</span></p>
                                <p><strong>Tài khoản:</strong> 43146717 - ACB </p>
                                <p><strong>Chủ tài khoản:</strong> ĐINH TẤN HUY</p>
                                <p><strong>Ngày tạo:</strong> ${formatDateTime(new Date())}</p>
                                <p><strong>Nhân viên:</strong> ${currentUser ? currentUser.name : 'Nhân viên'}</p>
                                <p><strong>Mã giao dịch:</strong> <span id="qr-transaction-id">-</span></p>
                            </div>
                            
                            <div class="qr-instructions" style="margin-top: 1rem; padding: 1rem; background-color: #fff8e1; border-radius: 8px;">
                                <h6><i class="fas fa-info-circle"></i> Hướng dẫn thanh toán:</h6>
                                <ol style="text-align: left; margin-left: 1.5rem; font-size: 0.9rem;">
                                    <li>Mở app ngân hàng trên điện thoại</li>
                                    <li>Chọn tính năng "Quét mã QR"</li>
                                    <li>Quét mã QR bên trái</li>
                                    <li>Kiểm tra thông tin và xác nhận thanh toán</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                    
                    <div class="qr-actions" style="margin-top: 2rem;">
                        <button class="btn btn-success" onclick="saveVietQR()">
                            <i class="fas fa-save"></i> Lưu thông tin
                        </button>
                        <button class="btn btn-primary" onclick="downloadQR()" style="margin-left: 10px;">
                            <i class="fas fa-download"></i> Tải mã QR
                        </button>
                        <button class="btn btn-info" onclick="shareQR()" style="margin-left: 10px;">
                            <i class="fas fa-share-alt"></i> Chia sẻ
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <style>
            .spinner {
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
}

// Tạo VietQR sử dụng API thực
function generateVietQR() {
    const amount = parseInt(document.getElementById('qr-amount').value);
    const description = document.getElementById('qr-description').value;
    
    if (!amount || amount < 1000) {
        alert('Vui lòng nhập số tiền hợp lệ (tối thiểu 1,000 VND)!');
        return;
    }
    
    if (!description || description.trim().length === 0) {
        alert('Vui lòng nhập nội dung chuyển khoản!');
        return;
    }
    
    const cleanDescription = removeVietnameseTones(description.substring(0, 20));
    
    const bankInfo = {
        bankCode: "970416",
        accountNumber: "43146717",
        accountName: "DINH TAN HUY",
        amount: amount,
        description: cleanDescription,
        template: "compact2"
    };
    
    document.getElementById('vietqr-result').classList.remove('hidden');
    document.getElementById('qr-loading').style.display = 'block';
    document.getElementById('generated-qr').style.display = 'none';
    
    document.getElementById('qr-amount-display').textContent = amount.toLocaleString();
    document.getElementById('qr-description-display').textContent = description;
    document.getElementById('qr-transaction-id').textContent = 'TX' + Date.now();
    
    createVietQRCode(bankInfo);
    
    document.getElementById('vietqr-result').scrollIntoView({ behavior: 'smooth' });
}

// Hàm tạo QR code bằng VietQR API
function createVietQRCode(bankInfo) {
    const qrImageUrl = `https://img.vietqr.io/image/ACB-${bankInfo.accountNumber}-${bankInfo.template || 'compact2'}.jpg?amount=${bankInfo.amount}&addInfo=${encodeURIComponent(bankInfo.description)}&accountName=${encodeURIComponent(bankInfo.accountName)}`;
    
    const qrImg = document.getElementById('generated-qr');
    qrImg.src = qrImageUrl;
    qrImg.alt = `QR Thanh toán ${bankInfo.amount} VND`;
    
    qrImg.onload = function() {
        document.getElementById('qr-loading').style.display = 'none';
        qrImg.style.display = 'block';
        qrImg.dataset.qrUrl = qrImageUrl;
    };
    
    qrImg.onerror = function() {
        document.getElementById('qr-loading').innerHTML = `
            <div style="color: #f44336;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem;"></i>
                <p>Không thể tạo mã QR</p>
                <p>Vui lòng thử lại sau</p>
            </div>
        `;
    };
}

// Lưu thông tin QR
function saveVietQR() {
    const amount = parseInt(document.getElementById('qr-amount').value);
    const description = document.getElementById('qr-description').value;
    
    if (!amount || amount < 1000) {
        alert('Không thể lưu mã QR với số tiền không hợp lệ!');
        return;
    }
    
    const newQRId = appData.qrCodes.length + 1;
    const transactionId = 'TX' + Date.now();
    
    const newQR = {
        id: newQRId,
        transactionId: transactionId,
        billId: null,
        roomNumber: null,
        customerName: "Khách thanh toán QR",
        totalAmount: amount,
        content: description || `Thanh toán ${amount} VND`,
        bank: "ACB",
        accountNumber: "43146717",
        accountName: "ĐINH TẤN HUY",
        bankCode: "970416",
        createdDate: new Date(),
        staffName: currentUser ? currentUser.name : 'Nhân viên',
        status: 'generated',
        qrUrl: document.getElementById('generated-qr')?.src || ''
    };
    
    appData.qrCodes.push(newQR);
    
    alert(`Đã lưu thông tin QR #${newQRId} thành công!\nMã giao dịch: ${transactionId}\nSố tiền: ${formatCurrency(amount)}`);
}

// Tải mã QR về máy
function downloadQR() {
    const qrImg = document.getElementById('generated-qr');
    if (!qrImg.src) {
        alert('Chưa có mã QR để tải!');
        return;
    }
    
    const amount = document.getElementById('qr-amount-display').textContent;
    const description = document.getElementById('qr-description-display').textContent;
    
    const link = document.createElement('a');
    link.href = qrImg.src;
    link.download = `VietQR_${amount}VND_${Date.now()}.png`;
    link.click();
    
    alert('Đang tải mã QR về máy...');
}

// Chia sẻ mã QR
function shareQR() {
    const qrImg = document.getElementById('generated-qr');
    if (!qrImg.src) {
        alert('Chưa có mã QR để chia sẻ!');
        return;
    }
    
    const amount = document.getElementById('qr-amount-display').textContent;
    const description = document.getElementById('qr-description-display').textContent;
    
    const shareText = `Mã QR thanh toán ${amount} VND\nNội dung: ${description}\nTài khoản: 43146717 - ACB\nChủ TK: ĐINH TẤN HUY`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Mã QR thanh toán Sunshine Hotel',
            text: shareText,
            url: qrImg.src
        })
        .then(() => console.log('Chia sẻ thành công'))
        .catch(error => console.log('Lỗi chia sẻ:', error));
    } else {
        navigator.clipboard.writeText(shareText + '\n' + qrImg.src)
            .then(() => alert('Đã sao chép thông tin mã QR vào clipboard!'))
            .catch(err => alert('Không thể sao chép: ' + err));
    }
}

// Xóa dấu tiếng Việt
function removeVietnameseTones(str) {
    str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    str = str.replace(/đ/g, 'd').replace(/Đ/g, 'D');
    str = str.replace(/[^a-zA-Z0-9 ]/g, '');
    return str.toUpperCase();
}

function clearQRForm() {
    document.getElementById('qr-amount').value = '';
    document.getElementById('qr-description').value = '';
    document.getElementById('vietqr-result').classList.add('hidden');
}

// Xem lịch sử QR đã tạo
function showQRHistory() {
    if (!appData.qrCodes || appData.qrCodes.length === 0) {
        alert('Chưa có mã QR nào được tạo!');
        return;
    }
    
    const historyHTML = appData.qrCodes.slice().reverse().map(qr => `
        <div style="border: 1px solid #ddd; padding: 1rem; margin-bottom: 1rem; border-radius: 8px; background: white;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <p style="margin: 0;"><strong>Mã giao dịch:</strong> ${qr.transactionId || 'N/A'}</p>
                    <p style="margin: 5px 0;"><strong>Số tiền:</strong> <span style="color: #e74c3c;">${formatCurrency(qr.totalAmount)}</span></p>
                    <p style="margin: 0;"><strong>Nội dung:</strong> ${qr.content}</p>
                    <p style="margin: 5px 0;"><strong>Ngày tạo:</strong> ${formatDateTime(qr.createdDate)}</p>
                </div>
                <span class="status-badge ${qr.status}" style="padding: 3px 10px; border-radius: 20px; font-size: 0.8em;">
                    ${qr.status === 'generated' ? 'Đã tạo' : 
                      qr.status === 'paid' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                </span>
            </div>
        </div>
    `).join('');
    
    alertHTML(`
        <div style="max-width: 600px; max-height: 500px; overflow-y: auto;">
            <h3 style="margin-bottom: 1rem; color: #2c3e50;">Lịch sử mã QR</h3>
            <p style="color: #7f8c8d;">Tổng số: ${appData.qrCodes.length} mã QR</p>
            <div style="margin-top: 1rem;">
                ${historyHTML}
            </div>
        </div>
    `);
}

// Hiển thị alert với HTML
function alertHTML(html) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: white;
        padding: 2rem;
        border-radius: 10px;
        max-width: 90%;
        max-height: 90%;
        overflow: auto;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
    `;
    content.innerHTML = html;
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Đóng';
    closeBtn.style.cssText = `
        margin-top: 1rem;
        padding: 0.5rem 1.5rem;
        background: #3498db;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 1em;
    `;
    closeBtn.onclick = () => modal.remove();
    
    content.appendChild(closeBtn);
    modal.appendChild(content);
    document.body.appendChild(modal);
}

// ========== HÀM CHỨC NĂNG BỔ SUNG ==========

// Định dạng tiền tệ
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// Định dạng ngày tháng
function formatDate(date) {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('vi-VN');
}

// Định dạng ngày giờ
function formatDateTime(date) {
    if (!date) return '-';
    return new Date(date).toLocaleString('vi-VN');
}

// Kiểm tra số điện thoại hợp lệ
function isValidPhone(phone) {
    const phoneRegex = /^(09|03|07|08|05)[0-9]{8}$/;
    return phoneRegex.test(phone);
}

// Kiểm tra CCCD hợp lệ
function isValidCCCD(cccd) {
    const cccdRegex = /^[0-9]{12}$/;
    return cccdRegex.test(cccd);
}

// Thêm CSS cho status badges
document.head.insertAdjacentHTML('beforeend', `
    <style>
        .status-badge {
            padding: 3px 10px;
            border-radius: 20px;
            font-size: 0.8em;
            font-weight: bold;
        }
        .status-badge.generated {
            background-color: #3498db;
            color: white;
        }
        .status-badge.paid {
            background-color: #2ecc71;
            color: white;
        }
        .status-badge.pending {
            background-color: #f39c12;
            color: white;
        }
        .hidden {
            display: none !important;
        }
    </style>
`);

// Khởi tạo dữ liệu mẫu nếu chưa có
if (!appData) {
    var appData = {
        rooms: [],
        bookings: [],
        bills: [],
        qrCodes: []
    };
}

if (!APP_CONFIG) {
    var APP_CONFIG = {
        hotel: {
            floors: 3
        }
    };
}

if (!currentUser) {
    var currentUser = {
        name: "Nhân viên quầy"
    };
}
