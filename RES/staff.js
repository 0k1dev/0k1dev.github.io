// staff.js - FILE ĐÃ SỬA LỖI HOÀN CHỈNH

// ========== BIẾN TOÀN CỤC RIÊNG CỦA STAFF.JS ==========
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

let shiftHistory = [];

// ========== HÀM TIỆN ÍCH ==========

// Định dạng tiền tệ
function formatCurrency(amount) {
    if (!amount && amount !== 0) return '0đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// Định dạng ngày tháng
function formatDate(date) {
    if (!date) return '-';
    try {
        const d = new Date(date);
        return d.toLocaleDateString('vi-VN');
    } catch (e) {
        return '-';
    }
}

// Định dạng ngày giờ
function formatDateTime(date) {
    if (!date) return '-';
    try {
        const d = new Date(date);
        return d.toLocaleString('vi-VN');
    } catch (e) {
        return '-';
    }
}

// Định dạng thời gian
function formatTime(date) {
    if (!date) return '-';
    try {
        const d = new Date(date);
        return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
        return '-';
    }
}

// Kiểm tra số điện thoại hợp lệ
function isValidPhone(phone) {
    if (!phone) return false;
    const phoneRegex = /^(09|03|07|08|05)[0-9]{8}$/;
    return phoneRegex.test(phone);
}

// Kiểm tra CCCD hợp lệ
function isValidCCCD(cccd) {
    if (!cccd) return false;
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
    
    // Kiểm tra nếu đã có thông báo
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = 'notification';
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
        font-family: Arial, sans-serif;
    `;
    
    const icon = type === 'success' ? 'check-circle' : 
                 type === 'error' ? 'exclamation-circle' : 
                 type === 'warning' ? 'exclamation-triangle' : 'info-circle';
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
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
    try {
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
    } catch (e) {
        console.error('Lỗi tải dữ liệu chấm công:', e);
    }
}

// Lưu dữ liệu chấm công
function saveShiftData() {
    try {
        localStorage.setItem('staff_shifts', JSON.stringify(shiftHistory));
        localStorage.setItem('current_shift', JSON.stringify(currentShift));
    } catch (e) {
        console.error('Lỗi lưu dữ liệu chấm công:', e);
    }
}

// Bắt đầu ca làm việc
function startShift() {
    if (!currentShift.isActive) {
        currentShift = {
            startTime: new Date(),
            endTime: null,
            duration: 0,
            isActive: true,
            staffName: window.currentUser ? window.currentUser.name : 'Nhân viên'
        };
        
        showNotification('Bắt đầu ca làm việc', 'success');
        saveShiftData();
        updateShiftDisplay();
    }
}

// Kết thúc ca làm việc
function endShift() {
    if (currentShift.isActive && currentShift.startTime) {
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
    // Đảm bảo dữ liệu tồn tại
    const rooms = window.appData?.rooms || [];
    const roomTypes = window.APP_CONFIG?.hotel?.roomTypes || {
        "STANDARD": { name: "Phòng Tiêu Chuẩn", price: 500000 },
        "DELUXE": { name: "Phòng Deluxe", price: 800000 },
        "SUITE": { name: "Phòng Suite", price: 1200000 },
        "PRESIDENTIAL": { name: "Phòng Tổng Thống", price: 3000000 }
    };
    const floors = window.APP_CONFIG?.hotel?.floors || 7;
    
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
                            ${Object.keys(roomTypes).map(typeKey => `
                                <option value="${typeKey}">${roomTypes[typeKey].name}</option>
                            `).join('')}
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

// Lọc phòng (FIXED - kiểm tra DOM trước khi truy cập)
function filterRooms() {
    // Kiểm tra nếu phần tử DOM chưa tồn tại
    const filterAvailable = document.getElementById('filter-available');
    const filterOccupied = document.getElementById('filter-occupied');
    const filterReserved = document.getElementById('filter-reserved');
    const filterPriceMin = document.getElementById('filter-price-min');
    const filterPriceMax = document.getElementById('filter-price-max');
    const filterType = document.getElementById('filter-type');
    
    // Nếu không có phần tử DOM, trả về tất cả phòng
    if (!filterAvailable || !filterOccupied || !filterReserved) {
        return window.appData?.rooms || [];
    }
    
    const statusAvailable = filterAvailable.checked;
    const statusOccupied = filterOccupied.checked;
    const statusReserved = filterReserved.checked;
    
    const minPrice = parseInt(filterPriceMin?.value) || 0;
    const maxPrice = parseInt(filterPriceMax?.value) || 10000000;
    
    const roomType = filterType?.value || '';
    
    const rooms = window.appData?.rooms || [];
    
    return rooms.filter(room => {
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
    
    const floors = window.APP_CONFIG?.hotel?.floors || 7;
    let floorsHTML = '';
    
    for (let floor = 1; floor <= floors; floor++) {
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
                        
                        const roomTypeName = room.typeName || 
                            (window.APP_CONFIG?.hotel?.roomTypes[room.type]?.name) || 
                            'Unknown';
                        
                        return `
                            <div class="room ${room.status}" ${clickHandler} style="${cursorStyle}; border: 1px solid #ddd; border-radius: 8px; padding: 1rem; background-color: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                <div class="room-number" style="font-size: 1.2rem; font-weight: bold; color: #2c3e50;">${room.number}</div>
                                <div class="room-type" style="color: #7f8c8d; font-size: 0.9em;">${roomTypeName}</div>
                                <div class="room-price" style="color: #e74c3c; font-weight: bold; margin: 5px 0;">
                                    ${formatCurrency(room.price || 0)}
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
    const filterAvailable = document.getElementById('filter-available');
    const filterOccupied = document.getElementById('filter-occupied');
    const filterReserved = document.getElementById('filter-reserved');
    const filterPriceMin = document.getElementById('filter-price-min');
    const filterPriceMax = document.getElementById('filter-price-max');
    const filterType = document.getElementById('filter-type');
    
    if (filterAvailable) filterAvailable.checked = true;
    if (filterOccupied) filterOccupied.checked = true;
    if (filterReserved) filterReserved.checked = true;
    if (filterPriceMin) filterPriceMin.value = '';
    if (filterPriceMax) filterPriceMax.value = '';
    if (filterType) filterType.value = '';
    
    applyRoomFilters();
}

// Kiểm tra phòng trống theo ngày
function checkRoomAvailability() {
    const fromDateInput = document.getElementById('filter-date-from');
    const toDateInput = document.getElementById('filter-date-to');
    
    if (!fromDateInput || !toDateInput) {
        alert('Không thể tìm thấy các trường ngày!');
        return;
    }
    
    const fromDate = new Date(fromDateInput.value);
    const toDate = new Date(toDateInput.value);
    
    if (!fromDate || !toDate || fromDate > toDate) {
        alert('Vui lòng chọn khoảng ngày hợp lệ!');
        return;
    }
    
    const unavailableRooms = [];
    const rooms = window.appData?.rooms || [];
    const bookings = window.appData?.bookings || [];
    
    rooms.forEach(room => {
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
        
        bookings.forEach(booking => {
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
    
    const totalRooms = rooms.length;
    const uniqueUnavailableRooms = [...new Set(unavailableRooms.map(r => r.number))];
    const availableRooms = totalRooms - uniqueUnavailableRooms.length;
    
    const resultDiv = document.getElementById('availability-result');
    const messageDiv = document.getElementById('availability-message');
    
    if (!resultDiv || !messageDiv) {
        alert('Không thể hiển thị kết quả!');
        return;
    }
    
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
    const rooms = window.appData?.rooms || [];
    const room = rooms.find(r => r.number === roomNumber);
    
    if (!room || room.status !== 'reserved') return;
    
    alert(`Phòng ${room.number} - ĐÃ ĐẶT\nSố điện thoại nhân viên: ${room.staffPhone}\n\nĐối chiếu số điện thoại này với nhân viên để xác nhận.`);
}

// Hiển thị thông tin phòng đã thuê
function showOccupiedRoomInfo(roomNumber) {
    const rooms = window.appData?.rooms || [];
    const bookings = window.appData?.bookings || [];
    
    const room = rooms.find(r => r.number === roomNumber);
    if (!room || room.status !== 'occupied') return;
    
    const booking = bookings.find(b => b.roomNumber === room.number && b.status === 'active');
    
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
    const rooms = window.appData?.rooms || [];
    const availableRooms = rooms.filter(room => room.status === 'available');
    
    return `
        <div class="checkin-process">
            <h2 class="section-title"><i class="fas fa-user-check"></i> Check-in khách hàng</h2>
            
            <div class="form-container">
                <div class="form-row">
                    <div class="form-control">
                        <label for="checkin-room"><i class="fas fa-door-closed"></i> Số phòng</label>
                        <select id="checkin-room">
                            <option value="">-- Chọn phòng --</option>
                            ${availableRooms.map(room => `
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

// Xử lý check-in (FIXED - kiểm tra phần tử trước)
function processCheckIn() {
    const roomNumberInput = document.getElementById('checkin-room');
    const customerNameInput = document.getElementById('checkin-customer-name');
    const customerPhoneInput = document.getElementById('checkin-customer-phone');
    const customerIdInput = document.getElementById('checkin-customer-id');
    const checkinDateInput = document.getElementById('checkin-date');
    const checkoutDateInput = document.getElementById('checkout-date');
    const guestsInput = document.getElementById('checkin-guests');
    const paymentMethodInput = document.getElementById('checkin-payment-method');
    
    // Kiểm tra tất cả các phần tử tồn tại
    if (!roomNumberInput || !customerNameInput || !customerPhoneInput || !customerIdInput || 
        !checkinDateInput || !checkoutDateInput || !guestsInput || !paymentMethodInput) {
        alert('Không thể tìm thấy các trường dữ liệu!');
        return;
    }
    
    const roomNumber = roomNumberInput.value;
    const customerName = customerNameInput.value;
    const customerPhone = customerPhoneInput.value;
    const customerId = customerIdInput.value;
    const checkinDate = checkinDateInput.value;
    const checkoutDate = checkoutDateInput.value;
    const guests = guestsInput.value;
    const paymentMethod = paymentMethodInput.value;
    
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
    
    // Đảm bảo appData tồn tại
    if (!window.appData) window.appData = { rooms: [], bookings: [] };
    if (!window.appData.rooms) window.appData.rooms = [];
    if (!window.appData.bookings) window.appData.bookings = [];
    
    const rooms = window.appData.rooms;
    const room = rooms.find(r => r.number == roomNumber);
    
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
    const newBookingId = window.appData.bookings.length + 1;
    
    window.appData.bookings.push({
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
        staffName: window.currentUser ? window.currentUser.name : 'Nhân viên',
        createdDate: new Date()
    });
    
    // Hiển thị kết quả
    const successMessage = document.getElementById('checkin-success-message');
    const resultDiv = document.getElementById('checkin-result');
    
    if (successMessage) {
        successMessage.innerHTML = `
            <p>Đã check-in thành công cho khách <strong>${customerName}</strong></p>
            <p>Phòng: <strong>${roomNumber}</strong> - ${room.typeName}</p>
            <p>Ngày nhận: ${checkinDate} | Ngày trả: ${checkoutDate}</p>
            <p>Số điện thoại: ${customerPhone} | CCCD: ${customerId}</p>
            <p>Mã đặt phòng: #${newBookingId}</p>
            <p>Nhân viên thực hiện: ${window.currentUser ? window.currentUser.name : 'Nhân viên'}</p>
        `;
    }
    
    if (resultDiv) {
        resultDiv.classList.remove('hidden');
    }
    
    setTimeout(() => {
        clearCheckInForm();
        if (resultDiv) {
            resultDiv.classList.add('hidden');
        }
    }, 5000);
}

// Xóa form check-in (FIXED - kiểm tra phần tử trước)
function clearCheckInForm() {
    const inputs = [
        'checkin-room',
        'checkin-customer-name', 
        'checkin-customer-phone',
        'checkin-customer-id',
        'checkin-date',
        'checkout-date',
        'checkin-guests',
        'checkin-payment-method'
    ];
    
    inputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            if (element.type === 'select-one') {
                element.value = '';
            } else if (element.type === 'date') {
                if (id === 'checkin-date') {
                    element.value = new Date().toISOString().split('T')[0];
                } else if (id === 'checkout-date') {
                    element.value = new Date(Date.now() + 86400000).toISOString().split('T')[0];
                }
            } else if (id === 'checkin-guests') {
                element.value = '2';
            } else if (id === 'checkin-payment-method') {
                element.value = 'cash';
            } else {
                element.value = '';
            }
        }
    });
}

// ========== ORDER DỊCH VỤ ==========

// Render trang order dịch vụ
function renderOrderService() {
    const rooms = window.appData?.rooms || [];
    const occupiedRooms = rooms.filter(room => room.status === 'occupied');
    
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
    const roomNumberInput = document.getElementById('order-room');
    const customerInfoDiv = document.getElementById('order-customer-info');
    
    if (!roomNumberInput || !customerInfoDiv) return;
    
    const roomNumber = roomNumberInput.value;
    if (!roomNumber) {
        customerInfoDiv.classList.add('hidden');
        return;
    }
    
    const rooms = window.appData?.rooms || [];
    const room = rooms.find(r => r.number == roomNumber);
    if (!room) return;
    
    const customerName = document.getElementById('order-customer-name');
    const customerPhone = document.getElementById('order-customer-phone');
    const roomInfo = document.getElementById('order-room-info');
    const currentTotal = document.getElementById('order-current-total');
    
    if (customerName) customerName.textContent = room.customerName;
    if (customerPhone) customerPhone.textContent = room.customerPhone;
    if (roomInfo) roomInfo.textContent = room.number + ' - ' + room.typeName;
    
    const currentServiceTotal = room.services ? 
        room.services.reduce((sum, service) => sum + service.total, 0) : 0;
    
    if (currentTotal) currentTotal.textContent = formatCurrency(currentServiceTotal);
    
    customerInfoDiv.classList.remove('hidden');
    
    currentOrder = {
        roomNumber: roomNumber,
        items: [],
        total: 0
    };
    
    updateOrderDisplay();
}

// Thêm món vào order
function addToOrder(itemName, itemPrice) {
    const roomNumberInput = document.getElementById('order-room');
    if (!roomNumberInput) {
        alert('Không thể tìm thấy trường chọn phòng!');
        return;
    }
    
    const roomNumber = roomNumberInput.value;
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
    const roomNumberInput = document.getElementById('order-room');
    if (!roomNumberInput) {
        alert('Không thể tìm thấy trường chọn phòng!');
        return;
    }
    
    const roomNumber = roomNumberInput.value;
    if (!roomNumber) {
        alert('Vui lòng chọn phòng trước!');
        return;
    }
    
    const serviceNameInput = document.getElementById('custom-service-name');
    const servicePriceInput = document.getElementById('custom-service-price');
    const serviceQuantityInput = document.getElementById('custom-service-quantity');
    
    if (!serviceNameInput || !servicePriceInput || !serviceQuantityInput) {
        alert('Không thể tìm thấy các trường dịch vụ!');
        return;
    }
    
    const serviceName = serviceNameInput.value;
    const servicePrice = parseInt(servicePriceInput.value);
    const serviceQuantity = parseInt(serviceQuantityInput.value);
    
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
    
    // Xóa form
    serviceNameInput.value = '';
    servicePriceInput.value = '';
    serviceQuantityInput.value = 1;
    
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
    const roomNumberInput = document.getElementById('order-room');
    if (!roomNumberInput) {
        alert('Không thể tìm thấy trường chọn phòng!');
        return;
    }
    
    const roomNumber = roomNumberInput.value;
    if (!roomNumber) {
        alert('Vui lòng chọn phòng!');
        return;
    }
    
    if (currentOrder.items.length === 0) {
        alert('Đơn hàng trống! Vui lòng thêm ít nhất một món.');
        return;
    }
    
    const rooms = window.appData?.rooms || [];
    const room = rooms.find(r => r.number == roomNumber);
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
            staffName: window.currentUser ? window.currentUser.name : 'Nhân viên'
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

// Tạo hóa đơn ngay từ order (FIXED - kiểm tra switchView tồn tại)
function createBillFromOrder() {
    const roomNumberInput = document.getElementById('order-room');
    if (!roomNumberInput) {
        alert('Không thể tìm thấy trường chọn phòng!');
        return;
    }
    
    const roomNumber = roomNumberInput.value;
    if (!roomNumber) {
        alert('Vui lòng chọn phòng!');
        return;
    }
    
    if (currentOrder.items.length === 0) {
        alert('Đơn hàng trống! Vui lòng thêm ít nhất một món.');
        return;
    }
    
    const rooms = window.appData?.rooms || [];
    const room = rooms.find(r => r.number == roomNumber);
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
            staffName: window.currentUser ? window.currentUser.name : 'Nhân viên'
        });
    });
    
    // Chuyển sang trang check-out với phòng đã chọn
    if (typeof switchView === 'function') {
        switchView('check-out');
        
        // Đợi DOM load xong
        setTimeout(() => {
            const checkoutRoom = document.getElementById('checkout-room');
            if (checkoutRoom) {
                checkoutRoom.value = roomNumber;
            }
            // Kiểm tra hàm loadCheckoutInfo tồn tại
            if (typeof loadCheckoutInfo === 'function') {
                loadCheckoutInfo();
            }
        }, 100);
    } else {
        alert('Không thể chuyển trang!');
    }
}

