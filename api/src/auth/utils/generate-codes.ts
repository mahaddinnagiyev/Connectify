export const generate_confirm_code = () => {
    return Math.floor(100000 + Math.random() * 900000);
}