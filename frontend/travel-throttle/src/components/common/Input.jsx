/**
 * INPUT COMPONENT
 */

import { forwardRef, useState } from 'react';
import { cn } from '../../utils/helpers';

export const Input = forwardRef(({
  type = 'text',
  name,
  value,
  placeholder = '',
  label = '',
  error = '',
  success = false,
  disabled = false,
  required = false,
  size = 'md',
  leftIcon,
  rightIcon,
  className = '',
  onChange,
  options = [],
  rows = 4,
  helperText = '',
  ...props
}, ref) => {
  
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const actualType = isPassword && showPassword ? 'text' : type;
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-3 text-lg',
  };
  
  const inputClasses = cn(
    'w-full bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed',
    sizeClasses[size] || sizeClasses.md,
    error && 'border-error focus:ring-error',
    success && 'border-success focus:ring-success',
    leftIcon && 'pl-10',
    rightIcon && 'pr-10',
    className
  );
  
  const renderInput = () => {
    if (type === 'textarea') {
      return (
        <textarea
          ref={ref}
          name={name}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          onChange={onChange}
          rows={rows}
          className={inputClasses}
          {...props}
        />
      );
    }
    
    if (type === 'select') {
      return (
        <select
          ref={ref}
          name={name}
          value={value}
          disabled={disabled}
          required={required}
          onChange={onChange}
          className={inputClasses}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }
    
    return (
      <input
        ref={ref}
        type={actualType}
        name={name}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        onChange={onChange}
        className={inputClasses}
        {...props}
      />
    );
  };
  
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-dark-text mb-2">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      
      <div className="relative w-full">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}
        
        {renderInput()}
        
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        )}
        
        {rightIcon && !isPassword && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {rightIcon}
          </div>
        )}
        
        {success && !error && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-success">
            ✓
          </div>
        )}
      </div>
      
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
      {helperText && !error && <p className="mt-1 text-sm text-gray-400">{helperText}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;