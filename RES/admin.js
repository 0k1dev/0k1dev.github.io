// admin.js - CHỈ CHỨA CHỨC NĂNG QUẢN TRỊ VIÊN (KHÔNG CÓ ĐĂNG NHẬP)

// ========== RENDER FUNCTIONS - ADMIN ==========

// Render trang dashboard (ADMIN)
function renderAdminDashboard() {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Thống kê
    const occupiedRooms = appData.rooms.filter(r => r.status === 'occupied').length;
    const availableRooms = appData.rooms.filter(r => r.status === 'available').length;
    const reservedRooms = appData.rooms.filter(r => r.status === 'reserved').length;
    
    // Hôm nay
    const todayCheckIns = appData.bookings.filter(b => {
        const checkIn = new Date(b.checkInDate).toISOString().split('T')[0];
        return checkIn === todayStr;
    }).length;
    
    const todayCheckOuts = appData.bookings.filter(b => {
        const checkOut = b.actualCheckOutDate ? 
            new Date(b.actualCheckOutDate).toISOString().split('T')[0] : null;
        return checkOut === todayStr;
    }).length;
    
    // Tổng doanh thu
    const totalRevenue = appData.bills.reduce((sum, bill) => sum + bill.totalAmount, 0);
    const todayRevenue = appData.bills.filter(bill => {
        const billDate = new Date(bill.createdDate).toISOString().split('T')[0];
        return billDate === todayStr;
    }).reduce((sum, bill) => sum + bill.totalAmount, 0);
    
    // QR codes đã tạo
    const totalQRCodes = appData.qrCodes.length;
    const todayQRCodes = appData.qrCodes.filter(qr => {
        const qrDate = new Date(qr.createdDate).toISOString().split('T')[0];
        return qrDate === todayStr;
    }).length;
    
    return `
        <div class="admin-dashboard">
            <h2 class="section-title"><i class="fas fa-tachometer-alt"></i> Tổng quan hệ thống</h2>
            
            <div class="dashboard-stats">
                <div class="stat-card" style="background-color: #e3f2fd;">
                    <div class="stat-icon">
                        <i class="fas fa-bed" style="color: #2196f3;"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${appData.rooms.length}</h3>
                        <p>Tổng số phòng</p>
                        <small>${occupiedRooms} đã thuê, ${availableRooms} trống</small>
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
                        <i class="fas fa-money-bill-wave" style="color: #ff9800;"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${formatCurrency(todayRevenue)}</h3>
                        <p>Doanh thu hôm nay</p>
                        <small>Tổng: ${formatCurrency(totalRevenue)}</small>
                    </div>
                </div>
                
                <div class="stat-card" style="background-color: #fce4ec;">
                    <div class="stat-icon">
                        <i class="fas fa-qrcode" style="color: #e91e63;"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${totalQRCodes}</h3>
                        <p>Mã QR đã tạo</p>
                        <small>${todayQRCodes} mã hôm nay</small>
                    </div>
                </div>
            </div>
            
            <div class="dashboard-content">
                <div class="dashboard-section">
                    <h3><i class="fas fa-chart-line"></i> Tình trạng phòng hiện tại</h3>
                    <div style="display: flex; align-items: center; gap: 2rem; margin-top: 1.5rem;">
                        <div style="flex: 1;">
                            <canvas id="roomStatusChart" width="400" height="200"></canvas>
                        </div>
                        <div style="flex: 1;">
                            <div class="room-status-legends">
                                <div style="display: flex; align-items: center; margin-bottom: 10px;">
                                    <div style="width: 20px; height: 20px; background-color: #4CAF50; margin-right: 10px;"></div>
                                    <span>Phòng trống: ${availableRooms} (${Math.round((availableRooms/appData.rooms.length)*100)}%)</span>
                                </div>
                                <div style="display: flex; align-items: center; margin-bottom: 10px;">
                                    <div style="width: 20px; height: 20px; background-color: #f44336; margin-right: 10px;"></div>
                                    <span>Phòng đã thuê: ${occupiedRooms} (${Math.round((occupiedRooms/appData.rooms.length)*100)}%)</span>
                                </div>
                                <div style="display: flex; align-items: center;">
                                    <div style="width: 20px; height: 20px; background-color: #FF9800; margin-right: 10px;"></div>
                                    <span>Phòng đã đặt: ${reservedRooms} (${Math.round((reservedRooms/appData.rooms.length)*100)}%)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="dashboard-section">
                    <h3><i class="fas fa-history"></i> Hoạt động gần đây</h3>
                    <div class="table-container" style="max-height: 300px; overflow-y: auto;">
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
                                ${getRecentActivities().map(activity => `
                                    <tr>
                                        <td>${formatDateTime(activity.time)}</td>
                                        <td>
                                            <span class="activity-badge activity-${activity.type}">
                                                ${activity.type === 'checkin' ? 'Check-in' : 
                                                  activity.type === 'checkout' ? 'Check-out' : 'QR'}
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
            </div>
        </div>
        
        <script>
            // Vẽ biểu đồ tình trạng phòng
            setTimeout(() => {
                const ctx = document.getElementById('roomStatusChart').getContext('2d');
                new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Phòng trống', 'Phòng đã thuê', 'Phòng đã đặt'],
                        datasets: [{
                            data: [${availableRooms}, ${occupiedRooms}, ${reservedRooms}],
                            backgroundColor: ['#4CAF50', '#f44336', '#FF9800'],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'bottom'
                            }
                        }
                    }
                });
            }, 100);
        </script>
        
        <style>
            .dashboard-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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
            
            .activity-qr {
                background-color: #e3f2fd;
                color: #1565c0;
            }
            
            @media (max-width: 1024px) {
                .dashboard-content {
                    grid-template-columns: 1fr;
                }
            }
        </style>
    `;
}

// Hàm lấy hoạt động gần đây
function getRecentActivities() {
    const activities = [];
    
    // Thêm check-in
    appData.bookings.slice(-10).forEach(booking => {
        activities.push({
            time: booking.createdDate,
            type: 'checkin',
            details: `Check-in phòng ${booking.roomNumber} - ${booking.customerName}`,
            staff: booking.staffName || 'Nhân viên'
        });
    });
    
    // Thêm check-out
    appData.bills.slice(-10).forEach(bill => {
        activities.push({
            time: bill.createdDate,
            type: 'checkout',
            details: `Check-out phòng ${bill.roomNumber} - ${formatCurrency(bill.totalAmount)}`,
            staff: bill.staffName || 'Nhân viên'
        });
    });
    
    // Thêm QR codes
    appData.qrCodes.slice(-10).forEach(qr => {
        activities.push({
            time: qr.createdDate,
            type: 'qr',
            details: `Tạo mã QR - ${formatCurrency(qr.totalAmount)}`,
            staff: qr.staffName || 'Nhân viên'
        });
    });
    
    // Sắp xếp theo thời gian
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    
    return activities.slice(0, 10);
}

// Render trang quản lý phòng (ADMIN) - Chi tiết hơn
function renderRoomManagementAdmin() {
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
                        let clickHandler = `onclick="showRoomDetailsAdmin(${room.number})"`;
                        
                        return `
                            <div class="room ${room.status}" ${clickHandler} style="cursor: pointer;">
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
            <p>Nhấn vào phòng để xem thông tin chi tiết</p>
            
            ${floorsHTML}
        </div>
    `;
}

// Hiển thị chi tiết phòng cho admin
function showRoomDetailsAdmin(roomNumber) {
    const room = appData.rooms.find(r => r.number === roomNumber);
    if (!room) return;
    
    let detailsHTML = '';
    
    if (room.status === 'reserved') {
        detailsHTML = `
            <p><strong>Số điện thoại nhân viên:</strong> ${room.staffPhone || 'Chưa có'}</p>
            <p><strong>Trạng thái:</strong> Đã đặt</p>
            <p><strong>Nhân viên cần đối chiếu số điện thoại này</strong></p>
        `;
    } else if (room.status === 'occupied') {
        // Tìm booking
        const booking = appData.bookings.find(b => b.roomNumber === room.number && b.status === 'active');
        
        let servicesHTML = '';
        if (room.services && room.services.length > 0) {
            servicesHTML = `
                <h4>Dịch vụ đã gọi:</h4>
                <ul>
                    ${room.services.map(service => 
                        `<li>${service.name} x${service.quantity} - ${formatCurrency(service.total)}</li>`
                    ).join('')}
                </ul>
                <p><strong>Tổng dịch vụ:</strong> ${formatCurrency(room.services.reduce((sum, s) => sum + s.total, 0))}</p>
            `;
        } else {
            servicesHTML = '<p>Chưa gọi dịch vụ nào</p>';
        }
        
        detailsHTML = `
            <p><strong>Khách hàng:</strong> ${room.customerName || 'Chưa có'}</p>
            <p><strong>Số điện thoại:</strong> ${room.customerPhone || 'Chưa có'}</p>
            <p><strong>CCCD:</strong> ${room.customerId || 'Chưa có'}</p>
            <p><strong>Ngày nhận phòng:</strong> ${formatDateTime(room.checkInDate)}</p>
            <p><strong>Ngày trả phòng dự kiến:</strong> ${formatDate(room.checkOutDate)}</p>
            ${booking ? `<p><strong>Nhân viên check-in:</strong> ${booking.staffName || 'Nhân viên'}</p>` : ''}
            ${servicesHTML}
        `;
    } else {
        detailsHTML = `
            <p><strong>Trạng thái:</strong> Còn trống</p>
            <p><strong>Loại phòng:</strong> ${room.typeName}</p>
            <p><strong>Giá phòng:</strong> ${formatCurrency(room.price)}/đêm</p>
        `;
    }
    
    const modalHTML = `
        <div class="modal" style="display: flex;">
            <div class="modal-content" style="width: 500px;">
                <div class="modal-header">
                    <h3>Chi tiết phòng ${room.number}</h3>
                    <button class="close-modal" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="room-details">
                        <p><strong>Tầng:</strong> ${room.floor}</p>
                        <p><strong>Loại phòng:</strong> ${room.typeName}</p>
                        <p><strong>Giá phòng:</strong> ${formatCurrency(room.price)}/đêm</p>
                        <p><strong>Trạng thái:</strong> 
                            <span class="status-badge status-${room.status}">
                                ${room.status === 'available' ? 'Còn trống' : 
                                  room.status === 'occupied' ? 'Đã thuê' : 'Đã đặt'}
                            </span>
                        </p>
                        ${detailsHTML}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    `;
    
    const modal = document.createElement('div');
    modal.innerHTML = modalHTML;
    document.body.appendChild(modal);
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
                        <input type="text" id="search-bill" placeholder="Số phòng, tên KH, mã hóa đơn..." 
                               onkeyup="searchBillsAdmin()">
                    </div>
                    <div class="form-control">
                        <label for="filter-bill-date">Từ ngày</label>
                        <input type="date" id="filter-bill-date" onchange="searchBillsAdmin()">
                    </div>
                    <div class="form-control">
                        <label for="filter-bill-date-to">Đến ngày</label>
                        <input type="date" id="filter-bill-date-to" onchange="searchBillsAdmin()">
                    </div>
                </div>
            </div>
            
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Mã HD</th>
                            <th>Ngày</th>
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
                    <tbody id="bills-list-admin">
                        ${appData.bills.map(bill => `
                            <tr>
                                <td><strong>${bill.billNumber}</strong></td>
                                <td>${formatDate(bill.createdDate)}</td>
                                <td><span class="room-badge">${bill.roomNumber}</span></td>
                                <td>${bill.customerName}</td>
                                <td>${formatDate(bill.checkInDate)}</td>
                                <td>${formatDate(bill.checkOutDate)}</td>
                                <td>${bill.days}</td>
                                <td><strong>${formatCurrency(bill.totalAmount)}</strong></td>
                                <td>
                                    <span class="payment-badge payment-${bill.paymentMethod}">
                                        ${bill.paymentMethod === 'cash' ? 'Tiền mặt' : 
                                          bill.paymentMethod === 'banking' ? 'Chuyển khoản' : 'Thẻ tín dụng'}
                                    </span>
                                </td>
                                <td>${bill.staffName || 'Nhân viên'}</td>
                                <td>
                                    <button class="btn btn-secondary btn-sm" onclick="viewBillDetailsAdmin(${bill.id})">
                                        <i class="fas fa-eye"></i>
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
            
            .room-badge {
                background-color: #e3f2fd;
                color: #2196f3;
                padding: 4px 10px;
                border-radius: 12px;
                font-weight: bold;
            }
        </style>
    `;
}

// Tìm kiếm hóa đơn (Admin)
function searchBillsAdmin() {
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
    
    const tbody = document.getElementById('bills-list-admin');
    if (tbody) {
        tbody.innerHTML = filteredBills.map(bill => `
            <tr>
                <td><strong>${bill.billNumber}</strong></td>
                <td>${formatDate(bill.createdDate)}</td>
                <td><span class="room-badge">${bill.roomNumber}</span></td>
                <td>${bill.customerName}</td>
                <td>${formatDate(bill.checkInDate)}</td>
                <td>${formatDate(bill.checkOutDate)}</td>
                <td>${bill.days}</td>
                <td><strong>${formatCurrency(bill.totalAmount)}</strong></td>
                <td>
                    <span class="payment-badge payment-${bill.paymentMethod}">
                        ${bill.paymentMethod === 'cash' ? 'Tiền mặt' : 
                          bill.paymentMethod === 'banking' ? 'Chuyển khoản' : 'Thẻ tín dụng'}
                    </span>
                </td>
                <td>${bill.staffName || 'Nhân viên'}</td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="viewBillDetailsAdmin(${bill.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
}

