const BarChart = ({ bars, height = 90 }) => (
  <div style={{ display: "flex", alignItems: "flex-end", gap: 7, height }}>
    {bars.map((b, i) => (
      <div
        key={i}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
        }}
      >
        <div style={{ fontSize: 9.5, color: "var(--text3)" }}>{b.val}</div>
        <div
          className={`bar-fill${b.hi ? " hi" : ""}`}
          style={{ height: `${b.pct}%` }}
        />
        <div style={{ fontSize: 10, color: "var(--text3)" }}>{b.lbl}</div>
      </div>
    ))}
  </div>
);

export default BarChart;
