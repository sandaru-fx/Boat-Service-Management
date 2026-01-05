import User from '../models/userModel.js';
import BoatRepair from '../models/boatRepairModel.js';
import BoatBooking from '../models/boatBooking.model.js';
import Appointment from '../models/appointmentBooking.model.js';
import Boat from '../models/productModel.js';
import Product from '../models/productModel.js';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import { UserVisit, CategoryView, Engagement } from '../models/analytics.model.js';

// Get user registration trends
export const getUserRegistrationTrends = async (req, res) => {
  try {
    const { period } = req.query; // '24h', '7d', '30d', '6m', '1y'
    
    let startDate = new Date();
    let groupBy = 'hour';
    
    switch (period) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24);
        groupBy = 'hour';
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        groupBy = 'day';
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        groupBy = 'day';
        break;
      case '6m':
        startDate.setMonth(startDate.getMonth() - 6);
        groupBy = 'month';
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        groupBy = 'month';
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
        groupBy = 'day';
    }

    const pipeline = [
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
            hour: { $hour: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 }
      }
    ];

    const trends = await User.aggregate(pipeline);
    
    res.json({
      success: true,
      data: trends,
      period,
      groupBy
    });
  } catch (error) {
    console.error('Error getting registration trends:', error);
    res.status(500).json({ success: false, message: 'Failed to get registration trends' });
  }
};

// Get user distribution (active/inactive)
export const getUserDistribution = async (req, res) => {
  try {
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });
    
    res.json({
      success: true,
      data: {
        active: activeUsers,
        inactive: inactiveUsers,
        total: activeUsers + inactiveUsers
      }
    });
  } catch (error) {
    console.error('Error getting user distribution:', error);
    res.status(500).json({ success: false, message: 'Failed to get user distribution' });
  }
};

// Get geographic distribution by district
export const getGeographicDistribution = async (req, res) => {
  try {
    const pipeline = [
      {
        $match: {
          'address.district': { $exists: true, $ne: null, $ne: '' }
        }
      },
      {
        $group: {
          _id: '$address.district',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ];

    const distribution = await User.aggregate(pipeline);
    
    res.json({
      success: true,
      data: distribution
    });
  } catch (error) {
    console.error('Error getting geographic distribution:', error);
    res.status(500).json({ success: false, message: 'Failed to get geographic distribution' });
  }
};

// Get service requests by type
export const getServiceRequestsByType = async (req, res) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: '$serviceType',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ];

    const serviceTypes = await BoatRepair.aggregate(pipeline);
    
    res.json({
      success: true,
      data: serviceTypes
    });
  } catch (error) {
    console.error('Error getting service requests by type:', error);
    res.status(500).json({ success: false, message: 'Failed to get service requests by type' });
  }
};

// Get monthly service volume
export const getMonthlyServiceVolume = async (req, res) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ];

    const monthlyVolume = await BoatRepair.aggregate(pipeline);
    
    res.json({
      success: true,
      data: monthlyVolume
    });
  } catch (error) {
    console.error('Error getting monthly service volume:', error);
    res.status(500).json({ success: false, message: 'Failed to get monthly service volume' });
  }
};


// Get repair status breakdown
export const getRepairStatusBreakdown = async (req, res) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ];

    const statusBreakdown = await BoatRepair.aggregate(pipeline);
    
    // Get current month/year data
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    const currentMonthPipeline = [
      {
        $match: {
          $expr: {
            $and: [
              { $eq: [{ $year: '$createdAt' }, currentYear] },
              { $eq: [{ $month: '$createdAt' }, currentMonth] }
            ]
          }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ];

    const currentMonthData = await BoatRepair.aggregate(currentMonthPipeline);
    
    res.json({
      success: true,
      data: {
        allTime: statusBreakdown,
        currentMonth: currentMonthData
      }
    });
  } catch (error) {
    console.error('Error getting repair status breakdown:', error);
    res.status(500).json({ success: false, message: 'Failed to get repair status breakdown' });
  }
};

// Get technician performance data
export const getTechnicianPerformance = async (req, res) => {
  try {
    const pipeline = [
      {
        $match: {
          assignedTechnician: { $exists: true, $ne: null }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'assignedTechnician',
          foreignField: '_id',
          as: 'technician'
        }
      },
      {
        $unwind: '$technician'
      },
      {
        $group: {
          _id: {
            technicianId: '$assignedTechnician',
            technicianName: '$technician.name',
            position: '$technician.employeeData.position'
          },
          totalAssigned: { $sum: 1 },
          completed: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
            }
          },
          inProgress: {
            $sum: {
              $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0]
            }
          },
          pending: {
            $sum: {
              $cond: [{ $eq: ['$status', 'assigned'] }, 1, 0]
            }
          }
        }
      },
      {
        $addFields: {
          completionRate: {
            $round: [
              {
                $multiply: [
                  { $divide: ['$completed', '$totalAssigned'] },
                  100
                ]
              },
              2
            ]
          }
        }
      },
      {
        $sort: { totalAssigned: -1 }
      }
    ];

    const technicianPerformance = await BoatRepair.aggregate(pipeline);
    
    res.json({
      success: true,
      data: technicianPerformance
    });
  } catch (error) {
    console.error('Error getting technician performance:', error);
    res.status(500).json({ success: false, message: 'Failed to get technician performance' });
  }
};

// Get analytics dashboard data
export const getAnalyticsDashboard = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    console.log('📊 Getting analytics dashboard data for', days, 'days');

    // Get appointment metrics
    const totalAppointments = await Appointment.countDocuments({
      createdAt: { $gte: startDate }
    });

    const uniqueCustomers = await Appointment.distinct('customerEmail', {
      createdAt: { $gte: startDate }
    });

    const completedAppointments = await Appointment.countDocuments({
      status: 'completed',
      createdAt: { $gte: startDate }
    });

    const pendingAppointments = await Appointment.countDocuments({
      status: 'pending',
      createdAt: { $gte: startDate }
    });

    // Get boat category performance
    const categoryStats = await Appointment.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $lookup: {
          from: 'boats',
          localField: 'boatId',
          foreignField: '_id',
          as: 'boat'
        }
      },
      {
        $unwind: '$boat'
      },
      {
        $group: {
          _id: '$boat.category',
          totalViews: { $sum: 1 },
          uniqueViewers: { $addToSet: '$customerEmail' },
          averageTime: { $avg: '$estimatedDuration' }
        }
      },
      {
        $project: {
          category: '$_id',
          totalViews: 1,
          uniqueViewers: { $size: '$uniqueViewers' },
          averageTime: { $round: ['$averageTime', 2] }
        }
      },
      {
        $sort: { totalViews: -1 }
      }
    ]);

    // Get top boats by appointments
    const topBoats = await Appointment.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $lookup: {
          from: 'boats',
          localField: 'boatId',
          foreignField: '_id',
          as: 'boat'
        }
      },
      {
        $unwind: '$boat'
      },
      {
        $group: {
          _id: '$boatId',
          boatName: { $first: '$boat.name' },
          views: { $sum: 1 }
        }
      },
      {
        $sort: { views: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Get user engagement levels (simplified)
    const engagementStats = await Appointment.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$customerEmail',
          appointmentCount: { $sum: 1 },
          totalDuration: { $sum: '$estimatedDuration' }
        }
      },
      {
        $addFields: {
          engagementLevel: {
            $cond: [
              { $gte: ['$appointmentCount', 3] },
              'high',
              {
                $cond: [
                  { $gte: ['$appointmentCount', 2] },
                  'medium',
                  'low'
                ]
              }
            ]
          }
        }
      },
      {
        $group: {
          _id: '$engagementLevel',
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate revenue (simplified - using estimated costs)
    const revenueData = await Appointment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$estimatedCost' }
        }
      }
    ]);

    const totalRevenue = revenueData[0]?.totalRevenue || 0;

    res.json({
      success: true,
      data: {
        metrics: {
          totalVisitors: totalAppointments,
          uniqueVisitors: uniqueCustomers.length,
          returningVisitors: completedAppointments,
          averageSessionDuration: 1800, // 30 minutes default
          inquiries: pendingAppointments
        },
        categoryStats,
        topBoats,
        engagementStats,
        revenue: totalRevenue
      }
    });

  } catch (error) {
    console.error('❌ Error getting analytics dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics dashboard',
      error: error.message
    });
  }
};

