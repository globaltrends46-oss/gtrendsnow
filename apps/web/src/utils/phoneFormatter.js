import { parsePhoneNumberFromString } from 'libphonenumber-js';

/**
 * Formats and validates international mobile numbers.
 * @param {string|number} input - The raw phone number input
 * @returns {{isValid: boolean, formattedNumber: string, error: string|null}}
 */
export const formatPhoneNumber = (input) => {
  if (!input) {
    return { 
      isValid: false, 
      formattedNumber: '', 
      error: 'Phone number is required' 
    };
  }
  
  // Parse the phone number, defaulting to US if no country code is provided
  // but encouraging the use of + for international numbers
  const phoneNumber = parsePhoneNumberFromString(input.toString(), 'US');
  
  if (phoneNumber && phoneNumber.isValid()) {
    return {
      isValid: true,
      formattedNumber: phoneNumber.format('E.164'),
      error: null
    };
  }
  
  return { 
    isValid: false, 
    formattedNumber: '', 
    error: 'Please enter a valid international phone number (e.g., +1 234 567 8900)' 
  };
};