import React, { useState, useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { FaArrowLeft, FaDollarSign, FaChartPie, FaChartLine, FaUsers, FaChartBar, FaBox, FaExclamationTriangle, FaDownload } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { pdf, Document, Page, Text, View, StyleSheet, Table, TableHeader, TableBody, TableRow, TableCell } from '@react-pdf/renderer';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const FinancialAnalytics = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [generatingPDF, setGeneratingPDF] = useState(false);
  
  // Chart refs for PDF generation
  const chartRefs = {
    revenueByService: useRef(null),
    revenueTrends: useRef(null),
    servicePerformance: useRef(null),
    inventoryVsSales: useRef(null),
    revenueByDistrict: useRef(null)
  };

  // Financial Analytics Data States
  const [revenueByService, setRevenueByService] = useState(null);
  const [revenueTrends, setRevenueTrends] = useState(null);
  const [customerSpending, setCustomerSpending] = useState(null);
  const [servicePerformance, setServicePerformance] = useState(null);
  const [inventoryVsSales, setInventoryVsSales] = useState(null);
  const [revenueByDistrict, setRevenueByDistrict] = useState(null);
  const [quickStats, setQuickStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    topSpenderAmount: 0
  });

  useEffect(() => {
    loadFinancialAnalytics();
  }, []);

  useEffect(() => {
    loadRevenueTrends();
  }, [selectedPeriod]);

  const loadFinancialAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';

      // Load all financial analytics data in parallel
      const [
        revenueByServiceRes,
        revenueTrendsRes,
        customerSpendingRes,
        servicePerformanceRes,
        inventoryVsSalesRes,
        revenueByDistrictRes,
        quickStatsRes
      ] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL}/api/analytics/financial/revenue-by-service`, { headers }),
        fetch(`${process.env.REACT_APP_API_URL}/api/analytics/financial/revenue-trends?period=${selectedPeriod}`, { headers }),
        fetch(`${process.env.REACT_APP_API_URL}/api/analytics/financial/customer-spending`, { headers }),
        fetch(`${process.env.REACT_APP_API_URL}/api/analytics/financial/service-performance`, { headers }),
        fetch(`${process.env.REACT_APP_API_URL}/api/analytics/financial/inventory-vs-sales`, { headers }),
        fetch(`${process.env.REACT_APP_API_URL}/api/analytics/financial/revenue-distribution-district`, { headers }),
        fetch(`${process.env.REACT_APP_API_URL}/api/analytics/financial/quick-stats`, { headers })
      ]);

      const [
        revenueByServiceData,
        revenueTrendsData,
        customerSpendingData,
        servicePerformanceData,
        inventoryVsSalesData,
        revenueByDistrictData,
        quickStatsData
      ] = await Promise.all([
        revenueByServiceRes.json(),
        revenueTrendsRes.json(),
        customerSpendingRes.json(),
        servicePerformanceRes.json(),
        inventoryVsSalesRes.json(),
        revenueByDistrictRes.json(),
        quickStatsRes.json()
      ]);

      console.log('Financial Analytics Data:', {
        revenueByServiceData,
        revenueTrendsData,
        customerSpendingData,
        servicePerformanceData,
        inventoryVsSalesData,
        revenueByDistrictData,
        quickStatsData
      });

      if (revenueByServiceData.success) setRevenueByService(revenueByServiceData.data);
      if (revenueTrendsData.success) setRevenueTrends(revenueTrendsData.data);
      if (customerSpendingData.success) setCustomerSpending(customerSpendingData.data);
      if (servicePerformanceData.success) setServicePerformance(servicePerformanceData.data);
      if (inventoryVsSalesData.success) setInventoryVsSales(inventoryVsSalesData.data);
      if (revenueByDistrictData.success) setRevenueByDistrict(revenueByDistrictData.data);
      if (quickStatsData.success) setQuickStats(quickStatsData.data);

    } catch (error) {
      console.error('Failed to load financial analytics:', error);
      setError('Failed to load financial analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Chart configurations
  const revenueByServiceConfig = {
    data: {
      labels: revenueByService?.services || [],
      datasets: [{
        label: 'Revenue (LKR)',
        data: revenueByService?.revenues || [],
        backgroundColor: [
          '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = context.parsed;
              return `${context.label}: LKR ${value.toLocaleString()}`;
            }
          }
        }
      }
    }
  };

  const revenueTrendsConfig = {
    data: {
      labels: revenueTrends?.periods || [],
      datasets: [{
        label: 'Revenue (LKR)',
        data: revenueTrends?.revenues || [],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = context.parsed.y;
              return `Revenue: LKR ${value.toLocaleString()}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return 'LKR ' + value.toLocaleString();
            }
          }
        }
      }
    }
  };

  const servicePerformanceConfig = {
    data: {
      labels: servicePerformance?.services || [],
      datasets: [{
        label: 'Average Value (LKR)',
        data: servicePerformance?.averageValues || [],
        backgroundColor: '#10B981',
        borderColor: '#059669',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = context.parsed.y;
              return `Average Value: LKR ${value.toLocaleString()}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return 'LKR ' + value.toLocaleString();
            }
          }
        }
      }
    }
  };

  const inventoryVsSalesConfig = {
    data: {
      labels: inventoryVsSales?.categories || [],
      datasets: [{
        label: 'Revenue (LKR)',
        data: inventoryVsSales?.revenues || [],
        backgroundColor: '#F59E0B',
        borderColor: '#D97706',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = context.parsed.y;
              return `Revenue: LKR ${value.toLocaleString()}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return 'LKR ' + value.toLocaleString();
            }
          }
        }
      }
    }
  };

  const revenueByDistrictConfig = {
    data: {
      labels: revenueByDistrict?.districts || [],
      datasets: [{
        label: 'Revenue (LKR)',
        data: revenueByDistrict?.revenues || [],
        backgroundColor: '#8B5CF6',
        borderColor: '#7C3AED',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = context.parsed.y;
              return `Revenue: LKR ${value.toLocaleString()}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return 'LKR ' + value.toLocaleString();
            }
          }
        }
      }
    }
  };

  const loadRevenueTrends = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/analytics/financial/revenue-trends?period=${selectedPeriod}`, { headers });
      const data = await response.json();
      
      if (data.success) {
        setRevenueTrends(data.data);
      }
    } catch (error) {
      console.error('Error loading revenue trends:', error);
    }
  };

  const periods = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return `LKR ${amount?.toLocaleString() || '0'}`;
  };

  // Helper function to format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Styles for PDF
  const styles = StyleSheet.create({
    page: {
      flexDirection: 'column',
      backgroundColor: '#ffffff',
      padding: 30,
      fontSize: 12,
    },
    header: {
      textAlign: 'center',
      marginBottom: 30,
      borderBottom: '2 solid #333333',
      paddingBottom: 20,
    },
    companyName: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    reportTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 15,
    },
    contactInfo: {
      fontSize: 10,
      marginBottom: 10,
    },
    generatedDate: {
      fontSize: 10,
      color: '#666666',
    },
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 15,
      color: '#2c3e50',
      borderBottom: '1 solid #dddddd',
      paddingBottom: 5,
    },
    statsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    statCard: {
      border: '1 solid #dddddd',
      padding: 15,
      textAlign: 'center',
      backgroundColor: '#f9f9f9',
      flex: 1,
      marginHorizontal: 5,
    },
    statLabel: {
      fontSize: 10,
      color: '#666666',
      marginBottom: 5,
    },
    statValue: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#2c3e50',
    },
    table: {
      marginBottom: 15,
    },
    tableHeader: {
      backgroundColor: '#f5f5f5',
      fontWeight: 'bold',
    },
    tableRow: {
      flexDirection: 'row',
      borderBottom: '1 solid #dddddd',
    },
    tableCell: {
      padding: 8,
      flex: 1,
      borderRight: '1 solid #dddddd',
    },
    pageBreak: {
      pageBreakBefore: 'always',
    },
  });

  // Generate PDF Report using React-PDF
  const generatePDFReport = async () => {
    try {
      setGeneratingPDF(true);
      
      // Create PDF document
      const MyDocument = () => (
        <Document>
          {/* Page 1: Header and Executive Summary */}
          <Page size="A4" style={styles.page}>
            <View style={styles.header}>
              <Text style={styles.companyName}>MARINE SERVICE CENTER</Text>
              <Text style={styles.reportTitle}>Financial Analytics Report as at {formatDate(new Date())}</Text>
              <Text style={styles.contactInfo}>Email: info@marineservicecenter.com</Text>
              <Text style={styles.contactInfo}>Phone: +94 11 234 5678, +94 76 123 4568</Text>
              <Text style={styles.contactInfo}>Address: Colombo Marina, Port City, 00100</Text>
              <Text style={styles.generatedDate}>Generated: {new Date().toLocaleString()}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>EXECUTIVE SUMMARY</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Total Revenue</Text>
                  <Text style={styles.statValue}>{formatCurrency(quickStats?.totalRevenue)}</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Total Orders</Text>
                  <Text style={styles.statValue}>{quickStats?.totalOrders?.toLocaleString() || '0'}</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Average Order Value</Text>
                  <Text style={styles.statValue}>{formatCurrency(quickStats?.averageOrderValue)}</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Top Spender Amount</Text>
                  <Text style={styles.statValue}>{formatCurrency(quickStats?.topSpenderAmount)}</Text>
                </View>
              </View>
            </View>

            {/* Revenue by Service Type */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>REVENUE BY SERVICE TYPE</Text>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Service</Text>
                  <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Revenue</Text>
                  <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Percentage</Text>
                </View>
                {revenueByService?.services && revenueByService?.revenues ? 
                  revenueByService.services.map((service, index) => {
                    const revenue = revenueByService.revenues[index] || 0;
                    const percentage = ((revenue / quickStats?.totalRevenue) * 100).toFixed(1);
                    return (
                      <View key={index} style={styles.tableRow}>
                        <Text style={styles.tableCell}>{service}</Text>
                        <Text style={styles.tableCell}>{formatCurrency(revenue)}</Text>
                        <Text style={styles.tableCell}>{percentage}%</Text>
                      </View>
                    );
                  }) : (
                    <View style={styles.tableRow}>
                      <Text style={styles.tableCell}>No data available</Text>
                    </View>
                  )
                }
              </View>
            </View>
          </Page>

          {/* Page 2: Revenue Trends */}
          <Page size="A4" style={styles.page}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>REVENUE TRENDS</Text>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Period</Text>
                  <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Revenue</Text>
                </View>
                {revenueTrends?.periods && revenueTrends?.revenues ? 
                  revenueTrends.periods.map((period, index) => (
                    <View key={index} style={styles.tableRow}>
                      <Text style={styles.tableCell}>{period}</Text>
                      <Text style={styles.tableCell}>{formatCurrency(revenueTrends.revenues[index])}</Text>
                    </View>
                  )) : (
                    <View style={styles.tableRow}>
                      <Text style={styles.tableCell}>No data available</Text>
                    </View>
                  )
                }
              </View>
            </View>

            {/* Service Performance */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>SERVICE PERFORMANCE</Text>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Service</Text>
                  <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Average Value</Text>
                </View>
                {servicePerformance?.services && servicePerformance?.averageValues ? 
                  servicePerformance.services.map((service, index) => (
                    <View key={index} style={styles.tableRow}>
                      <Text style={styles.tableCell}>{service}</Text>
                      <Text style={styles.tableCell}>{formatCurrency(servicePerformance.averageValues[index] || 0)}</Text>
                    </View>
                  )) : (
                    <View style={styles.tableRow}>
                      <Text style={styles.tableCell}>No data available</Text>
                    </View>
                  )
                }
              </View>
            </View>

            {/* Inventory vs Sales */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>INVENTORY VS SALES</Text>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Category</Text>
                  <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Revenue</Text>
                </View>
                {inventoryVsSales?.categories && inventoryVsSales?.revenues ? 
                  inventoryVsSales.categories.map((category, index) => (
                    <View key={index} style={styles.tableRow}>
                      <Text style={styles.tableCell}>{category}</Text>
                      <Text style={styles.tableCell}>{formatCurrency(inventoryVsSales.revenues[index] || 0)}</Text>
                    </View>
                  )) : (
                    <View style={styles.tableRow}>
                      <Text style={styles.tableCell}>No data available</Text>
                    </View>
                  )
                }
              </View>
            </View>
          </Page>

          {/* Page 3: Revenue by District and Top Spenders */}
          <Page size="A4" style={styles.page}>
            {/* Revenue by District */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>REVENUE BY DISTRICT</Text>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>District</Text>
                  <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Revenue</Text>
                </View>
                {revenueByDistrict?.districts && revenueByDistrict?.revenues ? 
                  revenueByDistrict.districts.map((district, index) => (
                    <View key={index} style={styles.tableRow}>
                      <Text style={styles.tableCell}>{district}</Text>
                      <Text style={styles.tableCell}>{formatCurrency(revenueByDistrict.revenues[index] || 0)}</Text>
                    </View>
                  )) : (
                    <View style={styles.tableRow}>
                      <Text style={styles.tableCell}>No data available</Text>
                    </View>
                  )
                }
              </View>
            </View>

            {/* Top Spenders */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>TOP SPENDERS ANALYSIS</Text>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Rank</Text>
                  <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Customer Name</Text>
                  <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Total Spent</Text>
                  <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Orders</Text>
                  <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Avg Order Value</Text>
                </View>
                {customerSpending?.topSpenders ? 
                  customerSpending.topSpenders.slice(0, 10).map((customer, index) => (
                    <View key={index} style={styles.tableRow}>
                      <Text style={styles.tableCell}>{index + 1}</Text>
                      <Text style={styles.tableCell}>{customer.name}</Text>
                      <Text style={styles.tableCell}>{formatCurrency(customer.totalSpent)}</Text>
                      <Text style={styles.tableCell}>{customer.orderCount || 0}</Text>
                      <Text style={styles.tableCell}>{formatCurrency(customer.averageOrderValue)}</Text>
                    </View>
                  )) : (
                    <View style={styles.tableRow}>
                      <Text style={styles.tableCell}>No data available</Text>
                    </View>
                  )
                }
              </View>
            </View>
          </Page>
        </Document>
      );

      // Generate PDF blob
      const pdfBlob = await pdf(<MyDocument />).toBlob();
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Financial_Analytics_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF report. Please try again.');
    } finally {
      setGeneratingPDF(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-64 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <FaExclamationTriangle className="text-red-500 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-red-800">Error Loading Analytics</h3>
                <p className="text-red-600 mt-1">{error}</p>
                <button
                  onClick={loadFinancialAnalytics}
                  className="mt-3 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="mr-4 p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Back to Dashboard"
              >
                <FaArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Financial Analytics</h1>
            </div>
            <button
              onClick={generatePDFReport}
              disabled={generatingPDF || loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FaDownload className="mr-2" />
              {generatingPDF ? 'Generating PDF...' : 'Download Report'}
            </button>
          </div>
          <p className="text-gray-600">Comprehensive financial insights and revenue analysis</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FaDollarSign className="text-green-500 text-2xl mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  LKR {quickStats.totalRevenue?.toLocaleString() || '0'}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FaBox className="text-blue-500 text-2xl mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {quickStats.totalOrders?.toLocaleString() || '0'}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FaChartLine className="text-purple-500 text-2xl mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  LKR {quickStats.averageOrderValue?.toLocaleString() || '0'}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FaUsers className="text-orange-500 text-2xl mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Top Spender</p>
                <p className="text-2xl font-bold text-gray-900">
                  LKR {quickStats.topSpenderAmount?.toLocaleString() || '0'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue by Service Type */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <FaChartPie className="text-blue-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Revenue by Service Type</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Distribution of total revenue across different service categories
            </p>
            <div className="h-64" ref={chartRefs.revenueByService}>
              <Pie data={revenueByServiceConfig.data} options={revenueByServiceConfig.options} />
            </div>
          </div>

          {/* Revenue Trends */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <FaChartBar className="text-green-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Revenue Trends</h3>
              </div>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {periods.map(period => (
                  <option key={period.value} value={period.value}>
                    {period.label}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Revenue trends showing business growth over time
            </p>
            <div className="h-64" ref={chartRefs.revenueTrends}>
              <Line data={revenueTrendsConfig.data} options={revenueTrendsConfig.options} />
            </div>
          </div>

          {/* Service Performance */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <FaChartLine className="text-purple-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Service Performance</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Average value per service type showing most profitable services
            </p>
            <div className="h-64" ref={chartRefs.servicePerformance}>
              <Bar data={servicePerformanceConfig.data} options={servicePerformanceConfig.options} />
            </div>
          </div>

          {/* Inventory vs Sales */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <FaBox className="text-orange-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Inventory vs Sales</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Revenue generated by each spare parts category
            </p>
            <div className="h-64" ref={chartRefs.inventoryVsSales}>
              <Bar data={inventoryVsSalesConfig.data} options={inventoryVsSalesConfig.options} />
            </div>
          </div>
        </div>

        {/* Revenue Distribution Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-8">
          {/* Revenue by District */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <FaChartBar className="text-purple-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Revenue by District</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Revenue distribution across different districts
            </p>
            <div className="h-64" ref={chartRefs.revenueByDistrict}>
              <Bar data={revenueByDistrictConfig.data} options={revenueByDistrictConfig.options} />
            </div>
          </div>
        </div>

        {/* Customer Spending Analysis */}
        {customerSpending && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <FaUsers className="text-indigo-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Top Spenders</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Customers with highest total spending across all services
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Spent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Orders
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Order Value
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customerSpending.topSpenders?.slice(0, 10).map((customer, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {customer.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        LKR {customer.totalSpent?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customer.orderCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        LKR {customer.averageOrderValue?.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialAnalytics;