// File cấu hình phân quyền cho hệ thống khách sạn
const APP_CONFIG = {
    // Cấu hình hệ thống khách sạn
    hotel: {
        name: "Sunshine Hotel",
        floors: 7,
        roomsPerFloor: 23,
        roomTypes: {
            "STANDARD": { name: "Phòng Tiêu Chuẩn", price: 500000 },
            "DELUXE": { name: "Phòng Deluxe", price: 800000 },
            "SUITE": { name: "Phòng Suite", price: 1200000 },
            "PRESIDENTIAL": { name: "Phòng Tổng Thống", price: 3000000 }
        },
        services: {
            foods: [
                { id: 1, name: "Phở bò", price: 80000, category: "food" },
                { id: 2, name: "Bún chả", price: 70000, category: "food" },
                { id: 3, name: "Cơm gà", price: 75000, category: "food" },
                { id: 4, name: "Bánh mì", price: 30000, category: "food" },
                { id: 5, name: "Pizza", price: 150000, category: "food" }
            ],
            drinks: [
                { id: 6, name: "Cà phê", price: 35000, category: "drink" },
                { id: 7, name: "Nước cam", price: 45000, category: "drink" },
                { id: 8, name: "Trà đào", price: 40000, category: "drink" },
                { id: 9, name: "Sinh tố", price: 60000, category: "drink" },
                { id: 10, name: "Nước suối", price: 15000, category: "drink" }
            ],
            desserts: [
                { id: 11, name: "Kem", price: 35000, category: "dessert" },
                { id: 12, name: "Bánh ngọt", price: 45000, category: "dessert" },
                { id: 13, name: "Trái cây", price: 60000, category: "dessert" },
                { id: 14, name: "Chè", price: 30000, category: "dessert" }
            ]
        }
    },

    // Cấu hình phân quyền
    permissions: {
        // Quyền cho CUSTOMER
        CUSTOMER: {
            canAccess: ['CUSTOMER'],
            features: [
                { id: 'book-room', name: 'Đặt phòng', icon: 'fas fa-bed' },
                { id: 'check-in', name: 'Nhận phòng', icon: 'fas fa-key' },
                { id: 'order-service', name: 'Gọi món', icon: 'fas fa-utensils' },
                { id: 'check-out', name: 'Trả phòng', icon: 'fas fa-door-open' },
                { id: 'my-bookings', name: 'Đặt phòng của tôi', icon: 'fas fa-list' }
            ]
        },
        
        // Quyền cho STAFF
        STAFF: {
            canAccess: ['CUSTOMER', 'STAFF'],
            features: [
                { id: 'room-management', name: 'Quản lý phòng', icon: 'fas fa-door-closed' },
                { id: 'check-in-process', name: 'Check-in khách', icon: 'fas fa-user-check' },
                { id: 'service-orders', name: 'Đơn đặt dịch vụ', icon: 'fas fa-concierge-bell' },
                { id: 'check-out-process', name: 'Check-out & Xuất bill', icon: 'fas fa-file-invoice-dollar' },
                { id: 'qr-generator', name: 'Tạo QR thanh toán', icon: 'fas fa-qrcode' }
            ]
        },
        
        // Quyền cho ADMIN
        ADMIN: {
            canAccess: ['CUSTOMER', 'STAFF', 'ADMIN'],
            features: [
                { id: 'dashboard', name: 'Tổng quan', icon: 'fas fa-tachometer-alt' },
                { id: 'room-management', name: 'Quản lý phòng', icon: 'fas fa-door-closed' },
                { id: 'customer-management', name: 'Quản lý khách hàng', icon: 'fas fa-users' },
                { id: 'staff-management', name: 'Quản lý nhân viên', icon: 'fas fa-user-tie' },
                { id: 'reports', name: 'Báo cáo & Thống kê', icon: 'fas fa-chart-bar' },
                { id: 'service-management', name: 'Quản lý dịch vụ', icon: 'fas fa-concierge-bell' },
                { id: 'revenue-analysis', name: 'Phân tích doanh thu', icon: 'fas fa-money-bill-wave' }
            ]
        }
    },

    // Tài khoản mẫu cho đăng nhập
    sampleAccounts: [
        { username: 'admin', password: 'admin123', role: 'ADMIN', name: 'ĐINH TẤN HUY' },
        { username: 'staff', password: 'staff123', role: 'STAFF', name: 'Trần Thị Nhân Viên' },
        { username: 'customer', password: 'password123', role: 'CUSTOMER', name: 'Lê Văn Khách' }
    ],

    // Hàm kiểm tra đăng nhập
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

    // Hàm kiểm tra quyền truy cập
    checkAccess: function(currentRole, targetRole) {
        if (!currentRole || !this.permissions[currentRole]) return false;
        return this.permissions[currentRole].canAccess.includes(targetRole);
    },

    // Hàm lấy menu theo vai trò
    getMenuForRole: function(role) {
        return this.permissions[role] ? this.permissions[role].features : [];
    },

    // Hàm khởi tạo dữ liệu phòng
    initializeRooms: function() {
        const rooms = [];
        const roomTypes = Object.keys(this.hotel.roomTypes);
        
        for (let floor = 1; floor <= this.hotel.floors; floor++) {
            for (let roomNum = 1; roomNum <= this.hotel.roomsPerFloor; roomNum++) {
                const roomNumber = floor * 100 + roomNum;
                const roomType = roomTypes[Math.floor(Math.random() * roomTypes.length)];
                
                // Tạo trạng thái ngẫu nhiên cho phòng
                const statuses = ['available', 'occupied', 'reserved'];
                const status = statuses[Math.floor(Math.random() * statuses.length)];
                
                rooms.push({
                    id: `${floor}-${roomNum}`,
                    number: roomNumber,
                    floor: floor,
                    type: roomType,
                    typeName: this.hotel.roomTypes[roomType].name,
                    price: this.hotel.roomTypes[roomType].price,
                    status: status,
                    customer: status === 'available' ? null : `Khách ${Math.floor(Math.random() * 1000)}`,
                    checkInDate: status === 'available' ? null : new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000),
                    checkOutDate: status === 'available' ? null : new Date(Date.now() + Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000)
                });
            }
        }
        
        return rooms;
    },

    // Hàm khởi tạo dữ liệu đặt phòng
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
                customerPhone: `090${Math.floor(1000000 + Math.random() * 9000000)}`,
                customerEmail: `customer${i}@example.com`,
                roomNumber: Math.floor(Math.random() * 700) + 101,
                roomType: roomType,
                checkInDate: checkIn,
                checkOutDate: checkOut,
                status: checkOut > today ? 'active' : 'completed',
                totalAmount: this.hotel.roomTypes[roomType].price * Math.floor(Math.random() * 10 + 1),
                services: []
            });
        }
        
        return bookings;
    },

    // Hàm khởi tạo dữ liệu nhân viên
    initializeStaff: function() {
        return [
            { id: 1, name: "Nguyễn Văn A", position: "Lễ tân", phone: "0901111111", email: "a@hotel.com", joinDate: "2020-01-15" },
            { id: 2, name: "Trần Thị B", position: "Quản lý", phone: "0902222222", email: "b@hotel.com", joinDate: "2019-05-20" },
            { id: 3, name: "Lê Văn C", position: "Nhân viên phục vụ", phone: "0903333333", email: "c@hotel.com", joinDate: "2021-03-10" },
            { id: 4, name: "Phạm Thị D", position: "Kế toán", phone: "0904444444", email: "d@hotel.com", joinDate: "2020-11-05" },
            { id: 5, name: "Hoàng Văn E", position: "Bảo vệ", phone: "0905555555", email: "e@hotel.com", joinDate: "2022-01-30" }
        ];
    }
};
