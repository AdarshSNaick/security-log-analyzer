export const Input = ({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  icon: Icon,
  required = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`mb-3 ${className}`}>
      {label && (
        <label htmlFor={id} className="form-label text-muted small fw-semibold mb-1">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <div className="position-relative">
        {Icon && (
          <div className="position-absolute start-0 top-50 translate-middle-y ps-3 text-muted">
            <Icon size={18} />
          </div>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`form-control soc-input ${Icon ? 'ps-5' : ''} ${error ? 'is-invalid border-danger' : ''}`}
          {...props}
        />
      </div>
      {error && <div className="invalid-feedback d-block mt-1 small text-danger">{error}</div>}
    </div>
  );
};
