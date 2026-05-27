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
      className="inline-flex items-center gap-1 text-[10.5px] py-0.5 px-1.75 rounded-[20px] font-medium"
      style={{ background: s.bg, color: s.color }}
    >
      <span
        className="size-1.25 rounded-full bg-current inline-block"
      />
      {s.label}
    </span>
  );
};

export default StatusPill;
