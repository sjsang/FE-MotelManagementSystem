import React, { useState, useEffect, useCallback } from 'react';
import { getInvoices } from '../../utils/api';
import { useToast } from '../../hooks/useToast';

// Import các component con
import InvoiceStats from './InvoiceStats';
import InvoiceFilter from './InvoiceFilter';
import InvoiceTable from './InvoiceTable';
import InvoiceDetailModal from './InvoiceDetailModal';

function today() { return new Date().toISOString().split('T')[0]; }
function monthAgo() {
    const d = new Date(); d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
}

const initialFilterState = {
    from: monthAgo(), to: today(),
    status: '', paymentMethod: '', roomNumber: '', guestName: '',
};

export default function InvoiceHistory() {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState(null);

    // Tách riêng state hiển thị UI và state thực sự gọi API
    const [filter, setFilter] = useState(initialFilterState);
    const [appliedFilter, setAppliedFilter] = useState(initialFilterState);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [summary, setSummary] = useState({ totalPaid: 0, count: 0 });

    const { addToast, ToastContainer } = useToast();

    // Hàm load bây giờ sẽ phụ thuộc vào appliedFilter thay vì filter
    const load = useCallback(async (p = 1) => {
        setLoading(true);
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
            setInvoices(data || []);
            setTotal(t || 0);
            setTotalPages(tp || 1);
            setPage(p);

            const issued = (data || []).filter(i => i.status === 'issued');
            setSummary({
                totalPaid: issued.reduce((s, i) => s + (i.paidAmount || 0), 0),
                count: issued.length,
            });
        } catch {
            addToast('Lỗi tải danh sách hóa đơn', 'error');
        } finally { setLoading(false); }
    }, [appliedFilter, addToast]);

    // Gọi API mỗi khi appliedFilter thay đổi
    useEffect(() => { load(1); }, [load]);

    // Hàm xác nhận lọc
    const handleApplyFilter = () => {
        setAppliedFilter(filter);
    };

    // Hàm xóa bộ lọc
    const handleClearFilter = () => {
        setFilter(initialFilterState);
        setAppliedFilter(initialFilterState);
    };

    return (
        <div>
            <ToastContainer />
            <InvoiceStats total={total} summary={summary} />

            <InvoiceFilter
                filter={filter}
                setFilter={setFilter}
                handleApplyFilter={handleApplyFilter}
                handleClearFilter={handleClearFilter}
            />

            <InvoiceTable
                loading={loading}
                invoices={invoices}
                setSelected={setSelected}
                page={page}
                totalPages={totalPages}
                load={load}
            />

            {selected && (
                <InvoiceDetailModal
                    invoice={selected}
                    onClose={() => setSelected(null)}
                    onCancel={() => { setSelected(null); load(page); }}
                    addToast={addToast}
                />
            )}
        </div>
    );
}