// Utility function to format prices with comma as decimal separator
export const formatPrice = (amount: number | undefined): string => {
  if (amount === undefined || amount === null) return '';
  
  // Format with 2 decimal places and replace dot with comma
  const formatted = amount.toFixed(2).replace('.', ',');
  
  // Remove unnecessary decimal zeros (e.g., "20,00" becomes "20")
  if (formatted.endsWith(',00')) {
    return formatted.slice(0, -3);
  }
  
  return formatted;
};

export const formatPriceDisplay = (amount: number | undefined): string => {
  if (amount === undefined || amount === null) return '';
  
  const formatted = formatPrice(amount);
  return `€${formatted}`;
};