# Pizza Ordering System - Homework 2

## Students

Student 1 full name: __________  
Student 1 ID: __________  

Student 2 full name: __________  
Student 2 ID: __________  

Repository link: __________

> Submission note: the submitter ID ends with the digit 4, so the personal rule is: a large pizza must include at least one topping.

---

## Project Structure

```text
pizza_app_<student_id>
├── server
│   ├── package.json
│   └── src
│       └── server.js
├── client
│   ├── package.json
│   ├── index.html
│   └── src
│       ├── main.jsx
│       └── styles.css
└── README.md
```

The project has two parts:

- `server` - Node.js + Express REST API.
- `client` - React application created in a Vite-style structure.

The orders are saved in the server memory only. There is no database in this exercise.

---

## Server Installation and Run

```bash
cd server
npm install
npm start
```

Default server address:

```text
http://localhost:3001
```

The server uses the environment variable `PORT`. If `PORT` is not defined, it runs on port `3001`.

Main API routes:

```text
GET    /api/menu
POST   /api/orders
GET    /api/orders/:id
GET    /api/orders?status=<status>
PATCH  /api/orders/:id/status
```

---

## Client Installation and Run

```bash
cd client
npm install
npm run dev
```

Default client address:

```text
http://localhost:5173
```

The client expects the server to run at:

```text
http://localhost:3001
```

If needed, the API address can be changed by setting:

```text
VITE_API_URL=http://localhost:3001
```

---

## Where the Price Is Calculated and Why

The final total price is calculated on the server in `server/src/server.js`.

The client shows only an estimated price for the user. The server calculates the final price again according to the menu, size and toppings. This is important because the server is the source of truth and should not trust prices sent from the browser.

---

## Personal Rule

Because the submitter ID ends with the digit `4`, the personal rule is:

```text
A large pizza must include at least one topping.
```

This rule is implemented on the server in the order validation logic inside `validateOrderBody()` in `server/src/server.js`.

The client also shows a matching validation message before sending the order, but the important validation is on the server.

---

## Changes from Homework 1 Design

The basic design stayed the same: Customer, Order, Pizza, Topping, Payment, Delivery and Employee.

A small implementation change was made: there is no real payment service and no real delivery service. Payment is simulated by setting `paymentStatus` to `paid` after a valid order is created. Delivery is represented by the order status flow.

---

## Required Questions

### 1. What is the difference between the client side and the server side in this system?

The client side is the React user interface. It displays the menu, cart, order forms and screens for the customer, employee and delivery person.  
The server side is the Express API. It validates data, calculates the price, saves orders in memory and updates order statuses.

### 2. Where is the total price calculated and why?

The total price is calculated on the server. This is done so users cannot change the price from the browser and send an incorrect total.

### 3. What happens when a customer sends an invalid order?

The server returns status code `400` with an error message. The order is not saved.

### 4. What happens after the mock payment succeeds?

The server creates the order, saves it in memory, sets the payment status to `paid`, sets the order status to `new`, and returns an order confirmation with the order ID.

### 5. What is the personal rule that applies to you?

The personal rule is that a large pizza must include at least one topping.

### 6. What was the most challenging part of the exercise?

The most challenging part was validating the order correctly and making sure status updates follow only the legal order flow.

### 7. What is one design decision you made and why?

One design decision was to split the client into three role-based screens: customer, kitchen, and delivery. Each screen handles only the actions relevant to that role, which keeps the UI simpler and easier to maintain.
