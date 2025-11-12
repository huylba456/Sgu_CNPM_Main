export const initialOrders = [
  {
    id: 'o1',
    customerName: 'Mai Anh',
    customerEmail: 'customer@foodfast.io',
    customerAddress: 'Vinhomes Grand Park',
    deliveryAddress: 'Vinhomes Grand Park',
    paymentMethod: 'Ví FoodFast Pay',
    items: [
      { id: 'p1', name: 'Burger Wagyu Signature', price: 189000, quantity: 1 },
      { id: 'p5', name: 'Tiramisu Espresso', price: 79000, quantity: 2 }
    ],
    total: 347000,
    status: 'shipping',
    droneId: 'DR-01',
    restaurantId: 'r1',
    placedAt: '2024-05-01T10:15:00Z'
  },
  {
    id: 'o2',
    customerName: 'Hữu Phát',
    customerEmail: 'phat@foodfast.io',
    customerAddress: 'Landmark 81',
    deliveryAddress: 'Landmark 81',
    paymentMethod: 'Thẻ tín dụng',
    items: [{ id: 'p2', name: 'Combo Sushi Thượng Hạng', price: 259000, quantity: 1 }],
    total: 259000,
    status: 'delivered',
    droneId: 'DR-02',
    restaurantId: 'r2',
    placedAt: '2024-04-28T18:45:00Z'
  },
  {
    id: 'o3',
    customerName: 'Tú Anh',
    customerEmail: 'tuanh@foodfast.io',
    customerAddress: 'Thủ Thiêm Eco',
    deliveryAddress: 'Thủ Thiêm Eco',
    paymentMethod: 'Chuyển khoản',
    items: [
      { id: 'p4', name: 'Salad Detox Xanh', price: 99000, quantity: 2 },
      { id: 'p6', name: 'Burger Gà Sốt Cay', price: 129000, quantity: 1 }
    ],
    total: 327000,
    status: 'pending',
    droneId: null,
    restaurantId: 'r1',
    placedAt: '2024-05-02T08:30:00Z'
  },
  {
    id: 'o4',
    customerName: 'Bích Ngọc',
    customerEmail: 'ngoc@foodfast.io',
    customerAddress: 'Sala Đại Quang Minh',
    deliveryAddress: 'Sala Đại Quang Minh',
    paymentMethod: 'Ví FoodFast Pay',
    items: [
      { id: 'p8', name: 'Mì Ý Hải Sản', price: 149000, quantity: 1 },
      { id: 'p9', name: 'Trà Hoa Hồng Mật Ong', price: 59000, quantity: 1 }
    ],
    total: 208000,
    status: 'shipping',
    droneId: 'DR-03',
    restaurantId: 'r1',
    placedAt: '2024-05-03T11:10:00Z'
  },
  {
    id: 'o5',
    customerName: 'Mai Anh',
    customerEmail: 'customer@foodfast.io',
    customerAddress: 'Vinhomes Grand Park',
    deliveryAddress: 'Vinhomes Grand Park',
    paymentMethod: 'Ví FoodFast Pay',
    items: [{ id: 'p1', name: 'Burger Wagyu Signature', price: 189000, quantity: 5 }],
    total: 189000,
    status: 'pending',
    droneId: null,
    restaurantId: 'r1',
    placedAt: '2025-06-01T10:15:00Z'
  },
  {
    id: 'o6',
    customerName: 'Mai Anh',
    customerEmail: 'customer@foodfast.io',
    customerAddress: 'Vinhomes Grand Park',
    deliveryAddress: 'Vinhomes Grand Park',
    paymentMethod: 'Ví FoodFast Pay',
    items: [{ id: 'p1', name: 'Burger Wagyu Signature', price: 189000, quantity: 5 }],
    total: 189000,
    status: 'delivered',
    droneId: 'DR-02',
    restaurantId: 'r1',
    placedAt: '2025-06-01T10:15:00Z'
  },
  {
    id: 'o7',
    customerName: 'Mai Anh',
    customerEmail: 'customer@foodfast.io',
    customerAddress: 'Vinhomes Grand Park',
    deliveryAddress: 'Vinhomes Grand Park',
    paymentMethod: 'Ví FoodFast Pay',
    items: [{ id: 'p1', name: 'Burger Wagyu Signature', price: 189000, quantity: 5 }],
    total: 189000,
    status: 'cancelled',
    droneId: null,
    restaurantId: 'r1',
    placedAt: '2025-06-01T10:15:00Z'
  }
];

export const statusLabels = {
  pending: 'Chờ xác nhận',
  preparing: 'Đang chuẩn bị',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Hủy'
};
