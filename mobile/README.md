# FoodFast Mobile (Expo)

Ứng dụng mobile React Native (Expo) mô phỏng đầy đủ trải nghiệm của website FoodFast giao đồ ăn bằng drone.

## Yêu cầu

- Node.js >= 18
- Expo CLI (`npm install -g expo-cli`) hoặc sử dụng `npx expo`
- Gói `expo-go` trên iOS/Android hoặc thiết bị/simulator để chạy thử

## Cài đặt & chạy

```bash
cd mobile
npm install
npm start
```

Sau khi khởi động, sử dụng ứng dụng Expo Go quét QR (hoặc chạy `npm run android` / `npm run ios` nếu đã cấu hình emulator).

## Tài khoản mẫu

| Vai trò       | Email                      | Mật khẩu    |
|---------------|----------------------------|-------------|
| Khách hàng    | customer@foodfast.io       | 123456      |
| Quản trị      | admin@foodfast.io          | admin       |
| Nhà hàng      | restaurant@foodfast.io     | restaurant  |

Bạn cũng có thể đăng ký tài khoản khách hàng mới ngay trong ứng dụng.

## Tính năng chính

- **Trang khách hàng**: danh sách món ăn, tìm kiếm, lọc theo danh mục/nhà hàng, chi tiết sản phẩm, giỏ hàng, thanh toán, lịch sử đơn hàng và hồ sơ khách hàng.
- **Quản trị**: dashboard tổng quan, quản lý sản phẩm, đơn hàng, người dùng và đội drone.
- **Nhà hàng**: dashboard doanh thu, quản lý menu riêng và đơn hàng thuộc nhà hàng.
- **Xác thực**: đăng nhập/đăng ký, quyền theo vai trò tương tự web app.

## Cấu trúc thư mục

```
mobile/
  App.js                   # Điều hướng & cấu hình tab/stack
  src/
    components/            # Thành phần giao diện tái sử dụng
    context/               # Context quản lý Auth, Cart, Orders
    data/                  # Dữ liệu mock (sản phẩm, đơn hàng, drone...)
    hooks/                 # Hooks tiện ích
    screens/               # Màn hình cho khách hàng, admin, nhà hàng
    styles/                # Theme (màu sắc, spacing)
```

## Lưu ý

- `react-native-reanimated` yêu cầu bật plugin trong `babel.config.js` (đã cấu hình sẵn).
