// File cấu hình phân quyền và cấu hình chung
const APP_CONFIG = {
    hotel: {
        name: "Sunshine Hotel",
        floors: 7,
        roomsPerFloor: 23,
        roomTypes: {
            "STANDARD": { name: "Phòng Tiêu Chuẩn", price: 500000 },
            "DELUXE": { name: "Phòng Deluxe", price: 800000 },
            "SUITE": { name: "Phòng Suite", price: 1200000 },
            "PRESIDENTIAL": { name: "Phòng Tổng Thống", price: 3000000 }
        }
    },

    // Phân quyền
    permissions: {
        STAFF: {
            canAccess: ['STAFF'],
            features: [
                { id: 'room-management', name: 'Quản lý phòng', icon: 'fas fa-door-closed' },
                { id: 'check-in-process', name: 'Check-in khách', icon: 'fas fa-user-check' },
                { id: 'check-out-process', name: 'Check-out & Xuất bill', icon: 'fas fa-file-invoice-dollar' },
                { id: 'qr-generator', name: 'Tạo mã thanh toán', icon: 'fas fa-qrcode' }
            ]
        },
        
        ADMIN: {
            canAccess: ['ADMIN'],
            features: [
                { id: 'dashboard', name: 'Tổng quan', icon: 'fas fa-tachometer-alt' },
                { id: 'room-management', name: 'Quản lý phòng', icon: 'fas fa-door-closed' },
                { id: 'reports', name: 'Báo cáo & Thống kê', icon: 'fas fa-chart-bar' },
                { id: 'revenue-analysis', name: 'Phân tích doanh thu', icon: 'fas fa-money-bill-wave' },
                { id: 'bill-history', name: 'Lịch sử hóa đơn', icon: 'fas fa-history' },
                { id: 'service-analytics', name: 'Thống kê dịch vụ', icon: 'fas fa-utensils' }
            ]
        }
    },

    // Tài khoản mẫu
    sampleAccounts: [
        { username: 'huy9a1qn', password: '01112006', role: 'ADMIN', name: 'Đinh Tấn Huy' },
        { username: 'bot', password: '123456', role: 'STAFF', name: 'Đệ của Huy' }
    ],

    // Hàm xác thực
    authenticate: function(username, password, role) {
        const account = this.sampleAccounts.find(acc => 
            acc.username === username && 
            acc.password === password && 
            acc.role === role
        );
        
        if (account) {
            return {
                success: true,
                user: {
                    username: account.username,
                    name: account.name,
                    role: account.role
                }
            };
        }
        
        return {
            success: false,
            message: "Tên đăng nhập, mật khẩu hoặc vai trò không chính xác!"
        };
    },

    // Hàm kiểm tra quyền
    checkAccess: function(currentRole, targetRole) {
        if (!currentRole || !this.permissions[currentRole]) return false;
        return this.permissions[currentRole].canAccess.includes(targetRole);
    },

    // Hàm lấy menu
    getMenuForRole: function(role) {
        return this.permissions[role] ? this.permissions[role].features : [];
    },

    // Khởi tạo dữ liệu phòng
    initializeRooms: function() {
        const rooms = [];
        const roomTypes = Object.keys(this.hotel.roomTypes);
        
        for (let floor = 1; floor <= this.hotel.floors; floor++) {
            for (let roomNum = 1; roomNum <= this.hotel.roomsPerFloor; roomNum++) {
                const roomNumber = floor * 100 + roomNum;
                const roomType = roomTypes[Math.floor(Math.random() * roomTypes.length)];
                
                // Trạng thái ngẫu nhiên
                const statuses = ['available', 'occupied', 'reserved'];
                const status = statuses[Math.floor(Math.random() * statuses.length)];
                
                // Tạo số điện thoại nhân viên 10 số
                const staffPhone = `09${Math.floor(Math.random() * 90000000) + 10000000}`;
                
                rooms.push({
                    id: `${floor}-${roomNum}`,
                    number: roomNumber,
                    floor: floor,
                    type: roomType,
                    typeName: this.hotel.roomTypes[roomType].name,
                    price: this.hotel.roomTypes[roomType].price,
                    status: status,
                    staffPhone: status === 'reserved' ? staffPhone : null,
                    customerName: status === 'available' ? null : `Khách ${Math.floor(Math.random() * 1000)}`,
                    customerPhone: status === 'available' ? null : `09${Math.floor(Math.random() * 90000000) + 10000000}`,
                    customerId: status === 'available' ? null : `${Math.floor(Math.random() * 900000000000) + 100000000000}`,
                    checkInDate: status === 'available' ? null : new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000),
                    checkOutDate: status === 'available' ? null : new Date(Date.now() + Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000),
                    services: status === 'occupied' ? generateRandomServices() : []
                });
            }
        }
        
        return rooms;
    },

    // Khởi tạo dữ liệu đặt phòng
    initializeBookings: function() {
        const bookings = [];
        const today = new Date();
        
        for (let i = 1; i <= 50; i++) {
            const checkIn = new Date(today);
            checkIn.setDate(checkIn.getDate() - Math.floor(Math.random() * 30));
            
            const checkOut = new Date(checkIn);
            checkOut.setDate(checkOut.getDate() + Math.floor(Math.random() * 10) + 1);
            
            const roomType = Object.keys(this.hotel.roomTypes)[Math.floor(Math.random() * Object.keys(this.hotel.roomTypes).length)];
            
            bookings.push({
                id: i,
                customerName: `Khách hàng ${i}`,
                customerPhone: `09${Math.floor(Math.random() * 90000000) + 10000000}`,
                customerId: `${Math.floor(Math.random() * 900000000000) + 100000000000}`,
                roomNumber: Math.floor(Math.random() * 700) + 101,
                roomType: roomType,
                roomTypeName: this.hotel.roomTypes[roomType].name,
                checkInDate: checkIn,
                checkOutDate: checkOut,
                actualCheckOutDate: checkOut > today ? null : checkOut,
                status: checkOut > today ? 'active' : 'completed',
                totalAmount: this.hotel.roomTypes[roomType].price * Math.floor(Math.random() * 10 + 1),
                services: generateRandomServices(),
                paymentMethod: ['cash', 'banking', 'credit'][Math.floor(Math.random() * 3)],
                staffName: ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C'][Math.floor(Math.random() * 3)],
                createdDate: new Date(checkIn.getTime() - Math.floor(Math.random() * 24) * 60 * 60 * 1000)
            });
        }
        
        return bookings;
    },

    // Khởi tạo dữ liệu hóa đơn
    initializeBills: function() {
        const bills = [];
        
        for (let i = 1; i <= 30; i++) {
            const checkIn = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000);
            const checkOut = new Date(checkIn.getTime() + Math.floor(Math.random() * 10 + 1) * 24 * 60 * 60 * 1000);
            const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
            
            const roomType = Object.keys(this.hotel.roomTypes)[Math.floor(Math.random() * Object.keys(this.hotel.roomTypes).length)];
            const roomPrice = this.hotel.roomTypes[roomType].price;
            const roomTotal = roomPrice * days;
            
            const serviceItems = generateRandomServices();
            const serviceTotal = serviceItems.reduce((sum, item) => sum + item.total, 0);
            const totalAmount = roomTotal + serviceTotal;
            
            bills.push({
                id: i,
                billNumber: `HD${1000 + i}`,
                roomNumber: Math.floor(Math.random() * 700) + 101,
                customerName: `Khách hàng ${i}`,
                customerId: `${Math.floor(Math.random() * 900000000000) + 100000000000}`,
                checkInDate: checkIn,
                checkOutDate: checkOut,
                days: days,
                roomType: this.hotel.roomTypes[roomType].name,
                roomPrice: roomPrice,
                roomTotal: roomTotal,
                services: serviceItems,
                serviceTotal: serviceTotal,
                totalAmount: totalAmount,
                paymentMethod: ['cash', 'banking', 'credit'][Math.floor(Math.random() * 3)],
                status: 'paid',
                staffName: ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C'][Math.floor(Math.random() * 3)],
                createdDate: checkOut,
                qrCode: `QR${1000 + i}`
            });
        }
        
        return bills;
    },

    // Khởi tạo dữ liệu QR codes
    initializeQRCodes: function() {
        const qrCodes = [];
        
        for (let i = 1; i <= 20; i++) {
            qrCodes.push({
                id: i,
                billId: i,
                roomNumber: Math.floor(Math.random() * 700) + 101,
                customerName: `Khách hàng ${i}`,
                totalAmount: Math.floor(Math.random() * 10000000) + 500000,
                content: `Thanh toán phòng ${Math.floor(Math.random() * 700) + 101}`,
                createdDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
                staffName: ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C'][Math.floor(Math.random() * 3)],
                status: 'used'
            });
        }
        
        return qrCodes;
    }
};

