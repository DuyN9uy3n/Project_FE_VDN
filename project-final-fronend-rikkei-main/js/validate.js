// validate.js
const validate = {
    isEmpty(value) {
        return value.trim() === "";
    },
    isEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    },
    isDuplicateEmail(value, usedEmails) {
        return usedEmails.includes(value.trim().toLowerCase());
    },
    isMinLength(value, length) {
        return value.length >= length;
    },
    isMatch(value1, value2) {
        return value1 === value2;
    },
};

export default validate;
