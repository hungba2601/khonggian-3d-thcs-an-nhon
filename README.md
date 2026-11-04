# Không gian 3D Trường THCS An Nhơn

Bảo tàng 3D tương tác trực quan tích hợp **Không gian văn hóa Hồ Chí Minh** và **Phòng Truyền thống nhà trường** – Trường THCS An Nhơn, Phường An Nhơn.

---

## 🌟 Tính năng chính

- **Không gian 3D tương tác**: Sử dụng Three.js mô phỏng đại sảnh hai tầng, 6 phòng trưng bày chuyên đề Bác Hồ và Phòng Truyền thống nhà trường.
- **Các phân khu chuyên mục**:
  1. Đại sảnh trung tâm & Lối vào 3D
  2. Không gian văn hóa Hồ Chí Minh (6 phòng chuyên đề):
     - Phòng 1: Tiểu sử Bác Hồ
     - Phòng 2: Tác phẩm của Người
     - Phòng 3: Những câu chuyện kể về Bác
     - Phòng 4: Hình ảnh tư liệu
     - Phòng 5: Video tư liệu
     - Phòng 6: Học tập và làm theo Bác
  3. Phòng Truyền thống nhà trường (Lịch sử hình thành & Biên niên Hiệu trưởng)
- **Hành trình tham quan tự động 360°**: Chế độ tự động quay trọn góc 360 độ ngắm toàn cảnh trước khi di chuyển qua các phòng.
- **Hệ thống đố vui tương tác & Hộ chiếu tham quan**: Tự động cấp giấy chứng nhận có tên học sinh, lớp, ngày tham quan sau khi trả lời các câu hỏi.
- **Thuyết minh & nhạc nền**: Tích hợp danh sách phát nhạc nền và thuyết minh tự động từng phòng.
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

1. Repository: [https://github.com/hungba2601/khonggian-3d-thcs-an-nhon](https://github.com/hungba2601/khonggian-3d-thcs-an-nhon)
2. Lệnh đẩy code lên GitHub:
```bash
git add .
git commit -m "Cap nhat noi dung"
git push origin main
```

---

## 🌐 Hướng dẫn Deploy lên Vercel

Dự án đã được liên kết và tự động triển khai (Auto-deploy) trên Vercel mỗi khi đẩy commit mới lên nhánh `main` của GitHub:
- **Địa chỉ website**: [https://khonggian-3d-thcs-an-nhon.vercel.app/](https://khonggian-3d-thcs-an-nhon.vercel.app/)
