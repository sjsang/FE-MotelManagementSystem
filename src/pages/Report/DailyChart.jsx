import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts";

const formatAmount = (v) => {
    if (v >= 1_000_000_000) return (v / 1_000_000_000).toFixed(v % 1_000_000_000 === 0 ? 0 : 1) + 'T';
    if (v >= 1_000_000) return (v / 1_000_000).toFixed(v % 1_000_000 === 0 ? 0 : 1) + 'M';
    if (v >= 1_000) return (v / 1_000).toFixed(v % 1_000 === 0 ? 0 : 1) + 'k';
    return v;
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ background: "#1e2130", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 14px" }}>
                <div style={{ fontSize: 12, color: "#9fa3b8", marginBottom: 4 }}>Ngày: {label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#8b85ff" }}>
                    Doanh thu: {(payload[0].value || 0).toLocaleString("vi-VN")}đ
                </div>
                <div style={{ fontSize: 12, color: "#9fa3b8", marginTop: 4 }}>
                    Số hóa đơn: {payload[0].payload.count}
                </div>
            </div>
        );
    }
    return null;
};

const BAR_WIDTH = 40;

export default function DailyChart({ dailyData }) {
    const [chartWidth, setChartWidth] = useState(0);
    const chartRef = useRef(null);

    useEffect(() => {
        if (!chartRef.current) return;
        let timeoutId;
        let isFirstRender = true;

        const observer = new ResizeObserver(entries => {
            const newWidth = entries[0].contentRect.width;
            if (newWidth === 0) return;
            if (isFirstRender) {
                setChartWidth(newWidth);
                isFirstRender = false;
            } else {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => setChartWidth(newWidth), 300);
            }
        });

        observer.observe(chartRef.current);
        return () => { clearTimeout(timeoutId); observer.disconnect(); };
    }, []);

    const chartData = (dailyData || []).map(item => ({
        ...item,
        displayDate: item.date ? item.date.slice(8, 10) + '/' + item.date.slice(5, 7) : ''
    }));

    const minChartWidth = chartData.length * BAR_WIDTH;
    const finalChartWidth = Math.max(minChartWidth, chartWidth);

    return (
        <div className="card" style={{ marginBottom: 20, padding: 24 }}>
            <style>{`
                .recharts-wrapper,
                .recharts-wrapper *,
                .recharts-wrapper:focus,
                .recharts-wrapper:focus-visible,
                .recharts-wrapper:active,
                .recharts-surface:focus,
                .recharts-surface:focus-visible {
                    outline: none !important;
                    box-shadow: none !important;
                }
            `}</style>

            <div style={{ fontWeight: 700, marginBottom: 20, fontSize: 16 }}>Biểu đồ doanh thu theo ngày</div>

            <div style={{ width: '100%', height: 280 }} ref={chartRef}>
                {!dailyData || dailyData.length === 0 ? (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9fa3b8', fontStyle: 'italic', fontSize: 14 }}>
                        Không có dữ liệu trong khoảng thời gian này
                    </div>
                ) : chartWidth > 0 ? (
                    <div style={{ width: '100%', overflowX: 'auto' }}>
                        <BarChart
                            width={finalChartWidth}
                            height={280}
                            data={chartData}
                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                            style={{ outline: 'none' }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis
                                dataKey="displayDate"
                                tick={{ fill: "#6b6f84", fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                                dy={10}
                            />
                            <YAxis width={50} tickFormatter={formatAmount} tick={{ fill: "#6b6f84", fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip
                                content={<CustomTooltip />}
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                trigger="click"
                            />
                            <Bar dataKey="revenue" fill="#6c63ff" radius={[4, 4, 0, 0]} maxBarSize={50} isAnimationActive={false} />
                        </BarChart>
                    </div>
                ) : null}
            </div>
        </div>
    );
}