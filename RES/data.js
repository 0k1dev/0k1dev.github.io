  // data.js - Dữ liệu mẫu
const appData = {
    rooms: [
        { number: 101, floor: 1, type: 'standard', typeName: 'Phòng Tiêu Chuẩn', price: 500000, status: 'available' },
        { number: 102, floor: 1, type: 'standard', typeName: 'Phòng Tiêu Chuẩn', price: 500000, status: 'occupied', customerName: 'Nguyễn Văn A', customerPhone: '0912345678', customerId: '012345678901', checkInDate: '2024-01-15', checkOutDate: '2024-01-20', services: [] },
        { number: 103, floor: 1, type: 'deluxe', typeName: 'Phòng Deluxe', price: 800000, status: 'reserved', staffPhone: '0909123456' },
        // ... thêm các phòng khác
    ],
    
    bookings: [
        // Dữ liệu mẫu booking
    ],
    
    bills: [
        // Dữ liệu mẫu hóa đơn
    ],
    
    qrCodes: [
        // Dữ liệu mẫu QR code
    ]
};
