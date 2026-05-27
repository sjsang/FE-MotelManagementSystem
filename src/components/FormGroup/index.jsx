const FormGroup = ({ label, children, full = false }) => (
  <div className={`flex flex-col gap-[5px]${full ? " col-span-full" : ""}`}>
    <label className="text-xs font-semibold text-[var(--text2)]">
      {label}
    </label>
    {children}
  </div>
);

export default FormGroup;
