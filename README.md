# Tải Video Douyin 🎬

Extension Chrome giúp bạn tải toàn bộ video từ trang cá nhân Douyin một cách dễ dàng, nhanh chóng.

---

## ✨ Tính năng

- Tự động quét và lấy toàn bộ video từ trang cá nhân Douyin
- Hiển thị danh sách video kèm ảnh thumbnail và mô tả
- Tải từng video riêng lẻ hoặc tải tất cả cùng lúc
- Thanh tiến trình theo dõi quá trình quét video
- Giao diện thanh bên (sidebar) tiện lợi, không che khuất nội dung trang
- Hỗ trợ ủng hộ tác giả qua mã QR VietQR

---

## 🚀 Cài đặt

> Extension chưa có trên Chrome Web Store, cần cài thủ công (Developer Mode).

1. Tải hoặc clone repository này về máy
2. Mở Chrome, truy cập `chrome://extensions/`
3. Bật **Developer mode** (góc trên bên phải)
4. Nhấn **Load unpacked** và chọn thư mục chứa extension
5. Icon extension sẽ xuất hiện trên thanh công cụ Chrome

---

## 📖 Hướng dẫn sử dụng

1. Truy cập trang cá nhân của người dùng Douyin, ví dụ:  
   `https://www.douyin.com/user/<user_id>`
2. Nhấn vào icon extension trên thanh công cụ để mở thanh bên
3. Nhấn **▶ Bắt đầu** để bắt đầu quét video
4. Chờ extension tự động cuộn và thu thập toàn bộ video
5. Sau khi hoàn tất, nhấn **⬇ Tải xuống** trên từng video, hoặc nhấn **Tải tất cả** để tải toàn bộ

---

## 🗂️ Cấu trúc dự án

```
├── manifest.json       # Cấu hình extension (Manifest V3)
├── background.js       # Service worker, xử lý sự kiện và relay tin nhắn
├── content.js          # Content script (placeholder)
├── extractor.js        # Script thu thập video, inject vào tab Douyin
├── sidebar.html        # Giao diện thanh bên
├── sidebar.js          # Logic giao diện thanh bên
├── icons/              # Icon extension (16x16, 48x48, 128x128)
└── generate-icons.html # Công cụ tạo icon
```

---

## ⚙️ Cách hoạt động

1. Khi nhấn **Bắt đầu**, extension inject `extractor.js` vào tab Douyin đang mở
2. `extractor.js` gọi API nội bộ của Douyin (`/aweme/v1/web/aweme/post/`) để lấy danh sách video theo từng trang
3. Dữ liệu video (URL, thumbnail, mô tả) được gửi về sidebar qua `chrome.runtime.sendMessage`
4. Sidebar hiển thị danh sách và cho phép tải xuống từng video hoặc tất cả

---

## ⚠️ Lưu ý

- Chỉ hoạt động trên trang cá nhân Douyin (`douyin.com/user/...`)
- Cần đăng nhập Douyin trên trình duyệt để API hoạt động bình thường
- Tốc độ quét phụ thuộc vào số lượng video và tốc độ mạng
- Extension sử dụng API không chính thức, có thể bị ảnh hưởng nếu Douyin thay đổi cấu trúc API

---

## 🛠️ Yêu cầu

- Trình duyệt Chrome (hoặc Chromium-based: Edge, Brave, ...)
- Manifest V3 — Chrome 88 trở lên

---

## ☕ Ủng hộ tác giả

Nếu extension hữu ích, bạn có thể ủng hộ tác giả qua chức năng **Ủng hộ tác giả** ngay trong giao diện extension (quét mã QR VietQR).

---

## 📄 Giấy phép

MIT License