// Xem chi tiết hóa đơn (Admin)
function viewBillDetailsAdmin(billId) {
    const bill = appData.bills.find(b => b.id === billId);
    if (!bill) return;
    
    const servicesHTML = bill.services && bill.services.length > 0 ? 
        bill.services.map(service => `
            <tr>
                <td>${service.name}</td>
                <td>${service.quantity}</td>
                <td>${formatCurrency(service.price)}</td>
                <td>${formatCurrency(service.total)}</td>
            </tr>
        `).join('') : 
        `<tr><td colspan="4" style="text-align: center; color: #999;">Không có dịch vụ</td></tr>`;
    
    const modalHTML = `
        <div class="modal" style="display: flex;">
            <div class="modal-content" style="width: 800px;">
                <div class="modal-header">
                    <h3>Hóa đơn ${bill.billNumber}</h3>
                    <button class="close-modal" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="bill-details">
                        <div style="margin-bottom: 1.5rem;">
                            <p><strong>Ngày xuất:</strong> ${formatDateTime(bill.createdDate)}</p>
                            <p><strong>Nhân viên:</strong> ${bill.staffName || 'Nhân viên'}</p>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
                            <div>
                                <h4>Thông tin khách hàng</h4>
                                <p><strong>Họ tên:</strong> ${bill.customerName}</p>
                                <p><strong>CCCD:</strong> ${bill.customerId}</p>
                            </div>
                            <div>
                                <h4>Thông tin phòng</h4>
                                <p><strong>Số phòng:</strong> ${bill.roomNumber}</p>
                                <p><strong>Loại phòng:</strong> ${bill.roomType}</p>
                                <p><strong>Số ngày:</strong> ${bill.days} ngày</p>
                            </div>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
                            <div>
                                <p><strong>Ngày nhận:</strong> ${formatDate(bill.checkInDate)}</p>
                            </div>
                            <div>
                                <p><strong>Ngày trả:</strong> ${formatDate(bill.checkOutDate)}</p>
                            </div>
                        </div>
                        
                        <h4>Chi tiết thanh toán</h4>
                        <div class="table-container">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Mục</th>
                                        <th>Số lượng</th>
                                        <th>Đơn giá</th>
                                        <th>Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Tiền phòng (${bill.days} ngày)</td>
                                        <td>${bill.days}</td>
                                        <td>${formatCurrency(bill.roomPrice)}</td>
                                        <td>${formatCurrency(bill.roomTotal)}</td>
                                    </tr>
                                    ${servicesHTML}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colspan="3" style="text-align: right;"><strong>Tổng tiền phòng:</strong></td>
                                        <td>${formatCurrency(bill.roomTotal)}</td>
                                    </tr>
                                    <tr>
                                        <td colspan="3" style="text-align: right;"><strong>Tổng tiền dịch vụ:</strong></td>
                                        <td>${formatCurrency(bill.serviceTotal)}</td>
                                    </tr>
                                    <tr style="background-color: #f0f5ff;">
                                        <td colspan="3" style="text-align: right;"><strong>TỔNG CỘNG:</strong></td>
                                        <td style="font-weight: bold; font-size: 1.2rem;">${formatCurrency(bill.totalAmount)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                        
                        <div style="margin-top: 1.5rem;">
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
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    `;
    
    const modal = document.createElement('div');
    modal.innerHTML = modalHTML;
    document.body.appendChild(modal);
}

// Render trang thống kê dịch vụ (ADMIN)
function renderServiceAnalytics() {
    // Tính thống kê dịch vụ
    const allServices = [];
    appData.bills.forEach(bill => {
        if (bill.services && bill.services.length > 0) {
            allServices.push(...bill.services);
        }
    });
    
    const serviceStats = calculateServiceStats(allServices);
    
    return `
        <div class="service-analytics">
            <h2 class="section-title"><i class="fas fa-utensils"></i> Thống kê dịch vụ</h2>
            
            <div class="analytics-stats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
                <div style="background-color: #e8f5e9; padding: 1.5rem; border-radius: 8px; text-align: center;">
                    <h4>Tổng dịch vụ</h4>
                    <p style="font-size: 2rem; font-weight: bold;">${serviceStats.totalItems}</p>
                </div>
                <div style="background-color: #fff3e0; padding: 1.5rem; border-radius: 8px; text-align: center;">
                    <h4>Doanh thu DV</h4>
                    <p style="font-size: 2rem; font-weight: bold;">${formatCurrency(serviceStats.totalRevenue)}</p>
                </div>
                <div style="background-color: #fce4ec; padding: 1.5rem; border-radius: 8px; text-align: center;">
                    <h4>Loại phổ biến</h4>
                    <p style="font-size: 1.5rem; font-weight: bold;">${serviceStats.topCategory}</p>
                </div>
                <div style="background-color: #e3f2fd; padding: 1.5rem; border-radius: 8px; text-align: center;">
                    <h4>Món phổ biến</h4>
                    <p style="font-size: 1.5rem; font-weight: bold;">${serviceStats.topItem}</p>
                </div>
            </div>
            
            <div class="analytics-content">
                <div class="dashboard-section">
                    <h3><i class="fas fa-chart-bar"></i> Phân bố theo loại dịch vụ</h3>
                    <div style="height: 300px;">
                        <canvas id="serviceCategoryChart"></canvas>
                    </div>
                </div>
                
                <div class="dashboard-section">
                    <h3><i class="fas fa-list-ol"></i> Top 5 món được gọi nhiều nhất</h3>
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Tên món</th>
                                    <th>Số lượng</th>
                                    <th>Doanh thu</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${serviceStats.topItems.map((item, index) => `
                                    <tr>
                                        <td>${index + 1}</td>
                                        <td>${item.name}</td>
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
                <h3><i class="fas fa-calendar-alt"></i> Dịch vụ theo tháng</h3>
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Tháng</th>
                                <th>Số lượng dịch vụ</th>
                                <th>Doanh thu</th>
                                <th>Món phổ biến</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${serviceStats.monthlyStats.map(month => `
                                <tr>
                                    <td>${month.month}</td>
                                    <td>${month.count}</td>
                                    <td>${formatCurrency(month.revenue)}</td>
                                    <td>${month.topItem}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        
        <script>
            // Vẽ biểu đồ loại dịch vụ
            setTimeout(() => {
                const ctx = document.getElementById('serviceCategoryChart').getContext('2d');
                const serviceStats = calculateServiceStats([]);
                
                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: ['Món ăn', 'Đồ uống', 'Tráng miệng'],
                        datasets: [{
                            label: 'Số lượng',
                            data: [${serviceStats.byCategory.food || 0}, ${serviceStats.byCategory.drink || 0}, ${serviceStats.byCategory.dessert || 0}],
                            backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1'],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            }, 100);
        </script>
        
        <style>
            .analytics-content {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 2rem;
            }
            
            @media (max-width: 1024px) {
                .analytics-content {
                    grid-template-columns: 1fr;
                }
            }
        </style>
    `;
}

// Tính thống kê dịch vụ
function calculateServiceStats(services) {
    const stats = {
        totalItems: 0,
        totalRevenue: 0,
        byCategory: { food: 0, drink: 0, dessert: 0 },
        topItems: [],
        topCategory: '',
        topItem: '',
        monthlyStats: []
    };
    
    // Đếm theo loại
    services.forEach(service => {
        stats.totalItems += service.quantity;
        stats.totalRevenue += service.total;
        
        if (service.category === 'food') {
            stats.byCategory.food += service.quantity;
        } else if (service.category === 'drink') {
            stats.byCategory.drink += service.quantity;
        } else if (service.category === 'dessert') {
            stats.byCategory.dessert += service.quantity;
        }
    });
    
    // Tìm loại phổ biến
    const maxCategory = Math.max(stats.byCategory.food, stats.byCategory.drink, stats.byCategory.dessert);
    if (maxCategory === stats.byCategory.food) {
        stats.topCategory = 'Món ăn';
    } else if (maxCategory === stats.byCategory.drink) {
        stats.topCategory = 'Đồ uống';
    } else {
        stats.topCategory = 'Tráng miệng';
    }
    
    // Gom nhóm theo tên món
    const itemMap = {};
    services.forEach(service => {
        if (!itemMap[service.name]) {
            itemMap[service.name] = {
                name: service.name,
                quantity: 0,
                revenue: 0
            };
        }
        itemMap[service.name].quantity += service.quantity;
        itemMap[service.name].revenue += service.total;
    });
    
    // Chuyển thành mảng và sắp xếp
    stats.topItems = Object.values(itemMap)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);
    
    stats.topItem = stats.topItems.length > 0 ? stats.topItems[0].name : 'N/A';
    
    // Thống kê theo tháng (mẫu)
    stats.monthlyStats = [
        { month: 'Tháng 1', count: 45, revenue: 4500000, topItem: 'Phở bò' },
        { month: 'Tháng 2', count: 52, revenue: 5200000, topItem: 'Cà phê' },
        { month: 'Tháng 3', count: 48, revenue: 4800000, topItem: 'Bún chả' },
        { month: 'Tháng 4', count: 60, revenue: 6000000, topItem: 'Nước cam' }
    ];
    
    return stats;
}

// Các trang khác
function renderReports() {
    return `
        <div class="reports">
            <h2 class="section-title"><i class="fas fa-chart-pie"></i> Báo cáo tổng hợp</h2>
            <div class="dashboard-section">
                <h3><i class="fas fa-chart-line"></i> Doanh thu theo tháng</h3>
                <canvas id="revenueChart" width="400" height="200"></canvas>
            </div>
            
            <div class="dashboard-section">
                <h3><i class="fas fa-chart-bar"></i> Tỷ lệ lấp đầy phòng</h3>
                <div style="height: 300px;">
                    <canvas id="occupancyChart"></canvas>
                </div>
            </div>
            
            <div class="dashboard-section">
                <h3><i class="fas fa-file-export"></i> Xuất báo cáo</h3>
                <div class="form-actions">
                    <button class="btn btn-primary" onclick="exportReport('daily')">
                        <i class="fas fa-download"></i> Xuất báo cáo ngày
                    </button>
                    <button class="btn btn-success" onclick="exportReport('monthly')" style="margin-left: 10px;">
                        <i class="fas fa-download"></i> Xuất báo cáo tháng
                    </button>
                    <button class="btn btn-warning" onclick="exportReport('yearly')" style="margin-left: 10px;">
                        <i class="fas fa-download"></i> Xuất báo cáo năm
                    </button>
                </div>
            </div>
        </div>
        
        <script>
            setTimeout(() => {
                // Biểu đồ doanh thu
                const ctx1 = document.getElementById('revenueChart').getContext('2d');
                new Chart(ctx1, {
                    type: 'line',
                    data: {
                        labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
                        datasets: [{
                            label: 'Doanh thu (triệu VND)',
                            data: [45, 52, 48, 60, 55, 65, 70, 68, 75, 80, 85, 90],
                            borderColor: '#2196f3',
                            backgroundColor: 'rgba(33, 150, 243, 0.1)',
                            fill: true
                        }]
                    },
                    options: {
                        responsive: true
                    }
                });
                
                // Biểu đồ tỷ lệ lấp đầy
                const ctx2 = document.getElementById('occupancyChart').getContext('2d');
                new Chart(ctx2, {
                    type: 'bar',
                    data: {
                        labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'],
                        datasets: [{
                            label: 'Tỷ lệ lấp đầy (%)',
                            data: [65, 70, 75, 80, 85, 90],
                            backgroundColor: '#4caf50'
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            y: {
                                beginAtZero: true,
                                max: 100
                            }
                        }
                    }
                });
            }, 100);
        </script>
    `;
}

function renderRevenueAnalysis() {
    return `
        <div class="revenue-analysis">
            <h2 class="section-title"><i class="fas fa-chart-line"></i> Phân tích doanh thu</h2>
            <div class="dashboard-section">
                <h3><i class="fas fa-money-bill-wave"></i> So sánh doanh thu</h3>
                <div class="revenue-comparison">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
                        <div style="background-color: #e8f5e9; padding: 1.5rem; border-radius: 8px; text-align: center;">
                            <h4>Hôm nay</h4>
                            <p style="font-size: 1.5rem; font-weight: bold; color: #2e7d32;">${formatCurrency(1500000)}</p>
                        </div>
                        <div style="background-color: #fff3e0; padding: 1.5rem; border-radius: 8px; text-align: center;">
                            <h4>Tuần này</h4>
                            <p style="font-size: 1.5rem; font-weight: bold; color: #ff9800;">${formatCurrency(10500000)}</p>
                        </div>
                        <div style="background-color: #fce4ec; padding: 1.5rem; border-radius: 8px; text-align: center;">
                            <h4>Tháng này</h4>
                            <p style="font-size: 1.5rem; font-weight: bold; color: #e91e63;">${formatCurrency(45000000)}</p>
                        </div>
                        <div style="background-color: #e3f2fd; padding: 1.5rem; border-radius: 8px; text-align: center;">
                            <h4>Năm nay</h4>
                            <p style="font-size: 1.5rem; font-weight: bold; color: #2196f3;">${formatCurrency(540000000)}</p>
                        </div>
                    </div>
                </div>
                
                <h3><i class="fas fa-chart-pie"></i> Phân bố nguồn thu</h3>
                <div style="height: 400px;">
                    <canvas id="revenueDistributionChart"></canvas>
                </div>
            </div>
        </div>
        
        <script>
            setTimeout(() => {
                const ctx = document.getElementById('revenueDistributionChart').getContext('2d');
                new Chart(ctx, {
                    type: 'pie',
                    data: {
                        labels: ['Tiền phòng', 'Dịch vụ ăn uống', 'Dịch vụ khác', 'Phụ thu'],
                        datasets: [{
                            data: [70, 15, 10, 5],
                            backgroundColor: ['#4caf50', '#2196f3', '#ff9800', '#e91e63']
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'bottom'
                            }
                        }
                    }
                });
            }, 100);
        </script>
    `;
}

// Xuất báo cáo
function exportReport(type) {
    alert(`Đang xuất báo cáo ${type === 'daily' ? 'ngày' : type === 'monthly' ? 'tháng' : 'năm'}...\nTrong thực tế sẽ tạo file Excel/PDF để tải về.`);
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
