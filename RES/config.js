// Cấu hình tài khoản đăng nhập
const ACCOUNTS = {
    // Khách hàng - không cần đăng nhập
    
    // Nhân viên (staff)
    staff: [
        { username: 'nhanvien1', password: 'nv123456', name: 'Nguyễn Văn A', role: 'staff', department: 'Lễ tân', permissions: ['view_orders', 'manage_rooms', 'update_order_status', 'view_dashboard', 'checkin', 'checkout', 'service_requests'] },
        { username: 'nhanvien2', password: 'nv123456', name: 'Trần Thị B', role: 'staff', department: 'Nhà hàng', permissions: ['view_orders', 'update_order_status', 'view_dashboard'] },
        { username: 'nhanvien3', password: 'nv123456', name: 'Lê Văn C', role: 'staff', department: 'Buồng phòng', permissions: ['manage_rooms', 'checkin', 'checkout', 'cleaning'] }
    ],
    
    // Quản lý (management)
    management: [
        { username: 'quanly1', password: 'ql123456', name: 'Phạm Quản Lý', role: 'management', department: 'Quản lý', permissions: ['all'] },
        { username: 'admin', password: 'admin123', name: 'Administrator', role: 'management', department: 'Quản trị hệ thống', permissions: ['all'] }
    ]
};

// Phân quyền chi tiết cho từng chức năng
const PERMISSION_MATRIX = {
    // Khách hàng
    customer: {
        views: ['customer'],
        actions: ['book_room', 'order_food', 'view_menu', 'request_service']
    },
    
    // Nhân viên
    staff: {
        views: ['customer', 'staff'],
        actions: ['view_orders', 'manage_rooms', 'update_order_status', 'view_dashboard', 'checkin', 'checkout', 'service_requests', 'mark_cleaning']
    },
    
    // Quản lý
    management: {
        views: ['customer', 'staff', 'management', 'reports'],
        actions: ['all']
    }
};
