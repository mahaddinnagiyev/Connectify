export const signup_confirm_message = (first_name: string, last_name: string, confirm_code: number) => {
    return `
    Hello ${first_name} ${last_name},

    Thank you for registering with us! To complete your registration process, please use the following confirmation code:

    Confirmation Code: ${confirm_code}

    Please enter this code on the confirmation page to verify your email address and finish signing up. If you didn't request this code, you can ignore this email.

    If you have any questions or need assistance, feel free to contact our support team.

    Best regards,
    The Connectify Team
    `
}