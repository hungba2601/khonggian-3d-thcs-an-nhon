// ====================================================================
// BACKEND GOOGLE APPS SCRIPT CHO BẢO TÀNG 3D - THCS AN NHƠN
// 1. GHI NHẬN & ĐẾM SỐ LƯỢT TRUY CẬP VÀO Ô B3 SHEET "CauHinh"
// 2. NHẬN & LƯU ẢNH ĐÓNG GÓP TƯ LIỆU VÀO GOOGLE DRIVE VÀ SHEET "piture"
// 3. ĐỌC DỮ LIỆU HIỆN VẬT & CÂU HỎI
// ====================================================================

var SHEET_CAU_HINH = "CauHinh";
var SHEET_NHAT_KY = "NhatKyThamQuan";
var SHEET_HIEN_VAT = "HienVat";
var SHEET_CAU_HOI = "CauHoi";
var SHEET_PICTURE = "piture"; // Tên sheet đóng góp ảnh theo đúng yêu cầu

// Tên thư mục trên Google Drive để chứa ảnh khách tham quan đóng góp
var FOLDER_NAME = "TU_LIEU_DONG_GOP_THCS_AN_NHON";

// Nếu bạn muốn lưu vào 1 thư mục cụ thể đã có sẵn trên Google Drive,
// hãy dán ID thư mục vào đây (ví dụ: "1AbCdEfGhIjKlMnOpQrStUvWxYz").
// Nếu để trống "", hệ thống sẽ tự động tìm hoặc tạo thư mục FOLDER_NAME trên Google Drive của bạn.
var FOLDER_ID = "";

/**
 * Xử lý yêu cầu HTTP GET từ website Bảo tàng 3D
 */
function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var thamSo = e && e.parameter ? e.parameter : {};
  var api = thamSo.api || "xem";

  // 1. API ĐẾM VÀ TĂNG SỐ LƯỢT (GHI VÀO Ô B3 CỦA SHEET CauHinh)
  // Chỉ tăng khi mở web lần đầu với ?api=luot (không tăng khi đi vào từng phòng)
  if (api === "luot") {
    return tangVaGhiLuotTruyCap(ss);
  }

  // 2. API CHỈ XEM SỐ LƯỢT (KHÔNG TĂNG)
  if (api === "xem") {
    return xemSoLuotHienTai(ss);
  }

  // 3. API LẤY DỮ LIỆU HIỆN VẬT & CÂU HỎI
  if (api === "hienvat") {
    return layDuLieuHienVat(ss);
  }

  // 4. API TỰ KHỞI TẠO SHEET "piture" VÀ THƯ MỤC DRIVE ĐỂ KIỂM TRA
  if (api === "khoitao" || api === "init") {
    return khoiTaoSheetPiture(ss);
  }

  // Mặc định: chỉ xem, không tăng
  return xemSoLuotHienTai(ss);
}

/**
 * Xử lý yêu cầu HTTP POST từ website Bảo tàng 3D (Đóng góp hình ảnh tư liệu)
 */
function doPost(e) {
  try {
    var data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (errJson) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    var api = data.api || (e && e.parameter ? e.parameter.api : "") || "";

    // API ĐÓNG GÓP HÌNH ẢNH: LƯU VÀO GOOGLE DRIVE & GHI VÀO SHEET "piture"
    if (api === "donggop" || data.base64) {
      return xuLyDongGopHinhAnh(data);
    }

    // Nếu không phải đóng góp thì xử lý như doGet
    return doGet(e);
  } catch (err) {
    return taoPhanHoiJson({
      success: false,
      error: "Lỗi máy chủ khi xử lý POST: " + err.toString()
    });
  }
}

/**
 * Nhận ảnh từ website, lưu vào Google Drive và ghi thông tin vào sheet "piture"
 */
