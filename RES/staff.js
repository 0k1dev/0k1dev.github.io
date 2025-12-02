// staff.js - CHỈ CHỨA CHỨC NĂNG NHÂN VIÊN (KHÔNG CÓ ĐĂNG NHẬP)

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

// Hiển thị thông tin phòng đã đặt (chỉ hiện số điện thoại nhân viên)
function showReservedRoomInfo(roomNumber) {
    const room = appData.rooms.find(r => r.number === roomNumber);
    if (!room || room.status !== 'reserved') return;
    
    alert(`Phòng ${room.number} - ĐÃ ĐẶT\nSố điện thoại nhân viên: ${room.staffPhone}\n\nĐối chiếu số điện thoại này với nhân viên để xác nhận.`);
}

// Hiển thị thông tin phòng đã thuê
function showOccupiedRoomInfo(roomNumber) {
    const room = appData.rooms.find(r => r.number === roomNumber);
    if (!room || room.status !== 'occupied') return;
    
    // Tìm booking cho phòng này
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
                            <option value="2">2 khách</option>
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
    
    // Kiểm tra số điện thoại
    if (!isValidPhone(customerPhone)) {
        alert('Số điện thoại không hợp lệ! Vui lòng nhập đúng 10 số (09, 03, 07, 08, 05).');
        return;
    }
    
    // Kiểm tra CCCD
    if (!isValidCCCD(customerId)) {
        alert('CCCD không hợp lệ! Vui lòng nhập đúng 12 số.');
        return;
    }
    
    // Tìm phòng
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
    
    // Reset form sau 5 giây
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
    document.getElementById('checkin-guests').value = '1';
    document.getElementById('checkin-payment-method').value = 'cash';
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
    const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
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
    
    // Tính tổng
    const serviceTotal = room.services ? room.services.reduce((sum, service) => sum + service.total, 0) : 0;
    const grandTotal = roomTotal + serviceTotal;
    document.getElementById('bill-grand-total').textContent = formatCurrency(grandTotal);
    
    // Hiển thị phần check-out
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
    
    // Tính toán
    const checkIn = new Date(room.checkInDate);
    const checkOut = new Date();
    const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
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

function printBill() {
    alert('In hóa đơn... (Trong thực tế sẽ gọi window.print())');
}

// Render trang tạo mã thanh toán (STAFF) - CHỈ NHẬP SỐ TIỀN
// Render trang tạo mã thanh toán (STAFF) - SỬ DỤNG VIETQR API
function renderQRGenerator() {
    return `
        <div class="qr-generator">
            <h2 class="section-title"><i class="fas fa-qrcode"></i> Tạo mã thanh toán VietQR</h2>
            <p>Tạo mã QR thanh toán qua ngân hàng ACB</p>
            
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
                        <small>Tối đa 20 ký tự (không dấu)</small>
                    </div>
                </div>
                
                <div class="bank-info" style="background-color: #f0f5ff; padding: 1.5rem; border-radius: 8px; margin-top: 1rem;">
                    <h4><i class="fas fa-university"></i> Thông tin tài khoản VietQR - ACB</h4>
                    <div class="form-row">
                        <div class="form-control">
                            <strong>Ngân hàng:</strong> Ngân hàng TMCP Á Châu (ACB)
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
                                <p><strong>Tài khoản:</strong> 43146717 - ACB (970416)</p>
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
    
    // Loại bỏ dấu và giới hạn ký tự
    const cleanDescription = removeVietnameseTones(description.substring(0, 20));
    
    // Thông tin tài khoản ACB
    const bankInfo = {
        bankCode: "970416", // Mã ngân hàng ACB
        accountNumber: "43146717",
        accountName: "DINH TAN HUY",
        amount: amount,
        description: cleanDescription,
        template: "compact2"
    };
    
    // Hiển thị loading
    document.getElementById('vietqr-result').classList.remove('hidden');
    document.getElementById('qr-loading').style.display = 'block';
    document.getElementById('generated-qr').style.display = 'none';
    
    // Cập nhật thông tin hiển thị
    document.getElementById('qr-amount-display').textContent = amount.toLocaleString();
    document.getElementById('qr-description-display').textContent = description;
    document.getElementById('qr-transaction-id').textContent = 'TX' + Date.now();
    
    // Tạo QR code sử dụng API VietQR
    createVietQRCode(bankInfo);
    
    // Cuộn đến phần kết quả
    document.getElementById('vietqr-result').scrollIntoView({ behavior: 'smooth' });
}

// Hàm tạo QR code bằng VietQR API
function createVietQRCode(bankInfo) {
    // URL API VietQR
    const apiUrl = `https://api.vietqr.io/v2/generate`;
    
    // Dữ liệu gửi lên API
    const requestData = {
        accountNo: bankInfo.accountNumber,
        accountName: bankInfo.accountName,
        acqId: bankInfo.bankCode, // Mã ngân hàng
        amount: bankInfo.amount,
        addInfo: bankInfo.description,
        format: "text", // text hoặc base64
        template: bankInfo.template || "compact"
    };
    
    // Tạo URL QR trực tiếp (phương pháp đơn giản)
    // Hoặc có thể sử dụng: https://img.vietqr.io/image/ACB-43146717-compact2.jpg?amount=100000&addInfo=Thanh toan phong 101
    const qrImageUrl = `https://img.vietqr.io/image/ACB-${bankInfo.accountNumber}-${bankInfo.template || 'compact2'}.jpg?amount=${bankInfo.amount}&addInfo=${encodeURIComponent(bankInfo.description)}&accountName=${encodeURIComponent(bankInfo.accountName)}`;
    
    // Hiển thị QR code
    const qrImg = document.getElementById('generated-qr');
    qrImg.src = qrImageUrl;
    qrImg.alt = `QR Thanh toán ${bankInfo.amount} VND`;
    
    // Khi ảnh tải xong
    qrImg.onload = function() {
        document.getElementById('qr-loading').style.display = 'none';
        qrImg.style.display = 'block';
        
        // Lưu URL QR để tải về sau
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
    
    // Ngoài ra, có thể tạo QR code local bằng thư viện
    createLocalQRCode(bankInfo);
}

// Tạo QR code local (fallback nếu API không hoạt động)
function createLocalQRCode(bankInfo) {
    // Tạo nội dung QR theo chuẩn VietQR
    const qrContent = generateVietQRString(bankInfo);
    
    // Nếu có thư viện QR code (ví dụ: qrcode.js)
    if (typeof QRCode !== 'undefined') {
        const qrContainer = document.getElementById('real-qr-image');
        qrContainer.innerHTML = '';
        
        new QRCode(qrContainer, {
            text: qrContent,
            width: 250,
            height: 250,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
        
        document.getElementById('qr-loading').style.display = 'none';
    }
}

// Tạo chuỗi VietQR theo tiêu chuẩn
function generateVietQRString(bankInfo) {
    // Định dạng theo tiêu chuẩn VietQR
    const data = {
        bank: "ACB",
        acc: bankInfo.accountNumber,
        amount: bankInfo.amount,
        desc: bankInfo.description,
        template: "print"
    };
    
    // Tạo URL deep link cho app ngân hàng
    return `https://vietqr.net/transfer/ACB/${bankInfo.accountNumber}/${bankInfo.amount}/${encodeURIComponent(bankInfo.description)}`;
}

// Lưu thông tin QR
function saveVietQR() {
    const amount = parseInt(document.getElementById('qr-amount').value);
    const description = document.getElementById('qr-description').value;
    
    if (!amount || amount < 1000) {
        alert('Không thể lưu mã QR với số tiền không hợp lệ!');
        return;
    }
    
    // Tạo QR code mới
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
    
    // Tạo link tải
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
    
    // Tạo nội dung chia sẻ
    const shareText = `Mã QR thanh toán ${amount} VND\nNội dung: ${description}\nTài khoản: 43146717 - ACB\nChủ TK: ĐINH TẤN HUY`;
    
    // Kiểm tra Web Share API
    if (navigator.share) {
        navigator.share({
            title: 'Mã QR thanh toán Sunshine Hotel',
            text: shareText,
            url: qrImg.src
        })
        .then(() => console.log('Chia sẻ thành công'))
        .catch(error => console.log('Lỗi chia sẻ:', error));
    } else {
        // Fallback: copy text
        navigator.clipboard.writeText(shareText + '\n' + qrImg.src)
            .then(() => alert('Đã sao chép thông tin mã QR vào clipboard!'))
            .catch(err => alert('Không thể sao chép: ' + err));
    }
}

// Xóa dấu tiếng Việt (cho nội dung QR)
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

// ========== HÀM MỚI BỔ SUNG ==========

// Kiểm tra trạng thái thanh toán (giả lập)
function checkPaymentStatus(transactionId) {
    // Giả lập kiểm tra thanh toán
    const statuses = ['pending', 'completed', 'failed'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    return {
        transactionId: transactionId,
        status: randomStatus,
        checkedAt: new Date(),
        amount: parseInt(document.getElementById('qr-amount').value) || 0
    };
}

// Xem lịch sử QR đã tạo
function showQRHistory() {
    if (!appData.qrCodes || appData.qrCodes.length === 0) {
        alert('Chưa có mã QR nào được tạo!');
        return;
    }
    
    const historyHTML = appData.qrCodes.map(qr => `
        <div style="border: 1px solid #ddd; padding: 1rem; margin-bottom: 1rem; border-radius: 8px;">
            <p><strong>Mã giao dịch:</strong> ${qr.transactionId || 'N/A'}</p>
            <p><strong>Số tiền:</strong> ${formatCurrency(qr.totalAmount)}</p>
            <p><strong>Nội dung:</strong> ${qr.content}</p>
            <p><strong>Ngày tạo:</strong> ${formatDateTime(qr.createdDate)}</p>
            <p><strong>Trạng thái:</strong> <span class="status-${qr.status}">${qr.status}</span></p>
        </div>
    `).join('');
    
    alertHTML(`
        <div style="max-width: 500px; max-height: 400px; overflow-y: auto;">
            <h3>Lịch sử mã QR</h3>
            <p>Tổng số: ${appData.qrCodes.length} mã QR</p>
            ${historyHTML}
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
    `;
    content.innerHTML = html;
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Đóng';
    closeBtn.style.cssText = `
        margin-top: 1rem;
        padding: 0.5rem 1rem;
        background: #f44336;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
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
