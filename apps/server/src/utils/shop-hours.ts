// openTime/closeTime are "HH:MM" 24h strings. Supports an overnight window
// (e.g. open 11:00, close 02:00) by wrapping past midnight.
export function isShopOpenNow(openTime: string, closeTime: string): boolean {
  const now = new Date();
  const [openH, openM] = openTime.split(":").map(Number);
  const [closeH, closeM] = closeTime.split(":").map(Number);
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  if (closeMinutes > openMinutes) {
    return minutesNow >= openMinutes && minutesNow < closeMinutes;
  }
  // Overnight window
  return minutesNow >= openMinutes || minutesNow < closeMinutes;
}
