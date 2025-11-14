import React from 'react';

const Loading = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-paper">
      {/* Sửa màu vòng xoay */}
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary border-solid"></div>
    </div>
  );
};

export default Loading;