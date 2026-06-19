export const SAVE_STATUS_STYLE = {
    saved: { color: '#10b981', label: '✓ Đã lưu' },
    pending: { color: '#f59e0b', label: '● Chưa lưu...' },
    saving: { color: '#8b85ff', label: '↻ Đang lưu...' },
    error: { color: '#ef4444', label: '✕ Lỗi lưu' },
};

export function formatTime(dateStr) {
    if (!dateStr) return '--';
    const d = new Date(dateStr);
    return d.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
}

export function calcElapsed(checkIn) {
    if (!checkIn) return { h: 0, m: 0, text: '--' };
    const diff = Date.now() - new Date(checkIn).getTime();
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return { h, m, text: h > 0 ? `${h} giờ ${m} phút` : `${m} phút` };
}

export const formatCurrency = (n) => (n || 0).toLocaleString('vi-VN') + 'đ';