# FDD — Functional Decomposition Diagram
## Hệ thống FoodFast Drone Delivery

> **Nguyên tắc:** Mỗi chức năng con = 1 hành động người dùng phân biệt được. Chi tiết implementation ghi inline, không tách sub riêng.

---

## Mức ưu tiên tổng quan

| Mức | Nhóm chức năng | Lý do |
|---|---|---|
| P1 — CRITICAL | 1. Xác thực · 2. Sản phẩm · 3. Giỏ hàng · 4. Đặt hàng | Luồng chính đăng nhập → xem món → thêm giỏ → đặt hàng |
| P2 — HIGH | 5. Quản lý đơn hàng · 6. Drone | Xử lý đơn sau khi đặt & vận chuyển |
| P3 — MEDIUM | 7. Nhà hàng · 8. Người dùng | Quản trị backend |
| P4 — LOW | 9. Hồ sơ cá nhân · 10. Dashboard | Nâng cao trải nghiệm & phân tích |

---

## P1 — CRITICAL

### 1. Quản lý Xác thực (Authentication)

```
1. Xác thực
├── 1.1 Đăng ký — nhập thông tin, validate email/mật khẩu, tạo tài khoản (role = customer)
├── 1.2 Đăng nhập — xác thực email/mật khẩu, kiểm tra trạng thái active, điều hướng theo role
└── 1.3 Đăng xuất — xóa session & giỏ hàng
```

> **Ràng buộc:** Khách chưa đăng nhập chỉ được xem sản phẩm, chặn giỏ hàng & đặt hàng.

| Chức năng | Vai trò | Màn hình |
|---|---|---|
| 1.1 Đăng ký | Guest | LoginScreen |
| 1.2 Đăng nhập | All | LoginScreen |
| 1.3 Đăng xuất | Authenticated | ProfileScreen |

---

### 2. Quản lý Sản phẩm (Product Management)

```
2. Sản phẩm
├── 2.1 Hiển thị sản phẩm — danh sách, chi tiết, sản phẩm liên quan, top đánh giá
├── 2.2 Tìm kiếm & Lọc — theo tên/nhà hàng/danh mục, sắp xếp (giá/đánh giá/giao nhanh)
├── 2.3 CRUD sản phẩm (Restaurant) — thêm/sửa/xóa sản phẩm của nhà hàng mình
└── 2.4 CRUD sản phẩm (Admin) — thêm/sửa/xóa toàn hệ thống, lọc & sắp xếp
```

| Chức năng | Vai trò | Màn hình |
|---|---|---|
| 2.1 Hiển thị | Guest, Customer | HomeScreen, ProductsScreen, ProductDetailScreen |
| 2.2 Tìm kiếm & Lọc | Guest, Customer | ProductsScreen |
| 2.3 CRUD (Restaurant) | Restaurant | RestaurantProductsScreen |
| 2.4 CRUD (Admin) | Admin | AdminProductsScreen |

---

### 3. Quản lý Giỏ hàng (Cart Management)

```
3. Giỏ hàng
├── 3.1 Thêm vào giỏ — thêm sản phẩm, ràng buộc đơn nhà hàng (single-restaurant)
├── 3.2 Cập nhật giỏ — tăng/giảm số lượng, xóa từng sản phẩm
└── 3.3 Xóa toàn bộ giỏ — khi checkout hoặc logout
```

| Chức năng | Vai trò | Màn hình |
|---|---|---|
| 3.1 Thêm | Customer | ProductCard, ProductDetailScreen |
| 3.2 Cập nhật | Customer | CartScreen |
| 3.3 Xóa toàn bộ | Customer | CartScreen |

---

### 4. Đặt hàng & Thanh toán (Checkout)

```
4. Đặt hàng
├── 4.1 Xử lý thanh toán — thông tin giao hàng (pre-fill từ profile), ghi chú,
│                          chọn phương thức (FoodFast Pay / Thẻ / Chuyển khoản), tóm tắt & tổng tiền
└── 4.2 Tạo đơn hàng — validate thông tin, lưu Firestore (status = pending), xóa giỏ hàng
```

