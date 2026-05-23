const CardHeader = ({ title, icon, action }) => (
  <div
    style={{
      padding: "14px 18px",
      borderBottom: "1px solid var(--border)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}
  >
    <div
      style={{
        fontSize: 13.5,
        fontWeight: 600,
        color: "var(--text)",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <i
        className={`ti ${icon}`}
        style={{ color: "var(--accent)", fontSize: 16 }}
      />
      {title}
    </div>
    {action}
  </div>
);

export default CardHeader;
