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
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: 18,
        boxShadow: "var(--shadow)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <div style={{ fontSize: 12, color: "var(--text2)", fontWeight: 500 }}>
          {label}
        </div>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            background: bg,
            color: fg,
          }}
        >
          <i className={`ti ${icon}`} />
        </div>
      </div>
      <div
        style={{
          fontSize: 28,
          fontWeight: 600,
          color: "var(--text)",
          lineHeight: 1,
          marginBottom: 6,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 12,
          display: "flex",
          alignItems: "center",
          gap: 4,
          color: changeColor,
        }}
      >
        {change}
      </div>
    </div>
  );
};

export default StatCard;
