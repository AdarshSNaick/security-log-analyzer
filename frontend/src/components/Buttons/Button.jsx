export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  type = 'button',
  onClick,
  className = '',
  ...props
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'primary': return 'btn soc-btn-primary';
      case 'outline': return 'btn soc-btn-outline';
      case 'danger': return 'btn btn-outline-danger';
      case 'success': return 'btn btn-outline-success';
      case 'secondary': return 'btn btn-secondary';
      default: return 'btn soc-btn-primary';
    }
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${getVariantClass()} ${className} d-inline-flex align-items-center justify-content-center gap-2`}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          <span>Loading...</span>
        </>
      ) : (
        <>
          {Icon && <Icon size={18} />}
          <span>{children}</span>
        </>
      )}
    </button>
  );
};
