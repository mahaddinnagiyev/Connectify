export const errorMessage = (
  message: string,
  module: string,
  details?: string,
  stack?: string,
) => {
  return `
    <div style="font-family: Arial, sans-serif; background-color: #ffecec; border: 2px solid #ff0000; padding: 20px; border-radius: 8px; max-width: 600px; margin: 20px auto;">
      <h1 style="color: #d32f2f; font-size: 1.8rem; margin-bottom: 10px;">🚨 Error Alert - Connectify Application 🚨</h1>
      <p style="font-size: 1rem; margin-bottom: 15px;">
        An error has occurred in the Connectify application. Please find the details below:
      </p>
      <ul style="list-style-type: none; padding-left: 0;">
        <li style="margin-bottom: 8px;"><strong>Message:</strong> ${message}</li>
        <li style="margin-bottom: 8px;"><strong>Module:</strong> ${module}</li>
        <li style="margin-bottom: 8px;"><strong>Details:</strong> ${details || 'No additional details provided'}</li>
        <li style="margin-bottom: 8px;"><strong>Stack Trace:</strong> ${stack || 'No stack trace available'}</li>
      </ul>
      <p style="font-size: 1rem; margin-top: 15px;">
        Please investigate this issue as soon as possible.
      </p>
      <p style="font-size: 1rem; margin-top: 20px;">
        Best regards,<br>
        <strong>Connectify System</strong>
      </p>
    </div>
  `;
};
