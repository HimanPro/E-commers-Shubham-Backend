const { parsePhoneNumberFromString } = require('libphonenumber-js');

exports.validatePhoneNumber = (phone) => {
  try {
    const phoneNumber = parsePhoneNumberFromString(phone);

    if (!phoneNumber) {
      return false;
    }

    return phoneNumber.isValid();
  } catch (error) {
    return false;
  }
};
