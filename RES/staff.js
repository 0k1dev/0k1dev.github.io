// staff.js - CHỨC NĂNG NHÂN VIÊN HOÀN CHỈNH
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

// ========== CHẤM CÔNG NHÂN VIÊN ==========

// Tự động chấm công khi đăng nhập
function startShift() {
    if (!currentShift.isActive) {
        currentShift = {
            startTime: new Date(),
            endTime: null,
            duration: 0,
            isActive: true,
            staffName: currentUser ? currentUser.name : 'Nhân viên'
        };
        
        // Hiển thị thông báo
        showNotification('Bắt đầu ca làm việc', 'success');
        
        // Lưu vào localStorage
        saveShiftData();
        
        // Cập nhật giao diện nếu đang ở trang chấm công
        updateShiftDisplay();
    }
}

// Kết thúc ca làm việc
function endShift() {
    if (currentShift.isActive) {
        currentShift.endTime = new Date();
        currentShift.duration = (currentShift.endTime - currentShift.startTime) / (1000 * 60 * 60); // Giờ
        currentShift.isActive = false;
        
        // Lưu vào lịch sử
        shiftHistory.push({...currentShift});
        
        // Hiển thị thông báo
        showNotification(`Kết thúc ca làm việc: ${currentShift.duration.toFixed(2)} giờ`, 'info');
        
        // Lưu vào localStorage
        saveShiftData();
        
        // Reset
        currentShift = {
            startTime: null,
            endTime: null,
            duration: 0,
            isActive: false
        };
        
        updateShiftDisplay();
    }
}

// Lưu dữ liệu chấm công
function saveShiftData() {
    localStorage.setItem('staff_shifts', JSON.stringify(shiftHistory));
    localStorage.setItem('current_shift', JSON.stringify(currentShift));
}

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
                
                <div style="margin-top: 1rem; text-align: center;">
                    <button class="btn btn-info" onclick="viewShiftReport()">
                        <i class="fas fa-file-alt"></i> Xem báo cáo chi tiết
                    </button>
                </div>
            </div>
        </div>
        
        <style>
            .status-badge.completed {
                background-color: #2ecc71;
                color: white;
                padding: 3px 10px;
                border-radius: 20px;
                font-size: 0.8em;
            }
        </style>
    `;
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
    if (document.getElementById('current-duration')) {
        document.getElementById('current-duration').textContent = calculateCurrentDuration();
    }
}

// Xem báo cáo chi tiết
function viewShiftReport() {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    
    // Nhóm theo ngày
    const shiftsByDay = {};
    shiftHistory.forEach(shift => {
        const dateStr = formatDate(new Date(shift.startTime));
        if (!shiftsByDay[dateStr]) {
            shiftsByDay[dateStr] = [];
        }
        shiftsByDay[dateStr].push(shift);
    });
    
    let reportHTML = '';
    Object.keys(shiftsByDay).sort().reverse().forEach(date => {
        const dayShifts = shiftsByDay[date];
        const dayTotal = dayShifts.reduce((sum, shift) => sum + shift.duration, 0);
        
        reportHTML += `
            <div style="border: 1px solid #ddd; padding: 1rem; margin-bottom: 1rem; border-radius: 8px;">
                <div style="font-weight: bold; margin-bottom: 0.5rem;">${date}</div>
                <div style="font-size: 0.9em;">
                    Số ca: ${dayShifts.length} | Tổng giờ: ${dayTotal.toFixed(2)}
                </div>
            </div>
        `;
    });
    
    alertHTML(`
        <div style="max-width: 600px; max-height: 500px; overflow-y: auto;">
            <h3 style="margin-bottom: 1rem; color: #2c3e50;">
                <i class="fas fa-chart-line"></i> Báo cáo chấm công
            </h3>
            <p style="color: #7f8c8d;">Tổng số ca: ${shiftHistory.length}</p>
            
            <div style="margin-top: 1rem;">
                ${reportHTML || '<p style="text-align: center; color: #999;">Chưa có dữ liệu</p>'}
            </div>
        </div>
    `);
}

// ========== QUẢN LÝ PHÒNG VỚI BỘ LỌC NÂNG CAO ==========

// Render trang quản lý phòng với bộ lọc
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
                
                <!-- Lọc theo ngày (Kiểm tra đặt phòng) -->
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
                    
                    <!-- Kết quả kiểm tra -->
                    <div id="availability-result" class="hidden" style="margin-top: 1rem; padding: 1rem; background-color: #e8f4fd; border-radius: 5px;">
                        <div id="availability-message"></div>
                    </div>
                </div>
                
                <!-- Nút reset -->
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

// Render phòng đã lọc
function renderFilteredRooms() {
    const rooms = filterRooms();
    
    // Cập nhật thống kê
    document.getElementById('stat-available')?.textContent = rooms.filter(r => r.status === 'available').length;
    document.getElementById('stat-occupied')?.textContent = rooms.filter(r => r.status === 'occupied').length;
    document.getElementById('stat-reserved')?.textContent = rooms.filter(r => r.status === 'reserved').length;
    document.getElementById('stat-total')?.textContent = rooms.length;
    
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

// Lọc phòng
function filterRooms() {
    const statusAvailable = document.getElementById('filter-available')?.checked ?? true;
    const statusOccupied = document.getElementById('filter-occupied')?.checked ?? true;
    const statusReserved = document.getElementById('filter-reserved')?.checked ?? true;
    
    const minPrice = parseInt(document.getElementById('filter-price-min')?.value) || 0;
    const maxPrice = parseInt(document.getElementById('filter-price-max')?.value) || 10000000;
    
    const roomType = document.getElementById('filter-type')?.value || '';
    
    return appData.rooms.filter(room => {
        // Lọc theo trạng thái
        let statusMatch = false;
        if (room.status === 'available' && statusAvailable) statusMatch = true;
        if (room.status === 'occupied' && statusOccupied) statusMatch = true;
        if (room.status === 'reserved' && statusReserved) statusMatch = true;
        
        // Lọc theo giá
        const priceMatch = room.price >= minPrice && room.price <= maxPrice;
        
        // Lọc theo loại phòng
        const typeMatch = !roomType || room.type === roomType || room.typeName.toLowerCase().includes(roomType);
        
        return statusMatch && priceMatch && typeMatch;
    });
}

// Áp dụng bộ lọc
function applyRoomFilters() {
    document.getElementById('rooms-container').innerHTML = renderFilteredRooms();
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
    
    // Tìm các phòng đã được đặt/đã thuê trong khoảng thời gian này
    const unavailableRooms = [];
    
    appData.rooms.forEach(room => {
        // Kiểm tra nếu phòng đã thuê
        if (room.status === 'occupied' && room.checkInDate && room.checkOutDate) {
            const checkIn = new Date(room.checkInDate);
            const checkOut = new Date(room.checkOutDate);
            
            // Kiểm tra xem có trùng ngày không
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
        
        // Kiểm tra các booking trong khoảng thời gian
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
    
    // Tìm các phòng trống
    const totalRooms = appData.rooms.length;
    const availableRooms = totalRooms - new Set(unavailableRooms.map(r => r.number)).size;
    
    // Hiển thị kết quả
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
                <div style="font-size: 1.5rem; font-weight: bold;">${unavailableRooms.length}</div>
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
        
        <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #ccc; font-size: 0.9em; color: #666;">
            <i class="fas fa-lightbulb"></i> <strong>Gợi ý:</strong> Để tối ưu doanh thu, hãy ưu tiên đặt các phòng có giá cao hơn trước.
        </div>
    `;
}

