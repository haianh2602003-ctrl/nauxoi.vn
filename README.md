# Nhật ký công sở

Giao diện tĩnh, responsive cho một không gian ghi nhận trải nghiệm công sở ẩn danh. Thiết kế lấy cảm hứng từ catalogue công nghiệp: nền sáng, đường viền hairline, bề mặt phẳng và không có bo góc.

## Chạy local

```sh
python3 -m http.server 4173
```

Sau đó mở `http://127.0.0.1:4173`.

## Lưu ý

Phiên bản này là MVP phía trình duyệt: nội dung chỉ được giữ trong `localStorage` của người dùng. Khi vận hành thật, cần có API, duyệt nội dung, cơ chế báo cáo/xóa và bảo vệ dữ liệu cá nhân trước khi cho phép đăng công khai.