// Get real-time analytics
export const getRealtimeAnalytics = async (req, res) => {
  try {
    const last5Minutes = new Date();
    last5Minutes.setMinutes(last5Minutes.getMinutes() - 5);

    console.log('📊 Getting real-time analytics');

    // Get recent appointments
    const recentAppointments = await Appointment.find({
      createdAt: { $gte: last5Minutes }
    })
    .populate('boatId', 'name category')
    .sort({ createdAt: -1 })
    .limit(10);

    // Get today's summary
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayStats = await Appointment.aggregate([
      {
        $match: {
          createdAt: { $gte: todayStart }
        }
      },
      {
        $group: {
          _id: null,
          totalAppointments: { $sum: 1 },
          uniqueCustomers: { $addToSet: '$customerEmail' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        recentVisits: recentAppointments.map(apt => ({
          userName: apt.customerName,
          userEmail: apt.customerEmail,
          deviceType: 'desktop', // Default
          visitDate: apt.createdAt
        })),
        recentViews: recentAppointments.map(apt => ({
          boatName: apt.boatId?.name || 'Unknown Boat',
          category: apt.boatId?.category || 'Unknown',
          viewDate: apt.createdAt
        })),
        todayStats: todayStats[0] || { 
          totalVisitors: 0, 
          uniqueVisitors: [] 
        }
      }
    });

  } catch (error) {
    console.error('❌ Error getting real-time analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get real-time analytics',
      error: error.message
    });
  }
};

// ==================== SPARE PARTS ANALYTICS ====================

// Get spare parts sales trends over time
export const getSparePartsSalesTrends = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    let startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    const salesTrends = await Order.aggregate([
      {
        $match: {
          orderDate: { $gte: startDate },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$orderDate' },
            month: { $month: '$orderDate' },
            day: { $dayOfMonth: '$orderDate' }
          },
          totalRevenue: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
          totalItems: { $sum: { $size: '$items' } }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    res.json({
      success: true,
      data: salesTrends
    });

  } catch (error) {
    console.error('❌ Error getting spare parts sales trends:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get sales trends',
      error: error.message
    });
  }
};

// Get top-selling spare parts
export const getTopSellingSpareParts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const topProducts = await Order.aggregate([
      {
        $match: { paymentStatus: 'paid' }
      },
      {
        $unwind: '$items'
      },
      {
        $group: {
          _id: {
            productId: '$items.productId',
            productName: '$items.productName',
            partNumber: '$items.partNumber'
          },
          totalQuantitySold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.totalPrice' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $sort: { totalQuantitySold: -1 }
      },
      {
        $limit: parseInt(limit)
      }
    ]);

    res.json({
      success: true,
      data: topProducts
    });

  } catch (error) {
    console.error('❌ Error getting top-selling spare parts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get top-selling products',
      error: error.message
    });
  }
};

// Get revenue by category
export const getSparePartsRevenueByCategory = async (req, res) => {
  try {
    const revenueByCategory = await Order.aggregate([
      {
        $match: { paymentStatus: 'paid' }
      },
      {
        $unwind: '$items'
      },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      },
      {
        $group: {
          _id: '$product.category',
          totalRevenue: { $sum: '$items.totalPrice' },
          totalQuantitySold: { $sum: '$items.quantity' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $sort: { totalRevenue: -1 }
      }
    ]);

    res.json({
      success: true,
      data: revenueByCategory
    });

  } catch (error) {
    console.error('❌ Error getting revenue by category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get revenue by category',
      error: error.message
    });
  }
};

// Get monthly sales performance
export const getSparePartsMonthlyPerformance = async (req, res) => {
  try {
    const monthlyPerformance = await Order.aggregate([
      {
        $match: { paymentStatus: 'paid' }
      },
      {
        $group: {
          _id: {
            year: { $year: '$orderDate' },
            month: { $month: '$orderDate' }
          },
          totalRevenue: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
          totalItems: { $sum: { $size: '$items' } },
          averageOrderValue: { $avg: '$totalAmount' }
        }
      },
      {
        $sort: { '_id.year': -1, '_id.month': -1 }
      },
      {
        $limit: 12
      }
    ]);

    res.json({
      success: true,
      data: monthlyPerformance
    });

  } catch (error) {
    console.error('❌ Error getting monthly performance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get monthly performance',
      error: error.message
    });
  }
};

// Get order status distribution
export const getSparePartsOrderStatusDistribution = async (req, res) => {
  try {
    const statusDistribution = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      success: true,
      data: statusDistribution
    });

  } catch (error) {
    console.error('❌ Error getting order status distribution:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get order status distribution',
      error: error.message
    });
  }
};

// Get customer purchase frequency
export const getSparePartsCustomerFrequency = async (req, res) => {
  try {
    const customerFrequency = await Order.aggregate([
      {
        $match: { paymentStatus: 'paid' }
      },
      {
        $group: {
          _id: '$customerId',
          customerName: { $first: '$customerName' },
          customerEmail: { $first: '$customerEmail' },
          orderCount: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          totalItems: { $sum: { $size: '$items' } },
          lastOrderDate: { $max: '$orderDate' }
        }
      },
      {
        $sort: { orderCount: -1 }
      },
      {
        $limit: 20
      }
    ]);

    res.json({
      success: true,
      data: customerFrequency
    });

  } catch (error) {
    console.error('❌ Error getting customer frequency:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get customer frequency',
      error: error.message
    });
  }
};

// Get spare parts inventory overview
export const getSparePartsInventoryOverview = async (req, res) => {
  try {
    console.log('📊 Getting spare parts inventory overview');

    // Get total products count
    const totalProducts = await Product.countDocuments();

    // Get low stock products (quantity < 10)
    const lowStockProducts = await Product.countDocuments({ quantity: { $lt: 10 } });

    // Get critical stock products (quantity < 5)
    const criticalStockProducts = await Product.countDocuments({ quantity: { $lt: 5 } });

    // Get out of stock products
    const outOfStockProducts = await Product.countDocuments({ quantity: { $lte: 0 } });

    // Calculate total inventory value
    const inventoryValueResult = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ['$price', '$quantity'] } }
        }
      }
    ]);
    const totalInventoryValue = inventoryValueResult.length > 0 ? inventoryValueResult[0].totalValue : 0;

    // Get categories count
    const categoriesCount = await Product.distinct('category').then(categories => categories.length);

    // Get companies count
    const companiesCount = await Product.distinct('company').then(companies => companies.length);

    res.json({
      success: true,
      data: {
        totalProducts,
        lowStockProducts,
        criticalStockProducts,
        outOfStockProducts,
        totalInventoryValue,
        categoriesCount,
        companiesCount
      }
    });

  } catch (error) {
    console.error('❌ Error getting spare parts inventory overview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get spare parts inventory overview',
      error: error.message
    });
  }
};

// Get spare parts category analytics
export const getSparePartsCategoryAnalytics = async (req, res) => {
  try {
    console.log('📊 Getting spare parts category analytics');

    const categoryStats = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          productCount: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: { $multiply: ['$price', '$quantity'] } },
          averagePrice: { $avg: '$price' },
          lowStockCount: {
            $sum: {
              $cond: [{ $lt: ['$quantity', 10] }, 1, 0]
            }
          }
        }
      },
      {
        $project: {
          category: '$_id',
          productCount: 1,
          totalQuantity: 1,
          totalValue: { $round: ['$totalValue', 2] },
          averagePrice: { $round: ['$averagePrice', 2] },
          lowStockCount: 1,
          _id: 0
        }
      },
      {
        $sort: { totalValue: -1 }
      }
    ]);

    res.json({
      success: true,
      data: categoryStats
    });

  } catch (error) {
    console.error('❌ Error getting spare parts category analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get spare parts category analytics',
      error: error.message
    });
  }
};

// Get spare parts company/supplier analytics
export const getSparePartsCompanyAnalytics = async (req, res) => {
  try {
    console.log('📊 Getting spare parts company analytics');

    const companyStats = await Product.aggregate([
      {
        $group: {
          _id: '$company',
          productCount: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: { $multiply: ['$price', '$quantity'] } },
          averagePrice: { $avg: '$price' },
          lowStockCount: {
            $sum: {
              $cond: [{ $lt: ['$quantity', 10] }, 1, 0]
            }
          }
        }
      },
      {
        $project: {
          company: '$_id',
          productCount: 1,
          totalQuantity: 1,
          totalValue: { $round: ['$totalValue', 2] },
          averagePrice: { $round: ['$averagePrice', 2] },
          lowStockCount: 1,
          _id: 0
        }
      },
      {
        $sort: { totalValue: -1 }
      }
    ]);

    res.json({
      success: true,
      data: companyStats
    });

  } catch (error) {
    console.error('❌ Error getting spare parts company analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get spare parts company analytics',
      error: error.message
    });
  }
};

