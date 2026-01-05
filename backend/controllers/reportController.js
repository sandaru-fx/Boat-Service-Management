import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate Financial Analytics PDF Report
export const generateFinancialAnalyticsReport = async (req, res) => {
  try {
    console.log('PDF generation request received');
    console.log('Request body keys:', Object.keys(req.body));
    
    const {
      quickStats,
      revenueByService,
      revenueTrends,
      servicePerformance,
      inventoryVsSales,
      revenueByDistrict,
      customerSpending,
      generatedDate,
      reportTitle
    } = req.body;

    console.log('Data extracted:', {
      quickStats: !!quickStats,
      revenueByService: !!revenueByService,
      revenueTrends: !!revenueTrends,
      servicePerformance: !!servicePerformance,
      inventoryVsSales: !!inventoryVsSales,
      revenueByDistrict: !!revenueByDistrict,
      customerSpending: !!customerSpending
    });

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

    // Create simple HTML content for the PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Financial Analytics Report</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            font-size: 14px;
            line-height: 1.6;
            color: #333;
            margin: 40px;
          }
          
          .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
          }
          
          .company-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          
          .report-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
          }
          
          .contact-info {
            font-size: 12px;
            margin-bottom: 10px;
          }
          
          .generated-date {
            font-size: 12px;
            color: #666;
          }
          
          .section {
            margin-bottom: 30px;
          }
          
          .section-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #2c3e50;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            font-size: 12px;
          }
          
          th, td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
          }
          
          th {
            background-color: #f5f5f5;
            font-weight: bold;
          }
          
          .stats-grid {
            display: table;
            width: 100%;
            margin: 20px 0;
          }
          
          .stat-row {
            display: table-row;
          }
          
          .stat-card {
            display: table-cell;
            border: 1px solid #ddd;
            padding: 15px;
            text-align: center;
            background: #f9f9f9;
            width: 25%;
          }
          
          .stat-label {
            font-size: 12px;
            color: #666;
            margin-bottom: 5px;
          }
          
          .stat-value {
            font-size: 16px;
            font-weight: bold;
            color: #2c3e50;
          }
        </style>
      </head>
      <body>
        <!-- Header -->
        <div class="header">
          <div class="company-name">MARINE SERVICE CENTER</div>
          <div class="report-title">${reportTitle}</div>
          <div class="contact-info">
            <div>Email: marineservicecenter513@gmail.com</div>
            <div>Phone: +94 11 234 5678, +94 76 123 4568</div>
            <div>Address: 112, Baseline Road, Colombo 10, Sri Lanka</div>
          </div>
          <div class="generated-date">Generated: ${new Date(generatedDate).toLocaleString()}</div>
        </div>

        <!-- Executive Summary -->
        <div class="section">
          <div class="section-title">EXECUTIVE SUMMARY</div>
          <div class="stats-grid">
            <div class="stat-row">
              <div class="stat-card">
                <div class="stat-label">Total Revenue</div>
                <div class="stat-value">${formatCurrency(quickStats?.totalRevenue)}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Total Orders</div>
                <div class="stat-value">${quickStats?.totalOrders?.toLocaleString() || '0'}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Average Order Value</div>
                <div class="stat-value">${formatCurrency(quickStats?.averageOrderValue)}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Top Spender Amount</div>
                <div class="stat-value">${formatCurrency(quickStats?.topSpenderAmount)}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Revenue by Service Type -->
        <div class="section">
          <div class="section-title">REVENUE BY SERVICE TYPE</div>
          ${revenueByService?.services && revenueByService?.revenues ? `
            <table>
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Revenue</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                ${revenueByService.services.map((service, index) => {
                  const revenue = revenueByService.revenues[index] || 0;
                  const percentage = ((revenue / quickStats?.totalRevenue) * 100).toFixed(1);
                  return `
                    <tr>
                      <td>${service}</td>
                      <td>${formatCurrency(revenue)}</td>
                      <td>${percentage}%</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          ` : '<p>No revenue data available</p>'}
        </div>

        <!-- Revenue Trends -->
        <div class="section">
          <div class="section-title">REVENUE TRENDS</div>
          ${revenueTrends?.periods && revenueTrends?.revenues ? `
            <table>
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                ${revenueTrends.periods.map((period, index) => `
                  <tr>
                    <td>${period}</td>
                    <td>${formatCurrency(revenueTrends.revenues[index])}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : '<p>No trends data available</p>'}
        </div>

        <!-- Top Spenders -->
        <div class="section">
          <div class="section-title">TOP SPENDERS ANALYSIS</div>
          ${customerSpending?.topSpenders ? `
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Customer Name</th>
                  <th>Total Spent</th>
                  <th>Orders</th>
                  <th>Avg Order Value</th>
                </tr>
              </thead>
              <tbody>
                ${customerSpending.topSpenders.slice(0, 10).map((customer, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${customer.name}</td>
                    <td>${formatCurrency(customer.totalSpent)}</td>
                    <td>${customer.orderCount || 0}</td>
                    <td>${formatCurrency(customer.averageOrderValue)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : '<p>No customer data available</p>'}
        </div>
      </body>
      </html>
    `;

    // Launch Puppeteer and generate PDF
    console.log('Launching Puppeteer...');
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    console.log('Creating new page...');
    const page = await browser.newPage();
    
    console.log('Setting content...');
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    console.log('Generating PDF...');
    const pdf = await page.pdf({
      format: 'A4',
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      },
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: `
        <div style="font-size: 8px; text-align: center; width: 100%; color: #666;">
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>
      `
    });
    
    console.log('PDF generated successfully, size:', pdf.length);
    await browser.close();
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Financial_Analytics_Report_${new Date().toISOString().split('T')[0]}.pdf"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    // Send the PDF
    res.send(pdf);
    
  } catch (error) {
    console.error('Error generating PDF report:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to generate PDF report',
      error: error.message
    });
  }
};