// Hàm tạo dịch vụ ngẫu nhiên
function generateRandomServices() {
    const services = [
        { id: 1, name: "Phở bò", price: 80000, category: "food", quantity: 1, total: 80000 },
        { id: 2, name: "Bún chả", price: 70000, category: "food", quantity: 2, total: 140000 },
        { id: 3, name: "Cà phê", price: 35000, category: "drink", quantity: 1, total: 35000 },
        { id: 4, name: "Nước cam", price: 45000, category: "drink", quantity: 2, total: 90000 },
        { id: 5, name: "Kem", price: 35000, category: "dessert", quantity: 1, total: 35000 },
        { id: 6, name: "Bánh ngọt", price: 45000, category: "dessert", quantity: 1, total: 45000 }
    ];
    
    const numServices = Math.floor(Math.random() * 3) + 1;
    const selectedServices = [];
    
    for (let i = 0; i < numServices; i++) {
        const service = services[Math.floor(Math.random() * services.length)];
        selectedServices.push({...service});
    }
    
    return selectedServices;
}

// Biến toàn cục
let currentUser = null;
let currentView = 'welcome';
let appData = {
    rooms: [],
    bookings: [],
    bills: [],
    qrCodes: []
};

// Khởi tạo dữ liệu
function initializeApp() {
    appData.rooms = APP_CONFIG.initializeRooms();
    appData.bookings = APP_CONFIG.initializeBookings();
    appData.bills = APP_CONFIG.initializeBills();
    appData.qrCodes = APP_CONFIG.initializeQRCodes();
}

// Hàm tiện ích định dạng
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

// Hàm kiểm tra số điện thoại
function isValidPhone(phone) {
    const phoneRegex = /^(09|03|07|08|05)[0-9]{8}$/;
    return phoneRegex.test(phone);
}

// Hàm kiểm tra CCCD
function isValidCCCD(cccd) {
    const cccdRegex = /^[0-9]{12}$/;
    return cccdRegex.test(cccd);
}
