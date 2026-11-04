// ====================================================================
// BACKEND GOOGLE APPS SCRIPT CHO BẢO TÀNG 3D - THCS AN NHƠN
// GHI NHẬN & ĐẾM SỐ LƯỢT TRUY CẬP VÀO Ô B3 SHEET "CauHinh"
// ====================================================================

var SHEET_CAU_HINH = "CauHinh";
var SHEET_NHAT_KY = "NhatKyThamQuan";
var SHEET_HIEN_VAT = "HienVat";
var SHEET_CAU_HOI = "CauHoi";

/**
 * Xử lý yêu cầu HTTP GET từ website Bảo tàng 3D
 */
function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var thamSo = e && e.parameter ? e.parameter : {};
  var api = thamSo.api || "luot";

  // 1. API ĐẾM VÀ TĂNG SỐ LƯỢT (GHI VÀO Ô B3 CỦA SHEET CauHinh)
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

  // Mặc định: tăng lượt truy cập
  return tangVaGhiLuotTruyCap(ss);
}

function doPost(e) {
  return doGet(e);
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
    { ma: "P6", ten: "Học tập và làm theo Bác" }
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
