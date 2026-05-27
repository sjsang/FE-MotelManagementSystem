const Card = ({ children, className = "", style = {} }) => (
  <div
    className={`bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-[var(--shadow)] overflow-hidden ${className}`}
    style={Object.keys(style).length ? style : undefined}
  >
    {children}
  </div>
);

export default Card;
