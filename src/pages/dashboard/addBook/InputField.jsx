import React from 'react';

const InputField = ({ label, name, type = 'text', register, placeholder }) => {
  const commonProps = {
    type: type,
    ...register(name, { required: true }),
    // --- SỬA LẠI STYLE ---
    className: "h-12 border border-subtle rounded-md px-4 w-full focus:outline-none focus:ring-1 focus:ring-accent bg-white shadow-inner",
    placeholder: placeholder,
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-ink mb-1">{label}</label>
      {type === 'textarea' ? (
        <textarea
          {...commonProps}
          className={`${commonProps.className} h-32 py-2`} // Style riêng cho textarea
          rows="4"
        />
      ) : (
        <input {...commonProps} />
      )}
    </div>
  );
};

export default InputField;