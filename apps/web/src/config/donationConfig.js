/**
 * Global PayPal Donation Configuration for GTrends Global
 */
export const DONATION_CONFIG = {
  paypalEmail: 'ram25108@gmail.com',
  paypalMeHandle: 'ram25108',
  itemName: 'Support GTrends Global Platform',
  currency: 'USD',
  presetAmounts: [
    { value: 5, label: '$5', desc: 'Buy a Coffee', icon: '☕' },
    { value: 15, label: '$15', desc: 'Platform Supporter', icon: '⚡' },
    { value: 25, label: '$25', desc: 'AI Advocate', icon: '🌟' },
    { value: 50, label: '$50', desc: 'Core Patron', icon: '🚀' },
    { value: 100, label: '$100', desc: 'VIP Champion', icon: '👑' },
  ],
  /**
   * Generates official PayPal donation URL (Zero SDK, 100% reliable)
   */
  getDonationUrl: (amount = 15) => {
    const email = encodeURIComponent('ram25108@gmail.com');
    const item = encodeURIComponent('Support GTrends Global Platform');
    const cleanAmount = parseFloat(amount) > 0 ? parseFloat(amount) : 15;
    return `https://www.paypal.com/donate?business=${email}&currency_code=USD&amount=${cleanAmount}&item_name=${item}`;
  },
  /**
   * Alternative direct PayPal.me link
   */
  getPayPalMeUrl: (amount = 15) => {
    const cleanAmount = parseFloat(amount) > 0 ? parseFloat(amount) : 15;
    return `https://paypal.me/ram25108/${cleanAmount}USD`;
  }
};
