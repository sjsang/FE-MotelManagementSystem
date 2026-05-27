const BarChart = ({ bars, height = 90 }) => (
  <div className="flex items-end gap-[7px]" style={{ height }}>
    {bars.map((b, i) => (
      <div key={i} className="flex-1 flex flex-col items-center gap-1">
        <div className="text-[9.5px] text-[var(--text3)]">{b.val}</div>
        <div
          className={`bar-fill${b.hi ? " hi" : ""}`}
          style={{ height: `${b.pct}%` }}
        />
        <div className="text-[10px] text-[var(--text3)]">{b.lbl}</div>
      </div>
    ))}
  </div>
);

export default BarChart;
