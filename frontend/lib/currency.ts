export function formatCurrency(
  amount: number | string,
  decimals: number = 2,
): string {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) {
    return `NPR 0.${"0".repeat(decimals)}`;
  }
  const formatted = numAmount.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `NPR ${formatted}`;
}
export function formatNumber(
  amount: number | string,
  decimals: number = 2,
): string {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) {
    return `0.${"0".repeat(decimals)}`;
  }
  return numAmount.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
