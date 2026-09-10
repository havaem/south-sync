@AGENTS.md

# Dự án: NotifSync — Đồng bộ thông báo giữa 2 điện thoại Android qua Bluetooth

## Mục tiêu

Xây dựng ứng dụng React Native cho Android, cho phép đồng bộ thông báo (notification) từ một điện thoại (máy A) sang một điện thoại khác (máy B) theo thời gian thực, thông qua kết nối Bluetooth Classic (RFCOMM). Đây vừa là dự án học tập (hiểu native module, Bluetooth, notification listener) vừa hướng tới sử dụng thực tế lâu dài.

Giai đoạn tiếp theo (chưa làm ngay): mở rộng thêm kênh truyền qua LAN/WiFi (WebSocket), dùng chung layer logic với Bluetooth.

## Yêu cầu chức năng

1. **Đọc thông báo hệ thống trên máy A**: bắt được mọi thông báo (tên app nguồn, tiêu đề, nội dung, thời gian) ngay khi phát sinh.
2. **Kết nối Bluetooth Classic (RFCOMM) giữa 2 máy đã pair sẵn thủ công** (không cần tự code UI ghép đôi Bluetooth ở bản đầu).
3. **Gửi thông báo đã bắt được từ máy A sang máy B** dưới dạng JSON qua socket Bluetooth.
4. **Hiển thị lại thông báo trên máy B** dưới dạng notification hệ thống thực (không chỉ hiện trong app).
5. Duy trì kết nối ổn định kể cả khi app chạy nền (dùng Foreground Service).

## Ràng buộc kỹ thuật quan trọng

- **Chỉ nhắm Android trước** (không cần hỗ trợ iOS ở giai đoạn này — iOS không cho phép app đọc thông báo hệ thống của app khác, nên tính năng "đọc & chuyển tiếp" chỉ khả thi trên Android).
- Dùng **React Native CLI** (không dùng Expo managed workflow) vì cần viết native module Kotlin tùy chỉnh.
- **Bluetooth Classic (RFCOMM), không dùng BLE** — vì nội dung thông báo (title + text) tương đối dài, BLE có MTU quá nhỏ, không phù hợp.
- Package JS dùng cho Bluetooth: `react-native-bluetooth-classic`.
- **Không có package RN cộng đồng đáng tin cậy nào đọc được `NotificationListenerService`** → phải tự viết native module Kotlin riêng cho phần này, bridge sang JS qua Native Modules / Event Emitter.
- Thiết kế lớp truyền dữ liệu (transport) tách biệt khỏi lớp logic (bắt & hiển thị thông báo) — dùng interface chung, để sau này thêm kênh WebSocket qua LAN/WiFi chỉ cần viết thêm 1 class mới implement cùng interface, không phải sửa lại toàn bộ app.

## Kiến trúc tổng quan

```
[Máy A]
NotificationListenerService (Kotlin, native module)
        │ emit event
        ▼
JS layer: NotificationBridge.ts
        │ serialize JSON {app, title, text, timestamp}
        ▼
BluetoothService.ts (wrap react-native-bluetooth-classic)
        │ gửi qua RFCOMM socket
        ▼
[Máy B]
BluetoothService.ts nhận dữ liệu
        │ parse JSON
        ▼
Hiển thị lại bằng notification hệ thống (native module hoặc react-native-push-notification)
```

## Cấu trúc thư mục dự kiến

```
NotifSync/
├── android/app/src/main/java/com/notifsync/
│   ├── notification/
│   │   ├── NotificationListenerModule.kt
│   │   └── NotificationListenerPackage.kt
│   └── MainApplication.kt (đăng ký package mới)
├── src/
│   ├── services/
│   │   ├── BluetoothService.ts
│   │   └── NotificationBridge.ts
│   ├── screens/
│   │   ├── PairingScreen.tsx
│   │   └── HomeScreen.tsx
│   └── App.tsx
└── package.json
```

## Quyền Android cần khai báo

```xml
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
<uses-permission android:name="android.permission.BLUETOOTH_SCAN" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_CONNECTED_DEVICE" />

<service
    android:name=".notification.NotificationListenerModule"
    android:label="NotifSync"
    android:permission="android.permission.BIND_NOTIFICATION_LISTENER_SERVICE"
    android:exported="false">
    <intent-filter>
        <action android:name="android.service.notification.NotificationListenerService" />
    </intent-filter>
</service>
```

Lưu ý: quyền truy cập thông báo (Notification Access) không xin được qua runtime permission dialog thông thường — người dùng phải cấp thủ công trong **Cài đặt → Ứng dụng → Truy cập đặc biệt → Truy cập thông báo**. App cần điều hướng người dùng tới màn hình này (dùng Intent `Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS`).

## Thứ tự triển khai đề xuất (làm từng bước, test riêng từng phần)

1. Viết `NotificationListenerModule.kt` — chỉ log thông báo ra Logcat, chưa gửi đi đâu.
2. Bridge sang JS (`NotificationBridge.ts`) — hiển thị danh sách thông báo bắt được ngay trong app (chưa liên quan Bluetooth).
3. Màn hình pairing (`PairingScreen.tsx`) dùng `react-native-bluetooth-classic` — test kết nối 2 máy, gửi thử message "hello world" qua lại.
4. Ghép bước 1+3: khi có thông báo mới → serialize JSON → gửi qua socket Bluetooth đã kết nối.
5. Máy nhận: parse JSON → hiển thị lại thành notification hệ thống thực trên máy B.
6. Bổ sung Foreground Service để giữ kết nối khi app chạy nền.

## Ghi chú test

- Bluetooth Classic không hoạt động ổn định trên emulator Android Studio — bắt buộc test bằng 2 thiết bị Android thật đã pair Bluetooth sẵn qua Cài đặt hệ thống.
