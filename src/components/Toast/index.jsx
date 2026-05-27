const Toast = ({ msg, icon, show }) => (
  <div className={`toast${show ? " show" : ""}`}>
    <i className={`ti ${icon}`} />
    <span>{msg}</span>
  </div>
);

export default Toast;
