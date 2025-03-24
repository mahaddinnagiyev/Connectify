export const errorMessage = (
  message: string,
  module: string,
  details?: string,
  stack?: string,
) => {
  return `
  🚨 **Error Alert - Connectify Application** 🚨
  
  An error has occurred in the Connectify application. Please find the details below:
  
  🔴 **Message:** ${message}  
  📌 **Module:** ${module}  
  📝 **Details:** ${details || 'No additional details provided'}  
  📜 **Stack Trace:** ${stack || 'No stack trace available'}  
  
  Please investigate this issue as soon as possible.  
  
  Best regards,  
  **Connectify System**
    `;
};
