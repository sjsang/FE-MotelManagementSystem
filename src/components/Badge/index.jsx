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
      className="inline-flex items-center gap-1 text-[11px] py-[3px] px-[9px] rounded-[20px] font-medium"
      style={{ background: s.bg, color: s.color }}
    >
      {children}
    </span>
  );
};
export default Badge;
