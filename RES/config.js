// Cấu hình tài khoản đăng nhập
const ACCOUNTS = {
    // Nhân viên (staff)
    staff: [
        { username: 'nhanvien1', password: 'nv123456', name: 'Nguyễn Văn A', role: 'staff', department: 'Lễ tân' },
        { username: 'nhanvien2', password: 'nv123456', name: 'Trần Thị B', role: 'staff', department: 'Nhà hàng' },
        { username: 'nhanvien3', password: 'nv123456', name: 'Lê Văn C', role: 'staff', department: 'Buồng phòng' }
    ],
    
    // Quản lý (management)
    management: [
        { username: 'quanly1', password: 'ql123456', name: 'Phạm Quản Lý', role: 'management', department: 'Quản lý' },
        { username: 'quanly2', password: 'ql123456', name: 'Hoàng Giám Đốc', role: 'management', department: 'Giám đốc' },
        { username: 'admin', password: 'admin123', name: 'Administrator', role: 'management', department: 'Quản trị hệ thống' }
    ]
};

// Cấu hình phân quyền
const PERMISSIONS = {
    staff: ['view_orders', 'manage_rooms', 'update_order_status', 'view_dashboard'],
    management: ['view_orders', 'manage_rooms', 'update_order_status', 'view_dashboard', 
                 'view_reports', 'generate_reports', 'export_data', 'manage_staff']
};

// Cấu hình hệ thống
const SYSTEM_CONFIG = {
    hotelName: 'Khách Sạn & Nhà Hàng Cao Cấp Horizon',
    floors: 7,
    roomsPerFloor: 10,
    currency: 'VND',
    timezone: 'Asia/Ho_Chi_Minh',
    autoLogoutMinutes: 30,
    defaultLanguage: 'vi'
};