function xuLyDongGopHinhAnh(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Kiểm tra hoặc tự tạo sheet "piture" nếu chưa có
  var sheet = ss.getSheetByName(SHEET_PICTURE);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_PICTURE);
    sheet.appendRow(["Thời gian", "Họ và tên", "Link ảnh (Google Drive)", "Nội dung ảnh", "Tên tệp gốc"]);
    var headerRange = sheet.getRange(1, 1, 1, 5);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#173a7a");
    headerRange.setFontColor("#ffffff");
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 160); // Thời gian
    sheet.setColumnWidth(2, 200); // Họ và tên
    sheet.setColumnWidth(3, 350); // Link ảnh trong thư mục Driver
    sheet.setColumnWidth(4, 400); // Nội dung ảnh
    sheet.setColumnWidth(5, 180); // Tên tệp gốc
  }

  // 2. Lấy hoặc tạo thư mục trên Google Drive
  var folder;
  if (FOLDER_ID && FOLDER_ID.trim() !== "") {
    try {
      folder = DriveApp.getFolderById(FOLDER_ID.trim());
    } catch (eFolder) {
      console.warn("Không tìm thấy FOLDER_ID, chuyển sang dùng FOLDER_NAME: " + eFolder.message);
      folder = layHoacTaoThuMuc(FOLDER_NAME);
    }
  } else {
    folder = layHoacTaoThuMuc(FOLDER_NAME);
  }

  // 3. Chuẩn bị thông tin người đóng góp và ảnh
  var hoTen = (data.hoTen || "Khách tham quan").toString().trim();
  var noiDung = (data.noiDung || "").toString().trim();
  var tenTep = (data.tenTep || "anh_dong_gop.jpg").toString().trim();
  var now = new Date();
  var thoiGianChu = Utilities.formatDate(now, "GMT+7", "dd/MM/yyyy HH:mm:ss");
  var prefix = Utilities.formatDate(now, "GMT+7", "yyyyMMdd_HHmmss");

  var fileUrl = "";
  var fileId = "";

  // 4. Giải mã base64 và lưu tệp vào Google Drive
  if (data.base64) {
    var rawBase64 = String(data.base64);
    var commaPos = rawBase64.indexOf(",");
    if (commaPos >= 0) {
      rawBase64 = rawBase64.substring(commaPos + 1);
    }

    var bytes = Utilities.base64Decode(rawBase64);
    var mimeType = data.mimeType || "image/jpeg";
    var tenFileDrive = prefix + "_" + tenTep.replace(/[^a-zA-Z0-9._-]/g, "_");
    var blob = Utilities.newBlob(bytes, mimeType, tenFileDrive);
    var file = folder.createFile(blob);

    // Cấp quyền xem cho bất kỳ ai có link để mở xem ảnh trực tiếp từ link trong sheet
    try {
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (eShare) {
      console.warn("Lỗi phân quyền Drive: " + eShare.message);
    }

    fileUrl = file.getUrl();
    fileId = file.getId();
  } else {
    return taoPhanHoiJson({
      success: false,
      error: "Không nhận được dữ liệu hình ảnh (base64 rỗng)."
    });
  }

  // 5. Ghi dòng dữ liệu mới vào sheet "piture"
  // [Thời gian, Họ và tên, Link ảnh (Google Drive), Nội dung ảnh, Tên tệp gốc]
  sheet.appendRow([
    thoiGianChu,
    hoTen,
    fileUrl,
    noiDung,
    tenTep
  ]);

  return taoPhanHoiJson({
    success: true,
    message: "Đóng góp tư liệu hình ảnh thành công!",
    fileUrl: fileUrl,
    fileId: fileId,
    thoiGian: thoiGianChu,
    hoTen: hoTen,
    noiDung: noiDung
  });
}

/**
 * Tìm hoặc tạo thư mục Google Drive theo tên
 */
function layHoacTaoThuMuc(tenThuMuc) {
  var folders = DriveApp.getFoldersByName(tenThuMuc);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(tenThuMuc);
}

/**
 * Hàm khởi tạo sẵn sheet "piture" và thư mục Drive (có thể bấm Chạy trực tiếp trên Apps Script nếu muốn)
 */
function khoiTaoSheetPiture(ss) {
  if (!ss) ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_PICTURE);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_PICTURE);
    sheet.appendRow(["Thời gian", "Họ và tên", "Link ảnh (Google Drive)", "Nội dung ảnh", "Tên tệp gốc"]);
    var headerRange = sheet.getRange(1, 1, 1, 5);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#173a7a");
    headerRange.setFontColor("#ffffff");
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 160);
    sheet.setColumnWidth(2, 200);
    sheet.setColumnWidth(3, 350);
    sheet.setColumnWidth(4, 400);
    sheet.setColumnWidth(5, 180);
  }
  var folder = layHoacTaoThuMuc(FOLDER_NAME);
  return taoPhanHoiJson({
    success: true,
    message: "Đã sẵn sàng sheet " + SHEET_PICTURE + " và thư mục Drive " + FOLDER_NAME,
    folderId: folder.getId()
  });
}

/**
 * Đọc ô B3 của sheet CauHinh, tăng lên 1, lưu lại vào B3 và trả về JSON
 */