| Chức năng | Vai trò | Màn hình |
|---|---|---|
| 4.1–4.2 | Customer | CheckoutScreen |

---

## P2 — HIGH

### 5. Quản lý Đơn hàng (Order Management)

```
5. Đơn hàng
├── 5.1 Xem & hủy đơn (Customer) — danh sách, chi tiết, thống kê, hủy đơn pending
├── 5.2 Quản lý đơn (Restaurant) — xem đơn nhà hàng, cập nhật trạng thái, thêm ghi chú
├── 5.3 Quản lý đơn (Admin) — xem tất cả, cập nhật trạng thái toàn luồng, thêm ghi chú
└── 5.4 Theo dõi giao hàng — bản đồ tĩnh OpenStreetMap, đếm ngược 20s, xác nhận nhận hàng
```

> **Quy tắc trạng thái:** pending → preparing → shipping → delivered (một chiều). Có thể hủy (cancelled) khi pending hoặc preparing.

| Chức năng | Vai trò | Màn hình |
|---|---|---|
| 5.1 Xem & hủy | Customer | OrdersScreen, OrderDetailScreen |
| 5.2 Quản lý (Restaurant) | Restaurant | RestaurantOrdersScreen |
| 5.3 Quản lý (Admin) | Admin | AdminOrdersScreen, OrderDetailScreen |
| 5.4 Theo dõi | Customer | OrderDetailScreen |

---

### 6. Quản lý Drone (Drone Management)

```
6. Drone
├── 6.1 CRUD Drone (Admin) — thêm/sửa/xóa (mã, trạng thái, pin, số giao)
├── 6.2 Phân bổ tự động — chọn ngẫu nhiên drone khả dụng khi shipping, kiểm tra xung đột
└── 6.3 Tìm kiếm & Lọc — theo mã/trạng thái, sắp xếp theo pin/số giao
```

| Chức năng | Vai trò | Màn hình |
|---|---|---|
| 6.1 CRUD | Admin | AdminDronesScreen |
| 6.2 Phân bổ tự động | Hệ thống | OrdersContext |
| 6.3 Tìm kiếm & Lọc | Admin | AdminDronesScreen |

> Trạng thái drone: Hoạt động · Đang bảo trì · Đang sạc · Không khả dụng

---

## P3 — MEDIUM

### 7. Quản lý Nhà hàng (Restaurant Management — Admin)

```
7. Nhà hàng
├── 7.1 Thêm nhà hàng — tên, địa chỉ, liên hệ, drone pad, ảnh
├── 7.2 Xóa nhà hàng — chặn nếu còn đơn/sản phẩm liên quan
├── 7.3 Xem danh sách — kèm thống kê doanh thu, số đơn
└── 7.4 Chi tiết nhà hàng — thông tin, doanh thu, biểu đồ 6 tháng, đơn gần đây
```

| Chức năng | Vai trò | Màn hình |
|---|---|---|
| 7.1–7.3 | Admin | AdminRestaurantsScreen, AdminUsersScreen |
| 7.4 Chi tiết | Admin | AdminRestaurantDetailScreen |

---

### 8. Quản lý Người dùng (User Management — Admin)

```
8. Người dùng
├── 8.1 CRUD tài khoản — thêm/sửa/khóa/mở khóa (customer/restaurant/admin)
├── 8.2 Gán nhà hàng — chọn nhà hàng hiện có hoặc tạo mới khi gán role restaurant
├── 8.3 Tìm kiếm & Lọc — theo vai trò/tên/email/SĐT, sắp xếp
└── 8.4 Auto-logout khi bị khóa — real-time qua Firestore listener
```

| Chức năng | Vai trò | Màn hình |
|---|---|---|
| 8.1–8.3 | Admin | AdminUsersScreen |
| 8.4 Auto-logout | Hệ thống | AuthContext |

---

## P4 — LOW

