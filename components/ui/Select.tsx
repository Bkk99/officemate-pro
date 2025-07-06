import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  wrapperClassName?: string;
  options: { value: string | number; label: string }[];
  placeholder?: string; // Added placeholder prop
}

export const Select: React.FC<SelectProps> = ({ label, id, error, className = '', wrapperClassName = '', options, ...props }) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  return (
    <div className={`mb-4 ${wrapperClassName}`}>
      {label && <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <select
        id={selectId}
        className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border ${error ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md ${className}`}
        {...props}
      >
        {props.placeholder && <option value="">{props.placeholder}</option>}
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};