// ========== CHECK-OUT & XUẤT BILL ==========

// Render trang check-out
function renderCheckOutProcess() {
    const rooms = window.appData?.rooms || [];
    const occupiedRooms = rooms.filter(room => room.status === 'occupied');
    
    return `
        <div class="checkout-process">
            <h2 class="section-title"><i class="fas fa-file-invoice-dollar"></i> Check-out & Xuất hóa đơn</h2>
            
            <div class="form-row">
                <div class="form-control">
                    <label for="checkout-room"><i class="fas fa-door-closed"></i> Số phòng</label>
                    <select id="checkout-room">
                        <option value="">-- Chọn phòng --</option>
                        ${occupiedRooms.map(room => `
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
                <!-- Nội dung check-out sẽ được thêm bởi loadCheckoutInfo -->
            </div>
        </div>
    `;
}

// ========== CHẤM CÔNG ==========

// Render trang chấm công
function renderTimeClock() {
    loadShiftData();
    
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
    
    // Cập nhật thời gian mỗi phút
    setInterval(updateShiftDisplay, 60000);
});

// Thêm CSS
if (!document.getElementById('staff-styles')) {
    const style = document.createElement('style');
    style.id = 'staff-styles';
    style.textContent = `
        .status-badge {
            padding: 3px 10px;
            border-radius: 20px;
            font-size: 0.8em;
            font-weight: bold;
            display: inline-block
