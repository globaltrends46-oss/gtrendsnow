export const triggerGumroad = () => {
  if (window.Gumroad && window.Gumroad.show) {
    window.Gumroad.show({ product_id: 'gtrendsvip' });
  } else {
    // Fallback if the Gumroad script hasn't loaded or method is unavailable
    window.open('https://gtrendsglobal.gumroad.com/l/gtrendsvip', '_blank');
  }
};