import React, { useEffect, useState } from 'react';
import { request } from '../api';

export default function DeliveryScreen() {
  const [deliveryOrders, setDeliveryOrders] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    refreshDeliveryOrders();
  }, []);

  async function refreshDeliveryOrders() {
    setError('');
    try {
      const readyOrders = await request('/api/orders?status=ready');
      setDeliveryOrders(readyOrders);
    } catch (err) {
      setError(err.message);
    }
  }

  async function markDelivered(orderId) {
    setError('');
    try {
      await request(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'delivered' })
      });
      await refreshDeliveryOrders();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="screen delivery-screen">
      <div className="screen-toolbar">
        <div>
          <h2>Pending Deliveries</h2>
          <p className="screen-subtitle">Ready for delivery only</p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={refreshDeliveryOrders}>
          Refresh
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div data-testid="delivery-orders" className="orders-grid">
        {deliveryOrders.length === 0 ? (
          <div className="empty-state-card">
            <span className="empty-icon">🛵</span>
            <p>No pending deliveries</p>
          </div>
        ) : (
          deliveryOrders.map((order) => (
            <article key={order.orderId} className="order-card delivery-card">
              <div className="order-card-header">
                <h3>Order #{order.orderId}</h3>
                <span className="status-badge status-ready">Ready</span>
              </div>
              <div className="order-card-body">
                <p><span className="label">Name:</span> {order.customerName}</p>
                <p><span className="label">Phone:</span> {order.phone}</p>
                <p><span className="label">Address:</span> {order.deliveryAddress}</p>
              </div>
              <div className="order-card-actions">
                <button
                  type="button"
                  className="btn btn-accent btn-block"
                  onClick={() => markDelivered(order.orderId)}
                >
                  Mark Delivered
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
