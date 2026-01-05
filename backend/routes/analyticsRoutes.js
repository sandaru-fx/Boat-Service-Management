import express from 'express';
import authMiddleware from '../middleware/auth.js';
import {
  getUserRegistrationTrends,
  getUserDistribution,
  getGeographicDistribution,
  getServiceRequestsByType,
  getMonthlyServiceVolume,
  getRevenueTrends,
  getRepairStatusBreakdown,
  getTechnicianPerformance,
  getSparePartsInventoryOverview,
  getSparePartsCategoryAnalytics,
  getSparePartsCompanyAnalytics,
  getSparePartsStockAlerts,
  getSparePartsTimeAnalytics,
  getSparePartsUsageAnalytics,
  getSparePartsSalesTrends,
  getTopSellingSpareParts,
  getSparePartsRevenueByCategory,
  getSparePartsMonthlyPerformance,
  getSparePartsOrderStatusDistribution,
  getSparePartsCustomerFrequency,
  getSalesVisitTrends,
  getSalesVisitCategoryDistribution,
  getSalesVisitGeographicDistribution,
  getSalesVisitPeakHours,
  getSalesVisitConversionRates,
  getSalesVisitStatusAnalytics,
  getRevenueByService,
  getCustomerSpending,
  getServicePerformance,
  getInventoryVsSales,
  getFinancialQuickStats,
  getRevenueDistributionByDistrict,
  getCustomerPurchaseFrequency,
  getCustomerServicePreferences,
  getCustomerLifetimeValue,
  getCustomerRetentionAnalysis,
  getCustomerSegmentation,
  getServiceCompletionRates,
  getCrossServiceUsage,
  getOperationalEfficiency,
  getPerformanceMetrics,
  getBoatRideTrends,
  getBoatRideStatusDistribution,
  getBoatTypePopularity,
  getJourneyTypePopularity,
  getBoatRideRevenueTrends,
  getPassengerCapacityAnalytics
} from '../controllers/analyticsController.js';
import { getAnalyticsDashboard, getRealtimeAnalytics } from '../controllers/analyticsController.js';

const router = express.Router();

// Analytics dashboard routes
router.get('/dashboard', getAnalyticsDashboard);
router.get('/realtime', getRealtimeAnalytics);

// User analytics
router.get('/users/registration-trends', getUserRegistrationTrends);
router.get('/users/distribution', getUserDistribution);
router.get('/users/geographic', getGeographicDistribution);

// Service analytics
router.get('/services/by-type', getServiceRequestsByType);
router.get('/services/monthly-volume', getMonthlyServiceVolume);
router.get('/services/revenue-trends', getRevenueTrends);
router.get('/services/status-breakdown', getRepairStatusBreakdown);
router.get('/services/technician-performance', getTechnicianPerformance);

// Spare parts analytics
router.get('/spare-parts/inventory-overview', getSparePartsInventoryOverview);
router.get('/spare-parts/category-analytics', getSparePartsCategoryAnalytics);
router.get('/spare-parts/company-analytics', getSparePartsCompanyAnalytics);
router.get('/spare-parts/stock-alerts', getSparePartsStockAlerts);
router.get('/spare-parts/time-analytics', getSparePartsTimeAnalytics);
router.get('/spare-parts/usage-analytics', getSparePartsUsageAnalytics);

// Spare parts sales analytics
router.get('/spare-parts/sales-trends', getSparePartsSalesTrends);
router.get('/spare-parts/top-selling', getTopSellingSpareParts);
router.get('/spare-parts/revenue-by-category', getSparePartsRevenueByCategory);
router.get('/spare-parts/monthly-performance', getSparePartsMonthlyPerformance);
router.get('/spare-parts/order-status-distribution', getSparePartsOrderStatusDistribution);
router.get('/spare-parts/customer-frequency', getSparePartsCustomerFrequency);

// Sales visit analytics
router.get('/sales-visits/trends', getSalesVisitTrends);
router.get('/sales-visits/category-distribution', getSalesVisitCategoryDistribution);
router.get('/sales-visits/geographic-distribution', getSalesVisitGeographicDistribution);
router.get('/sales-visits/peak-hours', getSalesVisitPeakHours);
router.get('/sales-visits/conversion-rates', getSalesVisitConversionRates);
router.get('/sales-visits/status-analytics', getSalesVisitStatusAnalytics);

// Financial analytics
router.get('/financial/revenue-by-service', getRevenueByService);
router.get('/financial/revenue-trends', getRevenueTrends);
router.get('/financial/customer-spending', getCustomerSpending);
router.get('/financial/service-performance', getServicePerformance);
router.get('/financial/inventory-vs-sales', getInventoryVsSales);
router.get('/financial/quick-stats', getFinancialQuickStats);
router.get('/financial/revenue-distribution-district', getRevenueDistributionByDistrict);

// Customer analytics
router.get('/customer/purchase-frequency', getCustomerPurchaseFrequency);
router.get('/customer/service-preferences', getCustomerServicePreferences);
router.get('/customer/lifetime-value', getCustomerLifetimeValue);
router.get('/customer/retention-analysis', getCustomerRetentionAnalysis);
router.get('/customer/segmentation', getCustomerSegmentation);

// Operational analytics
router.get('/operational/service-completion', getServiceCompletionRates);
router.get('/operational/cross-service-usage', getCrossServiceUsage);
router.get('/operational/efficiency', getOperationalEfficiency);
router.get('/operational/performance', getPerformanceMetrics);

// Boat Ride Analytics
router.get('/boat-rides/trends', getBoatRideTrends);
router.get('/boat-rides/status-distribution', getBoatRideStatusDistribution);
router.get('/boat-rides/boat-type-popularity', getBoatTypePopularity);
router.get('/boat-rides/journey-type-popularity', getJourneyTypePopularity);
router.get('/boat-rides/revenue-trends', getBoatRideRevenueTrends);
router.get('/boat-rides/passenger-capacity', getPassengerCapacityAnalytics);

export default router;
