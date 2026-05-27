const Btn = ({
  variant = "outline",
  size = "md",
  onClick,
  children,
  className = "",
}) => {
  const base =
    "inline-flex items-center gap-[7px] rounded-[var(--radius)] font-medium border border-transparent cursor-pointer transition-all duration-150 whitespace-nowrap";
  const sizeMap = {
    md: "h-9 px-4 text-[13px]",
    sm: "h-[30px] px-3 text-xs",
  };
  const variantMap = {
    primary: "bg-[var(--accent)] text-white border-[var(--accent)]",
    outline: "bg-white text-[var(--text)] border-[var(--border2)]",
    danger: "bg-white text-[#A32D2D] border-[#F7C1C1]",
  };
  return (
    <button
      className={`${base} ${sizeMap[size]} ${variantMap[variant]} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Btn;
