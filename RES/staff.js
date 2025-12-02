// Tích hợp: Quản lý phòng, Check-in, Order, Check-out, QR, Chấm công, Lọc phòng

// ========== BIẾN TOÀN CỤC ==========
let currentOrder = {
    roomNumber: null,
    items: [],
    total: 0
};

let quickOrder = {
    roomNumber: null,
    items: [],
    total: 0
};

let currentShift = {
    startTime: null,
    endTime: null,
    duration: 0,
    isActive: false
};

let shiftHistory = JSON.parse(localStorage.getItem('staff_shifts')) || [];

// ========== KHỞI TẠO DỮ LIỆU ==========
if (!currentUser) {
    var currentUser = {
        id: 1,
        name: "Nhân viên quầy",
        role: "staff"
    };
}

// ========== HÀM TIỆN ÍCH ==========

// Định dạng tiền tệ
function formatCurrency(amount) {
    if (!amount) return '0đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// Định dạng ngày tháng
function formatDate(date) {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('vi-VN');
}

// Định dạng ngày giờ
function formatDateTime(date) {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleString('vi-VN');
}

// Định dạng thời gian
function formatTime(date) {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
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

// Hiển thị thông báo
function showNotification(message, type) {
    const colors = {
        success: '#4CAF50',
        error: '#f44336',
        warning: '#FF9800',
        info: '#2196F3'
    };
    
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background-color: ${colors[type] || colors.info};
        color: white;
        border-radius: 5px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Thêm CSS animation cho thông báo
if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// ========== CHẤM CÔNG NHÂN VIÊN ==========

// Tải dữ liệu chấm công
function loadShiftData() {
    const savedShift = localStorage.getItem('current_shift');
    if (savedShift) {
        const shift = JSON.parse(savedShift);
        if (shift.isActive) {
            currentShift = {
                ...shift,
                startTime: new Date(shift.startTime),
                endTime: shift.endTime ? new Date(shift.endTime) : null
            };
        }
    }
    
    const savedHistory = localStorage.getItem('staff_shifts');
    if (savedHistory) {
        shiftHistory = JSON.parse(savedHistory);
    }
}

// Lưu dữ liệu chấm công
function saveShiftData() {
    localStorage.setItem('staff_shifts', JSON.stringify(shiftHistory));
    localStorage.setItem('current_shift', JSON.stringify(currentShift));
}

// Bắt đầu ca làm việc
function startShift() {
    if (!currentShift.isActive) {
        currentShift = {
            startTime: new Date(),
            endTime: null,
            duration: 0,
            isActive: true,
            staffName: currentUser ? currentUser.name : 'Nhân viên'
        };
        
        showNotification('Bắt đầu ca làm việc', 'success');
        saveShiftData();
        updateShiftDisplay();
    }
}

// Kết thúc ca làm việc
function endShift() {
    if (currentShift.isActive) {
        currentShift.endTime = new Date();
        currentShift.duration = (currentShift.endTime - currentShift.startTime) / (1000 * 60 * 60);
        currentShift.isActive = false;
        
        shiftHistory.push({...currentShift});
        showNotification(`Kết thúc ca làm việc: ${currentShift.duration.toFixed(2)} giờ`, 'info');
        saveShiftData();
        
        currentShift = {
            startTime: null,
            endTime: null,
            duration: 0,
            isActive: false
        };
        
        updateShiftDisplay();
    }
}

// Tính thời gian hiện tại của ca
function calculateCurrentDuration() {
    if (!currentShift.isActive || !currentShift.startTime) return '0:00';
    
    const now = new Date();
    const diffMs = now - currentShift.startTime;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHours}:${diffMinutes.toString().padStart(2, '0')}`;
}

// Cập nhật hiển thị thời gian
function updateShiftDisplay() {
    const durationElement = document.getElementById('current-duration');
    if (durationElement) {
        durationElement.textContent = calculateCurrentDuration();
    }
}

// ========== QUẢN LÝ PHÒNG VỚI BỘ LỌC ==========

// Render trang quản lý phòng
function renderRoomManagement() {
    return `
        <div class="room-management">
            <h2 class="section-title"><i class="fas fa-door-closed"></i> Quản lý phòng</h2>
            
            <!-- Bộ lọc -->
            <div class="filters-container" style="margin-bottom: 2rem; background-color: #f8f9fa; padding: 1.5rem; border-radius: 10px;">
                <h4><i class="fas fa-filter"></i> Bộ lọc nâng cao</h4>
                
                <div class="filter-row" style="display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 1rem;">
                    <!-- Lọc theo trạng thái -->
                    <div class="filter-group">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Trạng thái</label>
                        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                            <label style="cursor: pointer;">
                                <input type="checkbox" id="filter-available" checked onchange="applyRoomFilters()">
                                <span style="color: #4CAF50;"><i class="fas fa-circle"></i> Còn trống</span>
                            </label>
                            <label style="cursor: pointer;">
                                <input type="checkbox" id="filter-occupied" checked onchange="applyRoomFilters()">
                                <span style="color: #f44336;"><i class="fas fa-circle"></i> Đã thuê</span>
                            </label>
                            <label style="cursor: pointer;">
                                <input type="checkbox" id="filter-reserved" checked onchange="applyRoomFilters()">
                                <span style="color: #FF9800;"><i class="fas fa-circle"></i> Đã đặt</span>
                            </label>
                        </div>
                    </div>
                    
                    <!-- Lọc theo giá -->
                    <div class="filter-group">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Khoảng giá</label>
                        <div style="display: flex; gap: 10px; align-items: center;">
                            <input type="number" id="filter-price-min" placeholder="Từ" style="width: 100px; padding: 5px;" onchange="applyRoomFilters()">
                            <span>-</span>
                            <input type="number" id="filter-price-max" placeholder="Đến" style="width: 100px; padding: 5px;" onchange="applyRoomFilters()">
                            <span>nghìn VND</span>
                        </div>
                    </div>
                    
                    <!-- Lọc theo loại phòng -->
                    <div class="filter-group">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Loại phòng</label>
                        <select id="filter-type" style="padding: 5px;" onchange="applyRoomFilters()">
                            <option value="">Tất cả</option>
                            <option value="single">Phòng đơn</option>
                            <option value="double">Phòng đôi</option>
                            <option value="suite">Suite</option>
                            <option value="vip">VIP</option>
                        </select>
                    </div>
                </div>
                
                <!-- Lọc theo ngày -->
                <div class="filter-row" style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #ddd;">
                    <h5><i class="fas fa-calendar-alt"></i> Kiểm tra phòng trống theo ngày</h5>
                    <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 1rem;">
                        <div>
                            <label style="display: block; margin-bottom: 5px;">Từ ngày</label>
                            <input type="date" id="filter-date-from" style="padding: 5px;" value="${new Date().toISOString().split('T')[0]}">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px;">Đến ngày</label>
                            <input type="date" id="filter-date-to" style="padding: 5px;" value="${new Date(Date.now() + 86400000).toISOString().split('T')[0]}">
                        </div>
                        <div style="align-self: flex-end;">
                            <button class="btn btn-primary" onclick="checkRoomAvailability()">
                                <i class="fas fa-search"></i> Kiểm tra
                            </button>
                        </div>
                    </div>
                    
                    <div id="availability-result" class="hidden" style="margin-top: 1rem; padding: 1rem; background-color: #e8f4fd; border-radius: 5px;">
                        <div id="availability-message"></div>
                    </div>
                </div>
                
                <div style="margin-top: 1rem; text-align: right;">
                    <button class="btn btn-secondary" onclick="resetRoomFilters()">
                        <i class="fas fa-redo"></i> Xóa bộ lọc
                    </button>
                </div>
            </div>
            
            <!-- Thống kê -->
            <div class="room-stats" style="display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 150px; text-align: center; padding: 1rem; background-color: #4CAF50; color: white; border-radius: 8px;">
                    <div style="font-size: 1.5rem; font-weight: bold;" id="stat-available">0</div>
                    <div>Phòng trống</div>
                </div>
                <div style="flex: 1; min-width: 150px; text-align: center; padding: 1rem; background-color: #f44336; color: white; border-radius: 8px;">
                    <div style="font-size: 1.5rem; font-weight: bold;" id="stat-occupied">0</div>
                    <div>Đã thuê</div>
                </div>
                <div style="flex: 1; min-width: 150px; text-align: center; padding: 1rem; background-color: #FF9800; color: white; border-radius: 8px;">
                    <div style="font-size: 1.5rem; font-weight: bold;" id="stat-reserved">0</div>
                    <div>Đã đặt</div>
                </div>
                <div style="flex: 1; min-width: 150px; text-align: center; padding: 1rem; background-color: #2196F3; color: white; border-radius: 8px;">
                    <div style="font-size: 1.5rem; font-weight: bold;" id="stat-total">0</div>
                    <div>Tổng phòng</div>
                </div>
            </div>
            
            <!-- Danh sách phòng -->
            <div id="rooms-container">
                ${renderFilteredRooms()}
            </div>
            
            <p style="margin-top: 1rem; font-size: 0.9em; color: #666;">
                <i class="fas fa-info-circle"></i> Nhấn vào phòng "Đã đặt" để xem số điện thoại nhân viên
                <br>Nhấn vào phòng "Đã thuê" để xem thông tin chi tiết
            </p>
        </div>
    `;
}

// Lọc phòng
function filterRooms() {
    const statusAvailable = document.getElementById('filter-available').checked;
    const statusOccupied = document.getElementById('filter-occupied').checked;
    const statusReserved = document.getElementById('filter-reserved').checked;
    
    const minPrice = parseInt(document.getElementById('filter-price-min').value) || 0;
    const maxPrice = parseInt(document.getElementById('filter-price-max').value) || 10000000;
    
    const roomType = document.getElementById('filter-type').value;
    
    return appData.rooms.filter(room => {
        // Lọc theo trạng thái
        let statusMatch = false;
        if (room.status === 'available' && statusAvailable) statusMatch = true;
        if (room.status === 'occupied' && statusOccupied) statusMatch = true;
        if (room.status === 'reserved' && statusReserved) statusMatch = true;
        
        // Lọc theo giá
        const priceMatch = room.price >= minPrice && room.price <= maxPrice;
        
        // Lọc theo loại phòng
        const typeMatch = !roomType || room.type === roomType;
        
        return statusMatch && priceMatch && typeMatch;
    });
}

// Render phòng đã lọc
function renderFilteredRooms() {
    const rooms = filterRooms();
    
    // Cập nhật thống kê
    updateRoomStats(rooms);
    
    // Nhóm phòng theo tầng
    const roomsByFloor = {};
    rooms.forEach(room => {
        if (!roomsByFloor[room.floor]) {
            roomsByFloor[room.floor] = [];
        }
        roomsByFloor[room.floor].push(room);
    });
    
    let floorsHTML = '';
    for (let floor = 1; floor <= APP_CONFIG.hotel.floors; floor++) {
        const floorRooms = roomsByFloor[floor] || [];
        
        if (floorRooms.length === 0) continue;
        
        floorsHTML += `
            <div class="floor-plan" style="margin-bottom: 2rem;">
                <div class="floor-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid #ddd;">
                    <div class="floor-title" style="font-size: 1.2rem; font-weight: bold;">
                        <i class="fas fa-building"></i> Tầng ${floor}
                    </div>
                    <div class="floor-stats" style="font-size: 0.9em; color: #666;">
                        <span style="color: #4CAF50;">${floorRooms.filter(r => r.status === 'available').length} trống</span> | 
                        <span style="color: #f44336;">${floorRooms.filter(r => r.status === 'occupied').length} có khách</span> | 
                        <span style="color: #FF9800;">${floorRooms.filter(r => r.status === 'reserved').length} đã đặt</span>
                    </div>
                </div>
                <div class="rooms-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;">
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
                            <div class="room ${room.status}" ${clickHandler} style="${cursorStyle}; border: 1px solid #ddd; border-radius: 8px; padding: 1rem; background-color: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                <div class="room-number" style="font-size: 1.2rem; font-weight: bold; color: #2c3e50;">${room.number}</div>
                                <div class="room-type" style="color: #7f8c8d; font-size: 0.9em;">${room.typeName}</div>
                                <div class="room-price" style="color: #e74c3c; font-weight: bold; margin: 5px 0;">
                                    ${formatCurrency(room.price)}
                                </div>
                                <div class="room-status status-${room.status}" style="padding: 3px 8px; border-radius: 20px; font-size: 0.8em; display: inline-block; 
                                    ${room.status === 'available' ? 'background-color: #d4edda; color: #155724;' : 
                                      room.status === 'occupied' ? 'background-color: #f8d7da; color: #721c24;' : 
                                      'background-color: #fff3cd; color: #856404;'}">
                                    ${room.status === 'available' ? 'Còn trống' : 
                                      room.status === 'occupied' ? 'Đã thuê' : 'Đã đặt'}
                                </div>
                                ${room.customerName ? `
                                    <div class="room-customer" style="margin-top: 5px; font-size: 0.85em; color: #555;">
                                        <i class="fas fa-user"></i> ${room.customerName}
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
    
    return floorsHTML || '<p style="text-align: center; color: #999; padding: 2rem;">Không tìm thấy phòng nào phù hợp với bộ lọc</p>';
}

// Cập nhật thống kê phòng
function updateRoomStats(rooms) {
    const availableElement = document.getElementById('stat-available');
    const occupiedElement = document.getElementById('stat-occupied');
    const reservedElement = document.getElementById('stat-reserved');
    const totalElement = document.getElementById('stat-total');
    
    if (availableElement) {
        availableElement.textContent = rooms.filter(r => r.status === 'available').length;
    }
    if (occupiedElement) {
        occupiedElement.textContent = rooms.filter(r => r.status === 'occupied').length;
    }
    if (reservedElement) {
        reservedElement.textContent = rooms.filter(r => r.status === 'reserved').length;
    }
    if (totalElement) {
        totalElement.textContent = rooms.length;
    }
}

// Áp dụng bộ lọc
function applyRoomFilters() {
    const roomsContainer = document.getElementById('rooms-container');
    if (roomsContainer) {
        roomsContainer.innerHTML = renderFilteredRooms();
    }
}

// Reset bộ lọc
function resetRoomFilters() {
    document.getElementById('filter-available').checked = true;
    document.getElementById('filter-occupied').checked = true;
    document.getElementById('filter-reserved').checked = true;
    document.getElementById('filter-price-min').value = '';
    document.getElementById('filter-price-max').value = '';
    document.getElementById('filter-type').value = '';
    
    applyRoomFilters();
}

// Kiểm tra phòng trống theo ngày
function checkRoomAvailability() {
    const fromDate = new Date(document.getElementById('filter-date-from').value);
    const toDate = new Date(document.getElementById('filter-date-to').value);
    
    if (!fromDate || !toDate || fromDate > toDate) {
        alert('Vui lòng chọn khoảng ngày hợp lệ!');
        return;
    }
    
    const unavailableRooms = [];
    
    appData.rooms.forEach(room => {
        if (room.status === 'occupied' && room.checkInDate && room.checkOutDate) {
            const checkIn = new Date(room.checkInDate);
            const checkOut = new Date(room.checkOutDate);
            
            if ((fromDate >= checkIn && fromDate < checkOut) || 
                (toDate > checkIn && toDate <= checkOut) ||
                (fromDate <= checkIn && toDate >= checkOut)) {
                unavailableRooms.push({
                    number: room.number,
                    reason: 'Đã thuê',
                    customer: room.customerName,
                    period: `${formatDate(checkIn)} - ${formatDate(checkOut)}`
                });
            }
        }
        
        appData.bookings.forEach(booking => {
            if (booking.roomNumber === room.number && booking.status !== 'cancelled') {
                const checkIn = new Date(booking.checkInDate);
                const checkOut = new Date(booking.checkOutDate);
                
                if ((fromDate >= checkIn && fromDate < checkOut) || 
                    (toDate > checkIn && toDate <= checkOut) ||
                    (fromDate <= checkIn && toDate >= checkOut)) {
                    unavailableRooms.push({
                        number: room.number,
                        reason: 'Đã đặt trước',
                        customer: booking.customerName,
                        period: `${formatDate(checkIn)} - ${formatDate(checkOut)}`
                    });
                }
            }
        });
    });
    
    const totalRooms = appData.rooms.length;
    const uniqueUnavailableRooms = [...new Set(unavailableRooms.map(r => r.number))];
    const availableRooms = totalRooms - uniqueUnavailableRooms.length;
    
    const resultDiv = document.getElementById('availability-result');
    const messageDiv = document.getElementById('availability-message');
    
    resultDiv.classList.remove('hidden');
    
    messageDiv.innerHTML = `
        <div style="margin-bottom: 1rem;">
            <h5 style="color: #2c3e50;">Kết quả kiểm tra</h5>
            <p>Từ <strong>${formatDate(fromDate)}</strong> đến <strong>${formatDate(toDate)}</strong></p>
        </div>
        
        <div style="display: flex; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 150px; padding: 1rem; background-color: #4CAF50; color: white; border-radius: 8px; text-align: center;">
                <div style="font-size: 1.5rem; font-weight: bold;">${availableRooms}</div>
                <div>Phòng trống</div>
            </div>
            <div style="flex: 1; min-width: 150px; padding: 1rem; background-color: #f44336; color: white; border-radius: 8px; text-align: center;">
                <div style="font-size: 1.5rem; font-weight: bold;">${uniqueUnavailableRooms.length}</div>
                <div>Không khả dụng</div>
            </div>
        </div>
        
        ${unavailableRooms.length > 0 ? `
            <div style="margin-top: 1rem;">
                <h6><i class="fas fa-exclamation-triangle"></i> Phòng không khả dụng:</h6>
                <div style="max-height: 200px; overflow-y: auto; margin-top: 0.5rem;">
                    ${unavailableRooms.slice(0, 10).map(room => `
                        <div style="padding: 5px; border-bottom: 1px dashed #ddd; font-size: 0.9em;">
                            <strong>Phòng ${room.number}</strong> - ${room.reason}
                            ${room.customer ? ` (${room.customer})` : ''}
                            <br><small>${room.period}</small>
                        </div>
                    `).join('')}
                    ${unavailableRooms.length > 10 ? `<div style="text-align: center; color: #666; padding: 5px;">... và ${unavailableRooms.length - 10} phòng khác</div>` : ''}
                </div>
            </div>
        ` : ''}
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

// ========== CHECK-IN KHÁCH HÀNG ==========

// Render trang check-in
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

// Xóa form check-in
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

// ========== ORDER DỊCH VỤ ==========

// Render trang order dịch vụ
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

// Render menu item
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
    
    if (!orderItemsList || !orderTotalAmount) return;
    
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
    
    const successMessage = document.getElementById('order-success-message');
    if (successMessage) {
        successMessage.innerHTML = `
            Đã order thành công cho phòng <strong>${roomNumber}</strong><br>
            Tổng số món: <strong>${currentOrder.items.length}</strong><br>
            Tổng tiền: <strong>${formatCurrency(currentOrder.total)}</strong><br>
            Khách hàng: <strong>${room.customerName}</strong>
        `;
    }
    
    const orderSuccess = document.getElementById('order-success');
    if (orderSuccess) {
        orderSuccess.classList.remove('hidden');
    }
    
    currentOrder = {
        roomNumber: null,
        items: [],
        total: 0
    };
    
    updateOrderDisplay();
    
    setTimeout(() => {
        if (orderSuccess) {
            orderSuccess.classList.add('hidden');
        }
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
        const checkoutRoom = document.getElementById('checkout-room');
        if (checkoutRoom) {
            checkoutRoom.value = roomNumber;
        }
        loadCheckoutInfo();
    }, 100);
}

// ========== CHECK-OUT & XUẤT BILL ==========

// Render trang check-out
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
                    <div id="checkout-services-list" style="margin-top: 1rem;"></div>
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
                            <tbody id="bill-items"></tbody>
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

// In hóa đơn
function printBill() {
    alert('In hóa đơn... (Trong thực tế sẽ gọi window.print())');
}

// ========== CHẤM CÔNG ==========

// Render trang chấm công
function renderTimeClock() {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    
    // Tính tổng giờ tháng này
    const thisMonthShifts = shiftHistory.filter(shift => {
        const shiftDate = new Date(shift.startTime);
        return shiftDate.getMonth() + 1 === currentMonth && shiftDate.getFullYear() === currentYear;
    });
    
    const totalHoursThisMonth = thisMonthShifts.reduce((sum, shift) => sum + shift.duration, 0);
    
    // Tính tổng giờ hôm nay
    const todayShifts = shiftHistory.filter(shift => {
        const shiftDate = new Date(shift.startTime);
        return shiftDate.toDateString() === today.toDateString();
    });
    
    const totalHoursToday = todayShifts.reduce((sum, shift) => sum + shift.duration, 0);
    
    // Lịch sử gần đây (7 ngày)
    const recentShifts = shiftHistory.slice(-10).reverse();
    
    return `
        <div class="time-clock">
            <h2 class="section-title"><i class="fas fa-clock"></i> Chấm công ca làm việc</h2>
            
            <div class="shift-info" style="display: flex; gap: 2rem; margin-bottom: 2rem; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 250px; background-color: #f0f9ff; padding: 1.5rem; border-radius: 10px;">
                    <h4><i class="fas fa-user-clock"></i> Ca hiện tại</h4>
                    <div style="font-size: 1.2rem; margin: 1rem 0;">
                        ${currentShift.isActive ? 
                            `<div style="color: #2ecc71;">
                                <i class="fas fa-play-circle"></i> ĐANG LÀM VIỆC
                            </div>
                            <div style="margin-top: 10px;">
                                <strong>Bắt đầu:</strong> ${formatDateTime(currentShift.startTime)}
                            </div>
                            <div id="current-duration" style="font-size: 1.5rem; font-weight: bold; color: #e74c3c;">
                                ${calculateCurrentDuration()}
                            </div>` 
                            : 
                            `<div style="color: #7f8c8d;">
                                <i class="fas fa-stop-circle"></i> CHƯA BẮT ĐẦU
                            </div>`
                        }
                    </div>
                    
                    <div class="shift-actions" style="margin-top: 1rem;">
                        ${!currentShift.isActive ? 
                            `<button class="btn btn-success" onclick="startShift()">
                                <i class="fas fa-play"></i> Bắt đầu ca
                            </button>` 
                            : 
                            `<button class="btn btn-danger" onclick="endShift()">
                                <i class="fas fa-stop"></i> Kết thúc ca
                            </button>`
                        }
                    </div>
                </div>
                
                <div style="flex: 1; min-width: 250px; background-color: #fff8e1; padding: 1.5rem; border-radius: 10px;">
                    <h4><i class="fas fa-chart-bar"></i> Thống kê</h4>
                    <div style="margin-top: 1rem;">
                        <div><strong>Hôm nay:</strong> ${totalHoursToday.toFixed(2)} giờ</div>
                        <div><strong>Tháng ${currentMonth}:</strong> ${totalHoursThisMonth.toFixed(2)} giờ</div>
                        <div><strong>Tổng ca làm:</strong> ${shiftHistory.length} ca</div>
                        <div><strong>Ngày:</strong> ${formatDate(today)}</div>
                    </div>
                </div>
            </div>
            
            <!-- Lịch sử chấm công -->
            <div class="shift-history">
                <h4><i class="fas fa-history"></i> Lịch sử chấm công gần đây</h4>
                
                <div class="table-container" style="margin-top: 1rem;">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Ngày</th>
                                <th>Bắt đầu</th>
                                <th>Kết thúc</th>
                                <th>Thời gian</th>
                                <th>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${recentShifts.length > 0 ? recentShifts.map(shift => `
                                <tr>
                                    <td>${formatDate(new Date(shift.startTime))}</td>
                                    <td>${formatTime(new Date(shift.startTime))}</td>
                                    <td>${shift.endTime ? formatTime(new Date(shift.endTime)) : '---'}</td>
                                    <td>${shift.duration.toFixed(2)} giờ</td>
                                    <td><span class="status-badge completed">Hoàn thành</span></td>
                                </tr>
                            `).join('') : `
                                <tr>
                                    <td colspan="5" style="text-align: center; color: #999;">Chưa có lịch sử chấm công</td>
                                </tr>
                            `}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// ========== KHỞI TẠO ==========

// Tự động tải dữ liệu chấm công khi load
document.addEventListener('DOMContentLoaded', function() {
    loadShiftData();
    
    // Tự động bắt đầu ca nếu chưa có
    if (!currentShift.isActive) {
        setTimeout(() => {
            if (confirm('Bạn có muốn bắt đầu ca làm việc không?')) {
                startShift();
            }
        }, 1000);
    }
    
    // Cập nhật thời gian mỗi phút
    setInterval(updateShiftDisplay, 60000);
});

// Thêm CSS
document.head.insertAdjacentHTML('beforeend', `
    <style>
        .status-badge {
            padding: 3px 10px;
            border-radius: 20px;
            font-size: 0.8em;
            font-weight: bold;
            display: inline-block;
        }
        .status-badge.completed {
            background-color: #2ecc71;
            color: white;
        }
        .hidden {
            display: none !important;
        }
        
        .room.available:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .room.occupied:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .room.reserved:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
    </style>
`);