function tangVaGhiLuotTruyCap(ss) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000); // Tránh xung đột khi nhiều người cùng vào web
  } catch (err) {
    return xemSoLuotHienTai(ss);
  }

  try {
    var sheetConfig = ss.getSheetByName(SHEET_CAU_HINH);
    if (!sheetConfig) {
      sheetConfig = ss.insertSheet(SHEET_CAU_HINH);
      sheetConfig.appendRow(["Mục cấu hình", "Giá trị"]);
      sheetConfig.appendRow(["TenTruong", "Trường THCS An Nhơn - Phường An Nhơn"]);
      sheetConfig.appendRow(["TongLuot", 0]);
    }

    // ĐỌC TRỰC TIẾP Ô B3
    var oB3 = sheetConfig.getRange("B3");
    var giaTriCu = Number(oB3.getValue());
    var tongLuot = (isNaN(giaTriCu) || giaTriCu < 0) ? 1 : Math.floor(giaTriCu) + 1;

    // GHI SỐ MỚI VÀO Ô B3
    oB3.setValue(tongLuot);

    // Ghi nhật ký vào sheet NhatKyThamQuan (nếu có)
    try {
      var sheetLog = ss.getSheetByName(SHEET_NHAT_KY);
      if (sheetLog) {
        var now = new Date();
        sheetLog.appendRow([
          now,
          Utilities.formatDate(now, "GMT+7", "yyyy-MM-dd HH:mm:ss"),
          tongLuot
        ]);
      }
    } catch (eLog) {
      console.warn("Lỗi ghi log: " + eLog.message);
    }

    return taoPhanHoiJson({ luot: tongLuot });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Chỉ đọc ô B3 và trả về số lượt hiện tại mà không tăng
 */
function xemSoLuotHienTai(ss) {
  try {
    var sheetConfig = ss.getSheetByName(SHEET_CAU_HINH);
    if (sheetConfig) {
      var so = Number(sheetConfig.getRange("B3").getValue()) || 0;
      return taoPhanHoiJson({ luot: so });
    }
  } catch (e) {}
  return taoPhanHoiJson({ luot: 1 });
}

/**
 * Lấy danh sách hiện vật, câu hỏi, thông tin trường
 */
function layDuLieuHienVat(ss) {
  var sheetConfig = ss.getSheetByName(SHEET_CAU_HINH);
  var tenTruong = "Trường THCS An Nhơn - Phường An Nhơn";
  var soLuot = 0;

  if (sheetConfig) {
    try {
      var t = sheetConfig.getRange("B2").getValue();
      if (t) tenTruong = String(t);
      soLuot = Number(sheetConfig.getRange("B3").getValue()) || 0;
    } catch (e) {}
  }

  var danhSachPhong = [
    { ma: "P1", ten: "Tiểu sử Bác Hồ" },
    { ma: "P2", ten: "Tác phẩm của Người" },
    { ma: "P3", ten: "Những câu chuyện kể về Bác" },
    { ma: "P4", ten: "Hình ảnh tư liệu" },
    { ma: "P5", ten: "Video" },
    { ma: "P6", ten: "Học tập và làm theo Bác" },
    { ma: "P7", ten: "Phòng Truyền thống trường" },
    { ma: "P8", ten: "Phòng chuyện kể Bác Hồ" },
    { ma: "P9", ten: "Phòng các hoạt động trường" }
  ];

  return taoPhanHoiJson({
    truong: tenTruong,
    luot: soLuot,
    capNhat: new Date().toISOString(),
    phong: danhSachPhong,
    hienVat: docDanhSachHienVat(ss),
    cauHoi: docDanhSachCauHoi(ss)
  });
}

function docDanhSachHienVat(ss) {
  var sheet = ss.getSheetByName(SHEET_HIEN_VAT);
  if (!sheet) return [];
  var rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];

  var result = [];
  for (var i = 1; i < rows.length; i++) {
    var r = rows[i];
    if (!r[0] && !r[3]) continue;
    result.push({
      id: String(r[0] || ("HV" + i)),
      phong: String(r[1] || "P4"),
      loai: String(r[2] || "Ảnh"),
      tieuDe: String(r[3] || ""),
      noiDung: String(r[4] || ""),
      nguon: String(r[5] || ""),
      thuTu: Number(r[6]) || i,
      anh: String(r[7] || ""),
      anhDuPhong: String(r[8] || r[7] || ""),
      video: String(r[9] || ""),
      lienKet: String(r[10] || "")
    });
  }
  return result;
}

function docDanhSachCauHoi(ss) {
  var sheet = ss.getSheetByName(SHEET_CAU_HOI);
  if (!sheet) return [];
  var rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];

  var result = [];
  for (var i = 1; i < rows.length; i++) {
    var r = rows[i];
    if (!r[2]) continue;
    result.push({
      id: String(r[0] || ("CH" + i)),
      phong: String(r[1] || "P1"),
      hoi: String(r[2]),
      a: [String(r[3] || ""), String(r[4] || ""), String(r[5] || ""), String(r[6] || "")],
      dung: Number(r[7]) || 0,
      giaiThich: String(r[8] || ""),
      thuTu: Number(r[9]) || i
    });
  }
  return result;
}

/**
 * Trả về kết quả JSON chuẩn UTF-8
 */
function taoPhanHoiJson(duLieu) {
  return ContentService.createTextOutput(JSON.stringify(duLieu))
    .setMimeType(ContentService.MimeType.JSON);
}
