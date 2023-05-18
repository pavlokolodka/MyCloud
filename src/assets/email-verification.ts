export function generateVerificationEmail(
  username: string,
  verificationToken: string,
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
        <button id="verifyButton" class="button">Verify Email</button>
        <p>If you did not sign up for our service, you can safely ignore this email.</p>
        <p>Thank you,</p>
        <p>MyCloud Team</p>
      </div>
    </body>

    <script>
      var xhr = new XMLHttpRequest();
      xhr.open('PATCH', 'http://localhost:5000/verification/email', true);
      xhr.setRequestHeader('Content-Type', 'application/json');
    
      // Handle the response
      xhr.onload = function() {
        if (xhr.status === 200) {
          console.log('Email verified!');
        } else {
          console.log('Verification failed. Please try again.');
        }
      };
    
      var verifyButton = document.getElementById('verifyButton');
      verifyButton.addEventListener('click', function() {
        xhr.send(JSON.stringify({ token: '${verificationToken}' }));
      });
    </script>

  </html>
`;

  return html;
}