// ========== TẠO MÃ THANH TOÁN VỚI ORDER TÍCH HỢP ==========

// Render trang tạo mã thanh toán với tính năng order món (giữ nguyên từ code trước)
function renderQRGenerator() {
    const occupiedRooms = appData.rooms.filter(room => room.status === 'occupied');
    
    return `
        <div class="qr-generator">
            <h2 class="section-title"><i class="fas fa-qrcode"></i> Tạo mã thanh toán & Order dịch vụ</h2>
            <p>Quét mã QR để thanh toán và nhận order dịch vụ</p>
            
            <div class="tabs" style="margin-bottom: 2rem; border-bottom: 2px solid #ddd;">
                <button class="tab-btn active" onclick="switchQRTab('payment')">
                    <i class="fas fa-money-bill-wave"></i> Tạo mã thanh toán
                </button>
                <button class="tab-btn" onclick="switchQRTab('order')">
                    <i class="fas fa-utensils"></i> Order dịch vụ
                </button>
                <button class="tab-btn" onclick="switchQRTab('history')">
                    <i class="fas fa-history"></i> Lịch sử QR
                </button>
            </div>
            
            <!-- Tab Tạo mã thanh toán -->
            <div id="qr-payment-tab" class="qr-tab">
                <div class="form-container">
                    <div class="form-row">
                        <div class="form-control">
                            <label for="qr-amount"><i class="fas fa-money-bill-wave"></i> Số tiền (VND) *</label>
                            <input type="number" id="qr-amount" placeholder="Nhập số tiền" min="1000" required>
                            <small>Tối thiểu 1,000 VND</small>
                        </div>
                        <div class="form-control">
                            <label for="qr-room-select"><i class="fas fa-door-closed"></i> Phòng (tùy chọn)</label>
                            <select id="qr-room-select" onchange="updateQRRoomInfo()">
                                <option value="">-- Không chọn phòng --</option>
                                ${occupiedRooms.map(room => `
                                    <option value="${room.number}">${room.number} - ${room.customerName}</option>
                                `).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-control">
                            <label for="qr-description"><i class="fas fa-file-alt"></i> Nội dung chuyển khoản *</label>
                            <input type="text" id="qr-description" placeholder="Ví dụ: Thanh toán phòng 101" required>
                            <small>Tối đa 20 ký tự</small>
                        </div>
                    </div>
                    
                    <!-- Thông tin phòng (nếu chọn) -->
                    <div id="qr-room-info" class="hidden" style="background-color: #f0f9ff; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
                        <div class="form-row">
                            <div class="form-control">
                                <strong>Khách hàng:</strong> <span id="qr-customer-name">-</span>
                            </div>
                            <div class="form-control">
                                <strong>Số điện thoại:</strong> <span id="qr-customer-phone">-</span>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-control">
                                <strong>Dịch vụ hiện có:</strong> <span id="qr-current-services">0đ</span>
                            </div>
                            <div class="form-control">
                                <button class="btn btn-sm btn-primary" onclick="quickAddServiceToRoom()">
                                    <i class="fas fa-plus"></i> Thêm dịch vụ nhanh
                                </button>
                            </div>
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
                    </div>
                </div>
                
                <!-- Kết quả QR -->
                <div id="vietqr-result" class="hidden" style="margin-top: 2rem;">
                    ${renderQRResult()}
                </div>
            </div>
            
            <!-- Tab Order dịch vụ -->
            <div id="qr-order-tab" class="qr-tab hidden">
                ${renderQuickOrderTab()}
            </div>
            
            <!-- Tab Lịch sử -->
            <div id="qr-history-tab" class="qr-tab hidden">
                ${renderQRHistoryTab()}
            </div>
        </div>
        
        <style>
            .tabs {
                display: flex;
                gap: 0;
            }
            .tab-btn {
                padding: 12px 20px;
                border: none;
                background: none;
                cursor: pointer;
                font-size: 1em;
                border-bottom: 3px solid transparent;
                transition: all 0.3s;
            }
            .tab-btn.active {
                border-bottom-color: #3498db;
                color: #3498db;
                font-weight: bold;
            }
            .tab-btn:hover {
                background-color: #f5f5f5;
            }
            .qr-tab {
                display: block;
            }
            .qr-tab.hidden {
                display: none;
            }
            .quick-menu-item {
                padding: 10px;
                background: white;
                border: 1px solid #ddd;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
                text-align: center;
            }
            .quick-menu-item:hover {
                background-color: #3498db;
                color: white;
                transform: translateY(-2px);
            }
            .order-item {
                display: flex;
                justify-content: space-between;
                padding: 8px;
                background: white;
                margin: 5px 0;
                border-radius: 5px;
                border-left: 4px solid #3498db;
            }
        </style>
    `;
}

