# Không gian văn hóa Hồ Chí Minh 3D – Trường THCS An Nhơn - Phường An Nhơn

Bảo tàng 3D tương tác trực quan giới thiệu về cuộc đời, sự nghiệp, tư tưởng, đạo đức và phong cách của Chủ tịch Hồ Chí Minh.

---

## 🌟 Tính năng chính

- **Không gian 3D tương tác**: Sử dụng Three.js mô phỏng đại sảnh hai tầng và 6 phòng trưng bày chuyên đề.
- **6 phòng chuyên mục**:
  1. Tiểu sử Bác Hồ
  2. Tác phẩm của Người
  3. Những câu chuyện kể về Bác
  4. Hình ảnh tư liệu
  5. Video tư liệu
  6. Học tập và làm theo Bác
- **Hệ thống đố vui tương tác & Hộ chiếu tham quan**: Tự động cấp giấy chứng nhận có tên học sinh, lớp, ngày tham quan sau khi trả lời các câu hỏi.
- **Thuyết minh & nhạc nền**: Tích hợp giọng thuyết minh từng phòng và nhạc nền.
- **Kết nối dữ liệu động**: Đồng bộ dữ liệu hiện vật và câu hỏi từ Google Apps Script.

---

## 🚀 Cách chạy trên máy cục bộ (Local)

### Cách 1: Mở trực tiếp
Nhấp đúp chuột vào tệp `index.html` để mở trong trình duyệt Chrome, Edge, Cốc Cốc, Safari hoặc Firefox.

### Cách 2: Chạy qua máy chủ tĩnh (Khuyên dùng)
```bash
npm start
# hoặc
npx serve .
```

---

## 📤 Hướng dẫn đưa lên GitHub

1. Tạo một repository mới trên [GitHub](https://github.com/new) (ví dụ: `bao-tang-3d-thcs-an-nhon`).
2. Mở terminal tại thư mục này và chạy các lệnh:
```bash
git remote add origin https://github.com/<tai-khoan-cua-ban>/<ten-repo>.git
git branch -M main
git push -u origin main
```

---

## 🌐 Hướng dẫn Deploy lên Vercel

### Cách 1: Kết nối trực tiếp qua GitHub (Khuyên dùng)
1. Đăng nhập [Vercel](https://vercel.com).
2. Chọn **Add New...** -> **Project**.
3. Chọn repository GitHub vừa tạo ở trên và bấm **Import**.
4. Giữ nguyên cấu hình mặc định (Framework Preset: *Other*, Root Directory: `./`).
5. Bấm **Deploy**. Sau khoảng 10-20 giây, website sẽ hoạt động với tên miền miễn phí dạng `ten-du-an.vercel.app`.

### Cách 2: Deploy bằng dòng lệnh (CLI)
```bash
npx vercel
```
Làm theo các bước hướng dẫn trên màn hình đăng nhập và xác nhận để deploy ngay lập tức.

