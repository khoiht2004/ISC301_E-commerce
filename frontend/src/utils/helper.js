export const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("vi-VN");
};

// Trả về một hàm debounce: chỉ gọi `fn` sau khi ngừng gọi trong `delay` ms.
// Gọi lại nhiều lần trước khi hết delay sẽ hủy lần gọi trước đó.
export const debounce = (fn, delay = 300) => {
  let timeoutId;
  const debounced = (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
  debounced.cancel = () => clearTimeout(timeoutId);
  return debounced;
};
