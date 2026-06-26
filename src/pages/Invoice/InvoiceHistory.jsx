import React, { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import { getInvoices } from '../../utils/api';
import { useToast } from '../../hooks/useToast';

import InvoiceStats from './InvoiceStats';
import InvoiceFilter from './InvoiceFilter';
import InvoiceTable from './InvoiceTable';
import InvoiceDetailModal from './InvoiceDetailModal';

function today() { return dayjs().format('YYYY-MM-DD'); }
function startOfMonth() { return dayjs().startOf('month').format('YYYY-MM-DD'); }

const initialFilterState = {
    from: startOfMonth(), to: today(),
    status: '', paymentMethod: '', roomNumber: '', guestName: '',
};

/**
 * Tính khoảng thời gian so sánh tương ứng với khoảng hiện tại.
 * Trả về { from, to, label } để hiển thị tooltip.
 */
function getPreviousPeriod(from, to) {
    if (!from || !to) return null;

    const start = dayjs(from);
    const end = dayjs(to);
    const diffDays = end.diff(start, 'day') + 1; // số ngày của khoảng hiện tại

    // Heuristic: nhận diện các khoảng đặc biệt
    const isToday = from === today() && to === today();
    const isYesterday = (() => {
        const yd = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
        return from === yd && to === yd;
    })();
    const isThisMonth = start.date() === 1 && end.isSame(dayjs(), 'month');
    const isThisWeek = diffDays === 7 && end.isSame(dayjs(), 'day');

    if (isToday) {
        const yd = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
        return { from: yd, to: yd, label: 'hôm qua' };
    }
    if (isYesterday) {
        const d = dayjs().subtract(2, 'day').format('YYYY-MM-DD');
        return { from: d, to: d, label: 'hôm kia' };
    }
    if (isThisMonth) {
        const prevStart = start.subtract(1, 'month').startOf('month').format('YYYY-MM-DD');
        const prevEnd = start.subtract(1, 'month').endOf('month').format('YYYY-MM-DD');
        return { from: prevStart, to: prevEnd, label: 'tháng trước' };
    }
    if (isThisWeek) {
        const prevStart = start.subtract(7, 'day').format('YYYY-MM-DD');
        const prevEnd = end.subtract(7, 'day').format('YYYY-MM-DD');
        return { from: prevStart, to: prevEnd, label: '7 ngày trước' };
    }

    // Trường hợp tổng quát: dịch ngược bằng đúng số ngày của khoảng
    const prevEnd = start.subtract(1, 'day').format('YYYY-MM-DD');
    const prevStart = start.subtract(diffDays, 'day').format('YYYY-MM-DD');
    return { from: prevStart, to: prevEnd, label: `${diffDays} ngày trước đó` };
}

export default function InvoiceHistory() {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [selected, setSelected] = useState(null);

    const [filter, setFilter] = useState(initialFilterState);
    const [appliedFilter, setAppliedFilter] = useState(initialFilterState);
    // dateLabel được đồng bộ từ InvoiceFilter lên đây để truyền sang InvoiceStats
    const [dateLabel, setDateLabel] = useState('Tháng này');

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [summary, setSummary] = useState({ totalPaid: 0, count: 0 });

    // State mới: tổng kỳ trước để so sánh
    const [previousTotal, setPreviousTotal] = useState(null);

    const { addToast, ToastContainer } = useToast();

    const load = useCallback(async (p = 1) => {
        if (p === 1) setLoading(true);
        else setLoadingMore(true);

        try {
            const params = { page: p, limit: 20 };
            if (appliedFilter.from) params.from = appliedFilter.from;
            if (appliedFilter.to) params.to = appliedFilter.to;
            if (appliedFilter.status) params.status = appliedFilter.status;
            if (appliedFilter.paymentMethod) params.paymentMethod = appliedFilter.paymentMethod;
            if (appliedFilter.roomNumber) params.roomNumber = appliedFilter.roomNumber;
            if (appliedFilter.guestName) params.guestName = appliedFilter.guestName;

            const res = await getInvoices(params);
            const { data, total: t, totalPages: tp } = res.data;

            setInvoices(prev => {
                const updatedInvoices = p === 1 ? (data || []) : [...prev, ...(data || [])];
                const issued = updatedInvoices.filter(i => i.status === 'issued');
                setSummary({
                    totalPaid: issued.reduce((s, i) => s + (i.paidAmount || 0), 0),
                    count: issued.length,
                });
                return updatedInvoices;
            });

            setTotal(t || 0);
            setTotalPages(tp || 1);
            setPage(p);

            // Chỉ fetch kỳ trước khi load trang 1 (không cần lặp lại khi scroll)
            if (p === 1) {
                const prev = getPreviousPeriod(appliedFilter.from, appliedFilter.to);
                if (prev) {
                    try {
                        const prevRes = await getInvoices({ page: 1, limit: 1, from: prev.from, to: prev.to });
                        setPreviousTotal({ count: prevRes.data.total || 0, label: prev.label });
                    } catch {
                        setPreviousTotal(null);
                    }
                } else {
                    setPreviousTotal(null);
                }
            }

        } catch {
            addToast('Lỗi tải danh sách hóa đơn', 'error');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [appliedFilter, addToast]);

    useEffect(() => { load(1); }, [load]);

    const handleApplyFilter = () => { setAppliedFilter(filter); };
    const handleClearFilter = () => {
        setFilter(initialFilterState);
        setAppliedFilter(initialFilterState);
        setDateLabel('Tháng này');
    };

    return (
        <div>
            <ToastContainer />

            {/* Stats + Filter gộp trong 1 card */}
            <div className="card" style={{ marginBottom: 16, padding: '14px 20px' }}>
                <div className="stats-filter-row">
                    <InvoiceStats
                        total={total}
                        summary={summary}
                        previousTotal={previousTotal}
                        dateLabel={dateLabel}
                    />
                    <div className="stats-filter-divider" />
                    <InvoiceFilter
                        filter={filter}
                        setFilter={setFilter}
                        handleApplyFilter={handleApplyFilter}
                        handleClearFilter={handleClearFilter}
                        dateLabel={dateLabel}
                        setDateLabel={setDateLabel}
                    />
                </div>
            </div>

            <InvoiceTable
                loading={loading}
                invoices={invoices}
                setSelected={setSelected}
                page={page}
                totalPages={totalPages}
                load={load}
                hasMore={page < totalPages}
                loadingMore={loadingMore}
            />

            {selected && (
                <InvoiceDetailModal
                    invoice={selected}
                    onClose={() => setSelected(null)}
                    onCancel={() => { setSelected(null); load(1); }}
                    addToast={addToast}
                />
            )}
        </div>
    );
}