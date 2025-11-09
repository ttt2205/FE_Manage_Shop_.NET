//hàm định dạng tiền
export const shortCurrency = (value: number): string => {
  const NBSP = "\u00A0" // k xuống dòng
  if (value >= 1_000_000_000)
    return (value / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + NBSP + "tỷ ₫"
  if (value >= 1_000_000)
    return (value / 1_000_000).toFixed(1).replace(/\.0$/, "") + NBSP + "triệu ₫"
  if (value >= 1_000)
    return (value / 1_000).toFixed(0) + "k" + NBSP + "₫"
  return value + NBSP + "₫"
}
