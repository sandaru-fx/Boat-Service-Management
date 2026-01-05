import React from 'react';

const PackageCard = ({ 
	package: pkg, 
	onBook, 
	onEdit, 
	onDelete, 
	onToggleStatus,
	isEmployee = false 
}) => {
	const formatPrice = (price) => {
		return `Rs. ${price.toLocaleString('en-LK')}`;
	};

	const getStatusColor = (status) => {
		switch (status) {
			case 'Available': return 'bg-green-100 text-green-800';
			case 'Maintenance': return 'bg-yellow-100 text-yellow-800';
			case 'Out of Service': return 'bg-red-100 text-red-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	};

	const getTypeColor = (type) => {
		switch (type) {
			case 'Group Trip': return 'bg-blue-100 text-blue-800';
			case 'Family Package': return 'bg-purple-100 text-purple-800';
			case 'Luxury Experience': return 'bg-yellow-100 text-yellow-800';
			case 'Fishing Trip': return 'bg-teal-100 text-teal-800';
			case 'Event Package': return 'bg-pink-100 text-pink-800';
			case 'Individual Experience': return 'bg-orange-100 text-orange-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	};

	return (
		<div className="max-w-sm bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden hover:transform hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
			<div className="p-6">
				<div className="space-y-4">
					{/* Header */}
					<div className="flex justify-between items-start">
						<div className="flex-1">
							<h3 className="text-lg font-semibold text-blue-600">
								{pkg.packageName}
							</h3>
							<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(pkg.packageType)}`}>
								{pkg.packageType}
							</span>
						</div>
						<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(pkg.status)}`}>
							{pkg.status}
						</span>
					</div>

					{/* Description */}
					<p className="text-sm text-gray-600 line-clamp-3">
						{pkg.description}
					</p>

					{/* Details */}
					<div className="space-y-2">
						<div className="flex justify-between items-center">
							<div className="flex items-center space-x-2">
								<svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
								</svg>
								<span className="text-sm text-gray-600">Duration:</span>
							</div>
							<span className="text-sm font-medium">
								{pkg.duration}
							</span>
						</div>

						<div className="flex justify-between items-center">
							<div className="flex items-center space-x-2">
								<svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
								</svg>
								<span className="text-sm text-gray-600">Capacity:</span>
							</div>
							<span className="text-sm font-medium">
								{pkg.maxCapacity} people
							</span>
						</div>

						{pkg.destinations && pkg.destinations.length > 0 && (
							<div className="flex justify-between items-center">
								<div className="flex items-center space-x-2">
									<svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									<span className="text-sm text-gray-600">Destinations:</span>
								</div>
								<span className="text-sm font-medium">
									{pkg.destinations.join(', ')}
								</span>
							</div>
						)}
					</div>

					{/* Price */}
					<div className="bg-blue-50 p-3 rounded-md border border-blue-200">
						<p className="text-lg font-bold text-blue-600 text-center">
							{formatPrice(pkg.basePrice)}
						</p>
						<p className="text-xs text-gray-500 text-center">
							Base price
						</p>
					</div>

					{/* Actions */}
					<div className="space-y-2">
						{isEmployee ? (
							<div className="flex space-x-2">
								<button
									onClick={() => onEdit(pkg)}
									className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
								>
									Edit
								</button>
								<button
									onClick={() => onToggleStatus(pkg._id)}
									className={`px-3 py-2 text-sm rounded-md border focus:outline-none focus:ring-2 focus:ring-offset-2 ${
										pkg.isActive 
											? 'border-orange-500 text-orange-500 hover:bg-orange-50 focus:ring-orange-500' 
											: 'border-green-500 text-green-500 hover:bg-green-50 focus:ring-green-500'
									}`}
									title={pkg.isActive ? 'Deactivate' : 'Activate'}
								>
									{pkg.isActive ? 'Deactivate' : 'Activate'}
								</button>
								<button
									onClick={() => onDelete(pkg._id)}
									className="px-3 py-2 border border-red-500 text-red-500 text-sm rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
								>
									Delete
								</button>
							</div>
						) : (
							<button
								onClick={() => onBook(pkg)}
								disabled={!pkg.isActive || pkg.status !== 'Available'}
								className={`w-full px-4 py-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
									pkg.isActive && pkg.status === 'Available'
										? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
										: 'bg-gray-300 text-gray-500 cursor-not-allowed'
								}`}
							>
								{pkg.isActive && pkg.status === 'Available' ? 'Book Now' : 'Not Available'}
							</button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default PackageCard;