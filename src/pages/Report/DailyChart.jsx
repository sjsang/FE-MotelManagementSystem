import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

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

export default function DailyChart({ dailyData }) {
    if (!dailyData || dailyData.length === 0) return null;

    const chartData = dailyData.map(item => ({
        ...item,
        displayDate: item.date.slice(8, 10) + '/' + item.date.slice(5, 7)
    }));

    return (
        <div className="card" style={{ marginBottom: 20, padding: 24 }}>
            <div style={{ fontWeight: 700, marginBottom: 20, fontSize: 16 }}>Biểu đồ doanh thu theo ngày</div>
            <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="displayDate" tick={{ fill: "#6b6f84", fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                    <YAxis tickFormatter={(v) => (v / 1000).toFixed(0) + "k"} tick={{ fill: "#6b6f84", fontSize: 12 }} axisLine={false} tickLine={false} dx={-10} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                    <Bar dataKey="revenue" fill="#6c63ff" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}