// Get low stock and reorder recommendations
export const getSparePartsStockAlerts = async (req, res) => {
  try {
    console.log('📊 Getting spare parts stock alerts');

    // Get low stock products (quantity < 10)
    const lowStockProducts = await Product.find({ quantity: { $lt: 10 } })
      .select('name partNumber company category quantity price')
      .sort({ quantity: 1 });

    // Get critical stock products (quantity < 5)
    const criticalStockProducts = await Product.find({ quantity: { $lt: 5 } })
      .select('name partNumber company category quantity price')
      .sort({ quantity: 1 });

    // Get out of stock products
    const outOfStockProducts = await Product.find({ quantity: { $lte: 0 } })
      .select('name partNumber company category quantity price');

    // Get high-value low stock items (for priority reordering)
    const highValueLowStock = await Product.find({ 
      quantity: { $lt: 10 },
      price: { $gte: 1000 } // Assuming high value is >= 1000
    })
      .select('name partNumber company category quantity price')
      .sort({ price: -1 });

    res.json({
      success: true,
      data: {
        lowStockProducts,
        criticalStockProducts,
        outOfStockProducts,
        highValueLowStock
      }
    });

  } catch (error) {
    console.error('❌ Error getting spare parts stock alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get spare parts stock alerts',
      error: error.message
    });
  }
};

// Get spare parts time-based analytics
export const getSparePartsTimeAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    console.log('📊 Getting spare parts time analytics for', days, 'days');

    // Get products added in the specified period
    const newProducts = await Product.countDocuments({
      createdAt: { $gte: startDate }
    });

    // Get products updated in the specified period
    const updatedProducts = await Product.countDocuments({
      updatedAt: { $gte: startDate },
      createdAt: { $lt: startDate }
    });

    // Get monthly product additions for the last 6 months
    const monthlyAdditions = await Product.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          month: '$_id.month',
          year: '$_id.year',
          count: 1,
          _id: 0
        }
      },
      {
        $sort: { year: 1, month: 1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        newProducts,
        updatedProducts,
        monthlyAdditions
      }
    });

  } catch (error) {
    console.error('❌ Error getting spare parts time analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get spare parts time analytics',
      error: error.message
    });
  }
};

