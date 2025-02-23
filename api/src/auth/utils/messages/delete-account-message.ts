export const deleteAccountMessage = (delete_token: string) => {
  return `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
            <h2 style="text-align: center; color: #f44336;">Delete Account Request</h2>
            <p>We received a request to delete your account. If you initiated this request, please click the button below to confirm the deletion of your account.</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="http://localhost:5173/auth/delete-account?token=${delete_token}" 
                 style="display: inline-block; font-size: 18px; font-weight: bold; color: #ffffff; background-color: #f44336; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                Confirm Account Deletion
              </a>
            </div>
            <p>If the button above does not work, please copy and paste the following URL into your browser:</p>
            <a href="http://localhost:5173/auth/delete-account?token=${delete_token}" style="word-wrap: break-word; color: #f44336;">
              http://localhost:5173/auth/delete-account?token=${delete_token}
            </a>
            <p style="color: #777; font-size: 14px;">This link will expire in <strong>1 hour</strong>. If you did not request this, you can safely ignore this email.</p>
            <p>If you have any questions or need help, feel free to contact our support team at <a href="mailto:support@connectify.com" style="color: #f44336; text-decoration: none;">support@connectify.com</a>.</p>
            <p>Thank you,</p>
            <p style="text-align: center; font-weight: bold;">Connectify Team</p>
          </div>
        </body>
      </html>
    `;
};
