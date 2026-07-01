import React, { useEffect, useState } from 'react';
import { request } from '../api';
import { formatPrice, STATUS_LABELS } from '../utils';

function renderOrderItems(order) {
  return order.pizzas.map((pizza, index) => (
    <li key={`${order.orderId}-${index}`}>
      {pizza.pizzaName}, {pizza.sizeName}, toppings: {pizza.toppings.length ? pizza.toppings.map((t) => t.name).join(', ') : 'none'} — {formatPrice(pizza.subtotal)}
    </li>
  ));
}

export default function EmployeeScreen() {
  const [employeeOrders, setEmployeeOrders] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    refreshEmployeeOrders();
  }, []);

  async function refreshEmployeeOrders() {
    setError('');
    try {
      const [newOrders, preparingOrders] = await Promise.all([
        request('/api/orders?status=new'),
        request('/api/orders?status=preparing')
      ]);
      setEmployeeOrders([...newOrders, ...preparingOrders]);
    } catch (err) {
      setError(err.message);
    }
  }

  async function updateOrderStatus(orderId, status) {
    setError('');
    try {
      await request(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      await refreshEmployeeOrders();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="screen employee-screen">
      <div className="screen-toolbar">
        <div>
          <h2>Active Orders</h2>
          <p className="screen-subtitle">New and preparing orders</p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={refreshEmployeeOrders}>
          Refresh
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div data-testid="employee-orders" className="orders-grid">
        {employeeOrders.length === 0 ? (
          <div className="empty-state-card">
            <span className="empty-icon">👨‍🍳</span>
            <p>No active orders right now</p>
          </div>
        ) : (
          employeeOrders.map((order) => (
            <article key={order.orderId} className="order-card">
              <div className="order-card-header">
                <h3>Order #{order.orderId}</h3>
                <span className={`status-badge status-${order.status}`}>
                  {STATUS_LABELS[order.status] || order.status}
                </span>
              </div>
              <div className="order-card-body">
                <p><span className="label">Customer:</span> {order.customerName}</p>
                <p><span className="label">Price:</span> {formatPrice(order.totalPrice)}</p>
                <ul className="order-items-list">{renderOrderItems(order)}</ul>
              </div>
              <div className="order-card-actions">
                {order.status === 'new' && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => updateOrderStatus(order.orderId, 'preparing')}
                  >
                    Start Preparing
                  </button>
                )}
                {order.status === 'preparing' && (
                  <button
                    type="button"
                    className="btn btn-accent"
                    onClick={() => updateOrderStatus(order.orderId, 'ready')}
                  >
                    Mark Ready
                  </button>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