// Get spare parts used in repairs analytics
export const getSparePartsUsageAnalytics = async (req, res) => {
  try {
    console.log('📊 Getting spare parts usage analytics');

    // Get parts used in completed repairs
    const partsUsage = await BoatRepair.aggregate([
      {
        $match: {
          status: 'completed',
          partsUsed: { $exists: true, $ne: [] }
        }
      },
      {
        $unwind: '$partsUsed'
      },
      {
        $group: {
          _id: '$partsUsed.partNumber',
          partName: { $first: '$partsUsed.partName' },
          totalQuantityUsed: { $sum: '$partsUsed.quantity' },
          totalCost: { $sum: '$partsUsed.cost' },
          usageCount: { $sum: 1 }
        }
      },
      {
        $project: {
          partNumber: '$_id',
          partName: 1,
          totalQuantityUsed: 1,
          totalCost: { $round: ['$totalCost', 2] },
          usageCount: 1,
          _id: 0
        }
      },
      {
        $sort: { totalQuantityUsed: -1 }
      }
    ]);

    // Get total parts cost from repairs
    const totalPartsCost = await BoatRepair.aggregate([
      {
        $match: {
          status: 'completed',
          partsUsed: { $exists: true, $ne: [] }
        }
      },
      {
        $unwind: '$partsUsed'
      },
      {
        $group: {
          _id: null,
          totalCost: { $sum: '$partsUsed.cost' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        partsUsage,
        totalPartsCost: totalPartsCost.length > 0 ? totalPartsCost[0].totalCost : 0
      }
    });

  } catch (error) {
    console.error('❌ Error getting spare parts usage analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get spare parts usage analytics',
      error: error.message
    });
  }
};

// ==================== SALES VISIT ANALYTICS ====================

// Get sales visit trends over time
export const getSalesVisitTrends = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    let startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    const visitTrends = await Appointment.aggregate([
      {
        $match: {
          appointmentDate: { $gte: startDate },
          serviceType: 'Boat Purchase Visit'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$appointmentDate' },
            month: { $month: '$appointmentDate' },
            day: { $dayOfMonth: '$appointmentDate' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    res.json({
      success: true,
      data: visitTrends
    });

  } catch (error) {
    console.error('❌ Error getting sales visit trends:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get sales visit trends',
      error: error.message
    });
  }
};

// Get category distribution for sales visits
export const getSalesVisitCategoryDistribution = async (req, res) => {
  try {
    const categoryDistribution = await Appointment.aggregate([
      {
        $match: {
          serviceType: 'Boat Purchase Visit'
        }
      },
      {
        $group: {
          _id: '$boatDetails.boatType',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          category: '$_id',
          count: 1,
          _id: 0
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      success: true,
      data: categoryDistribution
    });

  } catch (error) {
    console.error('❌ Error getting sales visit category distribution:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get sales visit category distribution',
      error: error.message
    });
  }
};


// Get geographic distribution for sales visits
export const getSalesVisitGeographicDistribution = async (req, res) => {
  try {
    const geographicDistribution = await Appointment.aggregate([
      {
        $match: {
          serviceType: 'Boat Purchase Visit'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'customerEmail',
          foreignField: 'email',
          as: 'customer'
        }
      },
      {
        $unwind: '$customer'
      },
      {
        $group: {
          _id: '$customer.address.district',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          district: '$_id',
          count: 1,
          _id: 0
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      success: true,
      data: geographicDistribution
    });

  } catch (error) {
    console.error('❌ Error getting sales visit geographic distribution:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get sales visit geographic distribution',
      error: error.message
    });
  }
};

// Get peak hours for sales visits
export const getSalesVisitPeakHours = async (req, res) => {
  try {
    const peakHours = await Appointment.aggregate([
      {
        $match: {
          serviceType: 'Boat Purchase Visit'
        }
      },
      {
        $addFields: {
          hour: {
            $switch: {
              branches: [
                { case: { $eq: ['$appointmentTime', '09:00 AM'] }, then: 9 },
                { case: { $eq: ['$appointmentTime', '10:00 AM'] }, then: 10 },
                { case: { $eq: ['$appointmentTime', '11:00 AM'] }, then: 11 },
                { case: { $eq: ['$appointmentTime', '12:00 PM'] }, then: 12 },
                { case: { $eq: ['$appointmentTime', '01:00 PM'] }, then: 13 },
                { case: { $eq: ['$appointmentTime', '02:00 PM'] }, then: 14 },
                { case: { $eq: ['$appointmentTime', '03:00 PM'] }, then: 15 },
                { case: { $eq: ['$appointmentTime', '04:00 PM'] }, then: 16 },
                { case: { $eq: ['$appointmentTime', '05:00 PM'] }, then: 17 },
                { case: { $eq: ['$appointmentTime', '06:00 PM'] }, then: 18 },
                { case: { $eq: ['$appointmentTime', '07:00 PM'] }, then: 19 },
                { case: { $eq: ['$appointmentTime', '08:00 PM'] }, then: 20 }
              ],
              default: 0
            }
          }
        }
      },
      {
        $group: {
          _id: '$hour',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          hour: '$_id',
          count: 1,
          _id: 0
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      success: true,
      data: peakHours
    });

  } catch (error) {
    console.error('❌ Error getting sales visit peak hours:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get sales visit peak hours',
      error: error.message
    });
  }
};

// Get conversion rates for sales visits
export const getSalesVisitConversionRates = async (req, res) => {
  try {
    const conversionRates = await Appointment.aggregate([
      {
        $match: {
          serviceType: 'Boat Purchase Visit'
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          status: '$_id',
          count: 1,
          _id: 0
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      success: true,
      data: conversionRates
    });

  } catch (error) {
    console.error('❌ Error getting sales visit conversion rates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get sales visit conversion rates',
      error: error.message
    });
  }
};

// Get appointment status analytics for sales visits
export const getSalesVisitStatusAnalytics = async (req, res) => {
  try {
    const statusAnalytics = await Appointment.aggregate([
      {
        $match: {
          serviceType: 'Boat Purchase Visit'
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          percentage: { $sum: 1 }
        }
      },
      {
        $project: {
          status: '$_id',
          count: 1,
          _id: 0
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Calculate percentages
    const total = statusAnalytics.reduce((sum, item) => sum + item.count, 0);
    const statusAnalyticsWithPercentage = statusAnalytics.map(item => ({
      ...item,
      percentage: total > 0 ? ((item.count / total) * 100).toFixed(1) : 0
    }));

    res.json({
      success: true,
      data: statusAnalyticsWithPercentage
    });

  } catch (error) {
    console.error('❌ Error getting sales visit status analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get sales visit status analytics',
      error: error.message
    });
  }
};

// ==================== FINANCIAL ANALYTICS ====================

// Get revenue by service type
export const getRevenueByService = async (req, res) => {
  try {
    const revenueByService = await Payment.aggregate([
      {
        $match: {
          status: 'succeeded'
        }
      },
      {
        $group: {
          _id: '$serviceType',
          totalRevenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          serviceType: '$_id',
          totalRevenue: 1,
          count: 1,
          _id: 0
        }
      },
      {
        $sort: { totalRevenue: -1 }
      }
    ]);

    const services = revenueByService.map(item => {
      switch(item.serviceType) {
        case 'spare_parts': return 'Spare Parts';
        case 'boat_repair': return 'Boat Repair';
        case 'boat_sales': return 'Boat Sales';
        case 'ride_booking': return 'Ride Booking';
        case 'maintenance': return 'Maintenance';
        default: return item.serviceType;
      }
    });

    const revenues = revenueByService.map(item => item.totalRevenue);

    res.json({
      success: true,
      data: {
        services,
        revenues,
        details: revenueByService
      }
    });

  } catch (error) {
    console.error('❌ Error getting revenue by service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get revenue by service',
      error: error.message
    });
  }
};

// Get revenue trends
export const getRevenueTrends = async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;

    let groupBy = {};
    let dateFormat = '%Y-%m';

    switch (period) {
      case 'daily':
        groupBy = {
          year: { $year: '$paidAt' },
          month: { $month: '$paidAt' },
          day: { $dayOfMonth: '$paidAt' }
        };
        dateFormat = '%Y-%m-%d';
        break;
      case 'weekly':
        groupBy = {
          year: { $year: '$paidAt' },
          week: { $week: '$paidAt' }
        };
        dateFormat = '%Y-W%U';
        break;
      case 'monthly':
        groupBy = {
          year: { $year: '$paidAt' },
          month: { $month: '$paidAt' }
        };
        dateFormat = '%Y-%m';
        break;
      case 'yearly':
        groupBy = {
          year: { $year: '$paidAt' }
        };
        dateFormat = '%Y';
        break;
    }

    const revenueTrends = await Payment.aggregate([
      {
        $match: {
          status: 'succeeded',
          paidAt: { $exists: true }
        }
      },
      {
        $group: {
          _id: groupBy,
          totalRevenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          period: '$_id',
          totalRevenue: 1,
          count: 1,
          _id: 0
        }
      },
      {
        $sort: { 'period.year': 1, 'period.month': 1, 'period.day': 1, 'period.week': 1 }
      }
    ]);

    const periods = revenueTrends.map(item => {
      const { year, month, day, week } = item.period;
      if (period === 'daily') {
        return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      } else if (period === 'weekly') {
        return `${year}-W${week.toString().padStart(2, '0')}`;
      } else if (period === 'monthly') {
        return `${year}-${month.toString().padStart(2, '0')}`;
      } else {
        return year.toString();
      }
    });

    const revenues = revenueTrends.map(item => item.totalRevenue);

    res.json({
      success: true,
      data: {
        periods,
        revenues,
        details: revenueTrends
      }
    });

  } catch (error) {
    console.error('❌ Error getting revenue trends:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get revenue trends',
      error: error.message
    });
  }
};

// Get customer spending analysis
export const getCustomerSpending = async (req, res) => {
  try {
    const customerSpending = await Payment.aggregate([
      {
        $match: {
          status: 'succeeded'
        }
      },
      {
        $group: {
          _id: '$customerEmail',
          totalSpent: { $sum: '$amount' },
          orderCount: { $sum: 1 },
          averageOrderValue: { $avg: '$amount' },
          customerName: { $first: '$customerName' }
        }
      },
      {
        $project: {
          email: '$_id',
          name: '$customerName',
          totalSpent: 1,
          orderCount: 1,
          averageOrderValue: { $round: ['$averageOrderValue', 2] },
          _id: 0
        }
      },
      {
        $sort: { totalSpent: -1 }
      }
    ]);

    const topSpenders = customerSpending.slice(0, 20);
    const averageSpending = customerSpending.reduce((sum, customer) => sum + customer.totalSpent, 0) / customerSpending.length;

    // Calculate spending tiers
    const totalCustomers = customerSpending.length;
    const highSpenders = customerSpending.filter(c => c.totalSpent >= averageSpending * 2).length;
    const mediumSpenders = customerSpending.filter(c => c.totalSpent >= averageSpending && c.totalSpent < averageSpending * 2).length;
    const lowSpenders = customerSpending.filter(c => c.totalSpent < averageSpending).length;

    res.json({
      success: true,
      data: {
        topSpenders,
        averageSpending: Math.round(averageSpending),
        spendingTiers: {
          high: { count: highSpenders, percentage: ((highSpenders / totalCustomers) * 100).toFixed(1) },
          medium: { count: mediumSpenders, percentage: ((mediumSpenders / totalCustomers) * 100).toFixed(1) },
          low: { count: lowSpenders, percentage: ((lowSpenders / totalCustomers) * 100).toFixed(1) }
        },
        totalCustomers
      }
    });

  } catch (error) {
    console.error('❌ Error getting customer spending:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get customer spending',
      error: error.message
    });
  }
};

// Get service performance
export const getServicePerformance = async (req, res) => {
  try {
    const servicePerformance = await Payment.aggregate([
      {
        $match: {
          status: 'succeeded'
        }
      },
      {
        $group: {
          _id: '$serviceType',
          totalRevenue: { $sum: '$amount' },
          count: { $sum: 1 },
          averageValue: { $avg: '$amount' },
          minValue: { $min: '$amount' },
          maxValue: { $max: '$amount' }
        }
      },
      {
        $project: {
          serviceType: '$_id',
          totalRevenue: 1,
          count: 1,
          averageValue: { $round: ['$averageValue', 2] },
          minValue: 1,
          maxValue: 1,
          _id: 0
        }
      },
      {
        $sort: { averageValue: -1 }
      }
    ]);

    const services = servicePerformance.map(item => {
      switch(item.serviceType) {
        case 'spare_parts': return 'Spare Parts';
        case 'boat_repair': return 'Boat Repair';
        case 'boat_sales': return 'Boat Sales';
        case 'ride_booking': return 'Ride Booking';
        case 'maintenance': return 'Maintenance';
        default: return item.serviceType;
      }
    });

    const averageValues = servicePerformance.map(item => item.averageValue);

    res.json({
      success: true,
      data: {
        services,
        averageValues,
        details: servicePerformance
      }
    });

  } catch (error) {
    console.error('❌ Error getting service performance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get service performance',
      error: error.message
    });
  }
};

// Get inventory vs sales analytics
export const getInventoryVsSales = async (req, res) => {
  try {
    const inventoryVsSales = await Order.aggregate([
      {
        $match: {
          status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] }
        }
      },
      {
        $unwind: '$items'
      },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      },
      {
        $group: {
          _id: '$product.category',
          totalRevenue: { $sum: '$items.totalPrice' },
          totalQuantity: { $sum: '$items.quantity' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $project: {
          category: '$_id',
          totalRevenue: 1,
          totalQuantity: 1,
          orderCount: 1,
          _id: 0
        }
      },
      {
        $sort: { totalRevenue: -1 }
      }
    ]);

    const categories = inventoryVsSales.map(item => item.category);
    const revenues = inventoryVsSales.map(item => item.totalRevenue);

    res.json({
      success: true,
      data: {
        categories,
        revenues,
        details: inventoryVsSales
      }
    });

  } catch (error) {
    console.error('❌ Error getting inventory vs sales:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get inventory vs sales',
      error: error.message
    });
  }
};

// Get financial quick stats
export const getFinancialQuickStats = async (req, res) => {
  try {
    const quickStats = await Payment.aggregate([
      {
        $match: {
          status: 'succeeded'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: '$amount' },
          topSpenderAmount: { $max: '$amount' }
        }
      },
      {
        $project: {
          totalRevenue: 1,
          totalOrders: 1,
          averageOrderValue: { $round: ['$averageOrderValue', 2] },
          topSpenderAmount: 1,
          _id: 0
        }
      }
    ]);

    const stats = quickStats.length > 0 ? quickStats[0] : {
      totalRevenue: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      topSpenderAmount: 0
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ Error getting financial quick stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get financial quick stats',
      error: error.message
    });
  }
};

