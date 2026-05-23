const Badge = ({ color = "green", children }) => {
  const map = {
    green: { bg: "#E1F5EE", color: "#085041" },
    red: { bg: "#FCEBEB", color: "#791F1F" },
    blue: { bg: "#E6F1FB", color: "#0C447C" },
    amber: { bg: "#FAEEDA", color: "#633806" },
    gray: { bg: "#F1EFE8", color: "#444441" },
    purple: { bg: "#EEEDFE", color: "#3C3489" },
  };
  const s = map[color] || map.green;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: 11,
        padding: "3px 9px",
        borderRadius: 20,
        fontWeight: 500,
        background: s.bg,
        color: s.color,
      }}
    >
      {children}
    </span>
  );
};
export default Badge;
