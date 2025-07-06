
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  actions?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, actions }) => {
  return (
    <div className={`bg-white shadow-lg rounded-xl overflow-hidden ${className}`}>
      {(title || actions) && (
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex flex-wrap justify-between items-center gap-2">
          {title && <h3 className="text-lg leading-6 font-medium text-gray-900 flex-grow">{title}</h3>}
          {actions && <div className="flex-shrink-0">{actions}</div>}
        </div>
      )}
      <div className="p-4 sm:p-6">
        {children}
      </div>
    </div>
  );
};
