const Card = ({ children, style = {} }) => (
  <div
    style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)",
      boxShadow: "var(--shadow)",
      overflow: "hidden",
      ...style,
    }}
  >
    {children}
  </div>
);

export default Card;
