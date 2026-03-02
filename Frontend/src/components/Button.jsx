const Button = ({ children, className = '', ...props }) => (
  <button className={`btn ${className}`} {...props}>{children}</button>
);

export default Button;
