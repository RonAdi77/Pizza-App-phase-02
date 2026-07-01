export function formatPrice(price) {
  return `₪${Number(price).toFixed(2)}`;
}

export const STATUS_LABELS = {
  new: 'New',
  preparing: 'Preparing',
  ready: 'Ready',
  delivered: 'Delivered'
};
