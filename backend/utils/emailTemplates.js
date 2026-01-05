// Email templates for password reset functionality

export const passwordResetEmailTemplate = (resetToken, userName) => {
  const resetURL = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
  
  return {
    subject: 'Password Reset Request - Marine Service Center: Boat Service Management',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #0d9488;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background-color: #f8fafc;
            padding: 30px;
            border-radius: 0 0 8px 8px;
            border: 1px solid #e2e8f0;
          }
          .button {
            display: inline-block;
            background-color: #0d9488;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
            font-weight: bold;
          }
          .button:hover {
            background-color: #0f766e;
          }
          .warning {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #64748b;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🚤 Boat Service Management</h1>
        </div>
        <div class="content">
          <h2>Password Reset Request</h2>
          <p>Hello ${userName},</p>
          <p>We received a request to reset your password for your Boat Service Management account.</p>
          <p>Click the button below to reset your password:</p>
          <a href="${resetURL}" class="button">Reset Password</a>
          <div class="warning">
            <strong>⚠️ Important:</strong>
            <ul>
              <li>This link will expire in 10 minutes</li>
              <li>If you didn't request this reset, please ignore this email</li>
              <li>For security, this link can only be used once</li>
            </ul>
          </div>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background-color: #e2e8f0; padding: 10px; border-radius: 4px;">
            ${resetURL}
          </p>
        </div>
        <div class="footer">
          <p>This email was sent from Boat Service Management System</p>
          <p>If you have any questions, please contact our support team</p>
        </div>
      </body>
      </html>
    `,
    text: `
      Password Reset Request - Boat Service Management
      
      Hello ${userName},
      
      We received a request to reset your password for your Boat Service Management account.
      
      To reset your password, click the following link:
      ${resetURL}
      
      Important:
      - This link will expire in 10 minutes
      - If you didn't request this reset, please ignore this email
      - For security, this link can only be used once
      
      If you have any questions, please contact our support team.
      
      Best regards,
      Boat Service Management Team
    `
  };
};

export const passwordChangedEmailTemplate = (userName) => {
  return {
    subject: 'Password Changed Successfully - Marine Service Center: Boat Service Management',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Changed</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #059669;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background-color: #f8fafc;
            padding: 30px;
            border-radius: 0 0 8px 8px;
            border: 1px solid #e2e8f0;
          }
          .success {
            background-color: #d1fae5;
            border: 1px solid #10b981;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #64748b;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🚤 Boat Service Management</h1>
        </div>
        <div class="content">
          <h2>Password Changed Successfully</h2>
          <p>Hello ${userName},</p>
          <div class="success">
            <strong>✅ Your password has been successfully changed!</strong>
          </div>
          <p>Your account password was updated on ${new Date().toLocaleString()}.</p>
          <p>If you made this change, no further action is required.</p>
          <p><strong>If you did NOT make this change:</strong></p>
          <ul>
            <li>Please contact our support team immediately</li>
            <li>Consider changing your password again</li>
            <li>Check your account for any unauthorized activity</li>
          </ul>
        </div>
        <div class="footer">
          <p>This email was sent from Boat Service Management System</p>
          <p>If you have any questions, please contact our support team</p>
        </div>
      </body>
      </html>
    `,
    text: `
      Password Changed Successfully - Boat Service Management
      
      Hello ${userName},
      
      Your password has been successfully changed!
      
      Your account password was updated on ${new Date().toLocaleString()}.
      
      If you made this change, no further action is required.
      
      If you did NOT make this change:
      - Please contact our support team immediately
      - Consider changing your password again
      - Check your account for any unauthorized activity
      
      Best regards,
      Boat Service Management Team
    `
  };
};
