export function generateVerificationEmail(
  email: string,
  username: string,
  verificationCode: number,
): string {
  const html = `
    <html>
      <head>
        <title>Email Verification</title>
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
          <h1>Email Verification</h1>
          <p>Dear ${username},</p>
          <p>Thank you for registering with our service. To complete your registration, please click the following button:</p>
          <a class="button" href="https://example.com/verify?email=${encodeURIComponent(
            email,
          )}&code=${verificationCode}">Verify Email</a>
          <p>If the button above doesn't work, you can also manually copy and paste the following link into your web browser:</p>
          <p><a class="fallback-link" href="https://example.com/verify?email=${encodeURIComponent(
            email,
          )}&code=${verificationCode}">https://example.com/verify?email=${encodeURIComponent(
    email,
  )}&code=${verificationCode}</a></p>
          <p>If you did not sign up for our service, you can safely ignore this email.</p>
          <p>Thank you,</p>
          <p>Your Service Team</p>
        </div>
      </body>
    </html>
  `;

  return html;
}
