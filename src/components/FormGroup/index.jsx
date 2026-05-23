const FormGroup = ({ label, children, full = false }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: 5,
      ...(full ? { gridColumn: "1 / -1" } : {}),
    }}
  >
    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text2)" }}>
      {label}
    </label>
    {children}
  </div>
);

export default FormGroup;
