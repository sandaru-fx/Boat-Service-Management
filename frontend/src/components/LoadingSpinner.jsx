import React from 'react';

const LoadingSpinner = ({ size = 'lg', message = 'Loading...', ...props }) => {
	const sizeClasses = {
		sm: 'h-4 w-4',
		md: 'h-6 w-6',
		lg: 'h-8 w-8',
		xl: 'h-12 w-12'
	};

	return (
		<div
			className="flex flex-col items-center justify-center p-8"
			{...props}
		>
			<div className={`animate-spin rounded-full border-4 border-gray-200 border-t-blue-500 ${sizeClasses[size]}`}></div>
			{message && (
				<p className="mt-4 text-sm text-gray-600">
					{message}
				</p>
			)}
		</div>
	);
};

export default LoadingSpinner;