// Get revenue distribution by district
export const getRevenueDistributionByDistrict = async (req, res) => {
  try {
    const revenueByDistrict = await Payment.aggregate([
      {
        $match: {
          status: 'succeeded'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'customerEmail',
          foreignField: 'email',
          as: 'customer'
        }
      },
      {
        $unwind: '$customer'
      },
      {
        $group: {
          _id: '$customer.address.district',
          totalRevenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          district: '$_id',
          totalRevenue: 1,
          count: 1,
          _id: 0
        }
      },
      {
        $sort: { totalRevenue: -1 }
      }
    ]);

    const districts = revenueByDistrict.map(item => item.district || 'Unknown');
    const revenues = revenueByDistrict.map(item => item.totalRevenue);

    res.json({
      success: true,
      data: {
        districts,
        revenues,
        details: revenueByDistrict
      }
    });

  } catch (error) {
    console.error('❌ Error getting revenue distribution by district:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get revenue distribution by district',
      error: error.message
    });
  }
};

// Get revenue distribution by payment method
export const getRevenueDistributionByPaymentMethod = async (req, res) => {
  try {
    const revenueByPaymentMethod = await Payment.aggregate([
      {
        $match: {
          status: 'succeeded'
        }
      },
      {
        $group: {
          _id: '$paymentMethod',
          totalRevenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          paymentMethod: '$_id',
          totalRevenue: 1,
          count: 1,
          _id: 0
        }
      },
      {
        $sort: { totalRevenue: -1 }
      }
    ]);

    const paymentMethods = revenueByPaymentMethod.map(item => {
      switch(item.paymentMethod) {
        case 'card': return 'Credit/Debit Card';
        case 'bank_transfer': return 'Bank Transfer';
        case 'cash': return 'Cash';
        default: return item.paymentMethod || 'Unknown';
      }
    });
    const revenues = revenueByPaymentMethod.map(item => item.totalRevenue);

    res.json({
      success: true,
      data: {
        paymentMethods,
        revenues,
        details: revenueByPaymentMethod
      }
    });

  } catch (error) {
    console.error('❌ Error getting revenue distribution by payment method:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get revenue distribution by payment method',
      error: error.message
    });
  }
};

// ==================== CUSTOMER ANALYTICS ====================

// Get customer purchase frequency
export const getCustomerPurchaseFrequency = async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;

    let groupBy = {};
    let dateFormat = '%Y-%m';

    switch (period) {
      case 'daily':
        groupBy = {
          year: { $year: '$paidAt' },
          month: { $month: '$paidAt' },
          day: { $dayOfMonth: '$paidAt' }
        };
        dateFormat = '%Y-%m-%d';
        break;
      case 'weekly':
        groupBy = {
          year: { $year: '$paidAt' },
          week: { $week: '$paidAt' }
        };
        dateFormat = '%Y-W%U';
        break;
      case 'monthly':
        groupBy = {
          year: { $year: '$paidAt' },
          month: { $month: '$paidAt' }
        };
        dateFormat = '%Y-%m';
        break;
      case 'yearly':
        groupBy = {
          year: { $year: '$paidAt' }
        };
        dateFormat = '%Y';
        break;
    }

    const purchaseFrequency = await Payment.aggregate([
      {
        $match: {
          status: 'succeeded',
          paidAt: { $exists: true }
        }
      },
      {
        $group: {
          _id: {
            customerEmail: '$customerEmail',
            period: groupBy
          },
          purchaseCount: { $sum: 1 },
          totalSpent: { $sum: '$amount' }
        }
      },
      {
        $group: {
          _id: '$_id.period',
          uniqueCustomers: { $sum: 1 },
          totalPurchases: { $sum: '$purchaseCount' },
          totalRevenue: { $sum: '$totalSpent' }
        }
      },
      {
        $project: {
          period: '$_id',
          uniqueCustomers: 1,
          totalPurchases: 1,
          totalRevenue: 1,
          averagePurchasesPerCustomer: { $round: [{ $divide: ['$totalPurchases', '$uniqueCustomers'] }, 2] },
          _id: 0
        }
      },
      {
        $sort: { 'period.year': 1, 'period.month': 1, 'period.day': 1, 'period.week': 1 }
      }
    ]);

    const periods = purchaseFrequency.map(item => {
      const { year, month, day, week } = item.period;
      if (period === 'daily') {
        return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      } else if (period === 'weekly') {
        return `${year}-W${week.toString().padStart(2, '0')}`;
      } else if (period === 'monthly') {
        return `${year}-${month.toString().padStart(2, '0')}`;
      } else {
        return year.toString();
      }
    });

    const uniqueCustomers = purchaseFrequency.map(item => item.uniqueCustomers);
    const totalPurchases = purchaseFrequency.map(item => item.totalPurchases);
    const averagePurchases = purchaseFrequency.map(item => item.averagePurchasesPerCustomer);

    res.json({
      success: true,
      data: {
        periods,
        uniqueCustomers,
        totalPurchases,
        averagePurchases,
        details: purchaseFrequency
      }
    });

  } catch (error) {
    console.error('❌ Error getting customer purchase frequency:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get customer purchase frequency',
      error: error.message
    });
  }
};

// Get customer service preferences
export const getCustomerServicePreferences = async (req, res) => {
  try {
    const servicePreferences = await Payment.aggregate([
      {
        $match: {
          status: 'succeeded'
        }
      },
      {
        $group: {
          _id: '$customerEmail',
          services: { $addToSet: '$serviceType' },
          totalSpent: { $sum: '$amount' },
          purchaseCount: { $sum: 1 },
          customerName: { $first: '$customerName' }
        }
      },
      {
        $project: {
          customerEmail: '$_id',
          customerName: 1,
          services: 1,
          totalSpent: 1,
          purchaseCount: 1,
          serviceCount: { $size: '$services' },
          _id: 0
        }
      },
      {
        $sort: { totalSpent: -1 }
      }
    ]);

    // Calculate service popularity
    const servicePopularity = await Payment.aggregate([
      {
        $match: {
          status: 'succeeded'
        }
      },
      {
        $group: {
          _id: '$serviceType',
          customerCount: { $addToSet: '$customerEmail' },
          totalRevenue: { $sum: '$amount' },
          purchaseCount: { $sum: 1 }
        }
      },
      {
        $project: {
          serviceType: '$_id',
          uniqueCustomers: { $size: '$customerCount' },
          totalRevenue: 1,
          purchaseCount: 1,
          _id: 0
        }
      },
      {
        $sort: { uniqueCustomers: -1 }
      }
    ]);

    const services = servicePopularity.map(item => {
      switch(item.serviceType) {
        case 'spare_parts': return 'Spare Parts';
        case 'boat_repair': return 'Boat Repair';
        case 'boat_sales': return 'Boat Sales';
        case 'boat_ride': return 'Boat Rides';
        case 'maintenance': return 'Maintenance';
        default: return item.serviceType;
      }
    });

    const customerCounts = servicePopularity.map(item => item.uniqueCustomers);
    const revenues = servicePopularity.map(item => item.totalRevenue);

    res.json({
      success: true,
      data: {
        customerPreferences: servicePreferences.slice(0, 20), // Top 20 customers
        servicePopularity: {
          services,
          customerCounts,
          revenues,
          details: servicePopularity
        }
      }
    });

  } catch (error) {
    console.error('❌ Error getting customer service preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get customer service preferences',
      error: error.message
    });
  }
};

