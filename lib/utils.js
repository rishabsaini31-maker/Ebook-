// Timezone specific date utilities to prevent local vs UTC offset mismatch

/**
 * Returns YYYY-MM-DD for the given date object rigidly in Asia/Kolkata timezone
 * This prevents the classic UTC Midnight shift bug.
 */
export const getKolkataDate = (dateObj = new Date()) => {
  return dateObj.toLocaleString('en-CA', { timeZone: 'Asia/Kolkata' }).split(',')[0];
};

/**
 * Returns the exact Integer Year and Month rigidly in Asia/Kolkata timezone
 */
export const getKolkataYearMonth = (dateObj = new Date()) => {
  const dateStr = getKolkataDate(dateObj);
  return {
    year: parseInt(dateStr.split('-')[0]),
    month: parseInt(dateStr.split('-')[1])
  };
};
