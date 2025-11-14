import React from 'react';

const SelectField = ({ label, name, options, register }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-ink mb-1">{label}</label>
      <select
        {...register(name,  { required: true })}
        // --- SỬA LẠI STYLE ---
        className="h-12 w-full p-2 border border-subtle rounded-md focus:outline-none focus:ring-1 focus:ring-accent bg-white shadow-inner"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectField;