const CardHeader = ({ title, icon, action }) => (
  <div className="py-[14px] px-[18px] border-b border-[var(--border)] flex items-center justify-between">
    <div className="text-[13.5px] font-semibold text-[var(--text)] flex items-center gap-2">
      <i className={`ti ${icon} text-[var(--accent)] text-base`} />
      {title}
    </div>
    {action}
  </div>
);

export default CardHeader;