// Get customer lifetime value (CLV)
export const getCustomerLifetimeValue = async (req, res) => {
  try {
    const clvData = await Payment.aggregate([
      {
        $match: {
          status: 'succeeded'
        }
      },
      {
        $group: {
          _id: '$customerEmail',
          totalSpent: { $sum: '$amount' },
          purchaseCount: { $sum: 1 },
          firstPurchase: { $min: '$paidAt' },
          lastPurchase: { $max: '$paidAt' },
          customerName: { $first: '$customerName' },
          services: { $addToSet: '$serviceType' }
        }
      },
      {
        $project: {
          customerEmail: '$_id',
          customerName: 1,
          totalSpent: 1,
          purchaseCount: 1,
          firstPurchase: 1,
          lastPurchase: 1,
          serviceCount: { $size: '$services' },
          customerLifetime: {
            $divide: [
              { $subtract: ['$lastPurchase', '$firstPurchase'] },
              1000 * 60 * 60 * 24 // Convert to days
            ]
          },
          averageOrderValue: { $round: [{ $divide: ['$totalSpent', '$purchaseCount'] }, 2] },
          _id: 0
        }
      },
      {
        $sort: { totalSpent: -1 }
      }
    ]);

    // Calculate CLV statistics
    const totalCustomers = clvData.length;
    const totalRevenue = clvData.reduce((sum, customer) => sum + customer.totalSpent, 0);
    const averageCLV = totalRevenue / totalCustomers;
    const medianCLV = clvData[Math.floor(totalCustomers / 2)]?.totalSpent || 0;

    // Segment customers by CLV
    const highValueCustomers = clvData.filter(c => c.totalSpent >= averageCLV * 2).length;
    const mediumValueCustomers = clvData.filter(c => c.totalSpent >= averageCLV && c.totalSpent < averageCLV * 2).length;
    const lowValueCustomers = clvData.filter(c => c.totalSpent < averageCLV).length;

    res.json({
      success: true,
      data: {
        customers: clvData.slice(0, 20), // Top 20 customers
        statistics: {
          totalCustomers,
          totalRevenue,
          averageCLV: Math.round(averageCLV),
          medianCLV: Math.round(medianCLV),
          segmentation: {
            high: { count: highValueCustomers, percentage: ((highValueCustomers / totalCustomers) * 100).toFixed(1) },
            medium: { count: mediumValueCustomers, percentage: ((mediumValueCustomers / totalCustomers) * 100).toFixed(1) },
            low: { count: lowValueCustomers, percentage: ((lowValueCustomers / totalCustomers) * 100).toFixed(1) }
          }
        }
      }
    });

  } catch (error) {
    console.error('❌ Error getting customer lifetime value:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get customer lifetime value',
      error: error.message
    });
  }
};

// Get customer retention analysis
export const getCustomerRetentionAnalysis = async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;

    // Get customer cohorts by registration month
    const customerCohorts = await Payment.aggregate([
      {
        $match: {
          status: 'succeeded',
          paidAt: { $exists: true }
        }
      },
      {
        $group: {
          _id: '$customerEmail',
          firstPurchase: { $min: '$paidAt' },
          lastPurchase: { $max: '$paidAt' },
          totalSpent: { $sum: '$amount' },
          purchaseCount: { $sum: 1 }
        }
      },
      {
        $project: {
          customerEmail: '$_id',
          firstPurchase: 1,
          lastPurchase: 1,
          totalSpent: 1,
          purchaseCount: 1,
          cohortMonth: {
            $dateToString: {
              format: '%Y-%m',
              date: '$firstPurchase'
            }
          },
          isReturning: { $gt: ['$purchaseCount', 1] },
          _id: 0
        }
      },
      {
        $group: {
          _id: '$cohortMonth',
          totalCustomers: { $sum: 1 },
          returningCustomers: { $sum: { $cond: ['$isReturning', 1, 0] } },
          totalRevenue: { $sum: '$totalSpent' }
        }
      },
      {
        $project: {
          cohortMonth: '$_id',
          totalCustomers: 1,
          returningCustomers: 1,
          totalRevenue: 1,
          retentionRate: {
            $round: [
              { $multiply: [{ $divide: ['$returningCustomers', '$totalCustomers'] }, 100] },
              2
            ]
          },
          _id: 0
        }
      },
      {
        $sort: { cohortMonth: 1 }
      }
    ]);

    // Calculate overall retention metrics
    const totalCustomers = await Payment.distinct('customerEmail', { status: 'succeeded' });
    const returningCustomers = await Payment.aggregate([
      {
        $match: {
          status: 'succeeded'
        }
      },
      {
        $group: {
          _id: '$customerEmail',
          purchaseCount: { $sum: 1 }
        }
      },
      {
        $match: {
          purchaseCount: { $gt: 1 }
        }
      },
      {
        $count: 'returningCustomers'
      }
    ]);

    const overallRetentionRate = returningCustomers.length > 0 
      ? ((returningCustomers[0].returningCustomers / totalCustomers.length) * 100).toFixed(2)
      : 0;

    res.json({
      success: true,
      data: {
        cohorts: customerCohorts,
        overallMetrics: {
          totalCustomers: totalCustomers.length,
          returningCustomers: returningCustomers.length > 0 ? returningCustomers[0].returningCustomers : 0,
          retentionRate: parseFloat(overallRetentionRate)
        }
      }
    });

  } catch (error) {
    console.error('❌ Error getting customer retention analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get customer retention analysis',
      error: error.message
    });
  }
};

// Get customer segmentation
export const getCustomerSegmentation = async (req, res) => {
  try {
    const customerSegmentation = await Payment.aggregate([
      {
        $match: {
          status: 'succeeded'
        }
      },
      {
        $group: {
          _id: '$customerEmail',
          totalSpent: { $sum: '$amount' },
          purchaseCount: { $sum: 1 },
          firstPurchase: { $min: '$paidAt' },
          lastPurchase: { $max: '$paidAt' },
          customerName: { $first: '$customerName' },
          services: { $addToSet: '$serviceType' }
        }
      },
      {
        $project: {
          customerEmail: '$_id',
          customerName: 1,
          totalSpent: 1,
          purchaseCount: 1,
          firstPurchase: 1,
          lastPurchase: 1,
          serviceCount: { $size: '$services' },
          customerLifetime: {
            $divide: [
              { $subtract: ['$lastPurchase', '$firstPurchase'] },
              1000 * 60 * 60 * 24 // Convert to days
            ]
          },
          averageOrderValue: { $round: [{ $divide: ['$totalSpent', '$purchaseCount'] }, 2] },
          _id: 0
        }
      }
    ]);

    // Calculate segmentation thresholds
    const totalRevenue = customerSegmentation.reduce((sum, customer) => sum + customer.totalSpent, 0);
    const averageSpent = totalRevenue / customerSegmentation.length;
    const averagePurchases = customerSegmentation.reduce((sum, customer) => sum + customer.purchaseCount, 0) / customerSegmentation.length;

    // Segment customers
    const segments = {
      highValue: customerSegmentation.filter(c => c.totalSpent >= averageSpent * 2),
      frequent: customerSegmentation.filter(c => c.purchaseCount >= averagePurchases * 2),
      new: customerSegmentation.filter(c => c.customerLifetime <= 30), // New customers (last 30 days)
      returning: customerSegmentation.filter(c => c.purchaseCount > 1),
      singlePurchase: customerSegmentation.filter(c => c.purchaseCount === 1)
    };

    // Calculate segment statistics
    const segmentStats = {
      highValue: {
        count: segments.highValue.length,
        percentage: ((segments.highValue.length / customerSegmentation.length) * 100).toFixed(1),
        totalRevenue: segments.highValue.reduce((sum, c) => sum + c.totalSpent, 0)
      },
      frequent: {
        count: segments.frequent.length,
        percentage: ((segments.frequent.length / customerSegmentation.length) * 100).toFixed(1),
        totalRevenue: segments.frequent.reduce((sum, c) => sum + c.totalSpent, 0)
      },
      new: {
        count: segments.new.length,
        percentage: ((segments.new.length / customerSegmentation.length) * 100).toFixed(1),
        totalRevenue: segments.new.reduce((sum, c) => sum + c.totalSpent, 0)
      },
      returning: {
        count: segments.returning.length,
        percentage: ((segments.returning.length / customerSegmentation.length) * 100).toFixed(1),
        totalRevenue: segments.returning.reduce((sum, c) => sum + c.totalSpent, 0)
      },
      singlePurchase: {
        count: segments.singlePurchase.length,
        percentage: ((segments.singlePurchase.length / customerSegmentation.length) * 100).toFixed(1),
        totalRevenue: segments.singlePurchase.reduce((sum, c) => sum + c.totalSpent, 0)
      }
    };

    res.json({
      success: true,
      data: {
        segments: {
          highValue: segments.highValue.slice(0, 10), // Top 10 high-value customers
          frequent: segments.frequent.slice(0, 10), // Top 10 frequent customers
          new: segments.new.slice(0, 10), // Top 10 new customers
          returning: segments.returning.slice(0, 10) // Top 10 returning customers
        },
        statistics: segmentStats,
        totalCustomers: customerSegmentation.length
      }
    });

  } catch (error) {
    console.error('❌ Error getting customer segmentation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get customer segmentation',
      error: error.message
    });
  }
};

