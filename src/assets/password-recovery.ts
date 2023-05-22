const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL;

export function generatePasswordRecovery(
  username: string,
  verificationToken: string,
): string {
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
        <h1>Password Recovery</h1>
        <p>Dear ${username},</p>
        <p>We received a request to reset your password for our service. To proceed with the password recovery process, please click the following button:</p>
        
        <a class="button" href="${FRONTEND_BASE_URL}/password-recovery?token=${verificationToken}">Reset Password</a>
        
        <p>If the button above doesn't work, you can also manually copy and paste the following link into your web browser:</p>
        <p><a class="fallback-link" href="${FRONTEND_BASE_URL}/password-recovery?token=${verificationToken}">${FRONTEND_BASE_URL}/password-recovery?token=${verificationToken}</a></p>
        
        <p>If you did not request a password reset, you can safely ignore this email.</p>
        <p>Thank you,</p>
        <p>MyCloud Team</p>
      </div>
    </body>
  </html>
  `;

  return html;
}
