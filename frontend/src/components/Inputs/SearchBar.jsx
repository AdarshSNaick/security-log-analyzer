import { FiSearch, FiX } from 'react-icons/fi';

export const SearchBar = ({ value, onChange, placeholder = 'Search logs, IP, user or event...', onClear }) => {
  return (
    <div className="position-relative w-100">
      <div className="position-absolute start-0 top-50 translate-middle-y ps-3 text-cyan">
        <FiSearch size={18} style={{ color: 'var(--soc-cyan)' }} />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="form-control soc-input ps-5 pe-5"
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            onChange('');
            if (onClear) onClear();
          }}
          className="btn btn-sm text-muted position-absolute end-0 top-50 translate-middle-y me-2 p-0 border-0"
        >
          <FiX size={18} />
        </button>
      )}
    </div>
  );
};