### 9. Hồ sơ cá nhân (Profile Management)

```
9. Hồ sơ
├── 9.1 Customer — xem/sửa thông tin (tên, SĐT, địa chỉ), thống kê thanh toán
├── 9.2 Restaurant — xem thông tin tài khoản & nhà hàng, lịch sử đơn
└── 9.3 Admin — xem thông tin, tổng quan hệ thống (đơn/user/drone/nhà hàng)
```

| Chức năng | Vai trò | Màn hình |
|---|---|---|
| 9.1–9.3 | Theo role | ProfileScreen |

---

### 10. Dashboard & Thống kê (Analytics)

```
10. Dashboard
├── 10.1 Admin Dashboard — KPI doanh thu/đơn/khách hàng (MoM%), biểu đồ 6 tháng,
│                          top sản phẩm, trạng thái drone, thống kê user theo role
└── 10.2 Restaurant Dashboard — doanh thu tháng, đơn đang xử lý, khách mới 30 ngày,
                                đơn gần đây (Admin có thể xem dashboard từng nhà hàng)
```

| Chức năng | Vai trò | Màn hình |
|---|---|---|
| 10.1 Admin Dashboard | Admin | AdminDashboardScreen |
| 10.2 Restaurant Dashboard | Restaurant, Admin | RestaurantDashboardScreen |

---

## Thống kê tổng hợp

| # | Nhóm chức năng | Số CN | Vai trò | Mức ưu tiên |
|---|---|---|---|---|
| 1 | Xác thực | 3 | All | P1 — CRITICAL |
| 2 | Sản phẩm | 4 | Guest, Customer, Restaurant, Admin | P1 — CRITICAL |
| 3 | Giỏ hàng | 3 | Customer | P1 — CRITICAL |
| 4 | Đặt hàng | 2 | Customer | P1 — CRITICAL |
| 5 | Đơn hàng | 4 | Customer, Restaurant, Admin | P2 — HIGH |
| 6 | Drone | 3 | Admin, Hệ thống | P2 — HIGH |
| 7 | Nhà hàng | 4 | Admin | P3 — MEDIUM |
| 8 | Người dùng | 4 | Admin | P3 — MEDIUM |
| 9 | Hồ sơ | 3 | Customer, Restaurant, Admin | P4 — LOW |
| 10 | Dashboard | 2 | Admin, Restaurant | P4 — LOW |
| | **Tổng cộng** | **32** | | |

---

## Ma trận vai trò — chức năng

| Chức năng | Guest | Customer | Restaurant | Admin |
|---|---|---|---|---|
| Duyệt sản phẩm | ✔ | ✔ | ✔ | ✔ |
| Đăng ký tài khoản | ✔ | | | |
| Đăng nhập | | ✔ | ✔ | ✔ |
| Giỏ hàng & Đặt hàng | ✗ | ✔ | ✗ | ✗ |
| Xem đơn hàng | ✗ | ✔ (của mình) | ✔ (nhà hàng) | ✔ (tất cả) |
| Hủy đơn pending | ✗ | ✔ | ✗ | ✗ |
| Xác nhận nhận hàng | ✗ | ✔ (sau countdown) | ✗ | ✗ |
| Cập nhật trạng thái đơn | ✗ | ✗ | ✔ (pending→shipping) | ✔ (toàn bộ) |
| CRUD sản phẩm | ✗ | ✗ | ✔ (của mình) | ✔ (tất cả) |
| Quản lý drone | ✗ | ✗ | ✗ | ✔ |
| Quản lý người dùng | ✗ | ✗ | ✗ | ✔ |
| Quản lý nhà hàng | ✗ | ✗ | ✗ | ✔ |
| Chỉnh sửa hồ sơ | ✗ | ✔ | ✗ (chỉ xem) | ✗ (chỉ xem) |
| Dashboard & Thống kê | ✗ | ✗ | ✔ (nhà hàng) | ✔ (hệ thống) |

> **✔** = Có quyền · **✗** = Không có quyền
