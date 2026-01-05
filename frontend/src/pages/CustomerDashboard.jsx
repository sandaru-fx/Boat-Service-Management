import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBoatPackageStore } from '../store/boatPackageStore';
import { useToastNotification } from '../components/ToastNotification';
import PackageCard from '../components/PackageCard';
import LoadingSpinner from '../components/LoadingSpinner';

const CustomerDashboard = () => {
	const navigate = useNavigate();
	const { 
		packages, 
		loading, 
		error, 
		fetchActivePackages,
		clearError 
	} = useBoatPackageStore();
	
	const { showError, ToastContainer } = useToastNotification();
	const [searchQuery, setSearchQuery] = useState('');
	const [filterType, setFilterType] = useState('');
	const [filteredPackages, setFilteredPackages] = useState([]);

	useEffect(() => {
		fetchActivePackages();
	}, []);

	useEffect(() => {
		if (error) {
			showError('Error', error);
			clearError();
		}
	}, [error]);

	useEffect(() => {
		let filtered = packages;

		// Apply search filter
		if (searchQuery) {
			filtered = filtered.filter(pkg => 
				pkg.packageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
				pkg.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
				pkg.packageType.toLowerCase().includes(searchQuery.toLowerCase())
			);
		}

		// Apply type filter
		if (filterType) {
			filtered = filtered.filter(pkg => pkg.packageType === filterType);
		}

		setFilteredPackages(filtered);
	}, [packages, searchQuery, filterType]);

	const handleSearch = (e) => {
		e.preventDefault();
		// Search is handled by the filteredPackages useEffect
		// No need to call API, just filter locally
	};

	const handleBookPackage = (pkg) => {
		// Navigate to booking page with package data
		navigate(`/booking?packageId=${pkg._id}`);
	};

	const packageTypes = [...new Set(packages.map(pkg => pkg.packageType))];

	if (loading) {
		return <LoadingSpinner message="Loading boat packages..." />;
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="space-y-8">
					{/* Back Button */}
					<div className="mb-4">
						<button
							onClick={() => navigate('/dashboard')}
							className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
						>
							<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
							</svg>
							Back to Dashboard
						</button>
					</div>

					{/* Header */}
					<div className="text-center">
						<h1 className="text-4xl font-bold text-gray-900 mb-4">
							🚤 Available Boat Packages
						</h1>
						<p className="text-lg text-gray-600 max-w-2xl mx-auto">
							Choose from our exciting boat experiences. Book your perfect adventure today!
						</p>
					</div>

					{/* Search and Filters */}
					<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
						<div className="space-y-4">
							<form onSubmit={handleSearch} className="w-full">
								<div className="relative">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
										</svg>
									</div>
									<input
										type="text"
										placeholder="Search packages..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
									/>
								</div>
							</form>

							<div className="flex flex-wrap items-center gap-4">
								<select
									value={filterType}
									onChange={(e) => setFilterType(e.target.value)}
									className="max-w-xs px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
								>
									<option value="">Filter by type</option>
									{packageTypes.map(type => (
										<option key={type} value={type}>{type}</option>
									))}
								</select>

								<button
									onClick={() => {
										setSearchQuery('');
										setFilterType('');
										fetchActivePackages();
									}}
									className="px-4 py-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
								>
									Clear Filters
								</button>

								<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
									{filteredPackages.length} packages available
								</span>
							</div>
						</div>
					</div>

					{/* Packages Grid */}
					{filteredPackages.length > 0 ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{filteredPackages.map((pkg) => (
								<PackageCard
									key={pkg._id}
									package={pkg}
									onBook={handleBookPackage}
									isEmployee={false}
								/>
							))}
						</div>
					) : (
						<div className="text-center py-12">
							<p className="text-lg text-gray-500">
								{searchQuery || filterType 
									? "No packages found matching your criteria." 
									: "No packages available at the moment. Please check back later."
								}
							</p>
							{(searchQuery || filterType) && (
								<button
									onClick={() => {
										setSearchQuery('');
										setFilterType('');
										fetchActivePackages();
									}}
									className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
								>
									View All Packages
								</button>
							)}
						</div>
					)}
				</div>
			</div>
			<ToastContainer />
		</div>
	);
};

export default CustomerDashboard;