export const forgotPasswordMessage = (reset_token: string) => {
  return `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
            <h2 style="text-align: center; color: #00ff00;">Password Reset Request</h2>
            <p>We received a request to reset your password. If you made this request, please click the button below to reset your password:</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="https://connectify-io.netlify.app/auth/reset-password?token=${reset_token}" 
                 style="display: inline-block; font-size: 18px; font-weight: bold; color: #ffffff; background-color: #00ff00; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Reset My Password</a>
            </div>
            <p>If the button above does not work, please copy and paste the following URL into your browser:</p>
            <a href="https://connectify-io.netlify.app/auth/reset-password?token=${reset_token}" style="word-wrap: break-word; color: #00ff00;">$https://connectify-io.netlify.app/auth/reset-password?token=${reset_token}</a>
            <p style="color: #777; font-size: 14px;">This link will expire in <strong>1 hours</strong>. If you did not request this, you can safely ignore this email.</p>
            <p>If you have any questions or need help, feel free to contact our support team at <a href="mailto:support@yourapp.com" style="color: #00ff00; text-decoration: none;">support@connectify.com</a>.</p>
            <p>Thank you,</p>
            <p style="text-align: center; font-weight: bold; color: #00ff00;">Connectify Team</p>
          </div>
        </body>
      </html>
    `;
};

export const emailNotFoundMessage = (email: string) => {
  return `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
            <h2 style="text-align: center; color: #FF5722;">Email Not Found</h2>
            <p>Dear User,</p>
            <p>We could not find an account associated with the email address: <strong>${email}</strong>.</p>
            <p>If you believe this is a mistake, please ensure you have entered the correct email address. Alternatively, you can register for a new account:</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="https://connectify-io.netlify.app/auth/register" 
                 style="display: inline-block; font-size: 18px; font-weight: bold; color: #ffffff; background-color: #FF5722; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Register Now</a>
            </div>
            <p>If you have any questions or need help, feel free to contact our support team at <a href="mailto:support@yourapp.com" style="color: #00ff00; text-decoration: none;">support@connectify.com</a>.</p>
            <p>Thank you,</p>
            <p style="text-align: center; font-weight: bold;">Connectify Team</p>
          </div>
        </body>
      </html>
    `;
};

export const googleSignInMessage = (email: string) => {
  return `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
            <h2 style="text-align: center; color: #FF9800;">Google Sign-In Detected</h2>
            <p>Dear User,</p>
            <p>The email address <strong>${email}</strong> is associated with a Google Sign-In account.</p>
            <p>If you want to access your account, please use the <strong>"Sign in with Google"</strong> option on the login page.</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="https://connectify-io.netlify.app/auth/login" 
                 style="display: inline-block; font-size: 18px; font-weight: bold; color: #ffffff; background-color: #FF9800; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Go to Login Page</a>
            </div>
            <p>If you did not try to reset your password and believe this is a mistake, you can ignore this email.</p>
            <p>If you have any questions or need help, feel free to contact our support team at <a href="mailto:support@yourapp.com" style="color: #00ff00; text-decoration: none;">support@connectify.com</a>.</p>
            <p>Thank you,</p>
            <p style="text-align: center; font-weight: bold;">Connectify Team</p>
          </div>
        </body>
      </html>
    `;
};
