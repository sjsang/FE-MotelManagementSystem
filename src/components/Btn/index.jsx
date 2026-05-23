const Btn = ({
  variant = "outline",
  size = "md",
  onClick,
  children,
  style = {},
}) => {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    borderRadius: "var(--radius)",
    fontFamily: "'Be Vietnam Pro', sans-serif",
    fontWeight: 500,
    border: "1px solid transparent",
    cursor: "pointer",
    transition: "all 0.15s",
    whiteSpace: "nowrap",
  };
  const sizeMap = {
    md: { height: 36, padding: "0 16px", fontSize: 13 },
    sm: { height: 30, padding: "0 12px", fontSize: 12 },
  };
  const variantMap = {
    primary: {
      background: "var(--accent)",
      color: "white",
      borderColor: "var(--accent)",
    },
    outline: {
      background: "white",
      color: "var(--text)",
      borderColor: "var(--border2)",
    },
    danger: { background: "white", color: "#A32D2D", borderColor: "#F7C1C1" },
  };
  return (
    <button
      style={{ ...base, ...sizeMap[size], ...variantMap[variant], ...style }}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Btn;
