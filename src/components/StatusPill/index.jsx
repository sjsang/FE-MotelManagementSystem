const StatusPill = ({ status }) => {
  const map = {
    occupied: { bg: "#FCEBEB", color: "#A32D2D", label: "Thuê" },
    available: { bg: "#E1F5EE", color: "#0F6E56", label: "Trống" },
    cleaning: { bg: "#FAEEDA", color: "#854F0B", label: "Dọn" },
    reserved: { bg: "#E6F1FB", color: "#185FA5", label: "Đặt" },
  };
  const s = map[status] || map.available;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: 10.5,
        padding: "2px 7px",
        borderRadius: 20,
        fontWeight: 500,
        background: s.bg,
        color: s.color,
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: "currentColor",
          display: "inline-block",
        }}
      />
      {s.label}
    </span>
  );
};

export default StatusPill;