// ==================== OPERATIONAL ANALYTICS ====================

// Get service completion rates
export const getServiceCompletionRates = async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;

    // Get completion rates by service type
    const completionRates = await Payment.aggregate([
      {
        $match: {
          status: 'succeeded'
        }
      },
      {
        $group: {
          _id: '$serviceType',
          totalOrders: { $sum: 1 },
          completedOrders: { $sum: 1 }, // All succeeded payments are considered completed
          totalRevenue: { $sum: '$amount' }
        }
      },
      {
        $project: {
          serviceType: '$_id',
          totalOrders: 1,
          completedOrders: 1,
          totalRevenue: 1,
          completionRate: 100, // All succeeded payments are completed
          averageOrderValue: { $round: [{ $divide: ['$totalRevenue', '$totalOrders'] }, 2] },
          _id: 0
        }
      },
      {
        $sort: { totalOrders: -1 }
      }
    ]);

    // Get time-based completion trends
    let groupBy = {};
    switch (period) {
      case 'daily':
        groupBy = {
          year: { $year: '$paidAt' },
          month: { $month: '$paidAt' },
          day: { $dayOfMonth: '$paidAt' }
        };
        break;
      case 'weekly':
        groupBy = {
          year: { $year: '$paidAt' },
          week: { $week: '$paidAt' }
        };
        break;
      case 'monthly':
        groupBy = {
          year: { $year: '$paidAt' },
          month: { $month: '$paidAt' }
        };
        break;
      case 'yearly':
        groupBy = {
          year: { $year: '$paidAt' }
        };
        break;
    }

    const timeTrends = await Payment.aggregate([
      {
        $match: {
          status: 'succeeded',
          paidAt: { $exists: true }
        }
      },
      {
        $group: {
          _id: {
            period: groupBy,
            serviceType: '$serviceType'
          },
          completedOrders: { $sum: 1 },
          totalRevenue: { $sum: '$amount' }
        }
      },
      {
        $group: {
          _id: '$_id.period',
          services: {
            $push: {
              serviceType: '$_id.serviceType',
              completedOrders: '$completedOrders',
              totalRevenue: '$totalRevenue'
            }
          },
          totalCompleted: { $sum: '$completedOrders' },
          totalRevenue: { $sum: '$totalRevenue' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        completionRates,
        timeTrends,
        overallStats: {
          totalServices: completionRates.length,
          totalCompleted: completionRates.reduce((sum, service) => sum + service.completedOrders, 0),
          averageCompletionRate: 100, // All succeeded payments are completed
          totalRevenue: completionRates.reduce((sum, service) => sum + service.totalRevenue, 0)
        }
      }
    });

  } catch (error) {
    console.error('❌ Error getting service completion rates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get service completion rates',
      error: error.message
    });
  }
};

