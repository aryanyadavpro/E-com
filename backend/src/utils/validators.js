// Input validators
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePassword = (password) => {
    // At least 6 chars (simplified for better UX)
    return password && password.length >= 6;
};

const validatePhoneNumber = (phone) => {
    // Allow 10+ digits with optional formatting
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length >= 10;
};

module.exports = {
    validateEmail,
    validatePassword,
    validatePhoneNumber,
};
