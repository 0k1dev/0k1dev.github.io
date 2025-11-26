/* 1) Vô hiệu hóa chuột phải */
document.addEventListener('contextmenu', function(e){
  e.preventDefault();
  return false;
});

/* 2) Chặn phím tắt phổ biến DevTools / View Source */
document.addEventListener('keydown', function(e){
  // F12
  if (e.key === 'F12') { e.preventDefault(); return false; }

  // Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C
  if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) {
    e.preventDefault(); return false;
  }

  // Ctrl+U (view source), Ctrl+S (save page) — tuỳ bạn có muốn chặn
  if (e.ctrlKey && (e.key === 'U' || e.key === 's' || e.key === 'S')) {
    e.preventDefault(); return false;
  }
});

/* 3) Vô hiệu hóa chọn text + kéo (hợp thêm CSS nhưng double đảm bảo) */
document.addEventListener('selectstart', e => e.preventDefault());
document.addEventListener('dragstart', e => e.preventDefault());

/* 4) Phát hiện DevTools mở (heuristic) và show overlay
   Lưu ý: này không hoàn hảo, dùng như cảnh báo. */
(function detectDevTools(){
  let devtoolsOpen = false;
  const threshold = 160; // thay đổi tuỳ trình duyệt/thiết bị

  function check() {
    const widthDiff = window.outerWidth - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;
    // nếu có khác biệt lớn (DevTools mở bên cạnh hoặc dưới)
    if (widthDiff > threshold || heightDiff > threshold) {
      if (!devtoolsOpen) {
        devtoolsOpen = true;
        document.getElementById('dev-overlay').style.display = 'flex';
      }
    } else {
      if (devtoolsOpen) {
        devtoolsOpen = false;
        document.getElementById('dev-overlay').style.display = 'none';
      }
    }
  }

  // check liên tục mỗi 500ms
  setInterval(check, 500);
})();

/* 5) Gợi ý: ghi log console fake để đánh lừa người tò mò */
console.log("%cTrang web đã được bảo vệ. Nếu bạn cần mã nguồn, liên hệ admin.", "color:orange;font-weight:bold");
/*  Có thể thêm nhiều cảnh báo để ngăn user thường dùng copy-paste */
