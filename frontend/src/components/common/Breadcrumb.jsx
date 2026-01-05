import React from 'react';
import { Link } from 'react-router-dom';

const Breadcrumb = ({ product }) => {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
      <Link 
        to="/" 
        className="hover:text-teal-600 transition-colors duration-200"
      >
        HOME
      </Link>
      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
      <Link 
        to="/spare-parts" 
        className="hover:text-teal-600 transition-colors duration-200"
      >
        SPARE PARTS
      </Link>
      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
      <span className="text-gray-700 font-medium capitalize">
        {product.category || "Uncategorized"}
      </span>
      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
      <span className="text-gray-900 font-medium truncate max-w-xs">
        {product.name}
      </span>
    </nav>
  );
};

export default Breadcrumb;
