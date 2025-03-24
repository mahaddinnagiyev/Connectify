export const newFeedbackMessage = (
  first_name: string,
  last_name: string,
  email: string,
  message: string,
  send_date: Date,
) => {
  return `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
            <h2 style="text-align: center; color: #00ff00;">New Feedback Received</h2>
            <p><strong>From:</strong> ${first_name} ${last_name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}" style="color: #00ff00; text-decoration: none;">${email}</a></p>
            <p><strong>Date:</strong> ${send_date.toDateString()}</p>
            <div style="background: #f3e5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; white-space: pre-line;">${message}</p>
            </div>
            <p style="text-align: center; font-weight: bold;">Connectify Team</p>
          </div>
        </body>
      </html>
    `;
};
