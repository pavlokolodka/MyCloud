export function generatePasswordRecoveryNotification(username: string): string {
  const html = `
  <html>
    <head>
      <title>Password recovery</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f5f5f5;
          margin: 0;
          padding: 0;
        }

        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }

        h1 {
          color: #333;
        }

        p {
          color: #555;
        }

        .button {
          display: inline-block;
          background-color: #007bff;
          color: #fff;
          padding: 10px 20px;
          border-radius: 4px;
          text-decoration: none;
        }

        .fallback-link {
          color: #007bff;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Password Change Notification</h1>
        <p>Dear ${username},</p>
        <p>We are writing to inform you that your password has been successfully changed.</p>
        <p>If you did not initiate this password change, please contact our support team immediately.</p>
        <p>Thank you for using our services.</p>
        <p>Best regards,</p>
        <p>MyCloud Team</p>      
      </div>
    </body>
  </html>
  `;

  return html;
}
