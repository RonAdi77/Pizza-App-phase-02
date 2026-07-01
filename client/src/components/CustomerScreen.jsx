import React, { useEffect, useMemo, useState } from 'react';
import { request } from '../api';
import { formatPrice } from '../utils';

export default function CustomerScreen() {
  const [menu, setMenu] = useState({ pizzas: [], sizes: [], toppings: [] });
  const [cart, setCart] = useState([]);
  const [selectedPizzaId, setSelectedPizzaId] = useState('');
  const [selectedSizeId, setSelectedSizeId] = useState('small');
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [confirmation, setConfirmation] = useState(null);
  const [orderStatusId, setOrderStatusId] = useState('');
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMenu();
  }, []);

  async function loadMenu() {
    try {
      const data = await request('/api/menu');
      setMenu(data);
      if (data.pizzas.length > 0) {
        setSelectedPizzaId(data.pizzas[0].id);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  const estimatedTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.subtotal, 0);
  }, [cart]);

  function toggleTopping(toppingId) {
    setSelectedToppings((current) => {
      if (current.includes(toppingId)) {
        return current.filter((id) => id !== toppingId);
      }
      if (current.length >= 3) {
        setError('You can choose up to three toppings per pizza.');
        return current;
      }
      return [...current, toppingId];
    });
  }

  function addPizzaToCart() {
    setError('');
    const pizza = menu.pizzas.find((item) => item.id === selectedPizzaId);
    const size = menu.sizes.find((item) => item.id === selectedSizeId);
    const toppings = selectedToppings.map((id) => menu.toppings.find((item) => item.id === id));

    if (!pizza || !size) {
      setError('Please choose pizza and size.');
      return;
    }

    if (size.id === 'large' && toppings.length === 0) {
      setError('Personal rule: a large pizza must include at least one topping.');
      return;
    }

    const subtotal = pizza.price + size.price + toppings.reduce((sum, topping) => sum + topping.price, 0);
    setCart((current) => [
      ...current,
      {
        pizzaId: pizza.id,
        pizzaName: pizza.name,
        sizeId: size.id,
        sizeName: size.name,
        toppingIds: selectedToppings,
        toppingNames: toppings.map((topping) => topping.name),
        subtotal
      }
    ]);
    setSelectedToppings([]);
  }

  function removeFromCart(index) {
    setCart((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  async function checkout() {
    setError('');
    setConfirmation(null);

    try {
      const payload = {
        customerName,
        phone,
        deliveryAddress,
        pizzas: cart.map((item) => ({
          pizzaId: item.pizzaId,
          sizeId: item.sizeId,
          toppingIds: item.toppingIds
        }))
      };

      const data = await request('/api/orders', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      setConfirmation(data);
      setCart([]);
      setCustomerName('');
      setPhone('');
      setDeliveryAddress('');
    } catch (err) {
      setError(err.message);
    }
  }

  async function trackOrder() {
    setError('');
    setTrackedOrder(null);
    try {
      const data = await request(`/api/orders/${orderStatusId}`);
      setTrackedOrder(data);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="screen customer-screen">
      {error && <div className="alert alert-error">{error}</div>}

      <div className="customer-grid">
        <div data-testid="menu-list" className="card menu-card">
          <div className="card-header">
            <span className="card-icon">📋</span>
            <h2>Our Menu</h2>
          </div>
          <div className="menu-section">
            <h3>Pizzas</h3>
            <ul className="menu-items">
              {menu.pizzas.map((pizza) => (
                <li key={pizza.id} className="menu-item">
                  <span>{pizza.name}</span>
                  <span className="price-tag">{formatPrice(pizza.price)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="menu-section">
            <h3>Sizes</h3>
            <ul className="menu-items">
              {menu.sizes.map((size) => (
                <li key={size.id} className="menu-item">
                  <span>{size.name}</span>
                  <span className="price-tag">{formatPrice(size.price)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="menu-section">
            <h3>Toppings</h3>
            <ul className="menu-items">
              {menu.toppings.map((topping) => (
                <li key={topping.id} className="menu-item">
                  <span>{topping.name}</span>
                  <span className="price-tag">{formatPrice(topping.price)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="card builder-card">
          <div className="card-header">
            <span className="card-icon">🍕</span>
            <h2>Build Your Pizza</h2>
          </div>
          <div className="form-group">
            <label htmlFor="pizza-select">Pizza</label>
            <select id="pizza-select" value={selectedPizzaId} onChange={(e) => setSelectedPizzaId(e.target.value)}>
              {menu.pizzas.map((pizza) => <option key={pizza.id} value={pizza.id}>{pizza.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="size-select">Size</label>
            <select id="size-select" value={selectedSizeId} onChange={(e) => setSelectedSizeId(e.target.value)}>
              {menu.sizes.map((size) => <option key={size.id} value={size.id}>{size.name}</option>)}
            </select>
          </div>
          <fieldset className="toppings-fieldset">
            <legend>Toppings (up to 3)</legend>
            <div className="toppings-grid">
              {menu.toppings.map((topping) => (
                <label key={topping.id} className="topping-chip">
                  <input
                    type="checkbox"
                    checked={selectedToppings.includes(topping.id)}
                    onChange={() => toggleTopping(topping.id)}
                  />
                  <span>{topping.name}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <button type="button" className="btn btn-primary" onClick={addPizzaToCart}>
            Add to Cart
          </button>
        </div>

        <div className="customer-sidebar">
          <div data-testid="cart" className="card cart-card">
            <div className="card-header">
              <span className="card-icon">🛒</span>
              <h2>My Cart</h2>
            </div>
            {cart.length === 0 ? (
              <p className="empty-state">Your cart is empty — pick a pizza and add it!</p>
            ) : (
              <ul className="cart-items">
                {cart.map((item, index) => (
                  <li key={`${item.pizzaId}-${index}`} className="cart-item">
                    <div className="cart-item-info">
                      <strong>{item.pizzaName}</strong>
                      <span>{item.sizeName}</span>
                      <span className="cart-toppings">
                        {item.toppingNames.length ? item.toppingNames.join(', ') : 'No toppings'}
                      </span>
                      <span className="cart-price">{formatPrice(item.subtotal)}</span>
                    </div>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeFromCart(index)}>
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div data-testid="order-summary-panel" className="card summary-card">
            <h3>Order Summary</h3>
            {cart.length === 0 ? (
              <p className="empty-state">No items to summarize yet.</p>
            ) : (
              <>
                <ul className="summary-items">
                  {cart.map((item, index) => (
                    <li key={`summary-${item.pizzaId}-${index}`} className="summary-item">
                      <span className="summary-item-name">
                        {item.pizzaName}, {item.sizeName}
                        {item.toppingNames.length > 0 && ` (${item.toppingNames.join(', ')})`}
                      </span>
                      <span className="summary-item-price">{formatPrice(item.subtotal)}</span>
                    </li>
                  ))}
                </ul>
                <p className="estimated-total">Total: <strong>{formatPrice(estimatedTotal)}</strong></p>
              </>
            )}
            <p className="hint">The final price is calculated again by the server after checkout.</p>
          </div>

          <div className="card checkout-card">
            <div className="card-header">
              <span className="card-icon">📍</span>
              <h2>Delivery Details</h2>
            </div>
            <div className="form-group">
              <label htmlFor="customer-name">Full Name</label>
              <input
                id="customer-name"
                placeholder="Customer name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                id="phone"
                placeholder="050-0000000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input
                id="address"
                placeholder="Street, number, city"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
              />
            </div>
            <button
              data-testid="checkout-button"
              type="button"
              className="btn btn-accent btn-block"
              onClick={checkout}
              disabled={cart.length === 0}
            >
              Mock Payment and Create Order
            </button>
          </div>
        </div>
      </div>

      {confirmation && (
        <div data-testid="order-confirmation" className="card confirmation-card">
          <div className="confirmation-icon">✅</div>
          <h2>Order Confirmed!</h2>
          <div className="confirmation-details">
            <p>Order number: <strong>{confirmation.orderId}</strong></p>
            <p>Status: <span className="status-badge status-new">{confirmation.status}</span></p>
            <p>Payment: <span className="status-badge status-paid">{confirmation.paymentStatus}</span></p>
            <p className="final-price">Final price from server: <strong>{formatPrice(confirmation.totalPrice)}</strong></p>
          </div>
        </div>
      )}

      <div className="card track-card">
        <div className="card-header">
          <span className="card-icon">🔍</span>
          <h2>Track Order</h2>
        </div>
        <div className="track-form">
          <input
            placeholder="Enter order ID"
            value={orderStatusId}
            onChange={(e) => setOrderStatusId(e.target.value)}
          />
          <button type="button" className="btn btn-secondary" onClick={trackOrder}>
            Check Status
          </button>
        </div>
        {trackedOrder && (
          <div className="track-result">
            Order <strong>#{trackedOrder.orderId}</strong> — status: <strong>{trackedOrder.status}</strong>
          </div>
        )}
      </div>
    </div>
  );
}
