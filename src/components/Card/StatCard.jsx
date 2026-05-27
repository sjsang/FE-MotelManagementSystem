const StatCard = ({
  label,
  value,
  icon,
  iconColor,
  change,
  changeType = "neutral",
}) => {
  const iconBg = {
    green: "#E1F5EE,#0F6E56",
    blue: "#E6F1FB,#185FA5",
    amber: "#FAEEDA,#854F0B",
    red: "#FCEBEB,#A32D2D",
    purple: "#EEEDFE,#534AB7",
  };
  const [bg, fg] = (iconBg[iconColor] || iconBg.green).split(",");
  const changeColor = {
    up: "#0F6E56",
    down: "#A32D2D",
    neutral: "var(--text3)",
  }[changeType];
  return (
    <div className="bg-(--surface) border border-(--border) rounded-lg p-4.5 shadow-(--shadow)">
      <div className="flex items-start justify-between mb-3">
        <div className="text-xs text-(--text2) font-medium">
          {label}
        </div>
        <div
          className="size-8.5 rounded-[9px] flex items-center justify-center text-base"
          style={{ background: bg, color: fg }}
        >
          <i className={`ti ${icon}`} />
        </div>
      </div>
      <div className="text-[28px] font-semibold text-(--text) leading-none mb-1.5">
        {value}
      </div>
      <div
        className="text-xs flex items-center gap-1"
        style={{ color: changeColor }}
      >
        {change}
      </div>
    </div>
  );
};

export default StatCard;
