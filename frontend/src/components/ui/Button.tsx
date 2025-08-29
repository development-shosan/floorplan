import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const Button = ({ children, className, ...props }: ButtonProps) => {
  return (
    <button
      className={`px-4 py-2 font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
