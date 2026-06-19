import React from 'react';
import { SAVE_STATUS_STYLE, formatCurrency } from '../../utils/roomDetailHelpers';

export default function TabServices({
    services,
    availableServices,
    newService,
    setNewService,
    saveStatus,
    addServiceFromList,
    addCustomService,
    removeService,
    serviceTotal
}) {
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: SAVE_STATUS_STYLE[saveStatus].color, transition: 'color 0.3s' }}>
                    {SAVE_STATUS_STYLE[saveStatus].label}
                </span>
            </div>

            {availableServices.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 12, color: '#6b6f84', marginBottom: 8 }}>Thêm nhanh:</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {availableServices.map((svc, i) => (
                            <button key={i} onClick={() => addServiceFromList(svc)}
                                style={{ padding: '5px 12px', background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: 20, color: '#8b85ff', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                                + {svc.name} ({(svc.price).toLocaleString('vi-VN')}đ)
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto auto', gap: 8, marginBottom: 14, alignItems: 'end' }}>
                <div>
                    <div style={{ fontSize: 11, color: '#6b6f84', marginBottom: 4 }}>Tên dịch vụ</div>
                    <input className="form-control" placeholder="Khác..." value={newService.name} onChange={e => setNewService(s => ({ ...s, name: e.target.value }))} />
                </div>
                <div>
                    <div style={{ fontSize: 11, color: '#6b6f84', marginBottom: 4 }}>Giá (đ)</div>
                    <input className="form-control" type="number" placeholder="0" value={newService.price} onChange={e => setNewService(s => ({ ...s, price: e.target.value }))} />
                </div>
                <div>
                    <div style={{ fontSize: 11, color: '#6b6f84', marginBottom: 4 }}>SL</div>
                    <input className="form-control" type="number" min="1" value={newService.quantity} onChange={e => setNewService(s => ({ ...s, quantity: e.target.value }))} style={{ width: 60 }} />
                </div>
                <button className="btn btn-primary btn-sm" onClick={addCustomService} style={{ alignSelf: 'flex-end' }}>+</button>
            </div>

            {services.length > 0 ? (
                <div>
                    {services.map((s, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <span style={{ fontSize: 13 }}>{s.name} x{s.quantity}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <span style={{ fontSize: 13, fontWeight: 600 }}>{(s.price * s.quantity).toLocaleString('vi-VN')}đ</span>
                                <button onClick={() => removeService(i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 16 }}>✕</button>
                            </div>
                        </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <span style={{ fontWeight: 600 }}>Tổng dịch vụ</span>
                        <span style={{ fontWeight: 700, color: '#8b85ff' }}>{formatCurrency(serviceTotal)}</span>
                    </div>
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '20px 0', color: '#6b6f84', fontSize: 13 }}>Chưa có dịch vụ</div>
            )}
        </div>
    );
}