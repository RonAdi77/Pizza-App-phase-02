import React, { useState } from 'react';
import CustomerScreen from './components/CustomerScreen';
import EmployeeScreen from './components/EmployeeScreen';
import DeliveryScreen from './components/DeliveryScreen';

const TABS = [
  { id: 'customer', label: 'Order', icon: '🍕' },
  { id: 'employee', label: 'Kitchen', icon: '👨‍🍳' },
  { id: 'delivery', label: 'Delivery', icon: '🛵' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('customer');

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-brand">
          <span className="logo">🍕</span>
          <div>
            <h1>Pizza Express</h1>
            <p>Pizza Ordering System</p>
          </div>
        </div>
        <nav className="tab-nav" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'tab-btn-active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="app-main">
        {activeTab === 'customer' && <CustomerScreen />}
        {activeTab === 'employee' && <EmployeeScreen />}
        {activeTab === 'delivery' && <DeliveryScreen />}
      </main>

      <footer className="app-footer">
        <p>Pizza Express &copy; 2026</p>
      </footer>
    </div>
  );
}