// ========== HÀM TIỆN ÍCH ==========

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

// Định dạng thời gian
function formatTime(date) {
    if (!date) return '-';
    return new Date(date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
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
function showNotification(message, type = 'info') {
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
    
    // Thêm CSS animation
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

// ========== KHỞI TẠO ==========

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
            floors: 3,
            roomTypes: [
                { id: 'single', name: 'Phòng đơn', price: 300000 },
                { id: 'double', name: 'Phòng đôi', price: 500000 },
                { id: 'suite', name: 'Suite', price: 800000 },
                { id: 'vip', name: 'VIP', price: 1200000 }
            ]
        }
    };
}

if (!currentUser) {
    var currentUser = {
        id: 1,
        name: "Nhân viên quầy",
        role: "staff"
    };
}

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

// Thêm CSS cho status badges
document.head.insertAdjacentHTML('beforeend', `
    <style>
        .status-badge {
            padding: 3px 10px;
            border-radius: 20px;
            font-size: 0.8em;
            font-weight: bold;
            display: inline-block;
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
        .status-badge.completed {
            background-color: #2ecc71;
            color: white;
        }
        .hidden {
            display: none !important;
        }
        
        /* Responsive design */
        @media (max-width: 768px) {
            .filter-row, .shift-info {
                flex-direction: column;
            }
            .rooms-container {
                grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)) !important;
            }
            .tab-btn {
                padding: 10px 15px;
                font-size: 0.9em;
            }
        }
        
        @media (max-width: 480px) {
            .rooms-container {
                grid-template-columns: 1fr !important;
            }
            .room-stats > div {
                min-width: 100% !important;
            }
        }
    </style>
`);
