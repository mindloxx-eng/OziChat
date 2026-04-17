// A simple map of dialing codes to country names.
const countryCodes: { [key: string]: string } = {
  '1': 'USA / Canada',
  '44': 'United Kingdom',
  '91': 'India',
  '61': 'Australia',
  '234': 'Nigeria'
  // This is not exhaustive, just for demonstration.
};

export const getCountryFromPhoneNumber = (phone: string): string => {
    // Remove spaces, parentheses, hyphens to make prefix checking easier
    const cleanedPhone = phone.replace(/[\s()-]/g, '');

    if (!cleanedPhone.startsWith('+')) {
        return 'Unknown / Local';
    }

    const digitsWithoutPlus = cleanedPhone.substring(1);

    // Check longest codes first (e.g., 3-digit vs 2-digit)
    if (digitsWithoutPlus.startsWith('234')) return countryCodes['234'];
    
    if (digitsWithoutPlus.startsWith('44')) return countryCodes['44'];
    if (digitsWithoutPlus.startsWith('91')) return countryCodes['91'];
    if (digitsWithoutPlus.startsWith('61')) return countryCodes['61'];

    if (digitsWithoutPlus.startsWith('1')) return countryCodes['1'];
    
    return 'Unknown';
};