// Get cross-service usage analysis
export const getCrossServiceUsage = async (req, res) => {
  try {
    // Get customers who use multiple services
    const crossServiceUsage = await Payment.aggregate([
      {
        $match: {
          status: 'succeeded'
        }
      },
      {
        $group: {
          _id: '$customerEmail',
          services: { $addToSet: '$serviceType' },
          totalSpent: { $sum: '$amount' },
          purchaseCount: { $sum: 1 },
          customerName: { $first: '$customerName' }
        }
      },
      {
        $project: {
          customerEmail: '$_id',
          customerName: 1,
          services: 1,
          serviceCount: { $size: '$services' },
          totalSpent: 1,
          purchaseCount: 1,
          isMultiService: { $gt: [{ $size: '$services' }, 1] },
          _id: 0
        }
      },
      {
        $sort: { totalSpent: -1 }
      }
    ]);

    // Calculate cross-service statistics
    const totalCustomers = crossServiceUsage.length;
    const multiServiceCustomers = crossServiceUsage.filter(c => c.isMultiService).length;
    const singleServiceCustomers = totalCustomers - multiServiceCustomers;
    const crossServiceRate = totalCustomers > 0 ? ((multiServiceCustomers / totalCustomers) * 100).toFixed(2) : 0;

    // Get service combination patterns
    const serviceCombinations = await Payment.aggregate([
      {
        $match: {
          status: 'succeeded'
        }
      },
      {
        $group: {
          _id: '$customerEmail',
          services: { $addToSet: '$serviceType' }
        }
      },
      {
        $match: {
          'services.1': { $exists: true } // Only customers with multiple services
        }
      },
      {
        $group: {
          _id: '$services',
          customerCount: { $sum: 1 }
        }
      },
      {
        $sort: { customerCount: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Calculate revenue by service combination
    const revenueByCombination = await Payment.aggregate([
      {
        $match: {
          status: 'succeeded'
        }
      },
      {
        $group: {
          _id: '$customerEmail',
          services: { $addToSet: '$serviceType' },
          totalSpent: { $sum: '$amount' }
        }
      },
      {
        $match: {
          'services.1': { $exists: true }
        }
      },
      {
        $group: {
          _id: '$services',
          totalRevenue: { $sum: '$totalSpent' },
          customerCount: { $sum: 1 }
        }
      },
      {
        $sort: { totalRevenue: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      success: true,
      data: {
        crossServiceUsage: crossServiceUsage.slice(0, 20), // Top 20 customers
        statistics: {
          totalCustomers,
          multiServiceCustomers,
          singleServiceCustomers,
          crossServiceRate: parseFloat(crossServiceRate)
        },
        serviceCombinations,
        revenueByCombination
      }
    });

  } catch (error) {
    console.error('❌ Error getting cross-service usage:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cross-service usage',
      error: error.message
    });
  }
};

// Get operational efficiency metrics
export const getOperationalEfficiency = async (req, res) => {
  try {
    // Calculate order processing times (for spare parts orders)
    const orderProcessingTimes = await Order.aggregate([
      {
        $match: {
          status: { $in: ['delivered', 'completed'] }
        }
      },
      {
        $project: {
          orderId: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          processingTime: {
            $divide: [
              { $subtract: ['$updatedAt', '$createdAt'] },
              1000 * 60 * 60 * 24 // Convert to days
            ]
          }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          averageProcessingTime: { $avg: '$processingTime' },
          minProcessingTime: { $min: '$processingTime' },
          maxProcessingTime: { $max: '$processingTime' }
        }
      }
    ]);

    // Calculate inventory turnover (for spare parts)
    const inventoryTurnover = await SparePart.aggregate([
      {
        $project: {
          name: 1,
          quantity: 1,
          price: 1,
          inventoryValue: { $multiply: ['$quantity', '$price'] }
        }
      },
      {
        $group: {
          _id: null,
          totalInventoryValue: { $sum: '$inventoryValue' },
          totalItems: { $sum: 1 },
          averagePrice: { $avg: '$price' }
        }
      }
    ]);

    // Get service delivery metrics
    const serviceDeliveryMetrics = await Payment.aggregate([
      {
        $match: {
          status: 'succeeded'
        }
      },
      {
        $group: {
          _id: '$serviceType',
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$amount' },
          averageOrderValue: { $avg: '$amount' }
        }
      },
      {
        $project: {
          serviceType: '$_id',
          totalOrders: 1,
          totalRevenue: 1,
          averageOrderValue: { $round: ['$averageOrderValue', 2] },
          _id: 0
        }
      },
      {
        $sort: { totalOrders: -1 }
      }
    ]);

    // Calculate resource utilization
    const resourceUtilization = await Payment.aggregate([
      {
        $match: {
          status: 'succeeded',
          paidAt: { $exists: true }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$paidAt' },
            month: { $month: '$paidAt' }
          },
          totalRevenue: { $sum: '$amount' },
          totalOrders: { $sum: 1 },
          uniqueCustomers: { $addToSet: '$customerEmail' }
        }
      },
      {
        $project: {
          period: '$_id',
          totalRevenue: 1,
          totalOrders: 1,
          uniqueCustomers: { $size: '$uniqueCustomers' },
          revenuePerCustomer: { $round: [{ $divide: ['$totalRevenue', { $size: '$uniqueCustomers' }] }, 2] },
          ordersPerCustomer: { $round: [{ $divide: ['$totalOrders', { $size: '$uniqueCustomers' }] }, 2] },
          _id: 0
        }
      },
      {
        $sort: { 'period.year': 1, 'period.month': 1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        orderProcessingTimes,
        inventoryTurnover: inventoryTurnover[0] || {
          totalInventoryValue: 0,
          totalItems: 0,
          averagePrice: 0
        },
        serviceDeliveryMetrics,
        resourceUtilization
      }
    });

  } catch (error) {
    console.error('❌ Error getting operational efficiency:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get operational efficiency',
      error: error.message
    });
  }
};

// Get performance metrics
export const getPerformanceMetrics = async (req, res) => {
  try {
    // Calculate service satisfaction scores (based on repeat business)
    const satisfactionScores = await Payment.aggregate([
      {
        $match: {
          status: 'succeeded'
        }
      },
      {
        $group: {
          _id: '$serviceType',
          totalCustomers: { $addToSet: '$customerEmail' },
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$amount' }
        }
      },
      {
        $project: {
          serviceType: '$_id',
          uniqueCustomers: { $size: '$totalCustomers' },
          totalOrders: 1,
          totalRevenue: 1,
          averageOrdersPerCustomer: { $round: [{ $divide: ['$totalOrders', { $size: '$totalCustomers' }] }, 2] },
          _id: 0
        }
      },
      {
        $sort: { averageOrdersPerCustomer: -1 }
      }
    ]);

    // Calculate repeat business rates
    const repeatBusinessRates = await Payment.aggregate([
      {
        $match: {
          status: 'succeeded'
        }
      },
      {
        $group: {
          _id: '$customerEmail',
          purchaseCount: { $sum: 1 },
          services: { $addToSet: '$serviceType' },
          totalSpent: { $sum: '$amount' }
        }
      },
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          repeatCustomers: { $sum: { $cond: [{ $gt: ['$purchaseCount', 1] }, 1, 0] } },
          singlePurchaseCustomers: { $sum: { $cond: [{ $eq: ['$purchaseCount', 1] }, 1, 0] } },
          totalRevenue: { $sum: '$totalSpent' }
        }
      }
    ]);

    // Calculate service profitability
    const serviceProfitability = await Payment.aggregate([
      {
        $match: {
          status: 'succeeded'
        }
      },
      {
        $group: {
          _id: '$serviceType',
          totalRevenue: { $sum: '$amount' },
          totalOrders: { $sum: 1 },
          uniqueCustomers: { $addToSet: '$customerEmail' }
        }
      },
      {
        $project: {
          serviceType: '$_id',
          totalRevenue: 1,
          totalOrders: 1,
          uniqueCustomers: { $size: '$uniqueCustomers' },
          averageOrderValue: { $round: [{ $divide: ['$totalRevenue', '$totalOrders'] }, 2] },
          revenuePerCustomer: { $round: [{ $divide: ['$totalRevenue', { $size: '$uniqueCustomers' }] }, 2] },
          _id: 0
        }
      },
      {
        $sort: { totalRevenue: -1 }
      }
    ]);

    // Calculate operational bottlenecks
    const operationalBottlenecks = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          averageProcessingTime: {
            $avg: {
              $divide: [
                { $subtract: ['$updatedAt', '$createdAt'] },
                1000 * 60 * 60 * 24 // Convert to days
              ]
            }
          }
        }
      },
      {
        $project: {
          status: '$_id',
          count: 1,
          averageProcessingTime: { $round: ['$averageProcessingTime', 2] },
          _id: 0
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const repeatBusinessData = repeatBusinessRates[0] || {
      totalCustomers: 0,
      repeatCustomers: 0,
      singlePurchaseCustomers: 0,
      totalRevenue: 0
    };

    res.json({
      success: true,
      data: {
        satisfactionScores,
        repeatBusinessRates: {
          totalCustomers: repeatBusinessData.totalCustomers,
          repeatCustomers: repeatBusinessData.repeatCustomers,
          singlePurchaseCustomers: repeatBusinessData.singlePurchaseCustomers,
          repeatBusinessRate: repeatBusinessData.totalCustomers > 0 
            ? ((repeatBusinessData.repeatCustomers / repeatBusinessData.totalCustomers) * 100).toFixed(2)
            : 0
        },
        serviceProfitability,
        operationalBottlenecks
      }
    });

  } catch (error) {
    console.error('❌ Error getting performance metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get performance metrics',
      error: error.message
    });
  }
};

// Boat Ride Analytics Functions

// Get boat ride booking trends
export const getBoatRideTrends = async (req, res) => {
  try {
    const { period } = req.query; // '7d', '30d', '6m', '1y'
    
    let startDate = new Date();
    let groupBy = 'day';
    
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        groupBy = 'day';
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        groupBy = 'day';
        break;
      case '6m':
        startDate.setMonth(startDate.getMonth() - 6);
        groupBy = 'month';
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        groupBy = 'month';
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
        groupBy = 'day';
    }

    const pipeline = [
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ];

    const trends = await BoatBooking.aggregate(pipeline);
    
    res.json({
      success: true,
      data: trends,
      period,
      groupBy
    });
  } catch (error) {
    console.error('Error getting boat ride trends:', error);
    res.status(500).json({ success: false, message: 'Failed to get boat ride trends' });
  }
};

// Get boat ride status distribution
export const getBoatRideStatusDistribution = async (req, res) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: '$employeeInfo.status',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ];

    const statusDistribution = await BoatBooking.aggregate(pipeline);
    
    res.json({
      success: true,
      data: statusDistribution
    });
  } catch (error) {
    console.error('Error getting boat ride status distribution:', error);
    res.status(500).json({ success: false, message: 'Failed to get boat ride status distribution' });
  }
};

// Get boat type popularity
export const getBoatTypePopularity = async (req, res) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: '$packageName',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ];

    const boatTypePopularity = await BoatBooking.aggregate(pipeline);
    
    res.json({
      success: true,
      data: boatTypePopularity
    });
  } catch (error) {
    console.error('Error getting boat type popularity:', error);
    res.status(500).json({ success: false, message: 'Failed to get boat type popularity' });
  }
};

// Get journey type popularity
export const getJourneyTypePopularity = async (req, res) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: '$packageName',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ];

    const journeyTypePopularity = await BoatBooking.aggregate(pipeline);
    
    res.json({
      success: true,
      data: journeyTypePopularity
    });
  } catch (error) {
    console.error('Error getting journey type popularity:', error);
    res.status(500).json({ success: false, message: 'Failed to get journey type popularity' });
  }
};

// Get boat ride revenue trends
export const getBoatRideRevenueTrends = async (req, res) => {
  try {
    const pipeline = [
      {
        $match: {
          'employeeInfo.status': 'Confirmed',
          paymentStatus: 'paid',
          totalPrice: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalRevenue: { $sum: '$totalPrice' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ];

    const revenueTrends = await BoatBooking.aggregate(pipeline);
    
    res.json({
      success: true,
      data: revenueTrends
    });
  } catch (error) {
    console.error('Error getting boat ride revenue trends:', error);
    res.status(500).json({ success: false, message: 'Failed to get boat ride revenue trends' });
  }
};

// Get passenger capacity analytics
export const getPassengerCapacityAnalytics = async (req, res) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: '$numberOfPassengers',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ];

    const capacityAnalytics = await BoatBooking.aggregate(pipeline);
    
    res.json({
      success: true,
      data: capacityAnalytics
    });
  } catch (error) {
    console.error('Error getting passenger capacity analytics:', error);
    res.status(500).json({ success: false, message: 'Failed to get passenger capacity analytics' });
  }
};
